import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureDetector, usePanGesture, usePinchGesture, useSimultaneousGestures } from 'react-native-gesture-handler';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { scheduleOnRN } from 'react-native-worklets';
import type { Picture } from '../../art/types';
import { sound } from '../../audio/sound';
import { compilePicture, hitTest } from '../../engine/compile';
import { LiveStroke } from '../../engine/liveStroke';
import { uid, type Paint, type PaintAction, type PaintState } from '../../engine/paint';
import { haptic } from '../../utils/feedback';
import { ArtSvg } from '../art/ArtSvg';

export type Tool = 'fill' | 'brush' | 'eraser' | 'sticker';

export type CanvasEvent =
  | { type: 'filled'; region: string }
  | { type: 'stroke'; region: string }
  | { type: 'cleared'; region: string }
  | { type: 'sticker-placed' }
  | { type: 'sticker-removed' }
  | { type: 'need-sticker' };

interface Props {
  picture: Picture;
  state: PaintState;
  /** on-screen size in px (the canvas is square) */
  size: number;
  tool: Tool;
  paint: Paint;
  /** brush / eraser width in canvas units */
  brushWidth: number;
  stickerId: string | null;
  dispatch: (a: PaintAction) => void;
  onEvent?: (e: CanvasEvent) => void;
  /** change this number to animate the zoom back to 100% */
  zoomResetKey?: number;
  onZoomChange?: (zoomed: boolean) => void;
  /** region id to highlight with a pulsing glow (hint) */
  hintRegion?: string | null;
  prefix: string;
}

const TAP_SLOP = 12; // px
const MAX_ZOOM = 4;

