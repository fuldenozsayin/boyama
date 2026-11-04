/**
 * Tiny drawing DSL for authoring colouring pages in code.
 *
 * All helpers return SVG path strings made of absolute M / L / C / Q / Z
 * commands only, so the same data drives rendering *and* hit-testing.
 * Coordinates are canvas units (0..1000).
 */
import { mapPath, type Pt } from '../engine/path';
import type { DecorItem, RegionItem } from './types';

export type { Pt };

// ---------------------------------------------------------------------------
// Style constants (shared by every picture so the whole book looks consistent)
// ---------------------------------------------------------------------------

/** soft plum ink used for all line art */
export const INK = '#4E3D63';
export const WHITE = '#FFFFFF';
export const BLUSH = '#FF9FBF';
/** outline widths in canvas units */
export const LINE = { outer: 7, inner: 5, fine: 3.5 } as const;

const f = (n: number) => Math.round(n * 10) / 10;
const P = (p: Pt) => `${f(p[0])} ${f(p[1])}`;
const K = 0.5522847498; // circle → bezier magic number
const rad = (deg: number) => (deg * Math.PI) / 180;

// ---------------------------------------------------------------------------
// Point helpers
// ---------------------------------------------------------------------------

export function rotatePt([x, y]: Pt, deg: number, cx = 0, cy = 0): Pt {
  const a = rad(deg);
  const c = Math.cos(a);
  const s = Math.sin(a);
  const dx = x - cx;
  const dy = y - cy;
  return [cx + dx * c - dy * s, cy + dx * s + dy * c];
}

/** points evenly spread on an ellipse (useful input for smooth()) */
export function ellipsePts(cx: number, cy: number, rx: number, ry: number, n: number, rot = 0, start = -90): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = rad(start + (360 / n) * i);
    pts.push(rotatePt([cx + rx * Math.cos(a), cy + ry * Math.sin(a)], rot, cx, cy));
  }
  return pts;
}

/** mirror a list of points around the vertical line x = axis */
export function mirrorPts(pts: Pt[], axis = 500): Pt[] {
  return pts.map(([x, y]) => [2 * axis - x, y] as Pt);
}

/** a symmetric outline: give the right half (top → bottom), get the full loop */
export function symmetric(rightHalf: Pt[], axis = 500): Pt[] {
  const left = mirrorPts(rightHalf, axis).reverse();
  // avoid duplicating points that sit exactly on the axis
  const trimmedLeft = left.filter(([x], i) => !(Math.abs(x - axis) < 0.01 && (i === 0 || i === left.length - 1)));
  return [...rightHalf, ...trimmedLeft];
}

// ---------------------------------------------------------------------------
// Basic shapes
// ---------------------------------------------------------------------------

export function circle(cx: number, cy: number, r: number): string {
  return ellipse(cx, cy, r, r);
}

export function ellipse(cx: number, cy: number, rx: number, ry: number, rot = 0): string {
  const kx = rx * K;
  const ky = ry * K;
  const pts: Pt[] = [
    [cx, cy - ry],
    [cx + kx, cy - ry],
    [cx + rx, cy - ky],
    [cx + rx, cy],
    [cx + rx, cy + ky],
    [cx + kx, cy + ry],
    [cx, cy + ry],
    [cx - kx, cy + ry],
    [cx - rx, cy + ky],
    [cx - rx, cy],
    [cx - rx, cy - ky],
    [cx - kx, cy - ry],
  ].map((p) => (rot ? rotatePt(p as Pt, rot, cx, cy) : (p as Pt)));
  return (
    `M${P(pts[0])}` +
    `C${P(pts[1])} ${P(pts[2])} ${P(pts[3])}` +
    `C${P(pts[4])} ${P(pts[5])} ${P(pts[6])}` +
    `C${P(pts[7])} ${P(pts[8])} ${P(pts[9])}` +
    `C${P(pts[10])} ${P(pts[11])} ${P(pts[0])}Z`
  );
}

