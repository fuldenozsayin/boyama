import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, Modal, Platform, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getPicture } from '../art';
import { sound } from '../audio/sound';
import { voice } from '../audio/voice';
import { ArtSvg } from '../components/art/ArtSvg';
import { CLOCK_STEP } from '../components/celebration/Celebration';
import { ArtThumb } from '../components/art/ArtThumb';
import { BubbleButton } from '../components/ui/BubbleButton';
import { ConfirmDialog, ParentGate } from '../components/ui/Dialogs';
import { Icon } from '../components/ui/Icon';
import { Mascot } from '../components/ui/Mascot';
import { PastelBackground } from '../components/ui/PastelBackground';
import { ScreenHeader } from '../components/ui/ScreenHeader';
import { EMPTY_STATE, type PaintState } from '../engine/paint';
import { deleteArt, loadArt } from '../store/artStorage';
import { useApp } from '../store/useApp';
import { C, softShadow } from '../theme';

const FRAME_COLORS = ['#FFC8DD', '#E2D4FF', '#C9F2DF', '#FFF1B3', '#CDE7FF', '#FFE0CC'];

/** Big view of one artwork; "play" replays its celebration animation. */
function Viewer({ id, onClose, onDelete }: { id: string; onClose: () => void; onDelete: () => void }) {
  const { width, height } = useWindowDimensions();
  const pic = getPicture(id);
  const [state, setState] = useState<PaintState>(EMPTY_STATE);
  const [t, setT] = useState<number | undefined>(undefined);
  useEffect(() => {
    loadArt(id).then((s) => setState(s ?? EMPTY_STATE));
  }, [id]);
  useEffect(() => {
    if (t === undefined) return;
    let raf = 0;
    const start = Date.now() - t * 1000;
    let last = -1;
    const tick = () => {
      const now = (Date.now() - start) / 1000;
      if (now > 6) {
        setT(undefined);
        return;
      }
      if (now - last >= CLOCK_STEP) {
        last = now;
        setT(now);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // only restart when animation is toggled on
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t === undefined]);
  if (!pic) return null;
  // landscape phones: picture beside the buttons, so both fit the short height
  const landscape = width > height;
  const size = landscape ? Math.min(height - 96, width * 0.6, 640) : Math.min(width * 0.86, height * 0.66, 640);
  // iOS: the button row (3 big + 1 small + gaps) must fit iPad Slide Over
  // windows (320 pt); Android and web keep the original size
  const b =
    landscape || Platform.OS !== 'ios' ? 72 : Math.max(52, Math.min(72, Math.floor((width - 32 - 48 - 56) / 3)));
  return (
    <View style={[styles.viewerBackdrop, landscape && { flexDirection: 'row', gap: 28 }]}>
      <Animated.View entering={ZoomIn.springify()} style={[styles.bigFrame, softShadow(14)]}>
        <View style={styles.bigInner}>
          <ArtSvg picture={pic} state={state} size={size} prefix="view" time={t} />
        </View>
      </Animated.View>
      <View style={[styles.viewerBtns, landscape && { flexDirection: 'column', marginTop: 0 }]}>
        <BubbleButton a11y="Kapat" size={b} color={C.pinkMid} onPress={onClose} testID="viewer-close">
          <Icon name="close" size={Math.round(b * 0.61)} />
        </BubbleButton>
        <BubbleButton
          a11y="Canlandır"
          size={b}
          color={C.yellowMid}
          onPress={() => {
            sound.play('magic');
            sound.character(pic.celebrate?.sound);
            setT(0);
          }}
          testID="viewer-play"
        >
          <Icon name="play" size={Math.round(b * 0.61)} color="#fff" />
        </BubbleButton>
        <BubbleButton
          a11y="Boyamaya devam et"
          size={b}
          color={C.mintMid}
          onPress={() => {
            onClose();
            router.push({ pathname: '/color/[id]', params: { id } });
          }}
          testID="viewer-edit"
        >
          <Icon name="brush" size={Math.round(b * 0.64)} color={C.pinkMid} accent={C.yellowMid} />
        </BubbleButton>
        <BubbleButton a11y="Sil (ebeveyn)" size={56} color="#EEE8F5" onPress={onDelete} testID="viewer-delete">
          <Icon name="trash" size={34} color={C.pinkMid} />
        </BubbleButton>
      </View>
    </View>
  );
}

export default function Gallery() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const gallery = useApp((s) => s.gallery);
  const removeArtwork = useApp((s) => s.removeArtwork);
  const [open, setOpen] = useState<string | null>(null);
  const [gate, setGate] = useState(false);
  const [confirm, setConfirm] = useState(false);
  // iOS can't present a modal while another one is still animating away, so
  // the next step waits for onDismiss there (Android switches at once)
  const after = useRef<'confirm' | 'close' | null>(null);

  useFocusEffect(
    useCallback(() => {
      voice.say('voice.gallery');
    }, []),
  );

  const cols = width > height ? 4 : width > 700 ? 3 : 2;
  const gap = 18;
  const cell = Math.min(300, (width - insets.left - insets.right - 32 - gap * (cols - 1)) / cols);
  const items = gallery.filter((g) => getPicture(g.id));

  return (
    <View style={styles.root}>
      <PastelBackground />
      <ScreenHeader icon="gallery" iconColor={C.mintMid} />
      {items.length === 0 ? (
        <View style={styles.empty}>
          <Mascot size={180} />
          <BubbleButton a11y="Boyamaya başla" size={110} color={C.pinkMid} glow onPress={() => router.replace('/categories')}>
            <Icon name="play" size={66} color="#fff" />
          </BubbleButton>
        </View>
      ) : (
        <FlatList
          key={cols}
          data={items}
          keyExtractor={(g) => g.id}
          numColumns={cols}
          initialNumToRender={cols * 3}
          maxToRenderPerBatch={cols * 2}
          windowSize={5}
          removeClippedSubviews
          columnWrapperStyle={cols > 1 ? { gap, justifyContent: 'center' } : undefined}
          contentContainerStyle={{ gap, paddingTop: 8, paddingLeft: 16 + insets.left, paddingRight: 16 + insets.right, paddingBottom: insets.bottom + 24 }}
          renderItem={({ item: g, index: i }) => {
            const pic = getPicture(g.id)!;
            return (
              <Animated.View entering={i < cols * 3 ? FadeInUp.delay(i * 60) : undefined}>
                <Pressable
                  onPress={() => {
                    sound.play('tap');
                    setOpen(g.id);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={pic.title}
                  testID={`art-${g.id}`}
                  style={[styles.frame, softShadow(6), { backgroundColor: FRAME_COLORS[i % FRAME_COLORS.length] }]}
                >
                  <View style={styles.paper}>
                    <ArtThumb artworkId={g.id} picture={pic} size={cell - 28} />
                  </View>
                </Pressable>
              </Animated.View>
            );
          }}
        />
      )}

      <Modal visible={!!open} transparent animationType="fade" onRequestClose={() => setOpen(null)} supportedOrientations={['portrait', 'landscape']}>
        {open && (
          <Animated.View entering={FadeIn} style={styles.flex}>
            <Viewer id={open} onClose={() => setOpen(null)} onDelete={() => setGate(true)} />
          </Animated.View>
        )}
        <ParentGate
          visible={gate}
          onClose={() => setGate(false)}
          onPass={() => {
            setGate(false);
            if (Platform.OS === 'ios') after.current = 'confirm';
            else setConfirm(true);
          }}
          onDismiss={() => {
            if (after.current !== 'confirm') return;
            after.current = null;
            setConfirm(true);
          }}
        />
        <ConfirmDialog
          visible={confirm}
          icon="trash"
          message="Bu resim galeriden silinsin mi?"
          onNo={() => setConfirm(false)}
          onYes={() => {
            if (open) {
              removeArtwork(open);
              if (open.startsWith('free-')) deleteArt(open);
            }
            setConfirm(false);
            if (Platform.OS === 'ios') after.current = 'close';
            else setOpen(null);
          }}
          onDismiss={() => {
            if (after.current !== 'close') return;
            after.current = null;
            setOpen(null);
          }}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', paddingHorizontal: 16, paddingTop: 8 },
  frame: { borderRadius: 26, padding: 10, borderWidth: 4, borderColor: C.ink },
  paper: { borderRadius: 16, overflow: 'hidden', backgroundColor: '#fff', borderWidth: 3, borderColor: C.ink },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24 },
  viewerBackdrop: { flex: 1, backgroundColor: 'rgba(255,236,248,0.95)', alignItems: 'center', justifyContent: 'center', padding: 16 },
  bigFrame: { backgroundColor: '#FFE68A', borderRadius: 34, padding: 12, borderWidth: 5, borderColor: C.ink },
  bigInner: { borderRadius: 22, overflow: 'hidden', backgroundColor: '#fff', borderWidth: 4, borderColor: C.ink },
  viewerBtns: { flexDirection: 'row', gap: 16, marginTop: 22, alignItems: 'center' },
});
