/**
 * Unicorn-category drawing helpers (built on top of the shared DSL).
 *
 * The star of the show is `lock()`: a tapered, flowing strand of hair that
 * follows a spine and ends in a soft point – perfect for curly manes and
 * tails. Combine it with `curl()` to finish a spine with a graceful spiral.
 */
import { mapPath } from '../../../engine/path';
import { arc, blush, curve, cuteEye, ellipse, ink, inkLine, LINE, petal, rect, region, rotate, rotatePt, shape, type Pt } from '../../dsl';
import type { ArtItem, DecorItem } from '../../types';

const rad = (deg: number) => (deg * Math.PI) / 180;

function bez(p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): Pt {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return [a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0], a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]];
}

/** sample the open Catmull-Rom spline through pts (same maths as dsl.curve) */
export function sampleSpline(pts: Pt[], perSeg = 16): Pt[] {
  const n = pts.length;
  const out: Pt[] = [];
  for (let i = 0; i < n - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(n - 1, i + 2)];
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    for (let k = 0; k < perSeg; k++) out.push(bez(p1, c1, c2, p2, k / perSeg));
  }
  out.push(pts[n - 1]);
  return out;
}

/** resample a polyline into `m` points evenly spaced by arc length */
function resample(pts: Pt[], m: number): Pt[] {
  const acc = [0];
  for (let i = 1; i < pts.length; i++) acc.push(acc[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const total = acc[acc.length - 1] || 1;
  const out: Pt[] = [];
  let j = 1;
  for (let k = 0; k < m; k++) {
    const s = (total * k) / (m - 1);
    while (j < acc.length - 1 && acc[j] < s) j++;
    const seg = acc[j] - acc[j - 1] || 1;
    const t = Math.min(1, Math.max(0, (s - acc[j - 1]) / seg));
    out.push([pts[j - 1][0] + (pts[j][0] - pts[j - 1][0]) * t, pts[j - 1][1] + (pts[j][1] - pts[j - 1][1]) * t]);
  }
  return out;
}

/**
 * Extend a spine with a spiral curl at its end.
 * side = 1 curls clockwise (turning right on screen), -1 anticlockwise.
 * r = starting radius, turn = degrees of curl, shrink = how much the radius
 * tightens (0..0.8).
 */
export function curl(pts: Pt[], r: number, side: 1 | -1, turn = 200, shrink = 0.45, steps = 5): Pt[] {
  const n = pts.length;
  const L = pts[n - 1];
  const P = pts[n - 2];
  const len = Math.hypot(L[0] - P[0], L[1] - P[1]) || 1;
  const dx = (L[0] - P[0]) / len;
  const dy = (L[1] - P[1]) / len;
  // right-hand normal on screen (y down)
  const C: Pt = [L[0] + side * -dy * r, L[1] + side * dx * r];
  const v0: Pt = [(L[0] - C[0]) / r, (L[1] - C[1]) / r];
  const out = [...pts];
  for (let k = 1; k <= steps; k++) {
    const f = k / steps;
    const a = rad(side * turn * f);
    const rr = r * (1 - shrink * f);
    const vx = v0[0] * Math.cos(a) - v0[1] * Math.sin(a);
    const vy = v0[0] * Math.sin(a) + v0[1] * Math.cos(a);
    out.push([C[0] + vx * rr, C[1] + vy * rr]);
  }
  return out;
}

export interface LockOpts {
  /** taper exponent: 1 = linear to a point, >1 = thins out sooner */
  taper?: number;
  /** extra fullness in the first half of the strand (0..1) */
  bulge?: number;
  /** half-width left at the tip as a fraction of the base (0 = pointed) */
  end?: number;
  /** number of samples along the spine */
  n?: number;
  /** round cap at the base (true) or a flat cut (false) */
  roundBase?: boolean;
}

/**
 * A tapered strand of hair along `spine` (base → tip). `width` is the full
 * width at the base. Use for manes, tails, forelocks and curly fringes.
 */
export function lock(spine: Pt[], width: number, o: LockOpts = {}): string {
  const { taper = 1, bulge = 0.45, end = 0, n = 26, roundBase = true } = o;
  const pts = resample(sampleSpline(spine, 20), n);
  const hw = (u: number) => (width / 2) * (end + (1 - end) * Math.pow(1 - u, taper)) * (1 + bulge * Math.sin(Math.PI * Math.min(1, u * 1.4)));
  const norms: Pt[] = pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(pts.length - 1, i + 1)];
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    return [-(b[1] - a[1]) / l, (b[0] - a[0]) / l];
  });
  const left: Pt[] = [];
  const right: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const u = i / (n - 1);
    const w = hw(u);
    left.push([pts[i][0] + norms[i][0] * w, pts[i][1] + norms[i][1] * w]);
    right.push([pts[i][0] - norms[i][0] * w, pts[i][1] - norms[i][1] * w]);
  }
  const out: (Pt | [number, number, 1])[] = [];
  // base cap (half circle behind the first point)
  const t0: Pt = [-norms[0][1], norms[0][0]]; // tangent pointing backwards from the base
  const w0 = hw(0);
  if (roundBase) {
    for (const a of [45, 90, 135]) {
      const c = Math.cos(rad(a));
      const s = Math.sin(rad(a));
      // from the right side, around the back, to the left side
      out.push([pts[0][0] - norms[0][0] * w0 * c + t0[0] * w0 * s * 0.9, pts[0][1] - norms[0][1] * w0 * c + t0[1] * w0 * s * 0.9]);
    }
  }
  if (roundBase) out.push(...left.slice(0, n - 1));
  else out.push([left[0][0], left[0][1], 1], ...left.slice(1, n - 1));
  if (end > 0) {
    const last = pts[n - 1];
    const we = hw(1);
    const tl: Pt = [norms[n - 1][1], -norms[n - 1][0]];
    out.push(left[n - 1]);
    for (const a of [45, 90, 135]) {
      const c = Math.cos(rad(a));
      const s = Math.sin(rad(a));
      out.push([last[0] + norms[n - 1][0] * we * c + tl[0] * we * s * 0.9, last[1] + norms[n - 1][1] * we * c + tl[1] * we * s * 0.9]);
    }
    out.push(right[n - 1]);
  } else {
    out.push([pts[n - 1][0], pts[n - 1][1], 1]);
  }
  const rr = right.slice(0, n - 1).reverse();
  if (roundBase) out.push(...rr);
  else {
    out.push(...rr.slice(0, -1));
    const b = rr[rr.length - 1];
    out.push([b[0], b[1], 1]);
  }
  return shape(out);
}

