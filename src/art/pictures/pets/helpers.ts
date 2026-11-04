/**
 * Shared drawing helpers for the "pets" category (cats, dogs, bunnies).
 * Only builds path strings / decor items with the public DSL.
 */
import {
  blush,
  circle,
  cuteEye,
  curve,
  decor,
  ellipse,
  heart,
  ink,
  inkLine,
  line,
  LINE,
  rect,
  rotate as rotatePath,
  rotatePt,
  roundPoly,
  shape,
  smooth,
  symmetric as symmetricPts,
  twinkle,
  type Pt,
} from '../../dsl';
import type { DecorItem } from '../../types';

/**
 * Closed "sausage" around a centre line: tails, legs, carrot leaves, handles.
 * w0 = width at the first point, w1 = width at the last point.
 * The far end gets a round cap, the start a small cap (usually hidden).
 */
export function tube(pts: Pt[], w0: number, w1 = w0): string {
  const n = pts.length;
  const left: Pt[] = [];
  const right: Pt[] = [];
  const dirAt = (i: number): Pt => {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(n - 1, i + 1)];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const l = Math.hypot(dx, dy) || 1;
    return [dx / l, dy / l];
  };
  for (let i = 0; i < n; i++) {
    const [dx, dy] = dirAt(i);
    const w = (w0 + ((w1 - w0) * i) / (n - 1)) / 2;
    const nx = -dy;
    const ny = dx;
    left.push([pts[i][0] + nx * w, pts[i][1] + ny * w]);
    right.push([pts[i][0] - nx * w, pts[i][1] - ny * w]);
  }
  const [ex, ey] = dirAt(n - 1);
  const [sx, sy] = dirAt(0);
  const tip: Pt = [pts[n - 1][0] + ex * w1 * 0.5, pts[n - 1][1] + ey * w1 * 0.5];
  const base: Pt = [pts[0][0] - sx * w0 * 0.3, pts[0][1] - sy * w0 * 0.3];
  return smooth([...left, tip, ...right.reverse(), base]);
}

/** soft triangle (cat ear) – corners rounded */
export function softTri(a: Pt, tip: Pt, b: Pt, round = 0.2): string {
  return roundPoly([a, tip, b], round);
}

/**
 * Cat ears for a head centred at (cx, cy) with half-width R.
 * Returns [leftOuter, leftInner, rightOuter, rightInner] paths.
 */
export function catEars(
  cx: number,
  cy: number,
  R: number,
  opts: { spread?: number; tilt?: number; height?: number } = {},
): string[] {
  const s = opts.spread ?? 1;
  const t = opts.tilt ?? 0;
  const P = (u: number, v: number): Pt => [cx + u * R, cy + v * R];
  const L = (u: number, v: number): Pt => P(-u, v);
  const h = opts.height ?? 1;
  const tipY = -0.84 - 0.38 * h;
  const inTipY = -0.84 - 0.25 * h;
  const outer = (Q: (u: number, v: number) => Pt) =>
    softTri(Q(0.1 * s, -0.8), Q((0.8 + t) * s, tipY), Q(1.0, -0.22), 0.2);
  const inner = (Q: (u: number, v: number) => Pt) =>
    softTri(Q(0.3 * s, -0.7), Q((0.76 + t) * s, inTipY), Q(0.83, -0.44), 0.22);
  return [outer(L), inner(L), outer(P), inner(P)];
}

/** round, slightly chubby-cheeked head */
export function chubbyHead(cx: number, cy: number, R: number, ry = 0.84): string {
  const pts: Pt[] = [];
  const n = 16;
  for (let i = 0; i < n; i++) {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    const c = Math.cos(a);
    const sn = Math.sin(a);
    // cheeks: push the lower sides out a little
    const cheek = sn > 0 ? 1 + 0.06 * Math.sin(Math.PI * Math.min(1, sn * 1.4)) : 1;
    pts.push([cx + c * R * cheek, cy + sn * R * ry]);
  }
  return smooth(pts);
}

export interface FaceOpts {
  /** blink part for the eyes */
  eyePart?: string;
  /** part for nose / mouth / whiskers / blush */
  part?: string;
  look?: [number, number];
  /** eye size relative to R (default 0.4) */
  eye?: number;
  /** eye spacing relative to R (default 0.4) */
  spread?: number;
  /** eye height relative to R (default 0.06) */
  eyeY?: number;
  lashes?: boolean;
  whiskers?: boolean;
  /** draw a little open mouth with tongue */
  open?: boolean;
  /** stroke width for whiskers / mouth */
  w?: number;
  /** closed, sleeping eyes (no blink needed) */
  sleep?: boolean;
}

