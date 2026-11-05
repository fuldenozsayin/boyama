import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import { Platform } from 'react-native';
import type { SoundKey } from '../art/types';

/**
 * Lightweight sound engine.
 * - all files are bundled (offline) and were synthesised by
 *   scripts/generate-sounds.ts, so there are no licensing concerns
 * - short effects use a small round-robin pool so taps can overlap
 * - brush sounds are seamless loops started/stopped with the stroke
 */
const SOURCES = {
  pop0: require('../../assets/sounds/pop0.wav'),
  pop1: require('../../assets/sounds/pop1.wav'),
  pop2: require('../../assets/sounds/pop2.wav'),
  pop3: require('../../assets/sounds/pop3.wav'),
  pop4: require('../../assets/sounds/pop4.wav'),
  pop5: require('../../assets/sounds/pop5.wav'),
  pop6: require('../../assets/sounds/pop6.wav'),
  pop7: require('../../assets/sounds/pop7.wav'),
  tap: require('../../assets/sounds/tap.wav'),
  sticker: require('../../assets/sounds/sticker.wav'),
  whoosh: require('../../assets/sounds/whoosh.wav'),
  undo: require('../../assets/sounds/undo.wav'),
  celebrate: require('../../assets/sounds/celebrate.wav'),
  chime: require('../../assets/sounds/chime.wav'),
  twinkle: require('../../assets/sounds/twinkle.wav'),
  magic: require('../../assets/sounds/magic.wav'),
  meow: require('../../assets/sounds/meow.wav'),
  woof: require('../../assets/sounds/woof.wav'),
  boing: require('../../assets/sounds/boing.wav'),
  bubbles: require('../../assets/sounds/bubbles.wav'),
  flutter: require('../../assets/sounds/flutter.wav'),
  brush: require('../../assets/sounds/brush.wav'),
  erase: require('../../assets/sounds/erase.wav'),
  sparkle: require('../../assets/sounds/sparkle.wav'),
  music: require('../../assets/sounds/music.wav'),
} as const;

export type SfxKey = keyof typeof SOURCES;
export type LoopKey = 'brush' | 'erase' | 'sparkle';
const LOOP_KEYS: readonly SfxKey[] = ['brush', 'erase', 'sparkle', 'music'];
const IOS = Platform.OS === 'ios';

// each Android player is a full ExoPlayer: keep the pool small
const POOL: Partial<Record<SfxKey, number>> = { tap: 2 };
const VOLUME: Partial<Record<SfxKey, number>> = {
  tap: 0.45,
  whoosh: 0.35,
  undo: 0.5,
  brush: 0.35,
  erase: 0.35,
  sparkle: 0.4,
  music: 0.22,
};

class SoundEngine {
  private sfxOn = true;
  private musicOn = true;
  private ready = false;
  private pools = new Map<SfxKey, AudioPlayer[]>();
  private cursor = new Map<SfxKey, number>();
  private activeLoop: LoopKey | null = null;
  private musicPlaying = false;
  private musicWanted = false;
  private popStep = 0;

