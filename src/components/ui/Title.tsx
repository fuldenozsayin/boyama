import React, { memo, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { FONT } from '../../theme';

const LETTER_COLORS = ['#FF7EB0', '#A98BEA', '#3FBF8A', '#F2B92B', '#5DA8F0', '#FF9468'];

const Letter = memo(function Letter({ ch, i, size }: { ch: string; i: number; size: number }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(
      i * 90,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 900, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 900, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
      ),
    );
  }, [i, t]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: -size * 0.06 * t.value }] }));
  if (ch === ' ') return <View style={{ width: size * 0.3 }} />;
  return (
    <Animated.Text
      style={[
        styles.letter,
        { fontSize: size, lineHeight: size * 1.2, color: LETTER_COLORS[i % LETTER_COLORS.length] },
        style,
      ]}
    >
      {ch}
    </Animated.Text>
  );
});

/** Bouncy rainbow title, one colour per letter. */
export function Title({ lines, size = 40 }: { lines: string[]; size?: number }) {
  let k = 0;
  return (
    <View accessibilityRole="header" accessibilityLabel={lines.join(' ')}>
      {lines.map((ln, li) => (
        <View key={li} style={styles.row}>
          {ln.split('').map((ch) => {
            const i = k++;
            return <Letter key={i} ch={ch} i={i} size={size} />;
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'center' },
  letter: {
    fontFamily: FONT.black,
    textShadowColor: '#FFFFFF',
    textShadowRadius: 10,
    textShadowOffset: { width: 0, height: 2 },
  },
});
