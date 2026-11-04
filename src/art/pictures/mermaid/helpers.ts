/**
 * Small drawing helpers shared by the mermaid pages
 * (bubbles, sea shells, faces, wave bands).
 */
import {
  arc,
  cuteEye,
  ellipse,
  roundPoly,
  blush,
  circle,
  curve,
  decor,
  inkLine,
  LINE,
  region,
  shape,
  smile,
  smooth,
  WHITE,
  wavePts,
  type Pt,
} from '../../dsl';
import { mapPath } from '../../../engine/path';
import type { ArtItem, DecorItem, RegionItem } from '../../types';

/** a colourable bubble with a little reflection curve */
export function bubble(id: string, cx: number, cy: number, r: number, opts: { part?: string; hint?: string } = {}): ArtItem[] {
  const { part, hint = '#EAF7FF' } = opts;
  return [
    region(id, circle(cx, cy, r), { part, hint }),
    decor(arc(cx, cy, r * 0.62, 200, 258), { stroke: '#4E3D63', width: LINE.fine, part }),
    decor(circle(cx + r * 0.38, cy - r * 0.38, Math.max(3, r * 0.12)), { fill: WHITE, part }),
  ];
}

/** tiny bubble that is only decoration (an ink ring) */
export function miniBubble(cx: number, cy: number, r: number, part?: string): DecorItem {
  return decor(circle(cx, cy, r), { stroke: '#4E3D63', width: LINE.fine, fill: WHITE, part });
}

/** band of water / sand with a wavy top edge, reaching below the canvas */
export function waveBand(y: number, amp: number, waves: number, phase = 0, bottom = 1020): string {
  return shape([[-20, bottom, 1], ...wavePts(-20, 1020, y, amp, waves, phase), [1020, bottom, 1]]);
}

/** scallop (fan) sea shell: hinge at the bottom, ribbed round top */
export function fanShell(cx: number, cy: number, w: number, h: number, rot = 0): string {
  const hw = w / 2;
  const pts: (Pt | [number, number, 1])[] = [
    [cx - hw * 0.28, cy + h * 0.5, 1],
    [cx - hw * 0.95, cy - h * 0.05],
    [cx - hw * 0.7, cy - h * 0.4],
    [cx, cy - h * 0.52],
    [cx + hw * 0.7, cy - h * 0.4],
    [cx + hw * 0.95, cy - h * 0.05],
    [cx + hw * 0.28, cy + h * 0.5, 1],
  ];
  const d = shape(pts);
  return rot ? mapPath(d, (p) => rotPt(p, rot, cx, cy)) : d;
}

/** ridge lines for fanShell (decor) */
export function fanShellRidges(cx: number, cy: number, w: number, h: number, rot = 0, part?: string): DecorItem[] {
  const hw = w / 2;
  const base: Pt = [cx, cy + h * 0.42];
  const tips: Pt[] = [
    [cx - hw * 0.55, cy - h * 0.22],
    [cx, cy - h * 0.36],
    [cx + hw * 0.55, cy - h * 0.22],
  ];
  return tips.map((tp) => {
    const mid: Pt = [(base[0] + tp[0]) / 2, (base[1] + tp[1]) / 2];
    let d = curve([base, mid, tp]);
    if (rot) d = mapPath(d, (p) => rotPt(p, rot, cx, cy));
    return inkLine(d, LINE.fine, part);
  });
}

function rotPt([x, y]: Pt, deg: number, cx: number, cy: number): Pt {
  const a = (deg * Math.PI) / 180;
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c];
}

/**
 * A cute face: two glossy eyes, a tiny smile and pink cheeks.
 * (cx, cy) = centre between the eyes.
 */
export function face(
  cx: number,
  cy: number,
  o: {
    gap: number;
    eye: number;
    eyePart?: string;
    part?: string;
    lashes?: boolean;
    look?: [number, number];
    smileW?: number;
    smileY?: number;
    cheekDx?: number;
    cheekY?: number;
    cheek?: number;
  },
): DecorItem[] {
  const { gap, eye, eyePart, part, lashes, look } = o;
  const smileW = o.smileW ?? eye * 0.55;
  const smileY = o.smileY ?? cy + eye * 0.62;
  const cheekDx = o.cheekDx ?? gap * 0.5 + eye * 0.42;
  const cheekY = o.cheekY ?? cy + eye * 0.5;
  const cheek = o.cheek ?? eye * 0.3;
  return [
    ...cuteEye(cx - gap / 2, cy, eye, { lashes: lashes ? 'left' : undefined, part: eyePart ?? part, look }),
    ...cuteEye(cx + gap / 2, cy, eye, { lashes: lashes ? 'right' : undefined, part: eyePart ?? part, look }),
    inkLine(smile(cx, smileY, smileW, smileW * 0.32), LINE.inner, part),
    blush(cx - cheekDx, cheekY, cheek, cheek * 0.62, part),
    blush(cx + cheekDx, cheekY, cheek, cheek * 0.62, part),
  ];
}

