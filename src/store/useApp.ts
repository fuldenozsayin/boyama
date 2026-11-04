import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { STICKERS } from '../art/stickers';

export interface Settings {
  sfx: boolean;
  music: boolean;
  voice: boolean;
  haptics: boolean;
  leftHanded: boolean;
}

export interface PicProgress {
  /** 0..1 share of coloured regions */
  pct: number;
  done: boolean;
  at: number;
}

export interface GalleryEntry {
  /** artwork id = picture id, or `free-<n>` for free drawings */
  id: string;
  at: number;
}

export const STARTER_STICKERS = 4;

interface AppState {
  settings: Settings;
  progress: Record<string, PicProgress>;
  gallery: GalleryEntry[];
  /** owned sticker ids (starter stickers are always owned) */
  owned: string[];
  /** stickers earned but not yet looked at in the sticker book */
  fresh: string[];
  freeCounter: number;

  setSetting: <K extends keyof Settings>(k: K, v: Settings[K]) => void;
  setProgress: (id: string, pct: number) => void;
  /** mark an artwork finished; returns a newly earned sticker id (if any) */
  complete: (artworkId: string, opts: { firstTimeReward: boolean }) => string | null;
  nextFreeId: () => string;
  removeArtwork: (id: string) => void;
  markStickersSeen: () => void;
  resetAll: () => void;
}

const DEFAULT_SETTINGS: Settings = { sfx: true, music: true, voice: true, haptics: true, leftHanded: false };

export function starterStickerIds(): string[] {
  return STICKERS.slice(0, STARTER_STICKERS).map((s) => s.id);
}

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_SETTINGS,
      progress: {},
      gallery: [],
      owned: [],
      fresh: [],
      freeCounter: 0,

      setSetting: (k, v) => set((s) => ({ settings: { ...s.settings, [k]: v } })),

      setProgress: (id, pct) =>
        set((s) => {
          const cur = s.progress[id];
          if (cur && Math.abs(cur.pct - pct) < 0.001) return s;
          return { progress: { ...s.progress, [id]: { pct, done: cur?.done ?? false, at: Date.now() } } };
        }),

      complete: (artworkId, { firstTimeReward }) => {
        const s = get();
        const wasDone = s.progress[artworkId]?.done ?? false;
        const gallery = [{ id: artworkId, at: Date.now() }, ...s.gallery.filter((g) => g.id !== artworkId)];
        let earned: string | null = null;
        if (!wasDone || !firstTimeReward) {
          const owned = new Set([...starterStickerIds(), ...s.owned]);
          const next = STICKERS.find((st) => !owned.has(st.id));
          if (next) earned = next.id;
        }
        set({
          gallery,
          progress: {
            ...s.progress,
            [artworkId]: { pct: s.progress[artworkId]?.pct ?? 1, done: true, at: Date.now() },
          },
          owned: earned ? [...s.owned, earned] : s.owned,
          fresh: earned ? [...s.fresh, earned] : s.fresh,
        });
        return earned;
      },

      nextFreeId: () => {
        const n = get().freeCounter + 1;
        set({ freeCounter: n });
        return `free-${n}`;
      },

      removeArtwork: (id) =>
        set((s) => {
          const progress = { ...s.progress };
          if (id.startsWith('free-')) delete progress[id];
          else if (progress[id]) progress[id] = { ...progress[id], done: false };
          return { gallery: s.gallery.filter((g) => g.id !== id), progress };
        }),

      markStickersSeen: () => set({ fresh: [] }),

      resetAll: () =>
        set({ progress: {}, gallery: [], owned: [], fresh: [], freeCounter: 0, settings: get().settings }),
    }),
    {
      name: 'minik-renkler-app',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        settings: s.settings,
        progress: s.progress,
        gallery: s.gallery,
        owned: s.owned,
        fresh: s.fresh,
        freeCounter: s.freeCounter,
      }),
    },
  ),
);

/** all sticker ids the child can use right now */
export function ownedStickerIds(owned: string[]): string[] {
  const set = new Set([...starterStickerIds(), ...owned]);
  return STICKERS.filter((s) => set.has(s.id)).map((s) => s.id);
}
