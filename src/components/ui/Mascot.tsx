import { useIsFocused } from 'expo-router';
import React, { memo, useEffect, useState } from 'react';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { G, Path } from 'react-native-svg';
import { INK } from '../../art/dsl';
import { MASCOT as M, MASCOT_BRUSH_TIP, MASCOT_COLOR } from '../../art/mascot';

/**
 * Pıtırcık – the game's original mascot: a happy little paint drop.
 * Floats gently and blinks every few seconds.
 */
export const Mascot = memo(function Mascot({ size = 160, color = MASCOT_COLOR }: { size?: number; color?: string }) {
  const [blink, setBlink] = useState(false);
  const float = useSharedValue(0);
  const focused = useIsFocused();

  useEffect(() => {
    if (!focused) {
      cancelAnimation(float);
      return;
    }
    float.set(withRepeat(
      withSequence(
        withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
    ));
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
  }, [float, focused]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: -8 * float.value }, { rotate: `${(float.value - 0.5) * 6}deg` }],
  }));

  return (
    <Animated.View style={style} accessibilityLabel="Pıtırcık">
      <Svg width={size} height={size} viewBox="0 0 210 210">
        <Path d={M.shadow} fill="rgba(78,61,99,0.12)" />
        <Path d={M.footL} fill={color} stroke={INK} strokeWidth={5} />
        <Path d={M.footR} fill={color} stroke={INK} strokeWidth={5} />
        <Path d={M.armL} fill={color} stroke={INK} strokeWidth={5} />
        <Path d={M.body} fill={color} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        <Path d={M.shine} fill="#fff" opacity={0.75} />
        <Path d={M.curl} fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" />
        {blink ? (
          <G>
            <Path d={M.closedL} fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" />
            <Path d={M.closedR} fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" />
          </G>
        ) : (
          <G>
            <Path d={M.eyeL} fill={INK} />
            <Path d={M.eyeR} fill={INK} />
            <Path d={M.shineL} fill="#fff" />
            <Path d={M.shineR} fill="#fff" />
            <Path d={M.dotL} fill="#fff" />
            <Path d={M.dotR} fill="#fff" />
          </G>
        )}
        <Path d={M.cheekL} fill="#FF8FB8" opacity={0.7} />
        <Path d={M.cheekR} fill="#FF8FB8" opacity={0.7} />
        <Path d={M.smile} fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" />
        <Path d={M.handle} stroke={INK} strokeWidth={13} strokeLinecap="round" />
        <Path d={M.handle} stroke="#FFD98A" strokeWidth={6} strokeLinecap="round" />
        <Path d={M.tip} fill={MASCOT_BRUSH_TIP} stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
        <Path d={M.armR} fill={color} stroke={INK} strokeWidth={5} />
        <Path d={M.spark1} fill="#FFE27A" stroke={INK} strokeWidth={3} />
        <Path d={M.spark2} fill="#fff" stroke={INK} strokeWidth={3} />
      </Svg>
    </Animated.View>
  );
});
