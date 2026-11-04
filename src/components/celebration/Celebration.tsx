import React, { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg from 'react-native-svg';
import type { Picture } from '../../art/types';
import { sound } from '../../audio/sound';
import { voice } from '../../audio/voice';
import type { PaintState } from '../../engine/paint';
import { C, FONT, softShadow } from '../../theme';
import { haptic } from '../../utils/feedback';
import { ArtSvg, getSticker, StickerArt } from '../art/ArtSvg';
import { BubbleButton } from '../ui/BubbleButton';
import { Icon } from '../ui/Icon';
import { Particles } from './Particles';

/**
 * Animation clock in seconds driving the picture's character animation.
 * Every tick re-renders the SVG (rasterised on the CPU on Android), so it is
 * capped at 30 fps there and settles after `maxSeconds`.
 */
export const CLOCK_STEP = Platform.OS === 'android' ? 1 / 20 : 1 / 50;
export const CLOCK_SECONDS = Platform.OS === 'android' ? 8 : 12;

export function useClock(active: boolean, maxSeconds = CLOCK_SECONDS): number {
  const [t, setT] = useState(0);
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const start = Date.now();
    let last = 0;
    const tick = () => {
      const now = (Date.now() - start) / 1000;
      if (now >= maxSeconds) {
        setT(maxSeconds);
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
  }, [active, maxSeconds]);
  return t;
}

interface Props {
  picture: Picture;
  state: PaintState;
  earnedSticker: string | null;
  onContinue: () => void;
  onNext?: () => void;
  onGallery: () => void;
}

export function Celebration({ picture, state, earnedSticker, onContinue, onNext, onGallery }: Props) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const t = useClock(true);
  const landscape = width > height;
  // every animation tick re-rasterises this SVG on the CPU on Android: keep it modest
  const artSize = Math.min(landscape ? height * 0.62 : width * 0.78, landscape ? width * 0.42 : height * 0.5, Platform.OS === 'android' ? 380 : 560);

  const pop = useSharedValue(0.3);
  const wobble = useSharedValue(0);
  const reward = useSharedValue(0);
  const spin = useSharedValue(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    pop.value = withSpring(1, { damping: 9, stiffness: 140 });
    wobble.value = withRepeat(withSequence(withTiming(1, { duration: 1300 }), withTiming(-1, { duration: 1300 })), -1, true);
    sound.play('celebrate');
    haptic('success');
    const later = (ms: number, fn: () => void) => timers.current.push(setTimeout(fn, ms));
    later(650, () => sound.character(picture.celebrate?.sound));
    later(900, () => voice.say('voice.done', { force: true }));
    if (earnedSticker) {
      later(1700, () => {
        reward.value = withSpring(1, { damping: 8, stiffness: 120 });
        spin.value = withSequence(withTiming(360, { duration: 700 }), withRepeat(withSequence(withTiming(352, { duration: 600 }), withTiming(368, { duration: 600 })), -1, true));
        sound.play('sticker');
        later(300, () => sound.play('twinkle'));
      });
      later(3200, () => voice.say('voice.newSticker', { force: true, queue: true }));
    }
    const list = timers.current;
    return () => list.forEach(clearTimeout);
  }, [earnedSticker, picture, pop, reward, spin, wobble]);

  const artStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pop.value }, { rotate: `${wobble.value * 1.5}deg` }],
  }));
  const rewardStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, reward.value * 1.5),
    transform: [{ translateY: (1 - reward.value) * 140 }, { scale: 0.5 + reward.value * 0.5 }],
  }));
  const stickerSpin = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.value}deg` }] }));

  const sticker = earnedSticker ? getSticker(earnedSticker) : undefined;
  const particles = picture.celebrate?.particles ?? 'stars';
  const btn = landscape ? 72 : 76;

  return (
    <Animated.View entering={FadeIn.duration(250)} exiting={FadeOut.duration(200)} style={StyleSheet.absoluteFill} testID="celebration">
      <View style={[StyleSheet.absoluteFill, styles.dim]} />
      <View
        style={[
          styles.content,
          { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 12, flexDirection: landscape ? 'row' : 'column' },
        ]}
        pointerEvents="box-none"
      >
        <Animated.View style={[styles.frame, softShadow(14), artStyle]}>
          <View style={styles.inner}>
            <ArtSvg picture={picture} state={state} size={artSize} prefix="cel" time={t} />
          </View>
        </Animated.View>

        <View style={[styles.side, landscape && { marginLeft: 28 }]}>
          {sticker ? (
            <Animated.View style={[styles.reward, softShadow(8), rewardStyle]}>
              <Animated.View style={stickerSpin}>
                <Svg width={110} height={110} viewBox="-10 -10 220 220">
                  <StickerArt def={sticker} />
                </Svg>
              </Animated.View>
              <Text style={styles.rewardText}>Yeni çıkartma!</Text>
            </Animated.View>
          ) : (
            <View style={styles.cheer}>
              <Icon name="star" size={64} color="#FFE27A" />
              <Icon name="heart" size={56} color="#FF8FB8" />
              <Icon name="star" size={64} color="#C9B8FF" />
            </View>
          )}
          <View style={styles.buttons}>
            <BubbleButton a11y="Galeriye git" size={btn} color={C.lilacMid} onPress={onGallery} testID="cel-gallery">
              <Icon name="gallery" size={btn * 0.62} color={C.mintMid} accent={C.pinkMid} />
            </BubbleButton>
            <BubbleButton a11y="Boyamaya devam et" size={btn} color={C.mintMid} onPress={onContinue} testID="cel-continue">
              <Icon name="check" size={btn * 0.62} />
            </BubbleButton>
            {onNext && (
              <BubbleButton a11y="Sonraki resim" size={btn} color={C.yellowMid} onPress={onNext} glow testID="cel-next">
                <Icon name="next" size={btn * 0.62} />
              </BubbleButton>
            )}
          </View>
        </View>
      </View>
      <Particles kind={particles} width={width} height={height} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  dim: { backgroundColor: 'rgba(255, 236, 248, 0.86)' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  frame: {
    backgroundColor: '#FFE68A',
    borderRadius: 34,
    padding: 12,
    borderWidth: 5,
    borderColor: C.ink,
  },
  inner: { borderRadius: 24, overflow: 'hidden', backgroundColor: '#fff', borderWidth: 4, borderColor: C.ink },
  side: { alignItems: 'center', marginTop: 18 },
  reward: {
    backgroundColor: '#fff',
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 4,
    borderColor: C.lilacMid,
  },
  rewardText: { fontFamily: FONT.bold, fontSize: 20, color: C.lilacDeep, marginTop: 2 },
  cheer: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  buttons: { flexDirection: 'row', gap: 18, marginTop: 18 },
});
