/**
 * Tiny, dependency-free flag for storage write failures (e.g. the device is
 * full). Saving must never crash the game, but parents should be told.
 */
let failed = false;
const listeners = new Set<() => void>();

export function reportStorageError(e: unknown) {
  if (__DEV__) console.warn('[storage] write failed', e);
  if (failed) return;
  failed = true;
  listeners.forEach((l) => l());
}

export function storageHasFailed(): boolean {
  return failed;
}

export function onStorageHealthChange(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
