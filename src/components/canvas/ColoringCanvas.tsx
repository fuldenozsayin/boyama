import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PixelRatio, StyleSheet, View } from 'react-native';
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
import { ArtSvg, getSticker, StickerArt } from '../art/ArtSvg';

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
  const [drag, setDrag] = useState<{ uid: string; id: string; s: number; x: number; y: number } | null>(null);

  // latest props for gesture callbacks (they are created once)
  const latest = useRef({ state, tool, paint, brushWidth, stickerId, size, dispatch, onEvent });
  latest.current = { state, tool, paint, brushWidth, stickerId, size, dispatch, onEvent };

  // ---------------------------------------------------------------- zoom
  const scale = useSharedValue(1);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const pinchStart = useSharedValue({ s: 1, k: 1, tx: 0, ty: 0, fx: 0, fy: 0, n: 2 });
  const panStart = useSharedValue({ tx: 0, ty: 0 });
  const pinching = useSharedValue(false);
  const half = useSharedValue(size / 2);
  // Re-render the SVG at a higher resolution while zoomed so lines stay crisp
  // (on iOS a scaled view would otherwise stretch a bitmap).
  const [renderScale, setRenderScale] = useState(1);
  const commitZoom = useCallback(
    (s: number) => {
      // cap by physical pixels: react-native-svg rasterises the whole view on Android
      const maxR = Math.max(1, Math.min(2.5, 1400 / size, 2048 / (size * PixelRatio.get())));
      const r = s <= 1.05 ? 1 : Math.min(maxR, Math.round(s * 4) / 4);
      setRenderScale(r);
    },
    [size],
  );

  useEffect(() => {
    half.value = size / 2;
  }, [size, half]);

  useEffect(() => {
    if (zoomResetKey === undefined) return;
    scale.value = withSpring(1, { damping: 16 });
    tx.value = withSpring(0, { damping: 16 });
    ty.value = withSpring(0, { damping: 16 });
    commitZoom(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoomResetKey, scale, tx, ty]);

  // ---------------------------------------------------------------- touch state (JS thread)
  const touch = useRef({
    active: false,
    cancelled: false,
    sx: 0,
    sy: 0,
    moved: 0,
    region: null as string | null,
    dragUid: null as string | null,
    dragSticker: null as { id: string; s: number } | null,
    lastDrag: null as { x: number; y: number } | null,
  });

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

  const flushPendingRef = useRef<() => void>(() => {});
  const dropPendingRef = useRef<() => void>(() => {});

  const cancelStroke = useCallback(() => {
    dropPendingRef.current();
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
      if (pointers <= 1) flushPendingRef.current();
      else dropPendingRef.current();
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
          t.dragSticker = { id: st.id, s: st.s };
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
        const ds = t.dragSticker ?? { id: '', s: 1 };
        setDrag({ uid: t.dragUid, id: ds.id, s: ds.s, x: nx, y: ny });
      }
    },
    [cancelStroke, live, scale, toCanvas],
  );

  type Snap = {
    sx: number;
    sy: number;
    cx: number;
    cy: number;
    isTap: boolean;
    region: string | null;
    dragUid: string | null;
    lastDrag: { x: number; y: number } | null;
    pts: number[];
    w: number;
  };

  /** apply the result of a finished touch */
  const commit = useCallback(
    (snap: Snap) => {
      const { tool: tl, paint: p, stickerId: sid, dispatch: send, onEvent: emit, state: st } = latest.current;
      const { cx, cy, isTap } = snap;

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
        const region = snap.region;
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
        } else if (region && snap.pts.length >= 2) {
          send({
            type: 'stroke',
            region,
            stroke: { id: uid('s'), paint: tl === 'eraser' ? null : p, w: snap.w, pts: snap.pts },
          });
          emit?.({ type: 'stroke', region });
        }
        if (!touch.current.active) {
          live.clear();
          setLiveRegion(null);
        }
        return;
      }

      if (tl === 'sticker') {
        if (snap.dragUid) {
          if (snap.lastDrag && !isTap)
            send({ type: 'sticker-move', uid: snap.dragUid, x: Math.round(snap.lastDrag.x), y: Math.round(snap.lastDrag.y) });
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
    },
    [compiled, live, stickerAt],
  );

  // A one-finger gesture that ends "cancelled" may be the first finger of a
  // pinch. Its tap action waits a moment and is dropped if a pinch begins.
  const pending = useRef<{ timer: ReturnType<typeof setTimeout>; snap: Snap } | null>(null);
  const flushPending = useCallback(() => {
    const pnd = pending.current;
    if (!pnd) return;
    clearTimeout(pnd.timer);
    pending.current = null;
    commit(pnd.snap);
  }, [commit]);
  const dropPending = useCallback(() => {
    const pnd = pending.current;
    if (!pnd) return;
    clearTimeout(pnd.timer);
    pending.current = null;
    if (!touch.current.active) {
      live.clear();
      setLiveRegion(null);
    }
  }, [live]);

  flushPendingRef.current = flushPending;
  dropPendingRef.current = dropPending;

  const onUp = useCallback(
    (canceled: boolean) => {
      const t = touch.current;
      if (!t.active) return;
      t.active = false;
      sound.stopLoop();
      if (t.cancelled) {
        t.cancelled = false;
        return;
      }
      const [cx, cy] = toCanvas(t.sx, t.sy);
      const snap: Snap = {
        sx: t.sx,
        sy: t.sy,
        cx,
        cy,
        isTap: t.moved < TAP_SLOP,
        region: t.region,
        dragUid: t.dragUid,
        lastDrag: t.lastDrag,
        pts: live.pts.slice(),
        w: live.w,
      };
      if (canceled && snap.isTap) {
        const timer = setTimeout(flushPending, 90);
        pending.current = { timer, snap };
        return;
      }
      commit(snap);
    },
    [commit, flushPending, live, toCanvas],
  );

  // ---------------------------------------------------------------- gestures
  const draw = usePanGesture({
    runOnJS: true,
    minDistance: 0,
    maxPointers: 1,
    onBegin: (e) => onDown(e.x, e.y, e.numberOfPointers),
    onUpdate: (e) => onMove(e.x, e.y, e.numberOfPointers),
    onFinalize: (e) => onUp(e.canceled),
    // a second finger means pinch/pan, never a tap or a stroke
    onTouchesDown: (e) => {
      if (e.numberOfTouches > 1) cancelStroke();
    },
  });

  const notifyZoom = useCallback(
    (z: boolean, s: number) => {
      commitZoom(z ? s : 1);
      onZoomChange?.(z);
    },
    [commitZoom, onZoomChange],
  );

  const pinch = usePinchGesture({
    onBegin: () => {
      'worklet';
      scheduleOnRN(cancelStroke);
    },
    onActivate: (e) => {
      'worklet';
      pinching.value = true;
      pinchStart.value = { s: scale.value, k: e.scale, tx: tx.value, ty: ty.value, fx: e.focalX, fy: e.focalY, n: e.numberOfPointers };
      scheduleOnRN(cancelStroke);
    },
    onUpdate: (e) => {
      'worklet';
      const st = pinchStart.value;
      // Android keeps the pinch alive until the LAST finger lifts and moves the
      // focal point to the remaining finger: re-anchor instead of jumping.
      if (e.numberOfPointers !== st.n) {
        pinchStart.value = { s: scale.value, k: e.scale, tx: tx.value, ty: ty.value, fx: e.focalX, fy: e.focalY, n: e.numberOfPointers };
        return;
      }
      if (e.numberOfPointers < 2 || st.k === 0) return;
      const c = half.value;
      const s = Math.min(MAX_ZOOM, Math.max(0.9, (st.s * e.scale) / st.k));
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
        scheduleOnRN(notifyZoom, false, 1);
      } else {
        scheduleOnRN(notifyZoom, true, scale.value);
      }
    },
  });

  const pan2 = usePanGesture({
    minPointers: 2,
    onBegin: () => {
      'worklet';
      scheduleOnRN(cancelStroke);
    },
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

  // ---------------------------------------------------------------- overlays
  const S = size * renderScale; // px of the rendered picture
  const k = S / 1000;
  // The stroke being drawn lives in a small overlay that covers only its
  // region (snapped to physical pixels so it lines up exactly). The big picture
  // SVG is not touched until the finger lifts.
  const liveBox = useMemo(() => {
    const r = liveRegion ? compiled.byId[liveRegion] : undefined;
    if (!r) return null;
    const pr = PixelRatio.get();
    const snap = (u: number) => Math.round(Math.max(0, Math.min(1000, u)) * k * pr) / pr;
    const left = snap(r.bbox.x0 - 2);
    const top = snap(r.bbox.y0 - 2);
    const right = snap(r.bbox.x1 + 2);
    const bottom = snap(r.bbox.y1 + 2);
    if (right - left < 1 || bottom - top < 1) return null;
    return { left, top, width: right - left, height: bottom - top, vb: [left / k, top / k, (right - left) / k, (bottom - top) / k] as [number, number, number, number] };
  }, [liveRegion, compiled, k]);
  const dragDef = drag ? getSticker(drag.id) : undefined;
  const dragPx = drag ? 224 * drag.s * 1.08 * k : 0;

  return (
    <GestureDetector gesture={gesture}>
      <View style={[styles.frame, { width: size, height: size }]} collapsable={false} testID="coloring-canvas">
        <Animated.View style={[{ width: size, height: size }, zoomStyle]}>
          {/* The picture is rendered at renderScale x resolution and scaled back down
              in the same React commit, so zoomed lines stay crisp without a size flash. */}
          <View
            style={{
              position: 'absolute',
              left: (size - S) / 2,
              top: (size - S) / 2,
              width: S,
              height: S,
              transform: [{ scale: 1 / renderScale }],
            }}
          >
          <ArtSvg
            picture={picture}
            state={state}
            size={S}
            prefix={prefix}
            activePaint={tool === 'brush' || tool === 'fill' ? paint : null}
            hiddenSticker={drag?.uid ?? null}
          />
          {liveRegion && liveBox ? (
            <View
              pointerEvents="none"
              style={{ position: 'absolute', left: liveBox.left, top: liveBox.top, width: liveBox.width, height: liveBox.height }}
            >
              <ArtSvg
                picture={picture}
                state={state}
                size={liveBox.width}
                width={liveBox.width}
                height={liveBox.height}
                viewBox={liveBox.vb}
                prefix={`${prefix}L`}
                live={live}
                liveRegion={liveRegion}
                liveOnly
                activePaint={tool === 'brush' ? paint : null}
              />
            </View>
          ) : null}
          {drag && dragDef ? (
            <View
              pointerEvents="none"
              style={{ position: 'absolute', left: drag.x * k - dragPx / 2, top: drag.y * k - dragPx / 2, width: dragPx, height: dragPx }}
            >
              <Svg width={dragPx} height={dragPx} viewBox="-12 -12 224 224">
                <StickerArt def={dragDef} />
              </Svg>
            </View>
          ) : null}
          {hintD ? (
            <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, glowStyle]}>
              <Svg width={S} height={S} viewBox="0 0 1000 1000">
                <Path d={hintD} fill="rgba(255,240,150,0.55)" stroke="#FFC233" strokeWidth={14} strokeLinejoin="round" />
              </Svg>
            </Animated.View>
          ) : null}
          </View>
        </Animated.View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  frame: { overflow: 'hidden', backgroundColor: '#fff' },
});