/** closed sleeping eye ‿ with two tiny lashes */
export function sleepyEye(cx: number, cy: number, w: number, side: -1 | 1, part?: string): DecorItem[] {
  return [
    inkLine(curve([[cx - w / 2, cy - w * 0.08], [cx, cy + w * 0.22], [cx + w / 2, cy - w * 0.08]]), LINE.inner + 1, part),
    inkLine(line([[cx + side * w * 0.42, cy + w * 0.02], [cx + side * w * 0.62, cy + w * 0.14]]), LINE.inner - 1, part),
  ];
}

/** cat face decor: eyes, nose, ω mouth, whiskers, cheeks */
export function catFace(cx: number, cy: number, R: number, o: FaceOpts = {}): DecorItem[] {
  const part = o.part;
  const es = (o.eye ?? 0.43) * R;
  const sp = (o.spread ?? 0.4) * R;
  const ey = cy + (o.eyeY ?? 0.06) * R;
  const w = o.w ?? LINE.inner;
  const items: DecorItem[] = o.sleep
    ? [...sleepyEye(cx - sp, ey, es * 0.95, -1, part), ...sleepyEye(cx + sp, ey, es * 0.95, 1, part)]
    : [
        ...cuteEye(cx - sp, ey, es, { part: o.eyePart, look: o.look, lashes: o.lashes ? 'left' : undefined }),
        ...cuteEye(cx + sp, ey, es, { part: o.eyePart, look: o.look, lashes: o.lashes ? 'right' : undefined }),
      ];
  const ny = cy + 0.27 * R;
  items.push(ink(roundPoly([[cx - 0.085 * R, ny - 0.035 * R], [cx + 0.085 * R, ny - 0.035 * R], [cx, ny + 0.06 * R]], 0.38), part));
  const my = ny + 0.06 * R;
  if (o.open) {
    items.push(
      decor(
        smooth([
          [cx - 0.1 * R, my + 0.05 * R],
          [cx, my + 0.03 * R],
          [cx + 0.1 * R, my + 0.05 * R],
          [cx + 0.07 * R, my + 0.17 * R],
          [cx, my + 0.2 * R],
          [cx - 0.07 * R, my + 0.17 * R],
        ]),
        { fill: '#FF8FAB', stroke: '#4E3D63', width: w * 0.8, part },
      ),
    );
  }
  for (const s of [-1, 1]) {
    items.push(
      inkLine(
        curve([
          [cx, my - 0.01 * R],
          [cx + s * 0.02 * R, my + 0.05 * R],
          [cx + s * 0.08 * R, my + 0.085 * R],
          [cx + s * 0.14 * R, my + 0.06 * R],
          [cx + s * 0.16 * R, my + 0.02 * R],
        ]),
        w,
        part,
      ),
    );
  }
  if (o.whiskers !== false) {
    for (const s of [-1, 1]) {
      items.push(inkLine(curve([[cx + s * 0.72 * R, ny + 0.0 * R], [cx + s * 0.9 * R, ny - 0.05 * R], [cx + s * 1.08 * R, ny - 0.06 * R]]), w * 0.8, part));
      items.push(inkLine(curve([[cx + s * 0.72 * R, ny + 0.11 * R], [cx + s * 0.9 * R, ny + 0.14 * R], [cx + s * 1.06 * R, ny + 0.2 * R]]), w * 0.8, part));
    }
  }
  items.push(blush(cx - 0.56 * R, cy + 0.3 * R, 0.12 * R, 0.075 * R, part));
  items.push(blush(cx + 0.56 * R, cy + 0.3 * R, 0.12 * R, 0.075 * R, part));
  return items;
}

/** little toe lines on a paw (bottom edge at y, width w) */
export function toes(cx: number, y: number, w: number, part?: string, width: number = LINE.fine): DecorItem[] {
  return [
    inkLine(line([[cx - w * 0.17, y - w * 0.28], [cx - w * 0.17, y - w * 0.05]]), width, part),
    inkLine(line([[cx + w * 0.17, y - w * 0.28], [cx + w * 0.17, y - w * 0.05]]), width, part),
  ];
}

/** small outlined heart / twinkle decorations for empty sky or walls */
export const tinyHeart = (cx: number, cy: number, w: number, part?: string) =>
  decor(heart(cx, cy, w), { fill: '#FFFFFF', stroke: '#4E3D63', width: 3, part });
