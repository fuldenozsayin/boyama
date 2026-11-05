import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sound } from '../audio/sound';
import { voice } from '../audio/voice';
import { BubbleButton } from '../components/ui/BubbleButton';
import { ParentGate } from '../components/ui/Dialogs';
import { Icon } from '../components/ui/Icon';
import { Mascot } from '../components/ui/Mascot';
import { PastelBackground } from '../components/ui/PastelBackground';
import { Title } from '../components/ui/Title';
import { useApp } from '../store/useApp';
import { C } from '../theme';

export default function Home() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const landscape = width > height;
  const [gate, setGate] = useState(false);
  // iOS: open the parent screen only after the gate has finished closing
  const toParents = useRef(false);
  const fresh = useApp((s) => s.fresh.length);
  const settings = useApp((s) => s.settings);
  const setSetting = useApp((s) => s.setSetting);
  const muted = !settings.sfx && !settings.music && !settings.voice;

  useFocusEffect(
    useCallback(() => {
      const id = setTimeout(() => voice.say('voice.welcome'), 700);
      return () => clearTimeout(id);
    }, []),
  );

  const short = Math.min(width, height);
  const titleSize = Math.max(30, Math.min(72, (landscape ? width * 0.5 : width) / 9.5));
  const mascotSize = Math.min(short * (landscape ? 0.45 : 0.42), 340);
  const playSize = Math.min(168, short * 0.3);
  const small = Math.min(112, short * 0.2);

  const go = (path: '/categories' | '/gallery' | '/stickers' | '/color/free') => {
    sound.play('whoosh');
    router.push(path);
  };

  return (
    <View style={styles.root}>
      <PastelBackground />
      <View style={[styles.topBar, { top: insets.top + 10, left: insets.left + 14, right: insets.right + 14 }]}>
        <BubbleButton
          a11y={muted ? 'Sesi aç' : 'Sesi kapat'}
          size={56}
          color={C.blueMid}
          onPress={() => {
            // one switch for every sound: effects, music and the spoken guide
            setSetting('sfx', muted);
            setSetting('music', muted);
            setSetting('voice', muted);
          }}
          testID="home-sound"
        >
          <Icon name={muted ? 'soundOff' : 'soundOn'} size={36} color="#fff" />
        </BubbleButton>
        <BubbleButton a11y="Ebeveyn ayarları" size={56} color={C.lilacMid} onPress={() => setGate(true)} testID="home-parents">
          <Icon name="lock" size={34} color={C.yellowMid} />
        </BubbleButton>
      </View>

      <View style={[styles.body, landscape && styles.bodyLandscape, { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.hero}>
          <Animated.View entering={FadeInDown.duration(600)}>
            <Title lines={['Minik Renkler', 'Dünyası']} size={titleSize} />
          </Animated.View>
          <Animated.View entering={ZoomIn.delay(200).springify()}>
            <Mascot size={mascotSize} />
          </Animated.View>
        </View>

        <View style={styles.actions}>
          <Animated.View entering={ZoomIn.delay(350).springify()}>
            <BubbleButton a11y="Boyamaya başla" size={playSize} color={C.pinkMid} glow onPress={() => go('/categories')} testID="home-play">
              <Icon name="play" size={playSize * 0.6} color="#fff" />
            </BubbleButton>
          </Animated.View>
          <Animated.View entering={FadeInUp.delay(500)} style={styles.row}>
            <BubbleButton a11y="Serbest çizim" size={small} color={C.mintMid} onPress={() => go('/color/free')} testID="home-free">
              <Icon name="palette" size={small * 0.64} />
            </BubbleButton>
            <BubbleButton a11y="Galerim" size={small} color={C.yellowMid} onPress={() => go('/gallery')} testID="home-gallery">
              <Icon name="gallery" size={small * 0.64} color={C.mintMid} accent={C.pinkMid} />
            </BubbleButton>
            <View>
              <BubbleButton a11y="Çıkartma kitabım" size={small} color={C.blueMid} onPress={() => go('/stickers')} testID="home-stickers">
                <Icon name="book" size={small * 0.64} color={C.pinkMid} accent={C.lilacMid} />
              </BubbleButton>
              {fresh > 0 && (
                <View style={styles.badge} pointerEvents="none">
                  <Icon name="star" size={30} color="#FFE27A" />
                </View>
              )}
            </View>
          </Animated.View>
        </View>
      </View>

      <ParentGate
        visible={gate}
        onClose={() => setGate(false)}
        onPass={() => {
          setGate(false);
          if (Platform.OS === 'ios') toParents.current = true;
          else router.push('/parents');
        }}
        onDismiss={() => {
          if (!toParents.current) return;
          toParents.current = false;
          router.push('/parents');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: { position: 'absolute', flexDirection: 'row', justifyContent: 'space-between', zIndex: 2 },
  body: { flex: 1, alignItems: 'center', justifyContent: 'space-evenly', paddingHorizontal: 16 },
  bodyLandscape: { flexDirection: 'row' },
  hero: { alignItems: 'center' },
  actions: { alignItems: 'center', gap: 22 },
  row: { flexDirection: 'row', gap: 18 },
  badge: { position: 'absolute', right: -6, top: -8 },
});
