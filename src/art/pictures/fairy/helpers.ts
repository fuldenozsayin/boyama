/**
 * Small drawing helpers shared by the fairy pictures.
 * (Kept inside the category folder on purpose – dsl.ts stays untouched.)
 */
import { mapPath, type Pt } from '../../../engine/path';
import { rect, rotate, shape } from '../../dsl';

/** rounded "sausage" along a segment – arms, legs, wand sticks, stems */
export function capsule(x0: number, y0: number, x1: number, y1: number, w: number): string {
  const len = Math.hypot(x1 - x0, y1 - y0);
  const ang = (Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI;
  return rotate(rect(x0 - w / 2, y0 - w / 2, len + w, w, w / 2), ang, x0, y0);
}

/**
 * Placement transform: draw something in local coordinates (origin = its
 * anchor, 1 unit = 1 canvas unit at s = 1) and place it on the canvas.
 * flip = mirror horizontally around the anchor.
 */
export function place(ox: number, oy: number, s = 1, flip = false) {
  const fx = flip ? -1 : 1;
  const p = (x: number, y: number): Pt => [ox + x * s * fx, oy + y * s];
  return {
    p,
    /** transform a list of local points */
    pts: (list: Pt[]): Pt[] => list.map(([x, y]) => p(x, y)),
    /** transform a finished local path */
    d: (path: string) => mapPath(path, ([x, y]) => p(x, y)),
    /** scale a length */
    k: (v: number) => v * s,
    fx,
  };
}

/** crescent moon: outer circle (cx, cy, r) minus the inner circle (ox, oy, ir) */
export function crescent(cx: number, cy: number, r: number, ox: number, oy: number, ir: number): string {
  // intersection angles on the outer circle
  const d = Math.hypot(ox - cx, oy - cy);
  const a = Math.atan2(oy - cy, ox - cx);
  const t = Math.acos((r * r + d * d - ir * ir) / (2 * r * d));
  const o0 = a + t;
  const o1 = a - t + Math.PI * 2;
  // matching angles on the inner circle
  const p0: [number, number] = [cx + r * Math.cos(o0), cy + r * Math.sin(o0)];
  const p1: [number, number] = [cx + r * Math.cos(o1), cy + r * Math.sin(o1)];
  const i0 = Math.atan2(p0[1] - oy, p0[0] - ox);
  let i1 = Math.atan2(p1[1] - oy, p1[0] - ox);
  // walk the inner arc p1 → p0 on the side that lies inside the outer circle
  if (i1 < i0) i1 += Math.PI * 2;
  const mid = (i0 + i1) / 2;
  if (Math.hypot(ox + ir * Math.cos(mid) - cx, oy + ir * Math.sin(mid) - cy) > r) i1 -= Math.PI * 2;
  const pts: [number, number, 1?][] = [];
  const n = 10;
  for (let k = 0; k <= n; k++) {
    const ang = o0 + ((o1 - o0) * k) / n;
    const pt: [number, number, 1?] = [cx + r * Math.cos(ang), cy + r * Math.sin(ang)];
    if (k === 0 || k === n) pt[2] = 1;
    pts.push(pt);
  }
  const m = 8;
  // inner arc from p1 back to p0 (skip the end points)
  for (let k = 1; k < m; k++) {
    const ang = i1 + ((i0 - i1) * k) / m;
    pts.push([ox + ir * Math.cos(ang), oy + ir * Math.sin(ang)]);
  }
  return shapeLoose(pts);
}

function shapeLoose(pts: [number, number, 1?][]): string {
  return shape(pts.map((p) => (p[2] === 1 ? ([p[0], p[1], 1] as [number, number, 1]) : ([p[0], p[1]] as [number, number]))));
}

/**
 * Cloud / treetop outline: n round bumps with soft cusps between them.
 * ry lets the blob be oval; rot turns where the first cusp sits.
 */
export function bumpy(cx: number, cy: number, rx: number, ry: number, n = 8, depth = 0.14, rot = 0): string {
  const pts: [number, number, 1?][] = [];
  const at = (deg: number, k: number): [number, number] => {
    const a = (deg * Math.PI) / 180;
    return [cx + rx * k * Math.cos(a), cy + ry * k * Math.sin(a)];
  };
  const step = 360 / n;
  for (let i = 0; i < n; i++) {
    const a0 = rot - 90 + step * i;
    const v = at(a0, 1 - depth);
    pts.push([v[0], v[1], 1]);
    pts.push(at(a0 + step * 0.22, 1 - depth * 0.15));
    pts.push(at(a0 + step * 0.5, 1 + depth * 0.18));
    pts.push(at(a0 + step * 0.78, 1 - depth * 0.15));
  }
  return shapeLoose(pts);
}

/** lily pad: an oval with a little V notch cut towards the centre */
export function lilyPad(cx: number, cy: number, rx: number, ry: number, notchDeg = -60): string {
  const pts: [number, number, 1?][] = [[cx, cy, 1]];
  const n = 14;
  const a0 = notchDeg + 18;
  const a1 = notchDeg + 342;
  for (let i = 0; i <= n; i++) {
    const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
    const p: [number, number, 1?] = [cx + rx * Math.cos(a), cy + ry * Math.sin(a)];
    if (i === 0 || i === n) p[2] = 1;
    pts.push(p);
  }
  return shapeLoose(pts);
}

/** points for a row of round treetops (use inside shape(); valleys are sharp) */
export function treeline(x0: number, x1: number, y: number, n: number, h: number, jitter = 0.35): [number, number, 1?][] {
  const pts: [number, number, 1?][] = [];
  const w = (x1 - x0) / n;
  for (let i = 0; i < n; i++) {
    const bx = x0 + w * i;
    const hh = h * (1 + jitter * Math.sin(i * 2.3));
    pts.push([bx, y, 1]);
    pts.push([bx + w * 0.08, y - hh * 0.55]);
    pts.push([bx + w * 0.3, y - hh * 0.95]);
    pts.push([bx + w * 0.5, y - hh]);
    pts.push([bx + w * 0.7, y - hh * 0.95]);
    pts.push([bx + w * 0.92, y - hh * 0.55]);
  }
  pts.push([x1, y, 1]);
  return pts;
}

export { shapeLoose };
