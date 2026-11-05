// Baloo 2: rounded and playful, with full Turkish coverage (Ş Ğ İ ı …)
// per-weight imports: only the three weights we use end up in the app bundle
import { Baloo2_500Medium } from '@expo-google-fonts/baloo-2/500Medium';
import { Baloo2_600SemiBold } from '@expo-google-fonts/baloo-2/600SemiBold';
import { Baloo2_800ExtraBold } from '@expo-google-fonts/baloo-2/800ExtraBold';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { AppState, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { sound } from '../audio/sound';
import { voice } from '../audio/voice';
import { useApp } from '../store/useApp';
import { C } from '../theme';
import { setHapticsEnabled } from '../utils/feedback';

SplashScreen.preventAutoHideAsync().catch(() => {});

function useHydrated() {
  const [done, setDone] = useState(() => useApp.persist.hasHydrated());
  useEffect(() => {
    const unsub = useApp.persist.onFinishHydration(() => setDone(true));
    // hydration may have finished between the first render and this subscription
    if (useApp.persist.hasHydrated()) Promise.resolve().then(() => setDone(true));
    // safety net: never keep the child on the splash screen
    const fallback = setTimeout(() => setDone(true), 5000);
    return () => {
      unsub();
      clearTimeout(fallback);
    };
  }, []);
  return done;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ Baloo2_500Medium, Baloo2_600SemiBold, Baloo2_800ExtraBold });
  const hydrated = useHydrated();
  const settings = useApp((s) => s.settings);
  const ready = (fontsLoaded || !!fontError) && hydrated;

  useEffect(() => {
    sound.init();
    sound.preload();
    voice.init();
    const sub = AppState.addEventListener('change', (st) => {
      if (st === 'active') sound.resume();
      else {
        sound.suspend();
        voice.stop();
      }
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    sound.setEnabled(settings.sfx, settings.music);
    voice.setEnabled(settings.voice);
    setHapticsEnabled(settings.haptics);
  }, [settings]);

  useEffect(() => {
    if (!ready) return;
    SplashScreen.hideAsync().catch(() => {});
    sound.startMusic();
  }, [ready]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: C.bgTop }}>
      <SafeAreaProvider>
        <StatusBar hidden />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'fade',
            contentStyle: { backgroundColor: C.bgTop },
            // iOS: react-native-screens owns the status bar (expo-status-bar's
            // `hidden` only reaches the root view controller), and only an
            // edge swipe should go back, not a drag anywhere on a card grid
            ...(Platform.OS === 'ios' ? { statusBarHidden: true, fullScreenGestureEnabled: false } : null),
          }}
        >
          <Stack.Screen name="color/[id]" options={{ gestureEnabled: false, animation: 'fade_from_bottom' }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
