/**
 * Small drawing helpers for the reward stickers (200 x 200 box).
 *
 * The picture helpers in dsl.ts are tuned for the 1000-unit canvas (thick
 * lashes, 6-unit happy eyes...). Stickers are 5x smaller, so these versions
 * use thinner lines while keeping the same house look: plum ink, glossy
 * eyes, rosy cheeks.
 */
import { arc, circle, decor, ellipse, INK, line, region, smooth, twinkle, WHITE, type Pt } from './dsl';
import type { DecorItem, RegionItem } from './types';

/** region outline width for stickers */
export const OUT = 4;
/** decor line width for stickers (smiles, details) */
export const THIN = 3;
/** cheek colours: default for light faces, deeper one for pink / red faces */
export const CHEEK = '#FF9FBF';
export const CHEEK_DEEP = '#FF6F9C';

type RegionOpts = { evenOdd?: boolean; line?: number; outline?: boolean };

/** sticker region: always has a hint colour and the thinner sticker outline */
export function R(id: string, d: string, hint: string, opts: RegionOpts = {}): RegionItem {
  return region(id, d, { hint, line: OUT, ...opts });
}

export const inkFill = (d: string): DecorItem => decor(d, { fill: INK });
export const thin = (d: string, width: number = THIN, stroke: string = INK): DecorItem => decor(d, { stroke, width });
export const fillD = (d: string, fill: string, opacity?: number): DecorItem =>
  decor(d, opacity === undefined ? { fill } : { fill, opacity });

/** glossy cartoon eye sized for stickers */
export function eye(
  cx: number,
  cy: number,
  size: number,
  opts: { lash?: 'left' | 'right'; look?: [number, number] } = {},
): DecorItem[] {
  const { lash, look = [0, 0] } = opts;
  const rx = size * 0.42;
  const ry = size * 0.5;
  const ex = cx + look[0] * size * 0.1;
  const ey = cy + look[1] * size * 0.1;
  const items: DecorItem[] = [
    inkFill(ellipse(ex, ey, rx, ry)),
    fillD(ellipse(ex + rx * 0.3, ey - ry * 0.36, rx * 0.4, ry * 0.32), WHITE),
    fillD(circle(ex - rx * 0.36, ey + ry * 0.4, rx * 0.17), WHITE),
  ];
  if (lash) {
    const s = lash === 'right' ? 1 : -1;
    for (const deg of [-38, -12]) {
      const a = (deg * Math.PI) / 180;
      const p0: Pt = [cx + s * rx * Math.cos(a) * 0.95, cy + ry * Math.sin(a) * 0.95];
      const a2 = ((deg - 14) * Math.PI) / 180;
      const p1: Pt = [p0[0] + s * Math.cos(a2) * size * 0.24, p0[1] + Math.sin(a2) * size * 0.24];
      items.push(thin(line([p0, p1]), 2.4));
    }
  }
  return items;
}

/** happy closed eye ∩ */
export const happyEye = (cx: number, cy: number, w: number, width = 3.2): DecorItem =>
  thin(arc(cx, cy + w * 0.25, w / 2, 200, 340, w * 0.45), width);

/** sleepy closed eye ∪ */
export function sleepyEye(cx: number, cy: number, w: number): DecorItem[] {
  return [thin(arc(cx, cy - w * 0.15, w / 2, 20, 160, w * 0.42), 3.2)];
}

/** small smile (open curve) */
export function smileLine(cx: number, cy: number, w: number, depth = w * 0.35, width = THIN): DecorItem {
  return thin(`M${cx - w / 2} ${cy}Q${cx} ${cy + depth * 2} ${cx + w / 2} ${cy}`, width);
}

/** open happy mouth "D" with a pink tongue */
export function openMouth(cx: number, cy: number, w: number, depth = w * 0.6): DecorItem[] {
  const d = `M${cx - w / 2} ${cy}Q${cx} ${cy + depth * 2} ${cx + w / 2} ${cy}Z`;
  return [
    decor(d, { fill: INK, stroke: INK, width: 2 }),
    fillD(ellipse(cx, cy + depth * 0.66, w * 0.22, depth * 0.26), '#FF8FB1'),
  ];
}

/** little cat / bunny mouth "ω" */
export function catMouth(cx: number, cy: number, w: number): DecorItem {
  const h = w / 2;
  return thin(
    `M${cx - h} ${cy}Q${cx - h / 2} ${cy + h * 0.9} ${cx} ${cy}Q${cx + h / 2} ${cy + h * 0.9} ${cx + h} ${cy}`,
    2.8,
  );
}

/** rosy cheek */
export const cheek = (cx: number, cy: number, rx = 8, ry = rx * 0.6, color = CHEEK): DecorItem =>
  decor(ellipse(cx, cy, rx, ry), { fill: color, opacity: 0.7 });

/** soft white gloss spot */
export const gloss = (cx: number, cy: number, rx: number, ry: number, rot = 0, opacity = 0.85): DecorItem =>
  decor(ellipse(cx, cy, rx, ry, rot), { fill: WHITE, opacity });

/** tiny white twinkle with a thin ink outline (decor) */
export const sparkle = (cx: number, cy: number, r: number): DecorItem =>
  decor(twinkle(cx, cy, r), { fill: WHITE, stroke: INK, width: 2 });