/** rectangle with optional rounded corners */
export function rect(x: number, y: number, w: number, h: number, r = 0): string {
  r = Math.min(r, w / 2, h / 2);
  if (r <= 0) return `M${P([x, y])}L${P([x + w, y])}L${P([x + w, y + h])}L${P([x, y + h])}Z`;
  const k = r * (1 - K);
  return (
    `M${P([x + r, y])}L${P([x + w - r, y])}` +
    `C${P([x + w - k, y])} ${P([x + w, y + k])} ${P([x + w, y + r])}` +
    `L${P([x + w, y + h - r])}` +
    `C${P([x + w, y + h - k])} ${P([x + w - k, y + h])} ${P([x + w - r, y + h])}` +
    `L${P([x + r, y + h])}` +
    `C${P([x + k, y + h])} ${P([x, y + h - k])} ${P([x, y + h - r])}` +
    `L${P([x, y + r])}` +
    `C${P([x, y + k])} ${P([x + k, y])} ${P([x + r, y])}Z`
  );
}

/** straight-edged closed polygon */
export function poly(pts: Pt[]): string {
  return `M${pts.map(P).join('L')}Z`;
}

/** polygon with softly rounded corners (round = 0..0.5 of each edge) */
export function roundPoly(pts: Pt[], round = 0.2): string {
  const n = pts.length;
  const a: Pt[] = [];
  const b: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const v = pts[i];
    const prev = pts[(i - 1 + n) % n];
    const next = pts[(i + 1) % n];
    a.push([v[0] + (prev[0] - v[0]) * round, v[1] + (prev[1] - v[1]) * round]);
    b.push([v[0] + (next[0] - v[0]) * round, v[1] + (next[1] - v[1]) * round]);
  }
  let d = `M${P(a[0])}Q${P(pts[0])} ${P(b[0])}`;
  for (let i = 1; i < n; i++) d += `L${P(a[i])}Q${P(pts[i])} ${P(b[i])}`;
  return d + 'Z';
}

/**
 * Smooth closed curve passing through every point (Catmull-Rom spline).
 * The workhorse for organic shapes: bodies, hair, leaves, waves, hills.
 * tension 1 = normal, <1 = tighter corners, >1 = rounder.
 */
