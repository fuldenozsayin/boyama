import { useIsFocused } from 'expo-router';
import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { C, darken, FONT, softShadow, TEXT_CAP } from '../../theme';
import { tapFeedback } from '../../utils/feedback';

interface Props {
  onPress?: () => void;
  onLongPress?: () => void;
  size?: number;
  /** pill width (defaults to a circle) */
  width?: number;
  color?: string;
  children?: React.ReactNode;
  label?: string;
  /** accessibility label (Turkish) for screen readers / parents */
  a11y: string;
  disabled?: boolean;
  /** gently pulse to draw attention */
  glow?: boolean;
  selected?: boolean;
  style?: StyleProp<ViewStyle>;
  silent?: boolean;
  testID?: string;
  /** extra touch area around the button (default 8) */
  hitSlop?: number;
}

/** Big, round, squishy button. Every tap bounces and gives soft feedback. */
export function BubbleButton({
  onPress,
  onLongPress,
  size = 64,
  width,
  color = C.pinkMid,
  children,
  label,
  a11y,
  disabled,
  glow,
  selected,
  style,
  silent,
  testID,
  hitSlop = 8,
}: Props) {
  const scale = useSharedValue(1);
  const pulse = useSharedValue(1);
  const focused = useIsFocused();

  useEffect(() => {
    if (glow && !disabled && focused) {
      pulse.set(withRepeat(withSequence(withTiming(1.09, { duration: 650 }), withTiming(1, { duration: 650 })), -1));
    } else {
      cancelAnimation(pulse);
      pulse.set(withTiming(1, { duration: 200 }));
    }
  }, [glow, disabled, pulse, focused]);

  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value * pulse.value }] }));

  const w = width ?? size;
  const rim = darken(color, 0.18);
  return (
    <Animated.View style={[anim, { opacity: disabled ? 0.45 : 1 }, style]}>
      <Pressable
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={a11y}
        accessibilityState={{ disabled: !!disabled, selected: !!selected }}
        disabled={disabled}
        hitSlop={hitSlop}
        onPressIn={() => {
          scale.set(withSpring(0.86, { damping: 12, stiffness: 420 }));
        }}
        onPressOut={() => {
          scale.set(withSpring(1, { damping: 7, stiffness: 260 }));
        }}
        onPress={() => {
          if (!silent) tapFeedback();
          onPress?.();
        }}
        onLongPress={onLongPress}
      >
        <View
          style={[
            styles.base,
            {
              width: w,
              height: size,
              borderRadius: size / 2,
              backgroundColor: rim,
              paddingBottom: size * 0.07,
            },
            softShadow(5),
            selected && { borderWidth: 4, borderColor: '#fff' },
          ]}
        >
          <View
            style={[
              styles.face,
              {
                width: '100%',
                height: '100%',
                borderRadius: size / 2,
                backgroundColor: color,
              },
            ]}
          >
            <View style={[styles.shine, { width: w * 0.42, height: size * 0.14, borderRadius: size, left: w * 0.16, top: size * 0.1 }]} />
            {children}
            {label ? (
              <Text numberOfLines={1} maxFontSizeMultiplier={TEXT_CAP} style={[styles.label, { fontSize: Math.max(14, size * 0.28) }]}>
                {label}
              </Text>
            ) : null}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: { overflow: 'visible' },
  face: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    overflow: 'hidden',
  },
  shine: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.55)' },
  label: { fontFamily: FONT.bold, color: C.ink },
});