export interface FaceOpts {
  /** eye size (default 24) */
  size?: number;
  /** distance between the eye centres (default 38) */
  gap?: number;
  eyes?: 'open' | 'happy' | 'sleepy';
  mouth?: 'smile' | 'open' | 'cat' | 'none';
  lashes?: boolean;
  look?: [number, number];
  /** mouth position below the eye line */
  mouthDy?: number;
  mouthW?: number;
  /** cheek offset from the face centre */
  cheekDx?: number;
  cheekDy?: number;
  cheekR?: number;
  cheekColor?: string;
}

/** a complete kawaii face centred on the eye line (cx, cy) */
export function face(cx: number, cy: number, o: FaceOpts = {}): DecorItem[] {
  const size = o.size ?? 24;
  const gap = o.gap ?? 38;
  const lx = cx - gap / 2;
  const rx = cx + gap / 2;
  const items: DecorItem[] = [];
  const cheekDx = o.cheekDx ?? gap / 2 + size * 0.62;
  const cheekDy = o.cheekDy ?? size * 0.55;
  const cheekR = o.cheekR ?? size * 0.32;
  items.push(cheek(cx - cheekDx, cy + cheekDy, cheekR, cheekR * 0.62, o.cheekColor));
  items.push(cheek(cx + cheekDx, cy + cheekDy, cheekR, cheekR * 0.62, o.cheekColor));
  const eyes = o.eyes ?? 'open';
  if (eyes === 'open') {
    items.push(...eye(lx, cy, size, { lash: o.lashes ? 'left' : undefined, look: o.look }));
    items.push(...eye(rx, cy, size, { lash: o.lashes ? 'right' : undefined, look: o.look }));
  } else if (eyes === 'happy') {
    items.push(happyEye(lx, cy, size * 0.8), happyEye(rx, cy, size * 0.8));
  } else {
    items.push(...sleepyEye(lx, cy, size * 0.8), ...sleepyEye(rx, cy, size * 0.8));
  }
  const mouth = o.mouth ?? 'smile';
  const my = cy + (o.mouthDy ?? size * 0.55);
  const mw = o.mouthW ?? size * 0.5;
  if (mouth === 'smile') items.push(smileLine(cx, my, mw, mw * 0.32));
  else if (mouth === 'open') items.push(...openMouth(cx, my, mw));
  else if (mouth === 'cat') items.push(catMouth(cx, my, mw));
  return items;
}

/**
 * Crescent: circle (cx, cy, r) minus circle (cx2, cy2, r2), with softly
 * rounded horn tips. Returns a smooth closed path.
 */
export function crescent(cx: number, cy: number, r: number, cx2: number, cy2: number, r2: number, n = 16): string {
  const dx = cx2 - cx;
  const dy = cy2 - cy;
  const d = Math.hypot(dx, dy);
  const a = (r * r - r2 * r2 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, r * r - a * a));
  const ux = dx / d;
  const uy = dy / d;
  const px = cx + a * ux;
  const py = cy + a * uy;
  const X1: Pt = [px - h * uy, py + h * ux];
  const X2: Pt = [px + h * uy, py - h * ux];
  const alpha = Math.atan2(dy, dx);
  const norm = (v: number) => {
    while (v > Math.PI) v -= 2 * Math.PI;
    while (v <= -Math.PI) v += 2 * Math.PI;
    return v;
  };
  const b1 = norm(Math.atan2(X1[1] - cy, X1[0] - cx) - alpha);
  const b2 = norm(Math.atan2(X2[1] - cy, X2[0] - cx) - alpha);
  // outer arc goes from the positive intersection the long way round
  const start = alpha + Math.max(b1, b2);
  const end = alpha + 2 * Math.PI + Math.min(b1, b2);
  const firstX = b1 > b2 ? X1 : X2;
  const lastX = b1 > b2 ? X2 : X1;
  const pts: Pt[] = [firstX];
  const pad = 0.06;
  for (let i = 0; i <= n; i++) {
    const t = start + pad + ((end - start - 2 * pad) * i) / n;
    pts.push([cx + r * Math.cos(t), cy + r * Math.sin(t)]);
  }
  pts.push(lastX);
  // inner arc (on circle 2) back from lastX to firstX, through the side facing c1
  const back = alpha + Math.PI;
  const c1 = norm(Math.atan2(lastX[1] - cy2, lastX[0] - cx2) - back);
  const c2 = norm(Math.atan2(firstX[1] - cy2, firstX[0] - cx2) - back);
  const m = Math.max(4, Math.round(n * 0.7));
  const pad2 = 0.12;
  const s0 = c1 - Math.sign(c1) * pad2;
  const s1 = c2 - Math.sign(c2) * pad2;
  for (let i = 0; i <= m; i++) {
    const t = back + s0 + ((s1 - s0) * i) / m;
    pts.push([cx2 + r2 * Math.cos(t), cy2 + r2 * Math.sin(t)]);
  }
  return smooth(pts);
}

/** a batch of straight ink detail lines (waffle pattern, shell ridges...) */
export function segments(pairs: [Pt, Pt][], width = 2.6): DecorItem[] {
  return pairs.map(([a, b]) => thin(line([a, b]), width));
}
