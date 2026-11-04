import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { sound } from '../audio/sound';

let hapticsOn = true;

export function setHapticsEnabled(on: boolean) {
  hapticsOn = on;
}

export function haptic(kind: 'light' | 'medium' | 'success' = 'light') {
  if (!hapticsOn || Platform.OS === 'web') return;
  try {
    if (kind === 'success') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    else
      Haptics.impactAsync(kind === 'medium' ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light).catch(
        () => {},
      );
  } catch {
    /* ignore */
  }
}

/** standard button feedback: soft tock + light tap */
export function tapFeedback() {
  sound.play('tap');
  haptic('light');
}
