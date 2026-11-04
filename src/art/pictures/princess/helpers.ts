/**
 * Small drawing helpers shared by the princess pages.
 * (Kept inside this folder on purpose – dsl.ts is shared by every category.)
 */
import { blush, circle, cuteEye, decor, INK, inkLine, LINE, roundPoly, shape, smile, twinkle, type Pt } from '../../dsl';
import type { DecorItem } from '../../types';

/**
 * Chubby crown sitting on (cx, baseY). Three rounded points, slightly curved
 * band so it hugs a round head.
 */
export function crown(cx: number, baseY: number, w: number, h: number, sag = 10): string {
  const x0 = cx - w / 2;
  const x1 = cx + w / 2;
  const pts: Pt[] = [
    [x0 + w * 0.04, baseY],
    [cx - w * 0.25, baseY + sag * 0.75],
    [cx, baseY + sag],
    [cx + w * 0.25, baseY + sag * 0.75],
    [x1 - w * 0.04, baseY],
    [x1, baseY - h * 0.78],
    [cx + w * 0.25, baseY - h * 0.42],
    [cx, baseY - h],
    [cx - w * 0.25, baseY - h * 0.42],
    [x0, baseY - h * 0.78],
  ];
  return roundPoly(pts, 0.14);
}

/** the three tip positions of crown() (for little pearl balls) */
export function crownTips(cx: number, baseY: number, w: number, h: number): Pt[] {
  return [
    [cx - w / 2, baseY - h * 0.78],
    [cx, baseY - h],
    [cx + w / 2, baseY - h * 0.78],
  ];
}

/** white pearl with an ink ring (decor) */
export function pearl(cx: number, cy: number, r: number, part?: string): DecorItem {
  return decor(circle(cx, cy, r), { fill: '#FFFFFF', stroke: INK, width: LINE.fine + 0.5, part });
}

/**
 * Princess face details (decor): two big glossy eyes with lashes, rosy
 * cheeks and a tiny smile. `s` ≈ face half-width.
 */
export function princessFace(
  cx: number,
  cy: number,
  s: number,
  opts: { eyePart?: string; part?: string; look?: [number, number]; mouth?: 'smile' | 'open' } = {},
): DecorItem[] {
  const { eyePart, part, look, mouth = 'smile' } = opts;
  const ex = s * 0.4;
  const eyeSize = s * 0.46;
  const items: DecorItem[] = [
    ...cuteEye(cx - ex, cy, eyeSize, { lashes: 'left', part: eyePart, look }),
    ...cuteEye(cx + ex, cy, eyeSize, { lashes: 'right', part: eyePart, look }),
    blush(cx - s * 0.62, cy + s * 0.36, s * 0.15, s * 0.095, part),
    blush(cx + s * 0.62, cy + s * 0.36, s * 0.15, s * 0.095, part),
  ];
  if (mouth === 'open') {
    // little open "o" smile: a filled D shape
    const w = s * 0.2;
    const y = cy + s * 0.33;
    items.push(
      decor(
        `M${cx - w / 2} ${y}Q${cx} ${y - w * 0.12} ${cx + w / 2} ${y}C${cx + w * 0.42} ${y + w * 0.7} ${cx - w * 0.42} ${
          y + w * 0.7
        } ${cx - w / 2} ${y}Z`,
        { fill: '#FF8FAE', stroke: INK, width: LINE.inner, part },
      ),
    );
  } else {
    items.push(inkLine(smile(cx, cy + s * 0.33, s * 0.2, s * 0.06), LINE.inner, part));
  }
  return items;
}

/** small white four-point sparkle with an ink outline (decor) */
export function sparkle(cx: number, cy: number, r: number, part?: string): DecorItem {
  return decor(twinkle(cx, cy, r), { fill: '#FFFFFF', stroke: INK, width: LINE.fine, part });
}

/** tiny dot (decor) e.g. polka dots on a dress */
export function dot(cx: number, cy: number, r: number, part?: string): DecorItem {
  return decor(circle(cx, cy, r), { fill: INK, part });
}

/** heart-shaped gem outline helper points (for roundPoly) */
export function gemPts(cx: number, cy: number, w: number, h: number): Pt[] {
  return [
    [cx - w * 0.5, cy - h * 0.15],
    [cx - w * 0.28, cy - h * 0.5],
    [cx + w * 0.28, cy - h * 0.5],
    [cx + w * 0.5, cy - h * 0.15],
    [cx, cy + h * 0.5],
  ];
}

export const gem = (cx: number, cy: number, w: number, h = w * 0.85) => roundPoly(gemPts(cx, cy, w, h), 0.18);

export type SPt = [number, number] | [number, number, 1];

/**
 * Scalloped hem points from x1 → x0 (right to left, for a clockwise outline).
 * Valleys are sharp corners, n round bumps hang `depth` below them. `sag`
 * makes the hem dip in the middle so skirts look round.
 */