/**
 * Point transform: scale by s around (ox, oy), rotate by rot degrees around
 * (ox, oy), then move by (dx, dy). Use it for pivots of placed groups.
 */
export function placer(dx: number, dy: number, s = 1, ox = 0, oy = 0, rot = 0): (x: number, y: number) => [number, number] {
  const a = (rot * Math.PI) / 180;
  const c = Math.cos(a);
  const sn = Math.sin(a);
  return (x, y) => {
    const px = (x - ox) * s;
    const py = (y - oy) * s;
    return [ox + px * c - py * sn + dx, oy + px * sn + py * c + dy];
  };
}

/** move / scale / rotate a group of items (paths only; line widths stay the same) */
export function place<T extends ArtItem>(items: T[], fn: (x: number, y: number) => [number, number]): T[] {
  return items.map((it) => ({ ...it, d: mapPath(it.d, ([x, y]) => fn(x, y)) }));
}

/** re-tag a group of items with an animation part */
export function withPart<T extends ArtItem>(items: T[], part: string): T[] {
  return items.map((it) => ({ ...it, part }));
}

export type { RegionItem };

/**
 * Wavy seaweed ribbon growing up from (x0, yBottom). Width tapers a little
 * towards the rounded tip.
 */
export function seaweed(x0: number, yBottom: number, h: number, w: number, waves = 1.5, amp = 18, phase = 0): string {
  const n = Math.max(4, Math.round(waves * 4));
  const center: Pt[] = [];
  const half: number[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    center.push([x0 + Math.sin(t * waves * Math.PI * 2 + phase) * amp, yBottom - h * t]);
    half.push((w / 2) * (1 - 0.3 * t));
  }
  const left: (Pt | [number, number, 1])[] = [];
  const right: (Pt | [number, number, 1])[] = [];
  for (let i = 0; i <= n; i++) {
    left.push([center[i][0] - half[i], center[i][1]]);
    right.push([center[i][0] + half[i], center[i][1]]);
  }
  left[0] = [left[0][0], left[0][1], 1];
  right[0] = [right[0][0], right[0][1], 1];
  const tip: Pt = [center[n][0], center[n][1] - half[n] * 0.95];
  return shape([...left, tip, ...right.reverse()]);
}

/** rounded paddle / flipper / fin: narrow at the base, round and wide near the tip */
export function paddle(base: Pt, tip: Pt, w: number, fat = 1): string {
  const dx = tip[0] - base[0];
  const dy = tip[1] - base[1];
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const at = (t: number, s: number): Pt => [base[0] + dx * t + nx * s, base[1] + dy * t + ny * s];
  return smooth([
    at(0, w * 0.5),
    at(0.45, w * 0.92 * fat),
    at(0.82, w * 0.8 * fat),
    tip,
    at(0.82, -w * 0.8 * fat),
    at(0.45, -w * 0.92 * fat),
    at(0, -w * 0.5),
  ]);
}

/**
 * Smooth tube along a centre line (tails, arms). widths[i] = full width at
 * centre[i]. The start is left open-flat (hide it under another shape), the
 * end gets a round cap unless capEnd = false.
 */
export function tube(center: Pt[], widths: number[], capEnd = true): string {
  const n = center.length;
  const left: Pt[] = [];
  const right: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = center[Math.max(0, i - 1)];
    const b = center[Math.min(n - 1, i + 1)];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    const h = widths[i] / 2;
    left.push([center[i][0] + nx * h, center[i][1] + ny * h]);
    right.push([center[i][0] - nx * h, center[i][1] - ny * h]);
  }
  const pts: (Pt | [number, number, 1])[] = [];
  pts.push([left[0][0], left[0][1], 1]);
  for (let i = 1; i < n; i++) pts.push(left[i]);
  if (capEnd) {
    const e = center[n - 1];
    const p = center[n - 2];
    const len = Math.hypot(e[0] - p[0], e[1] - p[1]) || 1;
    const h = widths[n - 1] / 2;
    pts.push([e[0] + ((e[0] - p[0]) / len) * h * 0.9, e[1] + ((e[1] - p[1]) / len) * h * 0.9]);
  }
  for (let i = n - 1; i >= 1; i--) pts.push(right[i]);
  pts.push([right[0][0], right[0][1], 1]);
  return shape(pts);
}