export const tinyTwinkle = (cx: number, cy: number, r: number, part?: string) =>
  decor(twinkle(cx, cy, r), { fill: '#FFFFFF', stroke: '#4E3D63', width: 3, part });
export const dot = (cx: number, cy: number, r: number, part?: string) => ink(circle(cx, cy, r), part);

/** dog bone, centred at (cx, cy), total length len, end height w, rotated rot° */
export function bone(cx: number, cy: number, len: number, w: number, rot = 0): string {
  const a = len / 2 - w * 0.36;
  const r = w * 0.36;
  const t = w * 0.24;
  const ly = w * 0.3;
  const right: Pt[] = [
    [a - r * 1.15, -t],
    [a - r * 0.55, -ly - r * 0.8],
    [a + r * 0.35, -ly - r * 0.98],
    [a + r * 1.02, -ly - r * 0.15],
    [a + r * 0.55, 0],
    [a + r * 1.02, ly + r * 0.15],
    [a + r * 0.35, ly + r * 0.98],
    [a - r * 0.55, ly + r * 0.8],
    [a - r * 1.15, t],
  ];
  const left: Pt[] = right.map(([x, y]) => [-x, -y] as Pt);
  const pts: Pt[] = [...right, [0, t * 0.92], ...left, [0, -t * 0.92]];
  return smooth(pts.map(([x, y]) => rotatePt([cx + x, cy + y], rot, cx, cy)));
}

/**
 * Band across a ball (beach-ball stripe): the part of circle (cx, cy, r)
 * between two gently curved lines at y0 and y1 (relative to cy).
 */
