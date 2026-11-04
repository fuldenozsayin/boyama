import React, { memo, useEffect, useState } from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { G, Path } from 'react-native-svg';
import { arc, circle, drop, ellipse, INK, line, petal, twinkle } from '../../art/dsl';
import { RAINBOW_STOPS } from '../../engine/paints';

const BODY = drop(100, 122, 62, 44, -90);
const SHINE = ellipse(72, 92, 13, 20, 30);
const FOOT_L = ellipse(78, 184, 18, 10);
const FOOT_R = ellipse(122, 184, 18, 10);
const ARM_L = ellipse(40, 136, 11, 16, 30);
const ARM_R = ellipse(160, 130, 11, 16, -30);
const HANDLE = line([
  [162, 128],
  [186, 86],
]);
const TIP = petal([186, 86], [194, 58], 8);
const SMILE = arc(100, 140, 12, 20, 160);
const CURL = 'M100 18 C108 8 122 12 118 22';

/**
 * Pıtırcık – the game's original mascot: a happy little paint drop.
 * Floats gently and blinks every few seconds.
 */
export const Mascot = memo(function Mascot({ size = 160, color = '#FFB3D1' }: { size?: number; color?: string }) {
  const [blink, setBlink] = useState(false);
  const float = useSharedValue(0);

  useEffect(() => {
    float.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
    );
    let alive = true;
    let timer: ReturnType<typeof setTimeout>;
    const loop = () => {
      timer = setTimeout(() => {
        if (!alive) return;
        setBlink(true);
        timer = setTimeout(() => {
          if (!alive) return;
          setBlink(false);
          loop();
        }, 140);
      }, 2200 + Math.random() * 1800);
    };
    loop();
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [float]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: -8 * float.value }, { rotate: `${(float.value - 0.5) * 6}deg` }],
  }));

  return (
    <Animated.View style={style} accessibilityLabel="Pıtırcık">
      <Svg width={size} height={size} viewBox="0 0 210 210">
        <Path d={ellipse(100, 196, 50, 8)} fill="rgba(78,61,99,0.12)" />
        <Path d={FOOT_L} fill={color} stroke={INK} strokeWidth={5} />
        <Path d={FOOT_R} fill={color} stroke={INK} strokeWidth={5} />
        <Path d={ARM_L} fill={color} stroke={INK} strokeWidth={5} />
        <Path d={BODY} fill={color} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        <Path d={SHINE} fill="#fff" opacity={0.75} />
        <Path d={CURL} fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" />
        {blink ? (
          <G>
            <Path d={arc(80, 124, 11, 200, 340)} fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" />
            <Path d={arc(120, 124, 11, 200, 340)} fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" />
          </G>
        ) : (
          <G>
            <Path d={ellipse(80, 120, 11, 14)} fill={INK} />
            <Path d={ellipse(120, 120, 11, 14)} fill={INK} />
            <Path d={circle(84, 114, 4.5)} fill="#fff" />
            <Path d={circle(124, 114, 4.5)} fill="#fff" />
            <Path d={circle(77, 125, 2)} fill="#fff" />
            <Path d={circle(117, 125, 2)} fill="#fff" />
          </G>
        )}
        <Path d={ellipse(66, 140, 10, 6)} fill="#FF8FB8" opacity={0.7} />
        <Path d={ellipse(134, 140, 10, 6)} fill="#FF8FB8" opacity={0.7} />
        <Path d={SMILE} fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" />
        <Path d={HANDLE} stroke={INK} strokeWidth={13} strokeLinecap="round" />
        <Path d={HANDLE} stroke="#FFD98A" strokeWidth={6} strokeLinecap="round" />
        <Path d={TIP} fill={RAINBOW_STOPS[4]} stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
        <Path d={ARM_R} fill={color} stroke={INK} strokeWidth={5} />
        <Path d={twinkle(30, 60, 10)} fill="#FFE27A" stroke={INK} strokeWidth={3} />
        <Path d={twinkle(176, 30, 7)} fill="#fff" stroke={INK} strokeWidth={3} />
      </Svg>
    </Animated.View>
  );
});
