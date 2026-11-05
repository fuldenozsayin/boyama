import { useIsFocused } from 'expo-router';
import React, { memo, useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
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
import { FONT } from '../../theme';

const IOS = Platform.OS === 'ios';

const LETTER_COLORS = ['#FF7EB0', '#A98BEA', '#3FBF8A', '#F2B92B', '#5DA8F0', '#FF9468'];

const Letter = memo(function Letter({ ch, i, size }: { ch: string; i: number; size: number }) {
  const t = useSharedValue(0);
  const focused = useIsFocused();
  useEffect(() => {
    if (!focused) {
      cancelAnimation(t);
      return;
    }
    t.set(withDelay(
      i * 90,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 900, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 900, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
      ),
    ));
  }, [i, t, focused]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: -size * 0.06 * t.value }] }));
  if (ch === ' ') return <View style={{ width: size * 0.3 }} />;
  return (
    <Animated.Text
      // decorative and already sized from the window; the header carries the a11y label
      allowFontScaling={!IOS}
      style={[
        styles.letter,
        IOS ? styles.letterIos : null,
        { fontSize: size, color: LETTER_COLORS[i % LETTER_COLORS.length] },
        // iOS clips glyphs and glow to a line box smaller than the font's own
        // (Baloo 2 is ~1.6 em tall): keep the natural line height there and
        // pull the row back to the same 1.2 em footprint with margins
        IOS ? { marginVertical: -size * 0.2 } : { lineHeight: size * 1.2 },
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
  // room for the white glow at the sides, without changing the letter spacing
  letterIos: { paddingHorizontal: 8, marginHorizontal: -8 },
});
