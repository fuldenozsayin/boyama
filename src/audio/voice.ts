import * as Speech from 'expo-speech';
import { createAudioPlayer, type AudioPlayer } from 'expo-audio';
import { Platform } from 'react-native';
import { t, type TKey } from '../i18n/tr';

/**
 * Spoken guidance for children who can't read yet.
 *
 * Architecture: every prompt has a key. If a professionally recorded voice
 * file is registered in RECORDED for that key it is played; otherwise the
 * device's offline text-to-speech engine reads the Turkish text. Shipping
 * real voice-over later only means adding files here — no screen changes.
 */
type VoiceKey = Extract<TKey, `voice.${string}`>;

const RECORDED: Partial<Record<VoiceKey, number>> = {
  // 'voice.welcome': require('../../assets/voice/tr/welcome.m4a'),
};

// Android's expo-speech builds the locale from a bare language subtag; a
// region-tagged value would silently fall back to the phone's own language.
const LANG = Platform.OS === 'android' ? 'tr' : 'tr-TR';

class VoiceGuide {
  private enabled = true;
  private hasTurkish: boolean | null = null;
  private trVoice: string | undefined;
  private lastKey: VoiceKey | null = null;
  private lastAt = 0;
  private recorded: AudioPlayer | null = null;
  private ready: Promise<boolean> | null = null;

  /**
   * Start the TTS engine early and only query its voices once it had time to
   * initialise (some Android engines misbehave when asked during start-up).
   */
  init() {
    if (this.ready) return;
    try {
      Speech.isSpeakingAsync().catch(() => {});
    } catch {
      /* ignore */
    }
    this.ready = new Promise((resolve) => {
      setTimeout(() => {
        this.checkVoices().then(resolve, () => resolve(false));
      }, 1800);
    });
  }

  setEnabled(on: boolean) {
    this.enabled = on;
    if (!on) this.stop();
  }

  /** Only speak if the device actually has a Turkish voice (avoids gibberish). */
  private async checkVoices(): Promise<boolean> {
    if (this.hasTurkish !== null) return this.hasTurkish;
    try {
      const voices = await Speech.getAvailableVoicesAsync();
      const tr = voices.filter((v) => v.language?.toLowerCase().replace('_', '-').startsWith('tr'));
      // prefer an on-device (offline) Turkish voice
      this.trVoice = (tr.find((v) => /local|offline/i.test(v.identifier)) ?? tr[0])?.identifier;
      // web may report an empty list before voices load – allow it there
      this.hasTurkish = voices.length === 0 || tr.length > 0;
    } catch {
      this.hasTurkish = true;
    }
    return this.hasTurkish;
  }

  async say(key: VoiceKey, opts: { force?: boolean; queue?: boolean } = {}) {
    if (!this.enabled) return;
    const now = Date.now();
    // don't nag: skip the same prompt within 8s and anything within 1.2s
    if (!opts.force && ((key === this.lastKey && now - this.lastAt < 8000) || now - this.lastAt < 1200)) return;
    this.lastKey = key;
    this.lastAt = now;
    // queue: let the current sentence finish (Android TTS queues with QUEUE_ADD)
    if (!opts.queue) this.stop();
    const rec = RECORDED[key];
    if (rec) {
      try {
        this.recorded?.remove();
        this.recorded = createAudioPlayer(rec);
        this.recorded.play();
      } catch {
        /* ignore */
      }
      return;
    }
    if (!(await (this.ready ?? this.checkVoices()))) return;
    if (!this.enabled) return;
    Speech.speak(t(key), { language: LANG, voice: this.trVoice, pitch: 1.15, rate: 0.92 });
  }

  praise() {
    const keys: VoiceKey[] = ['voice.great1', 'voice.great2', 'voice.great3'];
    this.say(keys[Math.floor(Math.random() * keys.length)], { force: true });
  }

  stop() {
    try {
      Speech.stop();
    } catch {
      /* ignore */
    }
  }
}

export const voice = new VoiceGuide();