export function ballBand(cx: number, cy: number, r: number, y0: number, y1: number, bend = 10): string {
  const xAt = (y: number) => Math.sqrt(Math.max(0, r * r - y * y));
  // top edge, left → right (curved down by bend)
  const x0 = xAt(y0);
  const x1 = xAt(y1);
  const n = 6;
  const out: (Pt | [number, number, 1])[] = [];
  // edge points; the four corners where the band meets the ball are sharp
  const edge = (x: number, y: number, u: number, i: number) => {
    const yy = cy + y + bend * Math.sin(Math.PI * u) * Math.sqrt(1 - (x / r) ** 2);
    out.push(i === 0 || i === n ? [cx + x, yy, 1] : [cx + x, yy]);
  };
  for (let i = 0; i <= n; i++) edge(-x0 + (2 * x0 * i) / n, y0, i / n, i);
  // right arc from y0 to y1
  const a0 = Math.atan2(y0, x0);
  const a1 = Math.atan2(y1, x1);
  for (let i = 1; i < 4; i++) {
    const a = a0 + ((a1 - a0) * i) / 4;
    out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  for (let i = 0; i <= n; i++) edge(x1 - (2 * x1 * i) / n, y1, i / n, i);
  for (let i = 1; i < 4; i++) {
    const a = Math.PI - a1 + ((a1 - a0) * i) / 4;
    out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return shape(out);
}

/** short sun rays around (cx, cy) as ink lines */
export function sunRays(cx: number, cy: number, r0: number, r1: number, n = 8, part?: string, rot = 0): DecorItem[] {
  const items: DecorItem[] = [];
  for (let i = 0; i < n; i++) {
    const a = ((rot + (360 / n) * i) * Math.PI) / 180;
    items.push(
      inkLine(line([[cx + Math.cos(a) * r0, cy + Math.sin(a) * r0], [cx + Math.cos(a) * r1, cy + Math.sin(a) * r1]]), LINE.outer, part),
    );
  }
  return items;
}

/** a "v" bird in the sky */
export const bird = (cx: number, cy: number, w: number) =>
  inkLine(curve([[cx - w / 2, cy - w * 0.12], [cx - w * 0.25, cy - w * 0.22], [cx, cy + w * 0.05]]) + curve([[cx, cy + w * 0.05], [cx + w * 0.25, cy - w * 0.22], [cx + w / 2, cy - w * 0.12]]).replace(/^M[^C]+/, ''), LINE.inner);

/** floppy dog ear for a head at (cx, cy) with half-width R (s = -1 left, 1 right) */
export function floppyEar(cx: number, cy: number, R: number, s: number, len = 1): string {
  const pts: Pt[] = [
    [0.5, -0.8],
    [0.84, -0.8],
    [1.08, -0.52],
    [1.18, -0.08 * len],
    [1.12, 0.3 * len],
    [0.94, 0.44 * len],
    [0.78, 0.26 * len],
    [0.72, -0.16],
    [0.6, -0.58],
  ];
  return smooth(pts.map(([u, v]) => [cx + s * u * R, cy + v * R] as Pt));
}

/** dog / puppy face: eyes, big shiny nose, mouth with tongue, cheeks */
export function dogFace(cx: number, cy: number, R: number, o: FaceOpts = {}): DecorItem[] {
  const part = o.part;
  const es = (o.eye ?? 0.42) * R;
  const sp = (o.spread ?? 0.37) * R;
  const ey = cy + (o.eyeY ?? 0) * R;
  const w = o.w ?? LINE.inner;
  const items: DecorItem[] = [
    ...cuteEye(cx - sp, ey, es, { part: o.eyePart, look: o.look, lashes: o.lashes ? 'left' : undefined }),
    ...cuteEye(cx + sp, ey, es, { part: o.eyePart, look: o.look, lashes: o.lashes ? 'right' : undefined }),
  ];
  const ny = cy + 0.29 * R;
  const my = ny + 0.16 * R;
  if (o.open !== false) {
    items.push(
      decor(
        smooth([
          [cx - 0.1 * R, my + 0.02 * R],
          [cx + 0.1 * R, my + 0.02 * R],
          [cx + 0.095 * R, my + 0.15 * R],
          [cx, my + 0.21 * R],
          [cx - 0.095 * R, my + 0.15 * R],
        ]),
        { fill: '#FF8FAB', stroke: '#4E3D63', width: w * 0.85, part },
      ),
    );
    items.push(inkLine(line([[cx, my + 0.06 * R], [cx, my + 0.13 * R]]), w * 0.6, part));
  }
  items.push(inkLine(line([[cx, ny + 0.06 * R], [cx, my]]), w, part));
  for (const s of [-1, 1]) {
    items.push(
      inkLine(
        curve([
          [cx, my - 0.01 * R],
          [cx + s * 0.05 * R, my + 0.05 * R],
          [cx + s * 0.13 * R, my + 0.055 * R],
          [cx + s * 0.19 * R, my - 0.01 * R],
        ]),
        w,
        part,
      ),
    );
  }
  items.push(
    ink(
      smooth([
        [cx - 0.14 * R, ny - 0.05 * R],
        [cx, ny - 0.075 * R],
        [cx + 0.14 * R, ny - 0.05 * R],
        [cx + 0.08 * R, ny + 0.06 * R],
        [cx, ny + 0.09 * R],
        [cx - 0.08 * R, ny + 0.06 * R],
      ]),
      part,
    ),
  );
  items.push(decor(ellipse(cx - 0.05 * R, ny - 0.035 * R, 0.04 * R, 0.022 * R), { fill: '#FFFFFF', part }));
  items.push(blush(cx - 0.57 * R, cy + 0.3 * R, 0.11 * R, 0.07 * R, part));
  items.push(blush(cx + 0.57 * R, cy + 0.3 * R, 0.11 * R, 0.07 * R, part));
  return items;
}

/** long bunny ear with a round tip, from base to tip, half-width w */
export function longEar(base: Pt, tip: Pt, w: number): string {
  const dx = tip[0] - base[0];
  const dy = tip[1] - base[1];
  const L = Math.hypot(dx, dy) || 1;
  const ux = dx / L;
  const uy = dy / L;
  const nx = -uy;
  const ny = ux;
  const at = (t: number, s: number): Pt => [base[0] + ux * L * t + nx * w * s, base[1] + uy * L * t + ny * w * s];
  return smooth([
    [base[0] - ux * w * 0.4, base[1] - uy * w * 0.4],
    at(0.05, 0.75),
    at(0.38, 1.0),
    at(0.72, 0.94),
    at(0.93, 0.58),
    at(1, 0),
    at(0.93, -0.58),
    at(0.72, -0.94),
    at(0.38, -1.0),
    at(0.05, -0.75),
  ]);
}

/** fan of n round leaves (carrot tops, plant sprouts) from base, pointing angle° */
export function leafFan(base: Pt, angle: number, len: number, spread = 64, n = 3, fat = 0.2): string {
  const pts: Pt[] = [];
  const rad = (d: number) => (d * Math.PI) / 180;
  const dirs: number[] = [];
  for (let i = 0; i < n; i++) dirs.push(angle - spread / 2 + (spread * i) / (n - 1));
  const p = (a: number, r: number, side: number, hw: number): Pt => {
    const c = Math.cos(rad(a));
    const s = Math.sin(rad(a));
    return [base[0] + c * r - s * hw * side, base[1] + s * r + c * hw * side];
  };
  pts.push(p(angle, -len * 0.06, 0, 0));
  dirs.forEach((a, i) => {
    const l = i === (n - 1) / 2 ? len : len * 0.86;
    const hw = len * fat;
    if (i === 0) pts.push(p(a, l * 0.3, -1, hw * 0.45));
    pts.push(p(a, l * 0.62, -1, hw * 0.95));
    pts.push(p(a, l * 0.9, -1, hw * 0.62));
    pts.push(p(a, l, 0, 0));
    pts.push(p(a, l * 0.9, 1, hw * 0.62));
    pts.push(p(a, l * 0.62, 1, hw * 0.95));
    if (i < n - 1) pts.push(p((a + dirs[i + 1]) / 2, len * 0.46, 0, 0));
    else pts.push(p(a, l * 0.3, 1, hw * 0.45));
  });
  return smooth(pts);
}

/** carrot body: round top at `top`, tapering to `tip`, top width w */
export function carrot(top: Pt, tip: Pt, w: number): string {
  const mid: Pt = [top[0] + (tip[0] - top[0]) * 0.45, top[1] + (tip[1] - top[1]) * 0.45];
  return tube([top, mid, tip], w, w * 0.22);
}

/** short ridge lines across a carrot (decor) */
export function carrotLines(top: Pt, tip: Pt, w: number, part?: string): DecorItem[] {
  const dx = tip[0] - top[0];
  const dy = tip[1] - top[1];
  const L = Math.hypot(dx, dy) || 1;
  const nx = -dy / L;
  const ny = dx / L;
  const out: DecorItem[] = [];
  const marks: [number, number][] = [
    [0.28, 1],
    [0.48, -1],
    [0.66, 1],
  ];
  for (const [t, side] of marks) {
    const half = (w / 2) * (1 - t * 0.75);
    const cx = top[0] + dx * t;
    const cy = top[1] + dy * t;
    const p0: Pt = [cx + nx * half * side, cy + ny * half * side];
    const p1: Pt = [cx + nx * half * side * 0.25, cy + ny * half * side * 0.25];
    out.push(inkLine(line([p0, p1]), LINE.fine, part));
  }
  return out;
}

/** bunny face: eyes, tiny nose, mouth with buck teeth, short whiskers, cheeks */
export function bunnyFace(cx: number, cy: number, R: number, o: FaceOpts = {}): DecorItem[] {
  const part = o.part;
  const es = (o.eye ?? 0.42) * R;
  const sp = (o.spread ?? 0.4) * R;
  const ey = cy + (o.eyeY ?? 0.04) * R;
  const w = o.w ?? LINE.inner;
  const items: DecorItem[] = [
    ...cuteEye(cx - sp, ey, es, { part: o.eyePart, look: o.look, lashes: o.lashes ? 'left' : undefined }),
    ...cuteEye(cx + sp, ey, es, { part: o.eyePart, look: o.look, lashes: o.lashes ? 'right' : undefined }),
  ];
  const ny = cy + 0.29 * R;
  const my = ny + 0.1 * R;
  // buck teeth (under the mouth line)
  items.push(decor(rect(cx - 0.085 * R, my + 0.01 * R, 0.17 * R, 0.13 * R, 0.03 * R), { fill: '#FFFFFF', stroke: '#4E3D63', width: w * 0.7, part }));
  items.push(inkLine(line([[cx, my + 0.02 * R], [cx, my + 0.13 * R]]), w * 0.6, part));
  items.push(
    ink(
      smooth([
        [cx - 0.08 * R, ny - 0.04 * R],
        [cx + 0.08 * R, ny - 0.04 * R],
        [cx + 0.03 * R, ny + 0.04 * R],
        [cx, ny + 0.05 * R],
        [cx - 0.03 * R, ny + 0.04 * R],
      ]),
      part,
    ),
  );
  items.push(inkLine(line([[cx, ny + 0.04 * R], [cx, my]]), w, part));
  for (const s of [-1, 1]) {
    items.push(
      inkLine(
        curve([
          [cx, my - 0.005 * R],
          [cx + s * 0.06 * R, my + 0.045 * R],
          [cx + s * 0.14 * R, my + 0.03 * R],
          [cx + s * 0.17 * R, my - 0.02 * R],
        ]),
        w,
        part,
      ),
    );
    if (o.whiskers !== false) {
      items.push(inkLine(curve([[cx + s * 0.3 * R, ny + 0.0 * R], [cx + s * 0.45 * R, ny - 0.03 * R], [cx + s * 0.58 * R, ny - 0.02 * R]]), w * 0.7, part));
      items.push(inkLine(curve([[cx + s * 0.3 * R, ny + 0.08 * R], [cx + s * 0.45 * R, ny + 0.1 * R], [cx + s * 0.56 * R, ny + 0.15 * R]]), w * 0.7, part));
    }
  }
  items.push(blush(cx - 0.6 * R, cy + 0.3 * R, 0.12 * R, 0.075 * R, part));
  items.push(blush(cx + 0.6 * R, cy + 0.3 * R, 0.12 * R, 0.075 * R, part));
  return items;
}

/** puffy bunny muzzle (two cheek puffs) */
export function bunnyMuzzle(cx: number, cy: number, R: number): string {
  const P = (u: number, v: number): Pt => [cx + u * R, cy + v * R];
  return smooth([
    P(0, 0.2),
    P(0.18, 0.17),
    P(0.33, 0.25),
    P(0.38, 0.4),
    P(0.28, 0.53),
    P(0.12, 0.55),
    P(0, 0.5),
    P(-0.12, 0.55),
    P(-0.28, 0.53),
    P(-0.38, 0.4),
    P(-0.33, 0.25),
    P(-0.18, 0.17),
  ]);
}

/** "Z" letter for sleepy scenes (decor) */
export const zee = (cx: number, cy: number, h: number, part?: string) =>
  inkLine(
    line([
      [cx - h * 0.38, cy - h / 2],
      [cx + h * 0.38, cy - h / 2],
      [cx - h * 0.38, cy + h / 2],
      [cx + h * 0.38, cy + h / 2],
    ]),
    LINE.inner + 1,
    part,
  );

/** rotate every decor/region path of a list around (cx, cy) */
export function rotItems<T extends { d: string }>(items: T[], deg: number, cx: number, cy: number): T[] {
  return items.map((it) => ({ ...it, d: rotatePath(it.d, deg, cx, cy) }));
}

/** puppy head: round top, soft jowls */
export function dogHead(cx: number, cy: number, R: number): string {
  const P = (u: number, v: number): Pt => [cx + u * R, cy + v * R];
  return smooth([
    P(0, -0.86),
    P(0.62, -0.72),
    P(0.96, -0.2),
    P(0.92, 0.38),
    P(0.5, 0.8),
    P(0, 0.88),
    P(-0.5, 0.8),
    P(-0.92, 0.38),
    P(-0.96, -0.2),
    P(-0.62, -0.72),
  ]);
}

/** sitting body seen from the front, centred on x = cx, from top y0 to bottom y1, half-width w */
export function sitBody(cx: number, y0: number, y1: number, w: number): string {
  const h = y1 - y0;
  return smooth(
    symmetricPts(
      [
        [cx, y0],
        [cx + w * 0.5, y0 + h * 0.04],
        [cx + w * 0.87, y0 + h * 0.3],
        [cx + w, y0 + h * 0.6],
        [cx + w * 0.92, y0 + h * 0.86],
        [cx + w * 0.58, y0 + h * 0.98],
        [cx, y1],
      ],
      cx,
    ),
  );
}

/** curly balloon string (decor) hanging from (x, y) */
export const balloonString = (x: number, y: number, len: number, part?: string) =>
  inkLine(
    curve([
      [x, y],
      [x - 10, y + len * 0.25],
      [x + 8, y + len * 0.5],
      [x - 8, y + len * 0.75],
      [x + 4, y + len],
    ]),
    LINE.fine,
    part,
  );

/** balloon body with a little knot */
export function balloon(cx: number, cy: number, r: number): string {
  return shape([
    [cx, cy - r * 1.12],
    [cx + r * 0.82, cy - r * 0.7],
    [cx + r * 0.9, cy + r * 0.05],
    [cx + r * 0.42, cy + r * 0.86],
    [cx + r * 0.16, cy + r * 1.06, 1],
    [cx + r * 0.2, cy + r * 1.22, 1],
    [cx - r * 0.2, cy + r * 1.22, 1],
    [cx - r * 0.16, cy + r * 1.06, 1],
    [cx - r * 0.42, cy + r * 0.86],
    [cx - r * 0.9, cy + r * 0.05],
    [cx - r * 0.82, cy - r * 0.7],
  ]);
}
