import React, { memo, useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { circle, heart, petal, star, twinkle } from '../../art/dsl';
import type { ParticleKind } from '../../art/types';
import { RAINBOW_STOPS } from '../../engine/paints';

const SHAPES = {
  star: star(50, 52, 44, 24),
  heart: heart(50, 52, 84),
  twinkle: twinkle(50, 50, 46),
  bubble: circle(50, 50, 40),
  petal: petal([50, 92], [50, 8], 26),
};

const PALETTES: Record<ParticleKind, string[]> = {
  stars: ['#FFE27A', '#FFC6E0', '#C9B8FF', '#FFFFFF', '#9ED6FF'],
  hearts: ['#FF8FB8', '#FFB8D9', '#FF7A93', '#FFD3E6', '#C9B8FF'],
  sparkles: ['#FFE27A', '#FFFFFF', '#FFC6E0', '#E3D4FF'],
  bubbles: ['#CFE8FF', '#B9F0FF', '#E0F7FF', '#D7C2FF'],
  petals: ['#FFB8D9', '#FFD3A5', '#FFF0A0', '#C8F0D0', '#D7C2FF'],
  rainbow: RAINBOW_STOPS,
};

type Mode = 'burst' | 'rise' | 'fall';

function shapeFor(kind: ParticleKind, i: number): string {
  switch (kind) {
    case 'hearts':
      return i % 3 === 0 ? SHAPES.twinkle : SHAPES.heart;
    case 'sparkles':
      return i % 2 ? SHAPES.twinkle : SHAPES.star;
    case 'bubbles':
      return SHAPES.bubble;
    case 'petals':
      return i % 4 === 0 ? SHAPES.heart : SHAPES.petal;
    case 'rainbow':
      return [SHAPES.star, SHAPES.heart, SHAPES.twinkle][i % 3];
    default:
      return i % 3 === 0 ? SHAPES.twinkle : SHAPES.star;
  }
}

interface P {
  d: string;
  color: string;
  size: number;
  angle: number;
  dist: number;
  spin: number;
  delay: number;
  duration: number;
  x0: number;
}

const Particle = memo(function Particle({ p, mode, w, h, progress }: { p: P; mode: Mode; w: number; h: number; progress: SharedValue<number> }) {
  const style = useAnimatedStyle(() => {
    const t = progress.value;
    let x = 0;
    let y = 0;
    let o = 1;
    if (mode === 'burst') {
      const e = 1 - (1 - t) * (1 - t);
      x = w / 2 + Math.cos(p.angle) * p.dist * e;
      y = h * 0.42 + Math.sin(p.angle) * p.dist * e + 160 * t * t;
      o = t < 0.75 ? 1 : 1 - (t - 0.75) / 0.25;
    } else if (mode === 'rise') {
      x = p.x0 * w + Math.sin(t * 6.28 * 1.5 + p.angle) * 18;
      y = h + 40 - (h + 120) * t;
      o = t < 0.85 ? 0.9 : 0.9 * (1 - (t - 0.85) / 0.15);
    } else {
      x = p.x0 * w + Math.sin(t * 6.28 + p.angle) * 30;
      y = -40 + (h + 80) * t;
      o = t < 0.85 ? 1 : 1 - (t - 0.85) / 0.15;
    }
    return {
      opacity: o,
      transform: [
        { translateX: x - p.size / 2 },
        { translateY: y - p.size / 2 },
        { rotate: `${p.spin * t}deg` },
        { scale: mode === 'burst' ? 0.4 + Math.min(1, t * 4) * 0.6 : 1 },
      ],
    };
  });
  return (
    <Animated.View style={[styles.particle, style]}>
      <Svg width={p.size} height={p.size} viewBox="0 0 100 100">
        <Path d={p.d} fill={p.color} stroke="#4E3D63" strokeWidth={5} strokeLinejoin="round" opacity={0.95} />
      </Svg>
    </Animated.View>
  );
});

function ParticleDriver({ p, mode, w, h, loop }: { p: P; mode: Mode; w: number; h: number; loop: boolean }) {
  const progress = useSharedValue(0);
  useEffect(() => {
    const timing = withTiming(1, { duration: p.duration, easing: Easing.linear });
    progress.set(withDelay(p.delay, loop ? withRepeat(timing, -1, false) : timing));
  }, [p, loop, progress]);
  return <Particle p={p} mode={mode} w={w} h={h} progress={progress} />;
}

/** Celebration confetti tuned per category: stars, hearts, bubbles, petals... */
export const Particles = memo(function Particles({
  kind,
  width,
  height,
}: {
  kind: ParticleKind;
  width: number;
  height: number;
}) {
  const colors = PALETTES[kind];
  const burst = useMemo<P[]>(
    () =>
      Array.from({ length: 26 }, (_, i) => ({
        d: shapeFor(kind, i),
        color: colors[i % colors.length],
        size: 20 + ((i * 37) % 22),
        angle: (i / 26) * Math.PI * 2 + ((i * 13) % 7) * 0.05,
        dist: Math.min(width, height) * (0.32 + ((i * 29) % 30) / 100),
        spin: ((i % 2) * 2 - 1) * (120 + ((i * 53) % 200)),
        delay: (i % 5) * 40,
        duration: 1500 + ((i * 71) % 700),
        x0: 0,
      })),
    [kind, colors, width, height],
  );
  const ambientMode: Mode = kind === 'bubbles' ? 'rise' : 'fall';
  const ambient = useMemo<P[]>(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        d: shapeFor(kind, i + 1),
        color: colors[(i + 2) % colors.length],
        size: 16 + ((i * 41) % 18),
        angle: i * 1.7,
        dist: 0,
        spin: ((i % 2) * 2 - 1) * 180,
        delay: 600 + i * 380,
        duration: 4200 + ((i * 97) % 2200),
        x0: ((i * 0.618) % 1) * 0.9 + 0.05,
      })),
    [kind, colors],
  );
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {ambient.map((p, i) => (
        <ParticleDriver key={`a${i}`} p={p} mode={ambientMode} w={width} h={height} loop />
      ))}
      {burst.map((p, i) => (
        <ParticleDriver key={`b${i}`} p={p} mode="burst" w={width} h={height} loop={false} />
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  particle: { position: 'absolute', left: 0, top: 0 },
});