/** cloud-like curly outline: n round bumps around an ellipse (curly hair, bushes, coral) */
export function curlyBlob(cx: number, cy: number, rx: number, ry: number, n = 10, bump = 0.5, start = -90): string {
  const pts: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = ((start + (360 / n) * i) * Math.PI) / 180;
    pts.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]);
  }
  return bumpLoop(pts, bump, [cx, cy]);
}

/** closed loop through pts where every edge bulges outward (away from c) as a round bump */
export function bumpLoop(pts: Pt[], bump = 0.5, c?: Pt): string {
  const n = pts.length;
  const cc: Pt = c ?? [pts.reduce((s, p) => s + p[0], 0) / n, pts.reduce((s, p) => s + p[1], 0) / n];
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[i];
    const p1 = pts[(i + 1) % n];
    d += bumpSeg(p0, p1, bump, cc);
  }
  return d + 'Z';
}

/** cubic segment from p0 to p1 bulging away from point `away` (or to the left of travel if away is undefined) */
export function bumpSeg(p0: Pt, p1: Pt, bump: number, away?: Pt): string {
  const mx = (p0[0] + p1[0]) / 2;
  const my = (p0[1] + p1[1]) / 2;
  const dx = p1[0] - p0[0];
  const dy = p1[1] - p0[1];
  const len = Math.hypot(dx, dy) || 1;
  let nx = dy / len;
  let ny = -dx / len;
  if (away && (mx - away[0]) * nx + (my - away[1]) * ny < 0) {
    nx = -nx;
    ny = -ny;
  }
  const b = len * bump * 1.1;
  const f = (n: number) => n.toFixed(1);
  return `C${f(p0[0] + nx * b + dx * 0.02)} ${f(p0[1] + ny * b + dy * 0.02)} ${f(p1[0] + nx * b - dx * 0.02)} ${f(p1[1] + ny * b - dy * 0.02)} ${f(p1[0])} ${f(p1[1])}`;
}

/**
 * Curly / scalloped bangs sitting on a head ellipse: follows the top of the
 * head (slightly outside it) and ends in n round curls along the hairline.
 */
export function bangs(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  o: { a0?: number; a1?: number; pad?: number; hairY: number; n?: number; bump?: number },
): string {
  const a0 = o.a0 ?? 165;
  const a1 = o.a1 ?? 375;
  const pad = o.pad ?? 10;
  const n = o.n ?? 6;
  const bump = o.bump ?? 0.45;
  const outer = arc(cx, cy, rx + pad, a0, a1, ry + pad);
  const at = (deg: number): Pt => [cx + (rx + pad) * Math.cos((deg * Math.PI) / 180), cy + (ry + pad) * Math.sin((deg * Math.PI) / 180)];
  const R = at(a1);
  const L = at(a0);
  const pts: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const x = R[0] + (L[0] - R[0]) * t;
    const k = (2 * t - 1) ** 2;
    const y = o.hairY + (R[1] + (L[1] - R[1]) * t - o.hairY) * k;
    pts.push([x, y]);
  }
  let d = outer;
  for (let i = 0; i < n; i++) d += bumpSeg(pts[i], pts[i + 1], bump, [cx, cy - ry * 3]);
  return d + 'Z';
}

/**
 * Cute round fish (body + tail regions, eye/smile/stripe decor).
 * dir = 1 faces right, -1 faces left. size = body half-width.
 */