/** spiral grooves across a horn from base (b0,b1 = base corners) to tip */
export function hornGrooves(b0: Pt, b1: Pt, tip: Pt, count = 3, part?: string): DecorItem[] {
  const items: DecorItem[] = [];
  for (let i = 1; i <= count; i++) {
    const t = i / (count + 1);
    const l: Pt = [b0[0] + (tip[0] - b0[0]) * t, b0[1] + (tip[1] - b0[1]) * t];
    const r: Pt = [b1[0] + (tip[0] - b1[0]) * t, b1[1] + (tip[1] - b1[1]) * t];
    // gentle diagonal swoosh: start a bit lower on the left, end higher on the right
    const dir: Pt = [tip[0] - (b0[0] + b1[0]) / 2, tip[1] - (b0[1] + b1[1]) / 2];
    const dl = Math.hypot(dir[0], dir[1]) || 1;
    const k = 0.06 * dl * (1 - t);
    const lo: Pt = [l[0] - (dir[0] / dl) * k * 0.4, l[1] - (dir[1] / dl) * k * 0.4];
    const hi: Pt = [r[0] + (dir[0] / dl) * k * 0.4, r[1] + (dir[1] / dl) * k * 0.4];
    const mid: Pt = [(lo[0] + hi[0]) / 2 - (dir[0] / dl) * k * 0.35, (lo[1] + hi[1]) / 2 - (dir[1] / dl) * k * 0.35];
    // shrink a little so the groove sits inside the outline
    const pad = 0.14;
    const a: Pt = [lo[0] + (hi[0] - lo[0]) * pad, lo[1] + (hi[1] - lo[1]) * pad];
    const b: Pt = [hi[0] - (hi[0] - lo[0]) * pad, hi[1] - (hi[1] - lo[1]) * pad];
    items.push(inkLine(curve([a, mid, b]), LINE.fine, part));
  }
  return items;
}

/**
 * A lock that ends in a round "6"-shaped curl. r = curl radius (keep it at
 * roughly 0.5–0.8 × width so the spiral stays readable), side = curl direction.
 */
export function curlLock(
  spine: Pt[],
  width: number,
  r: number,
  side: 1 | -1,
  o: LockOpts & { turn?: number; shrink?: number } = {},
): string {
  const { turn = 250, shrink = 0.35, ...rest } = o;
  return lock(curl(spine, r, side, turn, shrink, 7), width, { taper: 0.55, bulge: 0.15, n: 34, ...rest });
}

