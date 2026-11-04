import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { FadeInUp, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getCategory } from '../../art';
import type { Picture } from '../../art/types';
import { sound } from '../../audio/sound';
import { voice } from '../../audio/voice';
import { ArtThumb } from '../../components/art/ArtThumb';
import { Icon } from '../../components/ui/Icon';
import { PastelBackground } from '../../components/ui/PastelBackground';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { useApp } from '../../store/useApp';
import { C, darken, lighten, softShadow } from '../../theme';
import { haptic } from '../../utils/feedback';

function PictureCard({ pic, size, color, index }: { pic: Picture; size: number; color: string; index: number }) {
  const prog = useApp((s) => s.progress[pic.id]);
  const press = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: press.value }] }));
  const pct = prog?.pct ?? 0;
  return (
    <Animated.View entering={FadeInUp.delay(70 * index).springify()}>
      <Animated.View style={style}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={pic.title}
        testID={`picture-${pic.id}`}
        onPressIn={() => press.set(withSpring(0.93, { damping: 12 }))}
        onPressOut={() => press.set(withSpring(1, { damping: 6 }))}
        onPress={() => {
          sound.play('whoosh');
          haptic('light');
          router.push({ pathname: '/color/[id]', params: { id: pic.id } });
        }}
        style={[styles.card, softShadow(6), { backgroundColor: color, borderColor: darken(color, 0.15) }]}
      >
        <View style={styles.paper}>
          <ArtThumb artworkId={pic.id} picture={pic} size={size} />
        </View>
        {prog?.done ? (
          <View style={styles.badge}>
            <Icon name="star" size={44} color="#FFD24A" />
          </View>
        ) : pct > 0 ? (
          <View style={styles.meter}>
            <View style={[styles.meterFill, { width: `${Math.round(pct * 100)}%`, backgroundColor: darken(color, 0.25) }]} />
          </View>
        ) : null}
      </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const cat = getCategory(String(id));
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  useFocusEffect(
    useCallback(() => {
      voice.say('voice.pickPicture');
    }, []),
  );
  if (!cat) return null;
  const usable = width - insets.left - insets.right - 24;
  const cols = width > height ? (width > 1100 ? 5 : 3) : width > 700 ? 3 : 2;
  const gap = 18;
  // card = art + 2*10 padding + 2*4 border
  const size = Math.floor(Math.min(320, (usable - gap * (cols - 1)) / cols - 28));
  return (
    <View style={styles.root}>
      <PastelBackground top={lighten(cat.color, 0.3)} bottom={cat.color} />
      <ScreenHeader title={cat.title} backTo="/categories" />
      <ScrollView contentContainerStyle={[styles.grid, { gap, paddingBottom: insets.bottom + 24 }]}>
        {cat.pictures.map((p, i) => (
          <PictureCard key={p.id} pic={p} size={size} color={lighten(cat.accent, 0.45)} index={i} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', paddingHorizontal: 12, paddingTop: 8 },
  card: { borderRadius: 28, padding: 10, borderWidth: 4 },
  paper: { borderRadius: 20, overflow: 'hidden', backgroundColor: '#fff', borderWidth: 3, borderColor: C.ink },
  badge: { position: 'absolute', right: -10, top: -12 },
  meter: {
    position: 'absolute',
    left: 22,
    right: 22,
    bottom: 18,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.85)',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: C.ink,
  },
  meterFill: { height: '100%', borderRadius: 4 },
});