export function hemPts(x0: number, x1: number, y: number, n: number, depth: number, sag = 0): SPt[] {
  const cx = (x0 + x1) / 2;
  const hw = (x1 - x0) / 2;
  const yAt = (x: number) => y + sag * (1 - ((x - cx) / hw) ** 2);
  const pts: SPt[] = [];
  for (let k = 0; k <= n; k++) {
    const x = x1 - ((x1 - x0) * k) / n;
    pts.push([x, yAt(x), 1]);
    if (k < n) {
      const m = x - (x1 - x0) / n / 2;
      pts.push([m, yAt(m) + depth]);
    }
  }
  return pts;
}

/** ribbon bow (one region) – pair with bowKnot() decor */
export function bow(cx: number, cy: number, w: number, h: number): string {
  const right: SPt[] = [
    [cx + w * 0.07, cy - h * 0.14, 1],
    [cx + w * 0.26, cy - h * 0.42],
    [cx + w * 0.46, cy - h * 0.44],
    [cx + w * 0.5, cy - h * 0.02],
    [cx + w * 0.42, cy + h * 0.4],
    [cx + w * 0.22, cy + h * 0.36],
    [cx + w * 0.07, cy + h * 0.14, 1],
  ];
  const left: SPt[] = right
    .map((p) => (p.length === 3 ? ([2 * cx - p[0], p[1], 1] as SPt) : ([2 * cx - p[0], p[1]] as SPt)))
    .reverse();
  return shape([...right, ...left]);
}

/** knot + little fold lines for bow() */
export function bowKnot(cx: number, cy: number, w: number, h: number, part?: string): DecorItem[] {
  return [
    decor(roundPoly([
      [cx - w * 0.1, cy - h * 0.2],
      [cx + w * 0.1, cy - h * 0.2],
      [cx + w * 0.1, cy + h * 0.2],
      [cx - w * 0.1, cy + h * 0.2],
    ], 0.35), { stroke: INK, width: LINE.inner, part }),
    inkLine(`M${cx + w * 0.16} ${cy - h * 0.08}Q${cx + w * 0.28} ${cy - h * 0.16} ${cx + w * 0.36} ${cy - h * 0.12}`, LINE.fine, part),
    inkLine(`M${cx - w * 0.16} ${cy - h * 0.08}Q${cx - w * 0.28} ${cy - h * 0.16} ${cx - w * 0.36} ${cy - h * 0.12}`, LINE.fine, part),
  ];
}

/**
 * Side-swept fringe + two side locks (hair cap). Drawn for a face ellipse
 * centred on (500, 450) with rx = 190; bangsFor() rescales it to any face.
 */
const SWEPT_BANGS: SPt[] = [
  [300, 545, 1],
  [296, 420],
  [326, 328],
  [402, 268],
  [500, 250],
  [598, 268],
  [674, 328],
  [704, 420],
  [700, 545, 1],
  [672, 470],
  [660, 405],
  [640, 366, 1],
  [612, 404],
  [566, 414],
  [520, 392],
  [480, 352],
  [452, 330, 1],
  [430, 376],
  [396, 404],
  [366, 372, 1],
  [346, 414],
  [334, 470],
];

/** fringe for a face centred on (cx, cy) with half-width rx; flip mirrors the part */
export function bangsFor(cx: number, cy: number, rx: number, flip = false): string {
  const k = rx / 190;
  return shape(
    SWEPT_BANGS.map((p) => {
      const x = cx + (flip ? -1 : 1) * (p[0] - 500) * k;
      const y = cy + (p[1] - 450) * k;
      return p.length === 3 ? ([x, y, 1] as SPt) : ([x, y] as SPt);
    }),
  );
}

/** hair strand lines that go with bangsFor() */
export function bangsLines(cx: number, cy: number, rx: number, flip = false, part?: string): DecorItem[] {
  const k = rx / 190;
  const T = (x: number, y: number): Pt => [cx + (flip ? -1 : 1) * (x - 500) * k, cy + (y - 450) * k];
  return [
    inkLine(curvePts([T(470, 300), T(540, 320), T(600, 360)]), LINE.fine, part),
    inkLine(curvePts([T(404, 300), T(388, 320), T(380, 344)]), LINE.fine, part),
  ];
}

function curvePts(p: Pt[]): string {
  return `M${p[0][0]} ${p[0][1]}Q${p[1][0]} ${p[1][1]} ${p[2][0]} ${p[2][1]}`;
}

/**
 * A plait hanging from `top` to `bottom`: n chubby segments, a hair tie and
 * a little tuft. Returns the outline plus the notch positions (for decor).
 */