// ---------------------------------------------------------------------------
// Shared character: the side-view unicorn head (same design as rainbow-hill)
// ---------------------------------------------------------------------------

export interface SideHeadOpts {
  /** head centre in canvas units */
  x: number;
  y: number;
  /** scale (1 = rainbow-hill size, head ≈ 236 × 204) */
  s?: number;
  /** true = facing left */
  flip?: boolean;
  /** animation part for the head pieces (eyes always use `eyePart`) */
  part?: string;
  eyePart?: string;
  /** pupils looking direction (-1..1) */
  look?: [number, number];
  /** set to false to leave out the forelock / top mane lock */
  forelock?: boolean;
  maneTop?: boolean;
  hints?: Partial<Record<'head' | 'muzzle' | 'ear' | 'earInner' | 'horn' | 'forelock' | 'maneTop', string>>;
}

export interface SideHead {
  items: ArtItem[];
  /** local (facing right, unscaled) → canvas point */
  T: (p: Pt) => Pt;
  /** eye centre in canvas units (use as blink pivot) */
  eye: Pt;
}

export function sideHead(o: SideHeadOpts): SideHead {
  const s = o.s ?? 1;
  const k = o.flip ? -1 : 1;
  const T = (p: Pt): Pt => [o.x + k * s * p[0], o.y + s * p[1]];
  const X = (d: string) => mapPath(d, T);
  const part = o.part;
  const h = {
    head: '#FFF8FC',
    muzzle: '#FFE1EC',
    ear: '#FFF8FC',
    earInner: '#FFC9DD',
    horn: '#FFE39A',
    forelock: '#FFC2DE',
    maneTop: '#D7C2FF',
    ...o.hints,
  };
  const items: ArtItem[] = [
    region('ear', X(petal([-42, -70], [-72, -180], 40)), { part, hint: h.ear }),
    region('ear-inner', X(petal([-42, -80], [-65, -156], 21)), { part, hint: h.earInner }),
    region('head', X(ellipse(0, 0, 118, 102, -6)), { part, hint: h.head }),
    region('muzzle', X(ellipse(95, 50, 74, 58, -12)), { part, hint: h.muzzle }),
    ink(X(ellipse(130, 28, 7, 10, -12)), part),
    inkLine(X(curve([[82, 80], [102, 90], [124, 82]])), LINE.inner, part),
    region('horn', X(shape([[-4, -84], [82, -230, 1], [54, -74]], 1.1)), { part, hint: h.horn }),
    inkLine(X(curve([[8, -112], [32, -118], [52, -108]])), LINE.fine, part),
    inkLine(X(curve([[25, -150], [44, -156], [60, -146]])), LINE.fine, part),
    inkLine(X(curve([[43, -187], [58, -192], [68, -184]])), LINE.fine, part),
  ];
  if (o.maneTop !== false) {
    items.push(region('mane-top', X(curlLock([[-50, -70], [-96, -68], [-134, -42], [-156, 2]], 64, 30, 1)), { part, hint: h.maneTop }));
  }
  if (o.forelock !== false) {
    items.push(region('forelock', X(curlLock([[46, -80], [4, -94], [-38, -82], [-58, -46]], 60, 26, -1)), { part, hint: h.forelock }));
  }
  const eye = T([15, 6]);
  items.push(...cuteEye(eye[0], eye[1], 64 * s, { lashes: o.flip ? 'left' : 'right', part: o.eyePart ?? 'eye', look: o.look }));
  const bl = T([-14, 58]);
  items.push(blush(bl[0], bl[1], 22 * s, 14 * s, part));
  return { items, T, eye };
}

/**
 * Crescent moon: a circle (cx, cy, r) with a bite taken out by a second
 * circle offset by (dx, dy) with radius r2.
 */