export function ColoringCanvas({
  picture,
  state,
  size,
  tool,
  paint,
  brushWidth,
  stickerId,
  dispatch,
  onEvent,
  zoomResetKey,
  onZoomChange,
  hintRegion,
  prefix,
}: Props) {
  const compiled = useMemo(() => compilePicture(picture), [picture]);
  const live = useMemo(() => new LiveStroke(), []);
  const [liveRegion, setLiveRegion] = useState<string | null>(null);
  const [drag, setDrag] = useState<{ uid: string; x: number; y: number } | null>(null);

  // latest props for gesture callbacks (they are created once)
  const latest = useRef({ state, tool, paint, brushWidth, stickerId, size, dispatch, onEvent });
  latest.current = { state, tool, paint, brushWidth, stickerId, size, dispatch, onEvent };

  // ---------------------------------------------------------------- zoom
  const scale = useSharedValue(1);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const pinchStart = useSharedValue({ s: 1, tx: 0, ty: 0, fx: 0, fy: 0 });
  const panStart = useSharedValue({ tx: 0, ty: 0 });
  const pinching = useSharedValue(false);
  const half = useSharedValue(size / 2);
  useEffect(() => {
    half.value = size / 2;
  }, [size, half]);

  useEffect(() => {
    if (zoomResetKey === undefined) return;
    scale.value = withSpring(1, { damping: 16 });
    tx.value = withSpring(0, { damping: 16 });
    ty.value = withSpring(0, { damping: 16 });
  }, [zoomResetKey, scale, tx, ty]);

  // ---------------------------------------------------------------- touch state (JS thread)
  const touch = useRef({ active: false, cancelled: false, sx: 0, sy: 0, moved: 0, region: null as string | null, dragUid: null as string | null, lastDrag: null as { x: number; y: number } | null });

  const toCanvas = useCallback(
    (x: number, y: number): [number, number] => {
      const s = scale.value;
      const c = latest.current.size / 2;
      const px = c + (x - c - tx.value) / s;
      const py = c + (y - c - ty.value) / s;
      const k = 1000 / latest.current.size;
      return [px * k, py * k];
    },
    [scale, tx, ty],
  );

  const stickerAt = useCallback((cx: number, cy: number) => {
    const list = latest.current.state.stickers;
    for (let i = list.length - 1; i >= 0; i--) {
      const st = list[i];
      if (Math.hypot(cx - st.x, cy - st.y) < 85 * st.s) return st;
    }
    return null;
  }, []);

  const cancelStroke = useCallback(() => {
    const t = touch.current;
    if (!t.active) return;
    t.cancelled = true;
    live.clear();
    setLiveRegion(null);
    setDrag(null);
    sound.stopLoop();
  }, [live]);

  const onDown = useCallback(
    (x: number, y: number, pointers: number) => {
      const t = touch.current;
      t.active = true;
      t.cancelled = pointers > 1;
      t.sx = x;
      t.sy = y;
      t.moved = 0;
      t.region = null;
      t.dragUid = null;
      t.lastDrag = null;
      if (t.cancelled) return;
      const { tool: tl, paint: p, brushWidth: bw } = latest.current;
      const [cx, cy] = toCanvas(x, y);
      if (tl === 'brush' || tl === 'eraser') {
        const r = hitTest(compiled, cx, cy);
        if (!r) return;
        t.region = r.id;
        const zoomW = bw / Math.max(1, scale.value * 0.75);
        live.start(r.id, tl === 'eraser' ? null : p, Math.round(zoomW), cx, cy);
        setLiveRegion(r.id);
        sound.startLoop(tl === 'eraser' ? 'erase' : p.k === 'glitter' || p.k === 'rainbow' ? 'sparkle' : 'brush');
      } else if (tl === 'sticker') {
        const st = stickerAt(cx, cy);
        if (st) {
          t.dragUid = st.uid;
          t.lastDrag = { x: st.x, y: st.y };
        }
      }
    },
    [compiled, live, scale, stickerAt, toCanvas],
  );

  const onMove = useCallback(
    (x: number, y: number, pointers: number) => {
      const t = touch.current;
      if (!t.active || t.cancelled) return;
      if (pointers > 1) {
        cancelStroke();
        return;
      }
      t.moved = Math.max(t.moved, Math.hypot(x - t.sx, y - t.sy));
      const [cx, cy] = toCanvas(x, y);
      if (t.region) {
        live.add(cx, cy, 2.5 / Math.max(1, scale.value));
      } else if (t.dragUid && t.moved > 4) {
        const nx = Math.max(0, Math.min(1000, cx));
        const ny = Math.max(0, Math.min(1000, cy));
        t.lastDrag = { x: nx, y: ny };
        setDrag({ uid: t.dragUid, x: nx, y: ny });
      }
    },
    [cancelStroke, live, scale, toCanvas],
  );

  const onUp = useCallback(() => {
    const t = touch.current;
    if (!t.active) return;
    t.active = false;
    if (t.cancelled) {
      t.cancelled = false;
      return;
    }
    const { tool: tl, paint: p, stickerId: sid, dispatch: send, onEvent: emit, state: st } = latest.current;
    const isTap = t.moved < TAP_SLOP;
    const [cx, cy] = toCanvas(t.sx, t.sy);

    if (tl === 'fill') {
      if (!isTap) return;
      const r = hitTest(compiled, cx, cy);
      if (r) {
        send({ type: 'fill', region: r.id, paint: p });
        emit?.({ type: 'filled', region: r.id });
      }
      return;
    }

    if (tl === 'brush' || tl === 'eraser') {
      sound.stopLoop();
      const region = t.region;
      if (tl === 'eraser' && isTap) {
        // tap with the eraser: remove a sticker, or clean the whole area
        const s = stickerAt(cx, cy);
        if (s) {
          send({ type: 'sticker-remove', uid: s.uid });
          emit?.({ type: 'sticker-removed' });
        } else if (region && (st.fills[region] || st.strokes[region]?.length)) {
          send({ type: 'clear', region });
          emit?.({ type: 'cleared', region });
        }
      } else if (region && live.pts.length >= 2) {
        send({
          type: 'stroke',
          region,
          stroke: { id: uid('s'), paint: tl === 'eraser' ? null : p, w: live.w, pts: live.pts.slice() },
        });
        emit?.({ type: 'stroke', region });
      }
      live.clear();
      setLiveRegion(null);
      return;
    }

    if (tl === 'sticker') {
      if (t.dragUid) {
        if (t.lastDrag && !isTap) send({ type: 'sticker-move', uid: t.dragUid, x: Math.round(t.lastDrag.x), y: Math.round(t.lastDrag.y) });
        setDrag(null);
        haptic('light');
        return;
      }
      if (!isTap) return;
      if (!sid) {
        emit?.({ type: 'need-sticker' });
        return;
      }
      send({ type: 'sticker-add', sticker: { uid: uid('k'), id: sid, x: Math.round(cx), y: Math.round(cy), s: 0.85 } });
      emit?.({ type: 'sticker-placed' });
    }
  }, [compiled, live, stickerAt, toCanvas]);

  // ---------------------------------------------------------------- gestures
  const draw = usePanGesture({
    runOnJS: true,
    minDistance: 0,
    maxPointers: 1,
    onBegin: (e) => onDown(e.x, e.y, e.numberOfPointers),
    onUpdate: (e) => onMove(e.x, e.y, e.numberOfPointers),
    onFinalize: () => onUp(),
  });

  const notifyZoom = useCallback((z: boolean) => onZoomChange?.(z), [onZoomChange]);

  const pinch = usePinchGesture({
    onActivate: (e) => {
      'worklet';
      pinching.value = true;
      pinchStart.value = { s: scale.value, tx: tx.value, ty: ty.value, fx: e.focalX, fy: e.focalY };
      scheduleOnRN(cancelStroke);
    },
    onUpdate: (e) => {
      'worklet';
      const st = pinchStart.value;
      const c = half.value;
      const s = Math.min(MAX_ZOOM, Math.max(0.9, st.s * e.scale));
      let nx = e.focalX - c - (s * (st.fx - c - st.tx)) / st.s;
      let ny = e.focalY - c - (s * (st.fy - c - st.ty)) / st.s;
      const lim = Math.max(0, (s - 1) * c);
      nx = Math.max(-lim, Math.min(lim, nx));
      ny = Math.max(-lim, Math.min(lim, ny));
      scale.value = s;
      tx.value = nx;
      ty.value = ny;
    },
    onDeactivate: () => {
      'worklet';
      pinching.value = false;
      if (scale.value < 1.05) {
        scale.value = withSpring(1, { damping: 16 });
        tx.value = withSpring(0, { damping: 16 });
        ty.value = withSpring(0, { damping: 16 });
        scheduleOnRN(notifyZoom, false);
      } else {
        scheduleOnRN(notifyZoom, true);
      }
    },
  });

  const pan2 = usePanGesture({
    minPointers: 2,
    onActivate: () => {
      'worklet';
      panStart.value = { tx: tx.value, ty: ty.value };
      scheduleOnRN(cancelStroke);
    },
    onUpdate: (e) => {
      'worklet';
      if (pinching.value) return;
      const lim = Math.max(0, (scale.value - 1) * half.value);
      tx.value = Math.max(-lim, Math.min(lim, panStart.value.tx + e.translationX));
      ty.value = Math.max(-lim, Math.min(lim, panStart.value.ty + e.translationY));
    },
  });

  const gesture = useSimultaneousGestures(draw, pinch, pan2);

  const zoomStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { translateY: ty.value }, { scale: scale.value }],
  }));

  // ---------------------------------------------------------------- hint glow
  const glow = useSharedValue(0);
  useEffect(() => {
    if (hintRegion) {
      glow.value = 0;
      glow.value = withRepeat(withSequence(withTiming(1, { duration: 420 }), withTiming(0.25, { duration: 420 })), 4, false);
    } else {
      cancelAnimation(glow);
      glow.value = 0;
    }
  }, [hintRegion, glow]);
  const glowStyle = useAnimatedStyle(() => ({ opacity: glow.value }));
  const hintD = hintRegion ? compiled.byId[hintRegion]?.item.d : undefined;

  return (
    <GestureDetector gesture={gesture}>
      <View style={[styles.frame, { width: size, height: size }]} collapsable={false} testID="coloring-canvas">
        <Animated.View style={[{ width: size, height: size }, zoomStyle]}>
          <ArtSvg
            picture={picture}
            state={state}
            size={size}
            prefix={prefix}
            live={live}
            liveRegion={liveRegion}
            activePaint={tool === 'brush' || tool === 'fill' ? paint : null}
            drag={drag}
          />
          {hintD ? (
            <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, glowStyle]}>
              <Svg width={size} height={size} viewBox="0 0 1000 1000">
                <Path d={hintD} fill="rgba(255,240,150,0.55)" stroke="#FFC233" strokeWidth={14} strokeLinejoin="round" />
              </Svg>
            </Animated.View>
          ) : null}
        </Animated.View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  frame: { overflow: 'hidden', backgroundColor: '#fff' },
});
