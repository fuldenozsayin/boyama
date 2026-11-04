import React, { memo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import Svg, { Circle, G, Path } from 'react-native-svg';
import { ellipse, INK } from '../../art/dsl';
import { sound } from '../../audio/sound';
import type { PaintKind } from '../../engine/paint';
import { MAGIC_KINDS, PaintDefs } from '../../engine/paints';
import { C, PALETTE } from '../../theme';
import { haptic } from '../../utils/feedback';
import { getSticker, StickerArt } from '../art/ArtSvg';
import { Icon } from '../ui/Icon';

const SHINE = ellipse(36, 30, 10, 6, -30);

const Swatch = memo(function Swatch({
  color,
  selected,
  size,
  onPress,
}: {
  color: string;
  selected: boolean;
  size: number;
  onPress: () => void;
}) {
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(selected ? 1.18 : 1, { damping: 10, stiffness: 260 }) }, { translateY: withSpring(selected ? -3 : 0) }],
  }));
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Renk ${color}`}
      accessibilityState={{ selected }}
      hitSlop={4}
      testID={`swatch-${color}`}
    >
      <Animated.View style={[{ width: size, height: size, margin: size * 0.12 }, style]}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Circle cx={50} cy={53} r={42} fill="rgba(78,61,99,0.15)" />
          <Circle cx={50} cy={50} r={42} fill={color} stroke={selected ? '#fff' : INK} strokeWidth={selected ? 9 : 5} />
          {selected && <Circle cx={50} cy={50} r={47} fill="none" stroke={INK} strokeWidth={4} />}
          <Path d={SHINE} fill="#fff" opacity={0.6} />
        </Svg>
      </Animated.View>
    </Pressable>
  );
});

export const ColorSwatches = memo(function ColorSwatches({
  selected,
  onSelect,
  vertical,
  size = 44,
}: {
  selected: string;
  onSelect: (c: string) => void;
  vertical?: boolean;
  size?: number;
}) {
  const items = PALETTE.map((c) => (
    <Swatch
      key={c}
      color={c}
      size={size}
      selected={c.toLowerCase() === selected.toLowerCase()}
      onPress={() => {
        sound.play('tap');
        haptic('light');
        onSelect(c);
      }}
    />
  ));
  if (vertical) {
    return (
      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        {items}
      </ScrollView>
    );
  }
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {items}
    </ScrollView>
  );
});

const CHIP_SPEC_CACHE = new Map<string, Parameters<typeof PaintDefs>[0]['spec']>();
function chipSpec(kind: PaintKind, color: string) {
  const key = `${kind}-${color}`;
  let s = CHIP_SPEC_CACHE.get(key);
  if (!s) {
    s =
      kind === 'rainbow'
        ? { patterns: [], rainbowRegions: [{ id: 'chip', bbox: { x0: 20, y0: 20, x1: 140, y1: 140 } }], rainbowStroke: false }
        : { patterns: kind === 'solid' ? [] : [{ k: kind, c: color }], rainbowRegions: [], rainbowStroke: false };
    CHIP_SPEC_CACHE.set(key, s);
  }
  return s;
}

const EffectChip = memo(function EffectChip({
  kind,
  color,
  selected,
  size,
  onPress,
}: {
  kind: PaintKind;
  color: string;
  selected: boolean;
  size: number;
  onPress: () => void;
}) {
  const prefix = `chip${kind}`;
  const fill = kind === 'solid' ? color : kind === 'rainbow' ? `url(#${prefix}rb-chip)` : `url(#${prefix}${kind}-${color.replace('#', '').toLowerCase()})`;
  const style = useAnimatedStyle(() => ({ transform: [{ scale: withSpring(selected ? 1.15 : 1, { damping: 10 }) }] }));
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`Efekt ${kind}`} accessibilityState={{ selected }} hitSlop={4} testID={`effect-${kind}`}>
      <Animated.View style={[{ width: size, height: size, margin: 4 }, style]}>
        <Svg width={size} height={size} viewBox="0 0 160 160">
          <PaintDefs spec={chipSpec(kind, color)} prefix={prefix} />
          <G>
            <Path d="M30 20 H130 Q140 20 140 30 V130 Q140 140 130 140 H30 Q20 140 20 130 V30 Q20 20 30 20 Z" fill={fill} stroke={selected ? '#fff' : INK} strokeWidth={selected ? 14 : 7} />
            {selected && <Path d="M28 10 H132 Q150 10 150 28 V132 Q150 150 132 150 H28 Q10 150 10 132 V28 Q10 10 28 10 Z" fill="none" stroke={INK} strokeWidth={6} />}
          </G>
        </Svg>
      </Animated.View>
    </Pressable>
  );
});