export function smooth(pts: Pt[], tension = 1): string {
  const n = pts.length;
  const t = tension / 6;
  let d = `M${P(pts[0])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) * t, p1[1] + (p2[1] - p0[1]) * t];
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) * t, p2[1] - (p3[1] - p1[1]) * t];
    d += `C${P(c1)} ${P(c2)} ${P(p2)}`;
  }
  return d + 'Z';
}

/**
 * Closed shape mixing smooth runs and sharp corners. Points ending with a
 * third element `1` are treated as sharp corners: ([x, y, 1]).
 */
export function shape(pts: (Pt | [number, number, 1])[], tension = 1): string {
  const n = pts.length;
  const t = tension / 6;
  const sharp = (i: number) => (pts[(i + n) % n] as number[])[2] === 1;
  const at = (i: number): Pt => {
    const p = pts[(i + n) % n];
    return [p[0], p[1]];
  };
  let d = `M${P(at(0))}`;
  for (let i = 0; i < n; i++) {
    const p1 = at(i);
    const p2 = at(i + 1);
    const p0 = sharp(i) ? p1 : at(i - 1);
    const p3 = sharp(i + 1) ? p2 : at(i + 2);
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) * t, p1[1] + (p2[1] - p0[1]) * t];
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) * t, p2[1] - (p3[1] - p1[1]) * t];
    d += `C${P(c1)} ${P(c2)} ${P(p2)}`;
  }
  return d + 'Z';
}

/** open smooth curve through points (for decor lines: smiles, hair strands) */
export function curve(pts: Pt[], tension = 1): string {
  const n = pts.length;
  if (n < 2) return '';
  const t = tension / 6;
  let d = `M${P(pts[0])}`;
  for (let i = 0; i < n - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(n - 1, i + 2)];
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) * t, p1[1] + (p2[1] - p0[1]) * t];
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) * t, p2[1] - (p3[1] - p1[1]) * t];
    d += `C${P(c1)} ${P(c2)} ${P(p2)}`;
  }
  return d;
}

/** open straight polyline */
export function line(pts: Pt[]): string {
  return `M${pts.map(P).join('L')}`;
}

/** open circular arc (degrees, 0 = right, 90 = down) built from cubic pieces */
export function arc(cx: number, cy: number, r: number, a0: number, a1: number, ry = r): string {
  const pieces = Math.max(1, Math.ceil(Math.abs(a1 - a0) / 90));
  const step = (a1 - a0) / pieces;
  const kk = (4 / 3) * Math.tan(rad(step) / 4);
  let d = '';
  for (let i = 0; i < pieces; i++) {
    const s = rad(a0 + step * i);
    const e = rad(a0 + step * (i + 1));
    const p0: Pt = [cx + r * Math.cos(s), cy + ry * Math.sin(s)];
    const p3: Pt = [cx + r * Math.cos(e), cy + ry * Math.sin(e)];
    const p1: Pt = [p0[0] - kk * r * Math.sin(s), p0[1] + kk * ry * Math.cos(s)];
    const p2: Pt = [p3[0] + kk * r * Math.sin(e), p3[1] - kk * ry * Math.cos(e)];
    if (i === 0) d += `M${P(p0)}`;
    d += `C${P(p1)} ${P(p2)} ${P(p3)}`;
  }
  return d;
}

// ---------------------------------------------------------------------------
// Friendly composite shapes
// ---------------------------------------------------------------------------

/** five (or n) pointed star with rounded tips */
export function star(cx: number, cy: number, rOut: number, rIn = rOut * 0.56, n = 5, rot = -90, round = 0.26): string {
  const pts: Pt[] = [];
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 === 0 ? rOut : rIn;
    const a = rad(rot + (180 / n) * i);
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return roundPoly(pts, round);
}

/** classic plump heart centred on (cx, cy) */
export function heart(cx: number, cy: number, w: number, h = w * 0.92): string {
  const top = cy - h * 0.2;
  return (
    `M${P([cx, top])}` +
    `C${P([cx - w * 0.06, cy - h * 0.48])} ${P([cx - w * 0.5, cy - h * 0.55])} ${P([cx - w * 0.5, cy - h * 0.12])}` +
    `C${P([cx - w * 0.5, cy + h * 0.16])} ${P([cx - w * 0.2, cy + h * 0.32])} ${P([cx, cy + h * 0.5])}` +
    `C${P([cx + w * 0.2, cy + h * 0.32])} ${P([cx + w * 0.5, cy + h * 0.16])} ${P([cx + w * 0.5, cy - h * 0.12])}` +
    `C${P([cx + w * 0.5, cy - h * 0.55])} ${P([cx + w * 0.06, cy - h * 0.48])} ${P([cx, top])}Z`
  );
}

/** puffy cloud: round bumps over the top, gently curved flat-ish bottom */
export function cloud(cx: number, cy: number, w: number, h: number, bumps = 5): string {
  const rx = w / 2;
  const ry = h / 2;
  const a0 = 165;
  const a1 = 375;
  const pts: Pt[] = [];
  const normals: Pt[] = [];
  for (let i = 0; i <= bumps; i++) {
    const a = rad(a0 + ((a1 - a0) * i) / bumps);
    pts.push([cx + rx * Math.cos(a), cy + ry * 0.55 * Math.sin(a) + ry * 0.25]);
    const nx = Math.cos(a) / rx;
    const ny = Math.sin(a) / (ry * 0.55);
    const nl = Math.hypot(nx, ny) || 1;
    normals.push([nx / nl, ny / nl]);
  }
  let d = `M${P(pts[0])}`;
  for (let i = 0; i < bumps; i++) {
    const p0 = pts[i];
    const p1 = pts[i + 1];
    const chord = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]);
    const b = chord * 0.72;
    const n0 = normals[i];
    const n1 = normals[i + 1];
    d += `C${P([p0[0] + n0[0] * b, p0[1] + n0[1] * b])} ${P([p1[0] + n1[0] * b, p1[1] + n1[1] * b])} ${P(p1)}`;
  }
  const last = pts[bumps];
  const first = pts[0];
  d += `C${P([last[0] + rx * 0.03, cy + ry * 0.85])} ${P([first[0] - rx * 0.03, cy + ry * 0.85])} ${P(first)}`;
  return d + 'Z';
}

/** leaf / petal from base to tip; width = half width at the widest point */
export function petal(base: Pt, tip: Pt, width: number, fat = 0.5): string {
  const dx = tip[0] - base[0];
  const dy = tip[1] - base[1];
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const at = (t: number, s: number): Pt => [base[0] + dx * t + nx * s, base[1] + dy * t + ny * s];
  return (
    `M${P(base)}` +
    `C${P(at(0.15, width * 1.15))} ${P(at(0.55 + fat * 0.3, width * 1.1))} ${P(tip)}` +
    `C${P(at(0.55 + fat * 0.3, -width * 1.1))} ${P(at(0.15, -width * 1.15))} ${P(base)}Z`
  );
}

/** teardrop: round bottom at (cx, cy) with radius r, tip pointing `angle` degrees */
export function drop(cx: number, cy: number, r: number, tipLen = r * 1.6, angle = -90): string {
  const a = rad(angle);
  const tip: Pt = [cx + Math.cos(a) * (r + tipLen), cy + Math.sin(a) * (r + tipLen)];
  const pts: Pt[] = [];
  for (let i = 0; i <= 8; i++) {
    const ang = a + rad(70 + (220 / 8) * i);
    pts.push([cx + r * Math.cos(ang), cy + r * Math.sin(ang)]);
  }
  return shape([[tip[0], tip[1], 1], ...pts]);
}

/** closed ring segment, e.g. one band of a rainbow (angles in degrees, 180 → 360 = top half) */
export function ringSegment(cx: number, cy: number, rIn: number, rOut: number, a0: number, a1: number): string {
  const outer = arc(cx, cy, rOut, a0, a1);
  const inner = arc(cx, cy, rIn, a1, a0);
  return `${outer}L${inner.slice(1)}Z`;
}

/** scalloped / flower outline with n round lobes */
export function scallop(cx: number, cy: number, r: number, n = 5, depth = 0.65, rot = -90): string {
  const step = 360 / n;
  const at = (deg: number, rr: number): Pt => [cx + rr * Math.cos(rad(deg)), cy + rr * Math.sin(rad(deg))];
  let d = `M${P(at(rot, r))}`;
  for (let i = 0; i < n; i++) {
    const a0 = rot + step * i;
    const a1 = a0 + step;
    const rc = r * (1 + depth * 2.1);
    d += `C${P(at(a0 + step * 0.02, rc))} ${P(at(a1 - step * 0.02, rc))} ${P(at(a1, r))}`;
  }
  return d + 'Z';
}

/** simple smile curve (open) */
export function smile(cx: number, cy: number, w: number, depth = w * 0.35): string {
  return `M${P([cx - w / 2, cy])}Q${P([cx, cy + depth * 2])} ${P([cx + w / 2, cy])}`;
}

/** wavy horizontal band edge: returns points from x0 to x1 */
export function wavePts(x0: number, x1: number, y: number, amp: number, waves: number, phase = 0): Pt[] {
  const pts: Pt[] = [];
  const n = Math.max(2, Math.round(waves * 4));
  for (let i = 0; i <= n; i++) {
    const x = x0 + ((x1 - x0) * i) / n;
    pts.push([x, y + Math.sin((i / n) * waves * Math.PI * 2 + phase) * amp]);
  }
  return pts;
}

/** join several sub-paths into one path string */
export function combine(...ds: string[]): string {
  return ds.filter(Boolean).join(' ');
}

// ---------------------------------------------------------------------------
// Path transforms
// ---------------------------------------------------------------------------

export const translate = (d: string, dx: number, dy: number) => mapPath(d, ([x, y]) => [x + dx, y + dy]);
export const scale = (d: string, sx: number, sy = sx, cx = 500, cy = 500) =>
  mapPath(d, ([x, y]) => [cx + (x - cx) * sx, cy + (y - cy) * sy]);
export const rotate = (d: string, deg: number, cx = 500, cy = 500) => mapPath(d, (p) => rotatePt(p, deg, cx, cy));
/** mirror horizontally around x = axis (draw the left wing, get the right one) */
export const mirrorX = (d: string, axis = 500) => mapPath(d, ([x, y]) => [2 * axis - x, y]);
export const mirrorY = (d: string, axis = 500) => mapPath(d, ([x, y]) => [x, 2 * axis - y]);

// ---------------------------------------------------------------------------
// Item constructors
// ---------------------------------------------------------------------------

export function region(
  id: string,
  d: string,
  opts: Omit<RegionItem, 'kind' | 'id' | 'd'> = {},
): RegionItem {
  return { kind: 'region', id, d, ...opts };
}

export function decor(d: string, opts: Omit<DecorItem, 'kind' | 'd'> = {}): DecorItem {
  return { kind: 'decor', d, ...opts };
}

/** solid ink shape (pupils, noses, mouths) */
export const ink = (d: string, part?: string) => decor(d, { fill: INK, part });
/** ink line (whiskers, smiles, lashes, details) */
export const inkLine = (d: string, width: number = LINE.inner, part?: string) =>
  decor(d, { stroke: INK, width, part });
/** white highlight */
export const shine = (d: string, part?: string) => decor(d, { fill: WHITE, part });
/** rosy cheek */
export const blush = (cx: number, cy: number, rx: number, ry = rx * 0.62, part?: string) =>
  decor(ellipse(cx, cy, rx, ry), { fill: BLUSH, opacity: 0.75, part });

/**
 * Big, glossy cartoon eye (decor only, sits on top of a face region).
 * lashes: 'left' | 'right' adds three soft eyelashes on that side.
 */
export function cuteEye(
  cx: number,
  cy: number,
  size: number,
  opts: { lashes?: 'left' | 'right'; part?: string; look?: [number, number] } = {},
): DecorItem[] {
  const { lashes, part, look = [0, 0] } = opts;
  const rx = size * 0.42;
  const ry = size * 0.5;
  const ex = cx + look[0] * size * 0.1;
  const ey = cy + look[1] * size * 0.1;
  const items: DecorItem[] = [
    ink(ellipse(ex, ey, rx, ry), part),
    shine(ellipse(ex + rx * 0.32, ey - ry * 0.38, rx * 0.36, ry * 0.3), part),
    shine(circle(ex - rx * 0.35, ey + ry * 0.42, rx * 0.16), part),
  ];
  if (lashes) {
    const s = lashes === 'right' ? 1 : -1;
    const bx = cx + s * rx * 0.75;
    const by = cy - ry * 0.65;
    for (let i = 0; i < 3; i++) {
      const a = rad(-90 + s * (25 + i * 28));
      const p0: Pt = [bx + Math.cos(a) * size * 0.05 - s * i * size * 0.06, by + i * size * 0.13];
      const p1: Pt = [p0[0] + Math.cos(a) * size * 0.28, p0[1] + Math.sin(a) * size * 0.28];
      items.push(inkLine(line([p0, p1]), LINE.inner, part));
    }
  }
  return items;
}

/** happy closed eye "∩" */
export function happyEye(cx: number, cy: number, w: number, part?: string): DecorItem {
  return inkLine(arc(cx, cy + w * 0.25, w / 2, 200, 340, w * 0.45), LINE.inner + 1, part);
}

/** small four-point twinkle (decor) */
export function twinkle(cx: number, cy: number, r: number): string {
  const s = r * 0.22;
  return (
    `M${P([cx, cy - r])}Q${P([cx + s, cy - s])} ${P([cx + r, cy])}` +
    `Q${P([cx + s, cy + s])} ${P([cx, cy + r])}` +
    `Q${P([cx - s, cy + s])} ${P([cx - r, cy])}` +
    `Q${P([cx - s, cy - s])} ${P([cx, cy - r])}Z`
  );
}
