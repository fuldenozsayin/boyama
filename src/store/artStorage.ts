import AsyncStorage from '@react-native-async-storage/async-storage';
import { deserialize, serialize, type PaintState } from '../engine/paint';
import { reportStorageError } from './storageHealth';

/**
 * Per-artwork paint data (can be large: brush strokes) lives in its own key,
 * separate from the small app store. A small LRU memory cache keeps
 * thumbnails snappy without holding every drawing in memory forever.
 */
const key = (id: string) => `art:${id}`;
const MAX_CACHE = 12;
const cache = new Map<string, PaintState | null>(); // insertion order = LRU order
const listeners = new Set<(id: string) => void>();

function remember(id: string, s: PaintState | null) {
  cache.delete(id);
  cache.set(id, s);
  while (cache.size > MAX_CACHE) {
    const oldest = cache.keys().next().value;
    if (oldest === undefined) break;
    cache.delete(oldest);
  }
}

/**
 * Load an artwork. Resolves `null` only when it was never saved; a failed or
 * unreadable read REJECTS, so callers never mistake it for a blank page (and
 * never overwrite the stored drawing with one).
 */
export async function loadArt(id: string): Promise<PaintState | null> {
  if (cache.has(id)) {
    const v = cache.get(id) ?? null;
    remember(id, v);
    return v;
  }
  const raw = await AsyncStorage.getItem(key(id));
  const s = deserialize(raw);
  if (raw != null && s === null) throw new Error(`artwork ${id} is unreadable`);
  remember(id, s);
  return s;
}

export function peekArt(id: string): PaintState | null | undefined {
  return cache.get(id);
}

/** Save an artwork; resolves false (and flags the problem for parents) if the write failed. */
export async function saveArt(id: string, state: PaintState): Promise<boolean> {
  remember(id, state);
  listeners.forEach((l) => l(id));
  try {
    await AsyncStorage.setItem(key(id), serialize(state));
    return true;
  } catch (e) {
    // storage full or unavailable – the in-memory copy still works this session
    reportStorageError(e);
    return false;
  }
}

export async function deleteArt(id: string): Promise<void> {
  cache.delete(id);
  listeners.forEach((l) => l(id));
  try {
    await AsyncStorage.removeItem(key(id));
  } catch {
    /* ignore */
  }
}

export async function deleteAllArt(): Promise<void> {
  cache.clear();
  try {
    const keys = await AsyncStorage.getAllKeys();
    await AsyncStorage.multiRemove(keys.filter((k) => k.startsWith('art:')));
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l('*'));
}

export function onArtChanged(fn: (id: string) => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
