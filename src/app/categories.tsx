import { router, useFocusEffect } from 'expo-router';
import React, { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { FadeInUp, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CATEGORIES } from '../art';
import { getPicture } from '../art';
import type { Category } from '../art/types';
import { sound } from '../audio/sound';
import { voice } from '../audio/voice';
import { ArtSvg } from '../components/art/ArtSvg';
import { Icon } from '../components/ui/Icon';
import { PastelBackground } from '../components/ui/PastelBackground';
import { ScreenHeader } from '../components/ui/ScreenHeader';
import { EMPTY_STATE } from '../engine/paint';
import { useApp } from '../store/useApp';
import { C, darken, FONT, softShadow } from '../theme';
import { haptic } from '../utils/feedback';

function CategoryCard({ cat, width, index }: { cat: Category; width: number; index: number }) {
  const progress = useApp((s) => s.progress);
  const done = cat.pictures.filter((p) => progress[p.id]?.done).length;
  const press = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: press.value }] }));
  const coverPic = getPicture(cat.cover.pictureId) ?? cat.pictures[0];
  const art = width - 28;
  return (
    <Animated.View entering={FadeInUp.delay(80 * index).springify()} style={style}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={cat.title}
        testID={`category-${cat.id}`}
        onPressIn={() => (press.value = withSpring(0.93, { damping: 12 }))}
        onPressOut={() => (press.value = withSpring(1, { damping: 6 }))}
        onPress={() => {
          sound.play('whoosh');
          haptic('light');
          router.push({ pathname: '/category/[id]', params: { id: cat.id } });
        }}
        style={[styles.card, softShadow(7), { width, backgroundColor: cat.color, borderColor: darken(cat.color, 0.12) }]}
      >
        <View style={[styles.art, { width: art, height: art }]}>
          {coverPic ? (
            <ArtSvg
              picture={coverPic}
              state={EMPTY_STATE}
              size={art}
              prefix={`cv-${cat.id}`}
              useHints
              viewBox={cat.cover.viewBox}
              hide={cat.cover.hide}
            />
          ) : (
            <Icon name="palette" size={art * 0.6} />
          )}
        </View>
        <View style={styles.stars}>
          {cat.pictures.map((p, i) => (
            <Icon key={p.id} name="star" size={Math.min(26, width / 8)} color={i < done ? '#FFD24A' : '#FFFFFF'} />
          ))}
        </View>
        <Text style={[styles.cardTitle, { color: darken(cat.accent, 0.35) }]} numberOfLines={2}>
          {cat.title}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export default function Categories() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  useFocusEffect(
    useCallback(() => {
      voice.say('voice.pickCategory');
    }, []),
  );
  const usable = width - insets.left - insets.right - 24;
  const cols = width > height ? (width > 1000 ? 3 : 3) : width > 700 ? 3 : 2;
  const gap = 16;
  const cardW = Math.min(300, (usable - gap * (cols - 1)) / cols);
  return (
    <View style={styles.root}>
      <PastelBackground />
      <ScreenHeader icon="palette" />
      <ScrollView contentContainerStyle={[styles.grid, { gap, paddingBottom: insets.bottom + 24 }]}>
        {CATEGORIES.map((c, i) => (
          <CategoryCard key={c.id} cat={c} width={cardW} index={i} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', paddingHorizontal: 12, paddingTop: 8 },
  card: {
    borderRadius: 30,
    padding: 14,
    alignItems: 'center',
    borderWidth: 4,
  },
  art: { borderRadius: 22, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.55)' },
  stars: { flexDirection: 'row', marginTop: 8, gap: 2 },
  cardTitle: { fontFamily: FONT.bold, fontSize: 14, textAlign: 'center', marginTop: 4 },
});