export function braid(top: Pt, bottom: Pt, w: number, n = 3): { d: string; notches: [Pt, Pt][]; tie: Pt } {
  const dx = bottom[0] - top[0];
  const dy = bottom[1] - top[1];
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const nx = -uy;
  const ny = ux;
  const at = (t: number, s: number): Pt => [top[0] + dx * t + nx * s, top[1] + dy * t + ny * s];
  const body = 0.74;
  const right: SPt[] = [];
  const notches: [Pt, Pt][] = [];
  for (let i = 0; i <= n; i++) {
    const t = (body * i) / n;
    const hw = i === 0 ? w * 0.42 : w * 0.3;
    const p = at(t, hw);
    right.push(i === 0 ? p : [p[0], p[1], 1]);
    if (i > 0 && i < n) notches.push([at(t, -w * 0.3), at(t, w * 0.3)]);
    if (i < n) right.push(at((body * (i + 0.5)) / n, w * 0.52));
  }
  right.push(at(0.79, w * 0.16));
  right.push(at(0.9, w * 0.4));
  right.push(at(1, w * 0.22));
  const tip = at(1.04, 0);
  const left: SPt[] = right.map((p) => {
    // mirror across the centre line
    const rx = p[0] - top[0];
    const ry = p[1] - top[1];
    const along = rx * ux + ry * uy;
    const side = rx * nx + ry * ny;
    const m: Pt = [top[0] + ux * along - nx * side, top[1] + uy * along - ny * side];
    return p.length === 3 ? ([m[0], m[1], 1] as SPt) : (m as SPt);
  });
  return { d: shape([...right, tip, ...left.reverse()]), notches, tie: at(0.79, 0) };
}

/**
 * Crescent moon: circle (cx, cy, r) with a bite taken by a circle of radius
 * ri centred at (cx + ox, cy + oy). Sharp tips, smooth arcs.
 */
export function crescent(cx: number, cy: number, r: number, ox: number, oy: number, ri: number): string {
  const d = Math.hypot(ox, oy);
  const ux = ox / d;
  const uy = oy / d;
  const a = (r * r - ri * ri + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, r * r - a * a));
  const p1: Pt = [cx + a * ux - h * uy, cy + a * uy + h * ux];
  const p2: Pt = [cx + a * ux + h * uy, cy + a * uy - h * ux];
  const deg = (y: number, x: number) => (Math.atan2(y, x) * 180) / Math.PI;
  // outer arc: p1 → p2 the long way (away from the bite)
  let o0 = deg(p1[1] - cy, p1[0] - cx);
  let o1 = deg(p2[1] - cy, p2[0] - cx);
  const away = deg(-uy, -ux);
  const norm = (x: number) => ((x % 360) + 360) % 360;
  // make sure the sweep from o0 to o1 passes through `away`
  if (norm(away - o0) > norm(o1 - o0)) o1 -= 360;
  else if (o1 < o0) o1 += 360;
  // inner arc: p2 → p1 on the bite circle, through the side facing the moon centre
  const bx = cx + ox;
  const by = cy + oy;
  let i0 = deg(p2[1] - by, p2[0] - bx);
  let i1 = deg(p1[1] - by, p1[0] - bx);
  const toward = deg(-uy, -ux);
  if (norm(toward - i0) > norm(i1 - i0)) i1 -= 360;
  else if (i1 < i0) i1 += 360;
  const outer = arcD(cx, cy, r, o0, o1);
  const inner = arcD(bx, by, ri, i0, i1);
  return `${outer}L${inner.slice(1)}Z`;
}

function arcD(cx: number, cy: number, r: number, a0: number, a1: number): string {
  const pieces = Math.max(1, Math.ceil(Math.abs(a1 - a0) / 60));
  const step = (a1 - a0) / pieces;
  const rad = (x: number) => (x * Math.PI) / 180;
  const kk = (4 / 3) * Math.tan(rad(step) / 4);
  const f = (n: number) => Math.round(n * 10) / 10;
  let d = '';
  for (let i = 0; i < pieces; i++) {
    const s = rad(a0 + step * i);
    const e = rad(a0 + step * (i + 1));
    const p0: Pt = [cx + r * Math.cos(s), cy + r * Math.sin(s)];
    const p3: Pt = [cx + r * Math.cos(e), cy + r * Math.sin(e)];
    const c1: Pt = [p0[0] - kk * r * Math.sin(s), p0[1] + kk * r * Math.cos(s)];
    const c2: Pt = [p3[0] + kk * r * Math.sin(e), p3[1] - kk * r * Math.cos(e)];
    if (i === 0) d += `M${f(p0[0])} ${f(p0[1])}`;
    d += `C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p3[0])} ${f(p3[1])}`;
  }
  return d;
}

/** baluster (vase-shaped railing post) between top and bottom */
export function baluster(cx: number, top: number, bottom: number, w: number): string {
  const h = bottom - top;
  const half: SPt[] = [
    [cx + w * 0.34, top, 1],
    [cx + w * 0.2, top + h * 0.16],
    [cx + w * 0.22, top + h * 0.3],
    [cx + w * 0.5, top + h * 0.62],
    [cx + w * 0.36, top + h * 0.88],
    [cx + w * 0.42, bottom, 1],
  ];
  const left = half.map((p) => (p.length === 3 ? ([2 * cx - p[0], p[1], 1] as SPt) : ([2 * cx - p[0], p[1]] as SPt))).reverse();
  return shape([...half, ...left]);
}
