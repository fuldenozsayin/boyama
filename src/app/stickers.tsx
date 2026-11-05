import { useFocusEffect } from 'expo-router';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { FadeInUp, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { G, Path } from 'react-native-svg';
import { STICKERS } from '../art/stickers';
import type { StickerDef } from '../art/types';
import { sound } from '../audio/sound';
import { voice } from '../audio/voice';
import { StickerArt } from '../components/art/ArtSvg';
import { Icon } from '../components/ui/Icon';
import { PastelBackground } from '../components/ui/PastelBackground';
import { ScreenHeader } from '../components/ui/ScreenHeader';
import { ownedStickerIds, useApp } from '../store/useApp';
import { C, FONT, softShadow, TEXT_CAP } from '../theme';
import { haptic } from '../utils/feedback';

/** soft silhouette for a sticker that is still waiting to be earned */
const Silhouette = memo(function Silhouette({ def }: { def: StickerDef }) {
  return (
    <G>
      {def.items.map((it, i) =>
        it.kind === 'region' ? <Path key={i} d={it.d} fill="#E9E1F4" stroke="#D6CBE6" strokeWidth={6} strokeLinejoin="round" /> : null,
      )}
    </G>
  );
});

function StickerCell({ def, owned, isNew, size, index }: { def: StickerDef; owned: boolean; isNew: boolean; size: number; index: number }) {
  const wiggle = useSharedValue(0);
  const glow = useSharedValue(1);
  useEffect(() => {
    if (isNew) glow.set(withRepeat(withSequence(withTiming(1.12, { duration: 500 }), withTiming(1, { duration: 500 })), 6));
  }, [isNew, glow]);
  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${wiggle.value}deg` }, { scale: glow.value }] }));
  return (
    <Animated.View entering={FadeInUp.delay(Math.min(index, 12) * 40)}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={owned ? def.title : 'Kilitli çıkartma'}
        onPress={() => {
          if (!owned) {
            sound.play('tap');
            return;
          }
          haptic('light');
          sound.play('sticker');
          wiggle.set(withSequence(withTiming(-14, { duration: 90 }), withTiming(14, { duration: 120 }), withSpring(0, { damping: 6 })));
        }}
        style={[styles.cell, { width: size, height: size }, owned ? softShadow(5) : null, owned ? styles.ownedCell : styles.lockedCell]}
      >
        <Animated.View style={style}>
          <Svg width={size - 18} height={size - 18} viewBox="-10 -10 220 220">
            {owned ? <StickerArt def={def} /> : <Silhouette def={def} />}
          </Svg>
        </Animated.View>
        {isNew && (
          <View style={styles.newBadge}>
            <Icon name="star" size={30} color="#FFE27A" />
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

export default function Stickers() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const owned = useApp((s) => s.owned);
  const fresh = useApp((s) => s.fresh);
  const markSeen = useApp((s) => s.markStickersSeen);
  const ownedSet = useMemo(() => new Set(ownedStickerIds(owned)), [owned]);
  // remember which stickers were new when the book was opened (they get marked as seen later)
  const [freshAtOpen] = useState(() => new Set(fresh));

  useFocusEffect(
    useCallback(() => {
      voice.say('voice.stickerBook');
      const tmr = setTimeout(markSeen, 4000);
      return () => clearTimeout(tmr);
    }, [markSeen]),
  );

  const cols = width > height ? 6 : width > 700 ? 5 : 3;
  const gap = 14;
  const size = Math.min(150, (width - insets.left - insets.right - 32 - gap * (cols - 1)) / cols);

  return (
    <View style={styles.root}>
      <PastelBackground top="#FFF3BF" bottom="#FFE2F0" />
      <ScreenHeader
        icon="book"
        iconColor={C.pinkMid}
        right={
          <View style={[styles.count, softShadow(4)]}>
            <Icon name="star" size={26} color="#FFD24A" />
            <Text style={styles.countText} maxFontSizeMultiplier={TEXT_CAP}>
              {ownedSet.size}/{STICKERS.length}
            </Text>
          </View>
        }
      />
      <ScrollView
        contentContainerStyle={[styles.grid, { gap, paddingBottom: insets.bottom + 24, paddingLeft: 16 + insets.left, paddingRight: 16 + insets.right }]}
      >
        {STICKERS.map((s, i) => (
          <StickerCell key={s.id} def={s} owned={ownedSet.has(s.id)} isNew={freshAtOpen.has(s.id)} size={size} index={i} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', paddingHorizontal: 16, paddingTop: 8 },
  cell: { borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  // opaque on iOS so the shadow path is cheap (see color/[id].tsx PANEL_BG)
  ownedCell: { backgroundColor: Platform.OS === 'ios' ? '#FFFFFF' : 'rgba(255,255,255,0.9)', borderWidth: 3, borderColor: '#F3D9FF' },
  lockedCell: { backgroundColor: 'rgba(255,255,255,0.45)', borderWidth: 3, borderColor: 'rgba(214,203,230,0.7)', borderStyle: 'dashed' },
  newBadge: { position: 'absolute', top: -8, right: -8 },
  count: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  countText: { fontFamily: FONT.black, fontSize: 18, color: C.ink },
});