  init() {
    if (this.ready) return;
    this.ready = true;
    // Play even when the phone is on vibrate / the iPhone Ring-Silent switch is
    // on silent: many parents keep their phone silenced, and the spoken
    // guidance is essential for children who can't read yet. Volume buttons and
    // the in-app switches stay in control. Never interrupt other apps' audio
    // (mixWithOthers) and never play in the background.
    setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: 'mixWithOthers',
      shouldPlayInBackground: false,
    }).catch(() => {});
  }

  private player(key: SfxKey): AudioPlayer | null {
    try {
      let pool = this.pools.get(key);
      if (!pool) {
        const n = POOL[key] ?? 1;
        // iOS: keep the audio session up between effects instead of tearing it
        // down ~100 ms after every clip (speech shares the same session)
        pool = Array.from({ length: n }, () => createAudioPlayer(SOURCES[key], { keepAudioSessionActive: IOS }));
        pool.forEach((p) => (p.volume = VOLUME[key] ?? 0.8));
        if (IOS) pool.forEach((p) => this.watchIos(key, p));
        this.pools.set(key, pool);
      }
      const i = this.cursor.get(key) ?? 0;
      this.cursor.set(key, (i + 1) % pool.length);
      return pool[i];
    } catch {
      return null;
    }
  }

  /**
   * iOS only.
   * - A finished AVPlayer stays parked at its end, and play() does not rewind
   *   it. Rewind each effect as soon as it ends, so the next play() starts
   *   instantly from the beginning.
   * - expo-audio resumes players by itself after an interruption, a route
   *   change or a return to the foreground. A brush loop must never come back
   *   unless a stroke is in progress.
   */
  private watchIos(key: SfxKey, p: AudioPlayer) {
    const isLoop = LOOP_KEYS.includes(key);
    p.addListener('playbackStatusUpdate', (st) => {
      try {
        if (!isLoop && st.didJustFinish) p.seekTo(0).catch(() => {});
        else if (isLoop && key !== 'music' && st.playing && this.activeLoop !== key) p.pause();
      } catch {
        /* ignore */
      }
    });
  }

  /** warm up the most common players (after start-up) so the first tap is instant */
  preload() {
    setTimeout(() => {
      const keys: SfxKey[] = ['tap', 'whoosh', 'pop0', 'pop2', 'pop4', 'celebrate'];
      // AVPlayers are cheap: warm up every bloop and the brush on iOS too
      if (IOS) keys.push('pop1', 'pop3', 'pop5', 'pop6', 'pop7', 'brush', 'undo', 'sticker');
      keys.forEach((k) => this.player(k));
    }, 1200);
  }

  setEnabled(sfx: boolean, music: boolean) {
    this.sfxOn = sfx;
    this.musicOn = music;
    if (!sfx) this.stopLoop();
    if (!music) this.pauseMusicInternal();
    else if (this.musicWanted) this.startMusic();
  }

  play(key: SfxKey) {
    if (!this.sfxOn) return;
    const p = this.player(key);
    if (!p) return;
    try {
      if (IOS) {
        // iOS: play() runs at once but seekTo() is async, so "seek, play"
        // would start at the clip's end (silence) and rewind afterwards.
        // Finished clips are already rewound (watchIos); otherwise wait for
        // the seek before playing.
        if (!p.playing && p.currentTime < 0.02) p.play();
        else p.seekTo(0).then(() => p.play(), () => {});
      } else {
        p.seekTo(0).catch(() => {});
        p.play();
      }
    } catch {
      // audio is a nice-to-have; never crash the game for it
    }
    this.ensureMusic();
  }

  /** music can be paused natively (headphones unplugged…): restart on the next tap */
  private ensureMusic() {
    if (this.musicWanted && this.musicOn && !this.musicPlaying) this.startMusic();
  }

  /** soft musical "bloop" walking up and down a pentatonic scale */
  pop() {
    const seq = [0, 2, 4, 3, 5, 4, 6, 7, 5, 3, 1, 2];
    const k = seq[this.popStep % seq.length];
    this.popStep++;
    this.play(`pop${k}` as SfxKey);
  }

  character(sound?: SoundKey) {
    if (!sound) return;
    this.play(sound as SfxKey);
  }

  startLoop(key: LoopKey) {
    if (!this.sfxOn) return;
    if (this.activeLoop === key) return;
    this.stopLoop();
    const p = this.player(key);
    if (!p) return;
    try {
      p.loop = true;
      p.play();
      this.activeLoop = key;
    } catch {
      /* ignore */
    }
  }

  stopLoop() {
    if (!this.activeLoop) return;
    const pool = this.pools.get(this.activeLoop);
    pool?.forEach((p) => {
      try {
        p.pause();
      } catch {
        /* ignore */
      }
    });
    this.activeLoop = null;
  }

  private musicListening = false;

  startMusic() {
    this.musicWanted = true;
    if (!this.musicOn || this.musicPlaying) return;
    const p = this.player('music');
    if (!p) return;
    try {
      if (!this.musicListening) {
        this.musicListening = true;
        // keep the JS flag in sync with native pauses (audio focus, noisy, …)
        p.addListener('playbackStatusUpdate', (st) => {
          this.musicPlaying = st.playing;
        });
      }
      p.loop = true;
      p.play();
      this.musicPlaying = true;
    } catch {
      /* ignore */
    }
  }

  stopMusic() {
    this.musicWanted = false;
    this.pauseMusicInternal();
  }

  private pauseMusicInternal() {
    if (!this.musicPlaying) return;
    this.pools.get('music')?.forEach((p) => {
      try {
        p.pause();
      } catch {
        /* ignore */
      }
    });
    this.musicPlaying = false;
  }

  /** app went to background */
  suspend() {
    this.stopLoop();
    this.pauseMusicInternal();
  }

  resume() {
    if (this.musicWanted) this.startMusic();
  }
}

export const sound = new SoundEngine();
