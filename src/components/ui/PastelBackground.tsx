import { useIsFocused } from 'expo-router';
import React, { memo, useEffect } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { circle, cloud, heart, star, twinkle } from '../../art/dsl';
import { C } from '../../theme';

type Floater = { d: string; vb: number; color: string; x: number; y: number; size: number; delay: number; drift: number };

const SHAPES = {
  cloud: cloud(100, 100, 180, 100),
  star: star(100, 100, 80),
  heart: heart(100, 100, 150),
  bubble: circle(100, 100, 70),
  twinkle: twinkle(100, 100, 80),
};

const FLOATERS: Floater[] = [
  { d: SHAPES.cloud, vb: 200, color: '#FFFFFF', x: 0.06, y: 0.12, size: 120, delay: 0, drift: 14 },
  { d: SHAPES.cloud, vb: 200, color: '#FFFFFF', x: 0.72, y: 0.06, size: 150, delay: 600, drift: 18 },
  { d: SHAPES.star, vb: 200, color: '#FFE68A', x: 0.86, y: 0.42, size: 46, delay: 300, drift: 10 },
  { d: SHAPES.heart, vb: 200, color: '#FFC2DC', x: 0.08, y: 0.62, size: 44, delay: 900, drift: 12 },
  { d: SHAPES.bubble, vb: 200, color: '#CFE6FF', x: 0.9, y: 0.78, size: 52, delay: 200, drift: 16 },
  { d: SHAPES.twinkle, vb: 200, color: '#FFFFFF', x: 0.3, y: 0.05, size: 34, delay: 1200, drift: 8 },
  { d: SHAPES.star, vb: 200, color: '#D9C8FF', x: 0.18, y: 0.86, size: 38, delay: 700, drift: 10 },
  { d: SHAPES.bubble, vb: 200, color: '#C9F2DF', x: 0.55, y: 0.92, size: 40, delay: 1500, drift: 14 },
];

const FloatingShape = memo(function FloatingShape({ f, w, h }: { f: Floater; w: number; h: number }) {
  const t = useSharedValue(0);
  const focused = useIsFocused();
  useEffect(() => {
    // screens below the top of the stack stay mounted: don't animate them
    if (!focused) {
      cancelAnimation(t);
      return;
    }
    t.value = withDelay(
      f.delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 2600 + f.drift * 60, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 2600 + f.drift * 60, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
      ),
    );
  }, [f, t, focused]);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: -f.drift * t.value }, { rotate: `${(t.value - 0.5) * 8}deg` }],
  }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[{ position: 'absolute', left: f.x * w - f.size / 2, top: f.y * h - f.size / 2, opacity: 0.85 }, style]}
    >
      <Svg width={f.size} height={f.size} viewBox={`0 0 ${f.vb} ${f.vb}`}>
        <Path d={f.d} fill={f.color} />
      </Svg>
    </Animated.View>
  );
});

/** Soft pink → blue sky with slowly drifting clouds, stars and bubbles. */
export const PastelBackground = memo(function PastelBackground({
  top = C.bgTop,
  bottom = C.bgBottom,
  floaters = true,
}: {
  top?: string;
  bottom?: string;
  floaters?: boolean;
}) {
  const { width, height } = useWindowDimensions();
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="bg-grad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={top} />
            <Stop offset="1" stopColor={bottom} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#bg-grad)" />
      </Svg>
      {floaters && FLOATERS.map((f, i) => <FloatingShape key={i} f={f} w={width} h={height} />)}
    </View>
  );
});