export const EffectChips = memo(function EffectChips({
  color,
  kind,
  onSelect,
  vertical,
  size = 40,
}: {
  color: string;
  kind: PaintKind;
  onSelect: (k: PaintKind) => void;
  vertical?: boolean;
  size?: number;
}) {
  const kinds: PaintKind[] = ['solid', ...MAGIC_KINDS];
  return (
    <ScrollView
      horizontal={!vertical}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={vertical ? styles.grid : styles.row}
    >
      {kinds.map((k) => (
        <EffectChip
          key={k}
          kind={k}
          color={color}
          size={size}
          selected={k === kind}
          onPress={() => {
            sound.play(k === 'solid' ? 'tap' : 'twinkle');
            haptic('light');
            onSelect(k);
          }}
        />
      ))}
    </ScrollView>
  );
});

export const StickerTray = memo(function StickerTray({
  ids,
  selected,
  fresh,
  onSelect,
  vertical,
  size = 58,
}: {
  ids: string[];
  selected: string | null;
  fresh: string[];
  onSelect: (id: string) => void;
  vertical?: boolean;
  size?: number;
}) {
  return (
    <ScrollView
      horizontal={!vertical}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={vertical ? styles.grid : styles.row}
    >
      {ids.map((id) => {
        const def = getSticker(id);
        if (!def) return null;
        const sel = id === selected;
        return (
          <Pressable
            key={id}
            onPress={() => {
              sound.play('tap');
              onSelect(id);
            }}
            accessibilityRole="button"
            accessibilityLabel={def.title}
            accessibilityState={{ selected: sel }}
            style={[styles.stickerCell, { width: size + 10, height: size + 10 }, sel && styles.stickerSel]}
          >
            <Svg width={size} height={size} viewBox="-10 -10 220 220">
              <StickerArt def={def} />
            </Svg>
            {fresh.includes(id) && (
              <View style={styles.newDot}>
                <Icon name="star" size={18} color="#FFE27A" />
              </View>
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
});

/** three dots of increasing size for the brush width */
export const SizePicker = memo(function SizePicker({
  value,
  onChange,
  color,
  vertical,
}: {
  value: number;
  onChange: (i: number) => void;
  color: string;
  vertical?: boolean;
}) {
  return (
    <View style={[styles.sizes, vertical && { flexDirection: 'column' }]}>
      {[0, 1, 2].map((i) => {
        const r = 7 + i * 6;
        const sel = i === value;
        return (
          <Pressable
            key={i}
            onPress={() => {
              sound.play('tap');
              onChange(i);
            }}
            accessibilityRole="button"
            accessibilityLabel={['İnce fırça', 'Orta fırça', 'Kalın fırça'][i]}
            accessibilityState={{ selected: sel }}
            style={[styles.sizeBtn, sel && styles.sizeSel]}
            testID={`size-${i}`}
          >
            <Svg width={44} height={44} viewBox="0 0 44 44">
              <Circle cx={22} cy={22} r={r} fill={color} stroke={INK} strokeWidth={3} />
            </Svg>
          </Pressable>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  row: { alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', paddingVertical: 6 },
  stickerCell: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    marginHorizontal: 4,
    marginVertical: 4,
  },
  stickerSel: { backgroundColor: 'rgba(255,255,255,0.9)', borderWidth: 3, borderColor: C.lilacDeep },
  newDot: { position: 'absolute', top: -4, right: -4 },
  sizes: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  sizeBtn: { borderRadius: 24, padding: 1 },
  sizeSel: { backgroundColor: '#fff', borderWidth: 3, borderColor: C.lilacDeep },
});
