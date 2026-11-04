import type { Paint } from './paint';

/**
 * Mutable "stroke in progress". The canvas pushes points here on every move
 * event and only the tiny <LiveStrokePath> component re-renders (once per
 * animation frame), not the whole picture.
 */
export class LiveStroke {
  region: string | null = null;
  paint: Paint | null = null;
  w = 30;
  pts: number[] = [];
  version = 0;
  private listeners = new Set<() => void>();
  private frame: ReturnType<typeof requestAnimationFrame> | 0 = 0;

  subscribe = (fn: () => void) => {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  };

  getVersion = () => this.version;

  start(region: string, paint: Paint | null, w: number, x: number, y: number) {
    this.region = region;
    this.paint = paint;
    this.w = w;
    this.pts = [Math.round(x), Math.round(y)];
    this.flush();
  }

  /** add a point if it moved far enough; returns true when added */
  add(x: number, y: number, minDist = 3): boolean {
    const n = this.pts.length;
    if (n >= 2) {
      const dx = x - this.pts[n - 2];
      const dy = y - this.pts[n - 1];
      if (dx * dx + dy * dy < minDist * minDist) return false;
    }
    this.pts.push(Math.round(x), Math.round(y));
    this.schedule();
    return true;
  }

  clear() {
    this.region = null;
    this.pts = [];
    this.flush();
  }

  private schedule() {
    if (this.frame) return;
    this.frame = requestAnimationFrame(() => {
      this.frame = 0;
      this.flush();
    });
  }

  private flush() {
    this.version++;
    this.listeners.forEach((l) => l());
  }
}
