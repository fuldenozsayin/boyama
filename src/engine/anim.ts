import type { PartAnim } from '../art/types';

/** 2D affine matrix [a, b, c, d, e, f] as used by SVG's matrix() */
export type Mat = [number, number, number, number, number, number];

export const IDENTITY: Mat = [1, 0, 0, 1, 0, 0];

const TAU = Math.PI * 2;

function aroundPivot(px: number, py: number, a: number, b: number, c: number, d: number): Mat {
  // translate(p) * M * translate(-p)
  return [a, b, c, d, px - a * px - c * py, py - b * px - d * py];
}

function rotation(deg: number, px: number, py: number): Mat {
  const r = (deg * Math.PI) / 180;
  const cs = Math.cos(r);
  const sn = Math.sin(r);
  return aroundPivot(px, py, cs, sn, -sn, cs);
}

/**
 * Transform of an animated part at time `t` (seconds since the celebration
 * started). Pure function → cheap to evaluate for every frame.
 */
export function partMatrix(p: PartAnim, t: number): Mat {
  const [px, py] = p.pivot;
  const ph = (p.phase ?? 0) * TAU;
  switch (p.anim) {
    case 'blink': {
      const period = 1 / (p.speed ?? 0.4);
      const u = ((t + (p.phase ?? 0) * period) % period) / period;
      // closed for a short window near the end of each cycle
      const w = 0.09;
      let sy = 1;
      if (u > 1 - w) sy = 1 - 0.88 * Math.sin(((u - (1 - w)) / w) * Math.PI);
      return aroundPivot(px, py, 1, 0, 0, sy);
    }
    case 'wag':
      return rotation((p.amp ?? 12) * Math.sin(TAU * (p.speed ?? 1.6) * t + ph), px, py);
    case 'sway':
      return rotation((p.amp ?? 5) * Math.sin(TAU * (p.speed ?? 0.6) * t + ph), px, py);
    case 'flap': {
      const k = 0.5 - 0.5 * Math.cos(TAU * (p.speed ?? 2.2) * t + ph);
      const sx = 1 - (p.amp ?? 0.45) * k;
      return aroundPivot(px, py, sx, 0, 0, 1);
    }
    case 'bob':
      return [1, 0, 0, 1, 0, (p.amp ?? 14) * Math.sin(TAU * (p.speed ?? 0.8) * t + ph)];
    case 'pulse': {
      const s = 1 + (p.amp ?? 0.08) * Math.sin(TAU * (p.speed ?? 1.2) * t + ph);
      return aroundPivot(px, py, s, 0, 0, s);
    }
    case 'twinkle': {
      const w = Math.sin(TAU * (p.speed ?? 1.5) * t + ph);
      const s = 1 + (p.amp ?? 0.25) * w;
      const r = ((15 * w) * Math.PI) / 180;
      return aroundPivot(px, py, s * Math.cos(r), s * Math.sin(r), -s * Math.sin(r), s * Math.cos(r));
    }
    case 'spin':
      return rotation(360 * (p.speed ?? 0.25) * t + (p.phase ?? 0) * 360, px, py);
    default:
      return IDENTITY;
  }
}

export function matToString(m: Mat): string {
  const r = (n: number) => Math.round(n * 1000) / 1000;
  return `matrix(${r(m[0])} ${r(m[1])} ${r(m[2])} ${r(m[3])} ${r(m[4])} ${r(m[5])})`;
}