export function crescent(cx: number, cy: number, r: number, dx: number, dy: number, r2: number): string {
  const d = Math.hypot(dx, dy);
  const a = Math.atan2(dy, dx);
  // intersection points of the two circles
  const l = (d * d + r * r - r2 * r2) / (2 * d);
  const hgt = Math.sqrt(Math.max(0, r * r - l * l));
  const mx = cx + (dx / d) * l;
  const my = cy + (dy / d) * l;
  const p1: Pt = [mx - (dy / d) * hgt, my + (dx / d) * hgt];
  const p2: Pt = [mx + (dy / d) * hgt, my - (dx / d) * hgt];
  const deg = (p: Pt, c: Pt) => (Math.atan2(p[1] - c[1], p[0] - c[0]) * 180) / Math.PI;
  const c2: Pt = [cx + dx, cy + dy];
  let o0 = deg(p1, [cx, cy]);
  let o1 = deg(p2, [cx, cy]);
  // outer arc: the long way round, away from the bite
  const away = (a * 180) / Math.PI + 180;
  while (o1 < o0) o1 += 360;
  const mid = (o0 + o1) / 2;
  const diff = Math.abs(((mid - away + 540) % 360) - 180);
  if (diff > 90) o1 -= 360;
  const outer = arc(cx, cy, r, o0, o1);
  // inner arc (bite edge) from p2 back to p1, the short way through the moon
  let i0 = deg(p2, c2);
  let i1 = deg(p1, c2);
  while (i1 < i0) i1 += 360;
  const imid = (i0 + i1) / 2;
  const idiff = Math.abs(((imid - (away) + 540) % 360) - 180);
  if (idiff > 90) i1 -= 360;
  const inner = arc(c2[0], c2[1], r2, i0, i1);
  return `${outer}L${inner.slice(1)}Z`;
}

/** a soft rounded tube along a spine (legs with a gentle bend) */
export function limb(spine: Pt[], width: number, endWidth = 0.9): string {
  return lock(spine, width, { end: endWidth, bulge: 0, taper: 1, n: 24 });
}

/** rounded hoof sitting on the end of a leg spine, aligned with its last segment */
export function hoofAt(spine: Pt[], width: number, len: number): string {
  const e = spine[spine.length - 1];
  const p = spine[spine.length - 2];
  const ang = (Math.atan2(e[1] - p[1], e[0] - p[0]) * 180) / Math.PI;
  return rotate(rect(e[0] - len * 0.45, e[1] - width / 2, len, width, width * 0.36), ang, e[0], e[1]);
}

/**
 * Stripes of a ribbon (e.g. a rainbow trail) along a smooth spine.
 * offsets are distances from the spine (left → right), one stripe between
 * each consecutive pair. Ends are cut square.
 */
export function ribbon(spine: Pt[], offsets: number[], n = 40): string[] {
  const pts = resample(sampleSpline(spine, 20), n);
  const norms: Pt[] = pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(pts.length - 1, i + 1)];
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    return [-(b[1] - a[1]) / l, (b[0] - a[0]) / l];
  });
  const at = (i: number, o: number): Pt => [pts[i][0] + norms[i][0] * o, pts[i][1] + norms[i][1] * o];
  const out: string[] = [];
  for (let s = 0; s < offsets.length - 1; s++) {
    const a: (Pt | [number, number, 1])[] = [];
    for (let i = 0; i < n; i++) {
      const p = at(i, offsets[s]);
      a.push(i === 0 || i === n - 1 ? [p[0], p[1], 1] : p);
    }
    for (let i = n - 1; i >= 0; i--) {
      const p = at(i, offsets[s + 1]);
      a.push(i === 0 || i === n - 1 ? [p[0], p[1], 1] : p);
    }
    out.push(shape(a));
  }
  return out;
}

/**
 * Chubby feathered wing. base = where it meets the back; the wing sweeps up
 * and backwards (to the left when dir = 1, to the right when dir = -1).
 * Returns the outline plus two soft feather lines (decor paths).
 */
export function featherWing(base: Pt, s = 1, dir: 1 | -1 = 1, rot = 0): { d: string; lines: string[] } {
  const T = (p: Pt): Pt => rotatePt([base[0] - dir * p[0] * s, base[1] + p[1] * s], rot, base[0], base[1]);
  const pts: (Pt | [number, number, 1])[] = [
    [0, 0, 1],
    [-4, -50],
    [18, -110],
    [62, -158],
    [124, -188],
    [186, -196],
    [222, -176],
    [216, -146],
    [190, -132, 1],
    [202, -106],
    [182, -82],
    [150, -80, 1],
    [158, -54],
    [134, -34],
    [104, -36, 1],
    [104, -12],
    [80, 4],
    [44, 8],
  ];
  const d = shape(pts.map((p) => (p.length === 3 ? ([...T([p[0], p[1]]), 1] as [number, number, 1]) : T(p as Pt))));
  const lines = [
    curve([T([46, -44]), T([100, -100]), T([170, -146])]),
    curve([T([40, -16]), T([80, -48]), T([128, -68])]),
  ];
  return { d, lines };
}
