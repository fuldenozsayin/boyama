import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { AppState, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getPicture, isFreeId, nextPicture } from '../../art';
import { sound } from '../../audio/sound';
import { voice } from '../../audio/voice';
import { Celebration } from '../../components/celebration/Celebration';
import { ColoringCanvas, type CanvasEvent, type Tool } from '../../components/canvas/ColoringCanvas';
import { ColorSwatches, EffectChips, SizePicker, StickerTray } from '../../components/canvas/Palette';
import { BubbleButton } from '../../components/ui/BubbleButton';
import { ConfirmDialog } from '../../components/ui/Dialogs';
import { Icon } from '../../components/ui/Icon';
import { PastelBackground } from '../../components/ui/PastelBackground';
import { compilePicture, visibleSamples } from '../../engine/compile';
import {
  coloredRatio,
  EMPTY_STATE,
  historyReducer,
  initHistory,
  isBlank,
  isColored,
  type PaintKind,
  type PaintState,
} from '../../engine/paint';
import { loadArt, saveArt } from '../../store/artStorage';
import { ownedStickerIds, useApp } from '../../store/useApp';
import { C, FONT, softShadow } from '../../theme';
import { haptic } from '../../utils/feedback';

const BRUSH_W = [14, 30, 58];
const ERASER_W = [26, 48, 84];

