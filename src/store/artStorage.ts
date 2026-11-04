import AsyncStorage from '@react-native-async-storage/async-storage';
import { deserialize, serialize, type PaintState } from '../engine/paint';

/**
 * Per-artwork paint data (can be large: brush strokes) lives in its own key,
 * separate from the small app store. A memory cache keeps thumbnails snappy.
 */
const key = (id: string) => `art:${id}`;
const cache = new Map<string, PaintState | null>();
const listeners = new Set<(id: string) => void>();

export async function loadArt(id: string): Promise<PaintState | null> {
  if (cache.has(id)) return cache.get(id) ?? null;
  try {
    const s = deserialize(await AsyncStorage.getItem(key(id)));
    cache.set(id, s);
    return s;
  } catch {
    return null;
  }
}

export function peekArt(id: string): PaintState | null | undefined {
  return cache.get(id);
}

export async function saveArt(id: string, state: PaintState): Promise<void> {
  cache.set(id, state);
  listeners.forEach((l) => l(id));
  try {
    await AsyncStorage.setItem(key(id), serialize(state));
  } catch {
    // storage full or unavailable – the in-memory copy still works this session
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
