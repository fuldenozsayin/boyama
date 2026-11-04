import { Fredoka_500Medium, Fredoka_600SemiBold, Fredoka_700Bold, useFonts } from '@expo-google-fonts/fredoka';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { AppState } from 'react-native';
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
    if (useApp.persist.hasHydrated()) setDone(true);
    return unsub;
  }, []);
  return done;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ Fredoka_500Medium, Fredoka_600SemiBold, Fredoka_700Bold });
  const hydrated = useHydrated();
  const settings = useApp((s) => s.settings);
  const ready = (fontsLoaded || !!fontError) && hydrated;

  useEffect(() => {
    sound.init();
    sound.preload();
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
          }}
        >
          <Stack.Screen name="color/[id]" options={{ gestureEnabled: false, animation: 'fade_from_bottom' }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