export default function ColorScreen() {
  const { id: rawId } = useLocalSearchParams<{ id: string }>();
  const routeId = String(rawId ?? 'free');
  const picture = getPicture(routeId);
  const free = isFreeId(routeId);
  const artworkId = routeId;

  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const landscape = width > height * 1.05;

  const settings = useApp((s) => s.settings);
  const owned = useApp((s) => s.owned);
  const fresh = useApp((s) => s.fresh);
  const setProgress = useApp((s) => s.setProgress);
  const complete = useApp((s) => s.complete);
  const nextFreeId = useApp((s) => s.nextFreeId);
  const stickerIds = useMemo(() => ownedStickerIds(owned), [owned]);

  const [history, dispatch] = useReducer(historyReducer, undefined, () => initHistory());
  const state = history.present;
  const [ready, setReady] = useState(false);

  const [tool, setTool] = useState<Tool>('fill');
  const [color, setColor] = useState('#FF8FC7');
  const [kind, setKind] = useState<PaintKind>('solid');
  const [sizeIdx, setSizeIdx] = useState(1);
  const [stickerId, setStickerId] = useState<string | null>(null);
  const [zoomed, setZoomed] = useState(false);
  const [zoomReset, setZoomReset] = useState(0);
  const [hint, setHint] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [celebration, setCelebration] = useState<{ state: PaintState; sticker: string | null } | null>(null);

  const prevPct = useRef<number | null>(null);
  const paint = useMemo(() => ({ k: kind, c: color }), [kind, color]);
  const compiled = useMemo(() => (picture ? compilePicture(picture) : null), [picture]);
  const regionIds = useMemo(() => compiled?.regions.map((r) => r.id) ?? [], [compiled]);
  const pct = free ? (isBlank(state) ? 0 : 1) : coloredRatio(state, regionIds);
  const doneReady = free ? !isBlank(state) : pct >= 0.5;

  // ------------------------------------------------------------- load + autosave
  useEffect(() => {
    let alive = true;
    setReady(false);
    prevPct.current = null;
    setHint(null);
    loadArt(artworkId).then((s) => {
      if (!alive) return;
      dispatch({ type: 'load', state: s ?? EMPTY_STATE });
      setReady(true);
    });
    voice.say(free ? 'voice.freeDraw' : 'voice.startColoring');
    return () => {
      alive = false;
    };
  }, [artworkId, free]);

  const latestState = useRef(state);
  latestState.current = state;
  const dirty = useRef(false);
  const saveNow = useCallback(() => {
    if (!dirty.current) return;
    dirty.current = false;
    saveArt(artworkId, latestState.current);
  }, [artworkId]);

  useEffect(() => {
    if (!ready) return;
    dirty.current = true;
    const tmr = setTimeout(saveNow, 450);
    if (!free) setProgress(artworkId, pct);
    return () => clearTimeout(tmr);
  }, [state, ready, saveNow, free, artworkId, pct, setProgress]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => {
      if (s !== 'active') saveNow();
    });
    return () => {
      sub.remove();
      saveNow();
      sound.stopLoop();
    };
  }, [saveNow]);

  useEffect(() => {
    if (!stickerId && stickerIds.length) setStickerId(stickerIds[stickerIds.length - 1]);
  }, [stickerId, stickerIds]);

  // ------------------------------------------------------------- celebration
  const celebrate = useCallback(() => {
    saveNow();
    sound.stopLoop();
    let target = artworkId;
    if (artworkId === 'free') {
      target = nextFreeId();
      saveArt(target, latestState.current);
    }
    const earned = complete(target, { firstTimeReward: !free });
    setHint(null);
    setCelebration({ state: latestState.current, sticker: earned });
  }, [artworkId, complete, free, nextFreeId, saveNow]);

  // auto-celebrate the moment the last region gets coloured
  useEffect(() => {
    if (!ready || free) return;
    const prev = prevPct.current;
    prevPct.current = pct;
    if (prev !== null && prev < 1 && pct >= 1 && !celebration) {
      const tmr = setTimeout(celebrate, 450);
      return () => clearTimeout(tmr);
    }
  }, [pct, ready, free, celebrate, celebration]);

  // ------------------------------------------------------------- hints
  const hintOrder = useMemo(() => {
    if (!compiled) return [];
    const samples = visibleSamples(compiled, 12);
    return [...compiled.regions].sort((a, b) => samples[b.id].length - samples[a.id].length).map((r) => r.id);
  }, [compiled]);

  const showHint = useCallback(() => {
    const target = hintOrder.find((rid) => !isColored(latestState.current, rid));
    if (!target) {
      voice.praise();
      return;
    }
    setHint(null);
    requestAnimationFrame(() => setHint(target));
    sound.play('twinkle');
  }, [hintOrder]);

  useEffect(() => {
    if (!hint) return;
    const tmr = setTimeout(() => setHint(null), 3600);
    return () => clearTimeout(tmr);
  }, [hint]);

  // ------------------------------------------------------------- canvas events
  const fills = useRef(0);
  const onEvent = useCallback(
    (e: CanvasEvent) => {
      switch (e.type) {
        case 'filled':
          sound.pop();
          haptic('light');
          if (e.region === hint) setHint(null);
          fills.current++;
          if (fills.current % 9 === 0) voice.praise();
          break;
        case 'stroke':
          if (e.region === hint) setHint(null);
          break;
        case 'cleared':
          sound.play('undo');
          haptic('light');
          break;
        case 'sticker-placed':
          sound.play('sticker');
          haptic('medium');
          break;
        case 'sticker-removed':
          sound.play('undo');
          break;
        case 'need-sticker':
          if (stickerIds.length) setStickerId(stickerIds[0]);
          break;
      }
    },
    [hint, stickerIds],
  );

  const chooseTool = (t: Tool) => {
    setTool(t);
    if (t === 'brush') voice.say('voice.brush');
    if (t === 'eraser') voice.say('voice.eraser');
    if (t === 'sticker') voice.say('voice.sticker');
  };

  const pickColor = (c: string) => {
    setColor(c);
    if (tool === 'eraser' || tool === 'sticker') setTool('fill');
  };

  const pickKind = (k: PaintKind) => {
    setKind(k);
    if (k !== 'solid') voice.say('voice.magic');
    if (tool === 'eraser' || tool === 'sticker') setTool('fill');
  };

  // ------------------------------------------------------------- done button wiggle
  const meterShake = useSharedValue(0);
  const meterStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${meterShake.value}deg` }] }));
  const pressDone = () => {
    if (doneReady) {
      celebrate();
      return;
    }
    meterShake.value = withSequence(withTiming(-8, { duration: 70 }), withTiming(8, { duration: 70 }), withTiming(-5, { duration: 70 }), withSpring(0));
    voice.say('voice.almost', { force: true });
    showHint();
  };

  if (!picture) {
    return (
      <View style={styles.missing}>
        <PastelBackground />
        <BubbleButton a11y="Ana sayfa" size={90} color={C.pinkMid} onPress={() => router.replace('/')}>
          <Icon name="home" size={60} />
        </BubbleButton>
      </View>
    );
  }

  // ------------------------------------------------------------- layout
  const pad = 10;
  const btn = landscape ? 58 : 54;
  const sideTools = 92;
  const sidePalette = Math.min(270, Math.max(190, width * 0.22));
  const topBar = 70;
  // fixed height so the canvas never jumps when switching tools
  const paletteH = 122;
  const bottomPanel = btn + 16 + paletteH + 10;
  const canvasSize = Math.floor(
    landscape
      ? Math.min(height - insets.top - insets.bottom - pad * 2, width - insets.left - insets.right - sideTools - sidePalette - pad * 4)
      : Math.min(width - insets.left - insets.right - pad * 2, height - insets.top - insets.bottom - topBar - bottomPanel - pad * 3),
  );

  const brushWidth = tool === 'eraser' ? ERASER_W[sizeIdx] : BRUSH_W[sizeIdx];

  const backBtn = (
    <BubbleButton
      a11y="Geri"
      size={btn}
      color={C.pinkMid}
      onPress={() => {
        saveNow();
        sound.play('whoosh');
        if (router.canGoBack()) router.back();
        else router.replace('/');
      }}
      testID="color-back"
    >
      <Icon name="back" size={btn * 0.62} />
    </BubbleButton>
  );

  const progressMeter = free ? null : (
    <Animated.View style={[styles.meter, meterStyle]} accessibilityLabel={`İlerleme yüzde ${Math.round(pct * 100)}`}>
      <View style={styles.meterTrack}>
        <View style={[styles.meterFill, { width: `${Math.max(6, Math.round(pct * 100))}%` }]} />
      </View>
      <View style={styles.meterStar}>
        <Icon name="star" size={38} color={pct >= 1 ? '#FFD24A' : '#FFF4C2'} />
      </View>
    </Animated.View>
  );

  const historyBtns = (
    <>
      <BubbleButton
        a11y="Geri al"
        size={btn}
        color={C.blueMid}
        disabled={!history.past.length}
        silent
        onPress={() => {
          sound.play('undo');
          dispatch({ type: 'undo' });
        }}
        testID="undo"
      >
        <Icon name="undo" size={btn * 0.66} />
      </BubbleButton>
      <BubbleButton
        a11y="İleri al"
        size={btn}
        color={C.blueMid}
        disabled={!history.future.length}
        onPress={() => dispatch({ type: 'redo' })}
        testID="redo"
      >
        <Icon name="redo" size={btn * 0.66} />
      </BubbleButton>
    </>
  );

  const doneBtn = (
    <BubbleButton a11y="Bitti" size={btn + 6} color={doneReady ? C.mintMid : '#E6E1EE'} glow={doneReady && !celebration} silent onPress={pressDone} testID="done">
      <Icon name="check" size={btn * 0.66} color={doneReady ? '#fff' : '#F4F1F8'} />
    </BubbleButton>
  );

  const toolBtn = (t: Tool, icon: 'bucket' | 'brush' | 'eraser' | 'sticker', label: string, tint: string) => (
    <BubbleButton
      key={t}
      a11y={label}
      size={btn}
      color={tool === t ? tint : '#FFFFFF'}
      selected={tool === t}
      onPress={() => chooseTool(t)}
      testID={`tool-${t}`}
    >
      <Icon name={icon} size={btn * 0.68} color={t === 'eraser' ? C.pinkMid : kind === 'rainbow' ? '#B48CFF' : color} accent={C.yellowMid} />
    </BubbleButton>
  );

  const tools = [
    toolBtn('fill', 'bucket', 'Boya kovası', C.yellowMid),
    toolBtn('brush', 'brush', 'Fırça', C.mintMid),
    toolBtn('eraser', 'eraser', 'Silgi', C.pinkMid),
    toolBtn('sticker', 'sticker', 'Çıkartmalar', C.lilacMid),
  ];

  const extraBtns = (
    <>
      {!free && (
        <BubbleButton a11y="İpucu" size={btn} color={C.yellow} onPress={showHint} testID="hint">
          <Icon name="bulb" size={btn * 0.66} color="#FFE27A" />
        </BubbleButton>
      )}
      <BubbleButton
        a11y="Sayfayı temizle"
        size={btn}
        color={C.peachMid}
        disabled={isBlank(state)}
        onPress={() => {
          voice.say('voice.reset');
          setConfirmReset(true);
        }}
        testID="reset"
      >
        <Icon name="trash" size={btn * 0.64} color={C.pinkMid} />
      </BubbleButton>
    </>
  );

  const sizes =
    tool === 'brush' || tool === 'eraser' ? (
      <SizePicker value={sizeIdx} onChange={setSizeIdx} color={tool === 'eraser' ? '#fff' : color} vertical={landscape} />
    ) : null;

  const palette =
    tool === 'sticker' ? (
      <StickerTray ids={stickerIds} selected={stickerId} fresh={fresh} onSelect={setStickerId} vertical={landscape} />
    ) : (
      <>
        <EffectChips color={color} kind={kind} onSelect={pickKind} vertical={landscape} size={landscape ? 44 : 40} />
        <View style={styles.divider} />
        <ColorSwatches selected={color} onSelect={pickColor} vertical={landscape} size={landscape ? 42 : 44} />
      </>
    );

  const canvas = (
    <View style={[styles.canvasWrap, softShadow(10), { width: canvasSize + 12, height: canvasSize + 12 }]}>
      {ready ? (
        <Animated.View entering={FadeIn.duration(250)}>
          <ColoringCanvas
            picture={picture}
            state={state}
            size={canvasSize}
            tool={tool}
            paint={paint}
            brushWidth={brushWidth}
            stickerId={stickerId}
            dispatch={dispatch}
            onEvent={onEvent}
            zoomResetKey={zoomReset}
            onZoomChange={setZoomed}
            hintRegion={hint}
            prefix={`cv${artworkId}`}
          />
        </Animated.View>
      ) : (
        <View style={{ width: canvasSize, height: canvasSize }} />
      )}
      {zoomed && (
        <View style={styles.zoomBtn}>
          <BubbleButton
            a11y="Yakınlaştırmayı sıfırla"
            size={50}
            color="#fff"
            onPress={() => {
              setZoomReset((n) => n + 1);
              setZoomed(false);
            }}
          >
            <Icon name="zoomOut" size={34} accent={C.lilacMid} />
          </BubbleButton>
        </View>
      )}
    </View>
  );

  const left = settings.leftHanded;

  return (
    <View style={styles.root}>
      <PastelBackground floaters={false} />
      {landscape ? (
        <View
          style={[
            styles.landscape,
            {
              paddingTop: insets.top + pad,
              paddingBottom: insets.bottom + pad,
              paddingLeft: insets.left + pad,
              paddingRight: insets.right + pad,
              flexDirection: left ? 'row-reverse' : 'row',
            },
          ]}
        >
          <View style={[styles.sideCol, { width: sideTools }]}>
            {backBtn}
            <View style={styles.colGroup}>{tools}</View>
            {sizes}
            <View style={styles.colGroup}>{extraBtns}</View>
          </View>
          <View style={styles.center}>{canvas}</View>
          <View style={[styles.paletteCol, softShadow(6), { width: sidePalette }]}>
            <View style={styles.topRow}>
              {historyBtns}
              {doneBtn}
            </View>
            {progressMeter}
            <View style={styles.flex}>{palette}</View>
          </View>
        </View>
      ) : (
        <View style={[styles.flex, { paddingTop: insets.top + 6, paddingBottom: insets.bottom + 6, paddingLeft: insets.left, paddingRight: insets.right }]}>
          <View style={[styles.topBar, { height: topBar }]}>
            {backBtn}
            <View style={styles.flex}>{progressMeter}</View>
            {historyBtns}
            {doneBtn}
          </View>
          <View style={styles.center}>{canvas}</View>
          <View style={[styles.bottomPanel, softShadow(8)]}>
            <View style={styles.toolRow}>
              {tools}
              <View style={styles.flex} />
              {sizes ?? extraBtns}
            </View>
            <View style={{ height: paletteH, justifyContent: 'center' }}>{palette}</View>
          </View>
        </View>
      )}

      {celebration && (
        <Celebration
          picture={picture}
          state={celebration.state}
          earnedSticker={celebration.sticker}
          onContinue={() => {
            setCelebration(null);
            if (artworkId === 'free') dispatch({ type: 'load', state: EMPTY_STATE });
          }}
          onGallery={() => {
            setCelebration(null);
            if (artworkId === 'free') dispatch({ type: 'load', state: EMPTY_STATE });
            router.push('/gallery');
          }}
          onNext={
            free
              ? undefined
              : () => {
                  const nxt = nextPicture(picture.id);
                  setCelebration(null);
                  if (nxt) router.replace({ pathname: '/color/[id]', params: { id: nxt.id } });
                }
          }
        />
      )}

      <ConfirmDialog
        visible={confirmReset}
        icon="trash"
        onNo={() => setConfirmReset(false)}
        onYes={() => {
          setConfirmReset(false);
          sound.play('whoosh');
          dispatch({ type: 'reset' });
        }}
      />
      {!ready && <Text style={styles.hidden}>yükleniyor</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  hidden: { position: 'absolute', opacity: 0 },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 10 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  canvasWrap: {
    backgroundColor: '#fff',
    borderRadius: 26,
    padding: 6,
    borderWidth: 0,
    overflow: 'hidden',
  },
  zoomBtn: { position: 'absolute', right: 12, top: 12 },
  bottomPanel: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 30,
    marginHorizontal: 8,
    paddingVertical: 8,
  },
  toolRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 10, paddingBottom: 4 },
  divider: { height: 2, backgroundColor: '#F1EAF8', marginHorizontal: 18, marginVertical: 2, borderRadius: 1 },
  landscape: { flex: 1 },
  sideCol: { alignItems: 'center', justifyContent: 'space-between' },
  colGroup: { gap: 10, alignItems: 'center' },
  paletteCol: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  topRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 8 },
  meter: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 6, marginBottom: 4 },
  meterTrack: {
    flex: 1,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: C.ink,
    overflow: 'hidden',
    marginRight: -12,
  },
  meterFill: { height: '100%', backgroundColor: C.yellowMid, borderRadius: 8 },
  meterStar: {},
  meterLabel: { fontFamily: FONT.bold },
});