export function fish(
  id: string,
  cx: number,
  cy: number,
  size: number,
  o: { dir?: 1 | -1; body?: string; tail?: string; part?: string; stripe?: boolean } = {},
): ArtItem[] {
  const { dir = 1, body = '#FFE27A', tail = '#FFD3A5', part, stripe = true } = o;
  const rx = size;
  const ry = size * 0.74;
  const X = (dx: number) => cx + dir * dx;
  const tailPts: Pt[] = [
    [X(-rx * 0.82), cy],
    [X(-rx * 1.62), cy - ry * 0.95],
    [X(-rx * 1.7), cy + ry * 0.95],
  ];
  const items: ArtItem[] = [
    region(`${id}-tail`, roundPoly(tailPts, 0.3), { part, hint: tail }),
    region(id, ellipse(cx, cy, rx, ry), { part, hint: body }),
  ];
  if (stripe) items.push(inkLine(curve([[X(-rx * 0.4), cy - ry * 0.88], [X(-rx * 0.56), cy], [X(-rx * 0.4), cy + ry * 0.88]]), LINE.inner, part));
  items.push(...cuteEye(X(rx * 0.4), cy - ry * 0.14, size * 0.5, { part }));
  items.push(inkLine(smile(X(rx * 0.68), cy + ry * 0.36, size * 0.24, size * 0.08), LINE.inner, part));
  return items;
}

/**
 * Stubby branching coral growing up from (x, yBottom); s = scale, flip mirrors it.
 */
export function coral(x: number, yb: number, s = 1, flip = false): string {
  const raw: [number, number, number?][] = [
    [-34, 0, 1],
    [-30, -50],
    [-62, -78],
    [-80, -122],
    [-64, -146],
    [-44, -132],
    [-34, -100],
    [-16, -88],
    [-24, -146],
    [-6, -178],
    [18, -170],
    [22, -136],
    [16, -100],
    [36, -108],
    [50, -140],
    [74, -144],
    [80, -116],
    [58, -76],
    [32, -48],
    [34, 0, 1],
  ];
  const pts = raw.map(([px, py, c]) => {
    const p: [number, number] = [x + (flip ? -px : px) * s, yb + py * s];
    return c ? ([p[0], p[1], 1] as [number, number, 1]) : p;
  });
  return shape(flip ? pts.reverse() : pts);
}

/** Jellyfish: dome bell + scalloped frill (regions), wavy tentacles + face (decor). */
export function jellyfish(
  id: string,
  cx: number,
  cy: number,
  w: number,
  o: { bell?: string; frill?: string; part?: string; eyePart?: string } = {},
): ArtItem[] {
  const { bell = '#E3D4FF', frill = '#FFC9DD', part } = o;
  const h = w * 0.8;
  const hw = w / 2;
  const bellD = shape([
    [cx - hw, cy + h * 0.22, 1],
    [cx - hw * 0.94, cy - h * 0.22],
    [cx - hw * 0.55, cy - h * 0.58],
    [cx, cy - h * 0.68],
    [cx + hw * 0.55, cy - h * 0.58],
    [cx + hw * 0.94, cy - h * 0.22],
    [cx + hw, cy + h * 0.22, 1],
  ]);
  const n = 5;
  const top = cy + h * 0.14;
  const low = cy + h * 0.26;
  const pts: Pt[] = [];
  for (let i = 0; i <= n; i++) pts.push([cx + hw * 1.04 - (w * 1.08 * i) / n, low]);
  let frillD = `M${(cx - hw * 1.04).toFixed(1)} ${top.toFixed(1)}L${(cx + hw * 1.04).toFixed(1)} ${top.toFixed(1)}L${pts[0][0].toFixed(1)} ${low.toFixed(1)}`;
  for (let i = 0; i < n; i++) frillD += bumpSeg(pts[i], pts[i + 1], 0.55, [cx, top - 100]);
  frillD += 'Z';
  const items: ArtItem[] = [];
  // tentacles first so the frill covers their tops
  const tl = h * 1.0;
  for (let i = 0; i < 4; i++) {
    const x0 = cx - hw * 0.6 + (w * 0.6 * i) / 3;
    const y0 = low;
    const s = i % 2 === 0 ? 1 : -1;
    items.push(
      inkLine(
        curve([
          [x0, y0],
          [x0 + s * w * 0.07, y0 + tl * 0.33],
          [x0 - s * w * 0.07, y0 + tl * 0.66],
          [x0 + s * w * 0.03, y0 + tl],
        ]),
        LINE.inner,
        part,
      ),
    );
  }
  items.push(region(id, bellD, { part, hint: bell }));
  items.push(region(`${id}-frill`, frillD, { part, hint: frill }));
  items.push(
    ...face(cx, cy - h * 0.12, {
      gap: w * 0.36,
      eye: w * 0.26,
      part,
      eyePart: o.eyePart ?? part,
      smileY: cy + h * 0.04,
      smileW: w * 0.14,
      cheekDx: w * 0.3,
      cheekY: cy + h * 0.02,
      cheek: w * 0.07,
    }),
  );
  return items;
}
