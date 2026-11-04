/**
 * Shared drawing helpers for the "Kelebekler ve çiçekler" category.
 * Everything returns ordinary DSL items, so pages stay plain data.
 */
import {
  blush,
  circle,
  cuteEye,
  curve,
  decor,
  ellipse,
  happyEye,
  heart,
  ink,
  inkLine,
  LINE,
  mirrorX,
  petal,
  region,
  ringSegment,
  rotate,
  roundPoly,
  rotatePt,
  scale,
  scallop,
  shape,
  smile,
  smooth,
  star,
  translate,
  WHITE,
  INK,
  type Pt,
} from '../../dsl';
import type { ArtItem, DecorItem, PartAnim } from '../../types';

// ---------------------------------------------------------------------------
// local → canvas transforms (draw once in a local frame, place anywhere)
// ---------------------------------------------------------------------------

export interface Frame {
  cx: number;
  cy: number;
  s: number;
  rot?: number;
}

export const xf = (d: string, t: Frame) => translate(rotate(scale(d, t.s, t.s, 0, 0), t.rot ?? 0, 0, 0), t.cx, t.cy);
export const xp = (p: Pt, t: Frame): Pt => {
  const r = rotatePt([p[0] * t.s, p[1] * t.s], t.rot ?? 0);
  return [r[0] + t.cx, r[1] + t.cy];
};
const xItem = <T extends ArtItem>(it: T, t: Frame): T => ({ ...it, d: xf(it.d, t) });

/** open-mouthed little smile (ink mouth + pink tongue) */
export function openSmile(cx: number, cy: number, w: number, part?: string): DecorItem[] {
  const h = w * 0.62;
  const mouth = shape([
    [cx - w / 2, cy, 1],
    [cx + w / 2, cy, 1],
    [cx + w * 0.3, cy + h * 0.75],
    [cx, cy + h],
    [cx - w * 0.3, cy + h * 0.75],
  ]);
  return [
    decor(mouth, { fill: INK, part }),
    decor(ellipse(cx, cy + h * 0.68, w * 0.24, h * 0.22), { fill: '#FF8FB1', part }),
  ];
}

// ---------------------------------------------------------------------------
// Butterfly (front view, body on a vertical axis)
// ---------------------------------------------------------------------------

export interface ButterflyStyle {
  top: string;
  bottom: string;
  topSpot: string;
  bottomSpot: string;
  /** inner panels (a border band appears around them) */
  topInner?: string;
  bottomInner?: string;
  /** small extra dot on the upper wing (only on big butterflies) */
  topDot?: string;
  body: string;
  head: string;
  tips?: string;
}

export interface ButterflyOpts {
  /** region id prefix: '' → 'wing-top-left', 'pink-' → 'pink-wing-top-left' */
  prefix?: string;
  cx: number;
  cy: number;
  s: number;
  rot?: number;
  style: ButterflyStyle;
  pattern?: 'hearts' | 'dots';
  parts: { left: string; right: string; eyes: string };
  lashes?: boolean;
  look?: [number, number];
  mouth?: 'smile' | 'open';
  /** flap speed (Hz) and phase */
  speed?: number;
  phase?: number;
  amp?: number;
  /** antenna tips: 'heart' | 'ball' */
  tips?: 'heart' | 'ball';
  /** spots on the lower wings (default true) */
  bottomSpots?: boolean;
}

// local design (s = 1 → wingspan ≈ 720, height ≈ 610). Body axis x = 0.
const UPPER_R: Pt[] = [
  [12, -70],
  [62, -168],
  [150, -252],
  [262, -280],
  [345, -238],
  [366, -150],
  [330, -66],
  [244, -6],
  [130, 22],
  [28, 22],
];
const LOWER_R: Pt[] = [
  [18, -6],
  [118, 22],
  [222, 68],
  [280, 146],
  [268, 232],
  [198, 276],
  [122, 254],
  [62, 192],
  [20, 112],
];
const BODY_HALF = 44;

const shrink = (pts: Pt[], k: number, about: Pt): Pt[] =>
  pts.map(([x, y]) => [about[0] + (x - about[0]) * k, about[1] + (y - about[1]) * k] as Pt);

export function butterfly(o: ButterflyOpts): { items: ArtItem[]; parts: Record<string, PartAnim> } {
  const p = o.prefix ?? '';
  const t: Frame = { cx: o.cx, cy: o.cy, s: o.s, rot: o.rot ?? 0 };
  const st = o.style;
  const pattern = o.pattern ?? 'hearts';
  const L = o.parts.left;
  const R = o.parts.right;
  const E = o.parts.eyes;
  const items: ArtItem[] = [];
  const both = (id: string, dRight: string, hint: string) => {
    items.push(region(`${p}${id}-left`, xf(mirrorX(dRight, 0), t), { part: L, hint }));
    items.push(region(`${p}${id}-right`, xf(dRight, t), { part: R, hint }));
  };
  const bothDecor = (dRight: string, extra: Partial<DecorItem>) => {
    items.push({ kind: 'decor', d: xf(mirrorX(dRight, 0), t), part: L, ...extra });
    items.push({ kind: 'decor', d: xf(dRight, t), part: R, ...extra });
  };

  // lower wings
  both('wing-bottom', smooth(LOWER_R), st.bottom);
  if (st.bottomInner) both('wing-bottom-inner', smooth(shrink(LOWER_R, 0.7, [40, 40])), st.bottomInner);
  const inner = !!st.topInner;
  if (o.bottomSpots === false) {
    for (const [x, y, rr] of [
      [170, 140, 15],
      [212, 186, 12],
      [148, 196, 11],
    ] as const)
      bothDecor(circle(x, y, rr), { fill: INK, opacity: 0.85 });
  } else if (inner) both('wing-bottom-spot', pattern === 'hearts' ? heart(132, 118, 74, 68) : circle(132, 116, 36), st.bottomSpot);
  else if (pattern === 'hearts') both('wing-bottom-spot', heart(178, 166, 92, 86), st.bottomSpot);
  else both('wing-bottom-spot', ellipse(176, 162, 50, 46), st.bottomSpot);

  // upper wings
  both('wing-top', smooth(UPPER_R), st.top);
  if (st.topInner) both('wing-top-inner', smooth(shrink(UPPER_R, 0.72, [40, -40])), st.topInner);
  if (inner) {
    both(
      'wing-top-spot',
      pattern === 'hearts' ? rotate(heart(178, -112, 100, 92), 18, 178, -112) : circle(178, -114, 46),
      st.topSpot,
    );
  } else if (pattern === 'hearts') {
    both('wing-top-spot', rotate(heart(226, -150, 128, 116), 18, 226, -150), st.topSpot);
  } else {
    both('wing-top-spot', circle(232, -160, 62), st.topSpot);
  }
  if (st.topDot) both('wing-top-dot', circle(130, -48, 30), st.topDot);
  // a few tiny decorative dots near the outer edge (pure line art)
  bothDecor(circle(330, -170, 9), { fill: INK, opacity: 0.85 });
  bothDecor(circle(310, -110, 7), { fill: INK, opacity: 0.85 });
  bothDecor(circle(250, 228, 8), { fill: INK, opacity: 0.85 });

  // antennae (behind the head)
  const tipsKind = o.tips ?? 'heart';
  const antR = curve([
    [20, -214],
    [36, -268],
    [72, -304],
    [106, -312],
  ]);
  items.push(xItem(inkLine(antR, LINE.inner + 0.5), t));
  items.push(xItem(inkLine(mirrorX(antR, 0), LINE.inner + 0.5), t));
  const tipR = tipsKind === 'heart' ? rotate(heart(116, -318, 50, 46), 18, 116, -318) : circle(114, -316, 25);
  const tipHint = st.tips ?? st.topSpot;
  if (o.s * 46 >= 36) {
    items.push(region(`${p}antenna-tip-left`, xf(mirrorX(tipR, 0), t), { hint: tipHint }));
    items.push(region(`${p}antenna-tip-right`, xf(tipR, t), { hint: tipHint }));
  } else {
    items.push(xItem(ink(mirrorX(tipR, 0)), t));
    items.push(xItem(ink(tipR), t));
  }

  // body (segment lines are decor)
  items.push(region(`${p}body`, xf(ellipse(0, 46, BODY_HALF, 132), t), { hint: st.body }));
  for (const [y, w] of [
    [58, 37],
    [104, 34],
    [146, 26],
  ] as const) {
    items.push(xItem(inkLine(curve([[-w, y - 6], [0, y + 6], [w, y - 6]]), LINE.fine), t));
  }

  // head + face
  items.push(region(`${p}head`, xf(circle(0, -142, 96), t), { hint: st.head }));
  const eyeL = xp([-35, -136], t);
  const eyeR = xp([35, -136], t);
  const size = 58 * o.s;
  items.push(...cuteEye(eyeL[0], eyeL[1], size, { part: E, look: o.look, lashes: o.lashes ? 'left' : undefined }));
  items.push(...cuteEye(eyeR[0], eyeR[1], size, { part: E, look: o.look, lashes: o.lashes ? 'right' : undefined }));
  const bl = xp([-63, -98], t);
  const br = xp([63, -98], t);
  items.push(blush(bl[0], bl[1], 16 * o.s, 10 * o.s));
  items.push(blush(br[0], br[1], 16 * o.s, 10 * o.s));
  const m = xp([0, -96], t);
  if (o.mouth === 'open') items.push(...openSmile(m[0], m[1] - 2 * o.s, 26 * o.s));
  else items.push(inkLine(smile(m[0], m[1], 28 * o.s, 7 * o.s), LINE.inner));

  const pl = xp([-BODY_HALF + 6, 40], t);
  const pr = xp([BODY_HALF - 6, 40], t);
  const ec = xp([0, -136], t);
  const flap = (pivot: Pt): PartAnim => ({
    anim: 'flap',
    pivot: [Math.round(pivot[0]), Math.round(pivot[1])],
    amp: o.amp ?? 0.42,
    speed: o.speed ?? 1.7,
    phase: o.phase ?? 0,
  });
  return {
    items,
    parts: {
      [L]: flap(pl),
      [R]: flap(pr),
      [E]: { anim: 'blink', pivot: [Math.round(ec[0]), Math.round(ec[1])], speed: 0.45, phase: o.phase ?? 0 },
    },
  };
}

// ---------------------------------------------------------------------------
// Sun with a face
// ---------------------------------------------------------------------------

export function sunFace(
  cx: number,
  cy: number,
  r: number,
  part: string,
  opts: { rays?: string; face?: string; single?: boolean } = {},
): ArtItem[] {
  const rays = star(cx, cy, r * 1.62, r * 1.24, 12, -90, 0.32);
  const head: ArtItem[] = opts.single
    ? [region('sun', rays, { part, hint: opts.face ?? '#FFE27A' }), inkLine(circle(cx, cy, r), LINE.inner, part)]
    : [
        region('sun-rays', rays, { part, hint: opts.rays ?? '#FFD98A' }),
        region('sun', circle(cx, cy, r), { hint: opts.face ?? '#FFF1A0' }),
      ];
  const fp = opts.single ? part : undefined;
  return [
    ...head,
    happyEye(cx - r * 0.34, cy - r * 0.1, r * 0.33, fp),
    happyEye(cx + r * 0.34, cy - r * 0.1, r * 0.33, fp),
    inkLine(smile(cx, cy + r * 0.24, r * 0.42, r * 0.12), LINE.inner, fp),
    blush(cx - r * 0.56, cy + r * 0.27, r * 0.17, r * 0.17 * 0.62, fp),
    blush(cx + r * 0.56, cy + r * 0.27, r * 0.17, r * 0.17 * 0.62, fp),
  ];
}

// ---------------------------------------------------------------------------
// Flowers
// ---------------------------------------------------------------------------

/** stem as a thin smooth band from bottom to top (centre-line points) */
export function stemPath(pts: Pt[], w: number): string {
  const left: Pt[] = [];
  const right: Pt[] = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(pts.length - 1, i + 1)];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const l = Math.hypot(dx, dy) || 1;
    const nx = (-dy / l) * (w / 2);
    const ny = (dx / l) * (w / 2);
    left.push([pts[i][0] + nx, pts[i][1] + ny]);
    right.push([pts[i][0] - nx, pts[i][1] - ny]);
  }
  return shape([
    [left[0][0], left[0][1], 1],
    ...left.slice(1),
    ...right.slice(1).reverse(),
    [right[0][0], right[0][1], 1],
  ]);
}

/**
 * Straight-ish stem with one leaf, as ONE region (keeps easy pages simple).
 * side = 1 → leaf on the right, -1 → left. Returns region + vein decor.
 */
export function stemLeaf(
  id: string,
  x: number,
  yb: number,
  yt: number,
  w: number,
  leafY: number,
  leafLen: number,
  side: 1 | -1,
  hint: string,
  part?: string,
): ArtItem[] {
  const h = w / 2;
  const L = leafLen;
  const X = (dx: number) => x + side * dx;
  const pts: (Pt | [number, number, 1])[] = [
    [X(-h), yb, 1],
    [X(-h - 1), (yb + yt) / 2],
    [X(-h), yt, 1],
    [X(h), yt, 1],
    [X(h), leafY - 6, 1],
    [X(h + L * 0.28), leafY - L * 0.36],
    [X(h + L * 0.68), leafY - L * 0.46],
    [X(h + L), leafY - L * 0.4, 1],
    [X(h + L * 0.74), leafY - L * 0.1],
    [X(h + L * 0.36), leafY + L * 0.04],
    [X(h), leafY + 16, 1],
    [X(h), yb, 1],
  ];
  const d = shape(side === 1 ? pts : (pts.slice().reverse() as typeof pts));
  return [
    region(id, d, { hint, part }),
    inkLine(
      curve([
        [X(h + 6), leafY - 2],
        [X(h + L * 0.45), leafY - L * 0.2],
        [X(h + L * 0.8), leafY - L * 0.34],
      ]),
      LINE.fine,
      part,
    ),
  ];
}

/** leaf with a decor vein */
export function leaf(id: string, base: Pt, tip: Pt, w: number, hint: string, part?: string): ArtItem[] {
  const mid: Pt = [base[0] + (tip[0] - base[0]) * 0.5, base[1] + (tip[1] - base[1]) * 0.5];
  const dx = tip[0] - base[0];
  const dy = tip[1] - base[1];
  const l = Math.hypot(dx, dy) || 1;
  const bend = w * 0.12;
  return [
    region(id, petal(base, tip, w), { hint, part }),
    inkLine(
      curve([
        [base[0] + dx * 0.12, base[1] + dy * 0.12],
        [mid[0] + (-dy / l) * bend, mid[1] + (dx / l) * bend],
        [base[0] + dx * 0.78, base[1] + dy * 0.78],
      ]),
      LINE.fine,
      part,
    ),
  ];
}

/** round daisy-like flower head: petals + centre */
export function daisy(
  id: string,
  cx: number,
  cy: number,
  r: number,
  hints: { petals: string; mid: string },
  opts: { part?: string; n?: number; rot?: number; depth?: number } = {},
): ArtItem[] {
  const n = opts.n ?? 6;
  return [
    region(`${id}`, scallop(cx, cy, r, n, opts.depth ?? 0.6, opts.rot ?? -90), { hint: hints.petals, part: opts.part }),
    region(`${id}-mid`, circle(cx, cy, r * 0.82), { hint: hints.mid, part: opts.part }),
  ];
}

/** ring of soft pointed petals (sunflower / big daisy) */
export function petalRing(cx: number, cy: number, rIn: number, rOut: number, n: number, rot = -90): string {
  const pts: Pt[] = [];
  const step = 360 / n;
  const at = (deg: number, r: number): Pt => [cx + r * Math.cos((deg * Math.PI) / 180), cy + r * Math.sin((deg * Math.PI) / 180)];
  const mid = rIn + (rOut - rIn) * 0.62;
  for (let i = 0; i < n; i++) {
    const a = rot + step * i;
    pts.push(at(a - step / 2, rIn));
    pts.push(at(a - step * 0.27, mid));
    pts.push(at(a, rOut));
    pts.push(at(a + step * 0.27, mid));
  }
  return smooth(pts);
}

/**
 * tulip head: two side petals (cup) + a front petal. (cx, cy) = centre of the cup base area.
 * single = one region (front petal drawn as decor lines) for easier pages.
 */
export function tulip(
  id: string,
  cx: number,
  cy: number,
  w: number,
  hints: { cup: string; front?: string },
  part?: string,
  single = false,
): ArtItem[] {
  const h = w * 1.05;
  if (single) {
    const cupOne = shape([
      [cx - w * 0.5, cy - h * 0.72, 1],
      [cx - w * 0.24, cy - h * 0.5],
      [cx, cy - h * 0.8, 1],
      [cx + w * 0.24, cy - h * 0.5],
      [cx + w * 0.5, cy - h * 0.72, 1],
      [cx + w * 0.54, cy - h * 0.25],
      [cx + w * 0.36, cy + h * 0.12],
      [cx, cy + h * 0.24],
      [cx - w * 0.36, cy + h * 0.12],
      [cx - w * 0.54, cy - h * 0.25],
    ]);
    return [
      region(id, cupOne, { hint: hints.cup, part }),
      inkLine(curve([[cx - w * 0.2, cy - h * 0.46], [cx - w * 0.24, cy - h * 0.1], [cx - w * 0.06, cy + h * 0.2]]), LINE.inner, part),
      inkLine(curve([[cx + w * 0.2, cy - h * 0.46], [cx + w * 0.24, cy - h * 0.1], [cx + w * 0.06, cy + h * 0.2]]), LINE.inner, part),
    ];
  }
  const cup = shape([
    [cx - w * 0.5, cy - h * 0.72, 1],
    [cx - w * 0.2, cy - h * 0.5],
    [cx, cy - h * 0.62, 1],
    [cx + w * 0.2, cy - h * 0.5],
    [cx + w * 0.5, cy - h * 0.72, 1],
    [cx + w * 0.54, cy - h * 0.25],
    [cx + w * 0.36, cy + h * 0.12],
    [cx, cy + h * 0.24],
    [cx - w * 0.36, cy + h * 0.12],
    [cx - w * 0.54, cy - h * 0.25],
  ]);
  const front = shape([
    [cx, cy - h * 0.78, 1],
    [cx + w * 0.22, cy - h * 0.45],
    [cx + w * 0.26, cy - h * 0.05],
    [cx, cy + h * 0.24],
    [cx - w * 0.26, cy - h * 0.05],
    [cx - w * 0.22, cy - h * 0.45],
  ]);
  return [region(`${id}`, cup, { hint: hints.cup, part }), region(`${id}-front`, front, { hint: hints.front ?? hints.cup, part })];
}

/** rose-ish flower: ring of round petals + a swirled bud with two wrapping petal lines */
export function rose(id: string, cx: number, cy: number, r: number, hints: { outer: string; bud: string }, part?: string): ArtItem[] {
  const br = r * 0.56;
  const by = cy - r * 0.04;
  return [
    region(`${id}`, scallop(cx, cy, r * 0.6, 6, 0.55, -90), { hint: hints.outer, part }),
    region(`${id}-bud`, circle(cx, by, br), { hint: hints.bud, part }),
    inkLine(
      curve([
        [cx - br * 0.06, by - br * 0.04],
        [cx + br * 0.2, by - br * 0.2],
        [cx + br * 0.2, by + br * 0.16],
        [cx - br * 0.2, by + br * 0.26],
        [cx - br * 0.44, by - br * 0.02],
        [cx - br * 0.26, by - br * 0.4],
        [cx + br * 0.2, by - br * 0.5],
        [cx + br * 0.5, by - br * 0.22],
      ]),
      LINE.fine + 0.5,
      part,
    ),
    inkLine(curve([[cx - br * 0.74, by + br * 0.02], [cx - br * 0.54, by + br * 0.44], [cx - br * 0.06, by + br * 0.6]]), LINE.fine + 0.5, part),
    inkLine(curve([[cx + br * 0.74, by + br * 0.02], [cx + br * 0.54, by + br * 0.44], [cx + br * 0.06, by + br * 0.6]]), LINE.fine + 0.5, part),
  ];
}

/** dashed flight trail through control points (Catmull-Rom), as decor dashes */
export function dashedTrail(pts: Pt[], dash = 16, gap = 14, width: number = LINE.fine + 0.5): DecorItem[] {
  // sample the spline densely
  const dense: Pt[] = [];
  const n = pts.length;
  for (let i = 0; i < n - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(n - 1, i + 2)];
    for (let k = 0; k < 24; k++) {
      const u = k / 24;
      const u2 = u * u;
      const u3 = u2 * u;
      const c = (a: number, b: number, cc: number, d: number) =>
        0.5 * (2 * b + (-a + cc) * u + (2 * a - 5 * b + 4 * cc - d) * u2 + (-a + 3 * b - 3 * cc + d) * u3);
      dense.push([c(p0[0], p1[0], p2[0], p3[0]), c(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  dense.push(pts[n - 1]);
  const out: DecorItem[] = [];
  let acc = 0;
  let on = true;
  let cur: Pt[] = [dense[0]];
  for (let i = 1; i < dense.length; i++) {
    const d = Math.hypot(dense[i][0] - dense[i - 1][0], dense[i][1] - dense[i - 1][1]);
    acc += d;
    if (on) cur.push(dense[i]);
    if (on && acc >= dash) {
      out.push(inkLine(curve(cur), width));
      on = false;
      acc = 0;
    } else if (!on && acc >= gap) {
      on = true;
      acc = 0;
      cur = [dense[i]];
    }
  }
  if (on && cur.length > 1) out.push(inkLine(curve(cur), width));
  return out;
}

// ---------------------------------------------------------------------------
// little friends
// ---------------------------------------------------------------------------

/** ellipse band between x0 and x1 (for bee stripes); follows the ellipse outline */
export function ellipseBand(cx: number, cy: number, rx: number, ry: number, x0: number, x1: number, bulge = 0.12): string {
  const top: Pt[] = [];
  const bot: Pt[] = [];
  const n = 6;
  for (let i = 0; i <= n; i++) {
    const x = x0 + ((x1 - x0) * i) / n;
    const u = Math.max(-1, Math.min(1, (x - cx) / rx));
    const h = ry * Math.sqrt(1 - u * u);
    top.push([x, cy - h]);
    bot.push([x, cy + h]);
  }
  const bx = (x1 - x0) * bulge;
  return shape([
    [top[0][0], top[0][1], 1],
    ...top.slice(1, -1),
    [top[n][0], top[n][1], 1],
    [x1 + bx, cy],
    [bot[n][0], bot[n][1], 1],
    ...bot.slice(1, -1).reverse(),
    [bot[0][0], bot[0][1], 1],
    [x0 + bx, cy],
  ]);
}

/** ladybug seen from the side, facing left (-1) or right (1). (cx, cy) = shell centre */
export function ladybug(id: string, cx: number, cy: number, r: number, dir: 1 | -1, part?: string, eyePart?: string): ArtItem[] {
  const hr = r * 0.6;
  const hx = cx + dir * r * 0.98;
  const hy = cy + r * 0.16;
  const items: ArtItem[] = [
    region(`${id}`, ellipse(cx, cy, r, r * 0.84), { hint: '#FFADB9', part }),
    inkLine(curve([[cx + dir * r * 0.46, cy - r * 0.74], [cx + dir * r * 0.02, cy - r * 0.1], [cx - dir * r * 0.2, cy + r * 0.82]]), LINE.inner, part),
  ];
  for (const [dx, dy, rr] of [
    [-0.56, -0.26, 0.16],
    [-0.58, 0.34, 0.13],
    [-0.12, -0.48, 0.12],
    [-0.18, 0.36, 0.12],
  ] as const) {
    items.push(ink(circle(cx + dir * dx * r, cy + dy * r, rr * r), part));
  }
  // antennae + head in front of the shell
  items.push(inkLine(curve([[hx - hr * 0.3, hy - hr * 0.8], [hx - hr * 0.42, hy - hr * 1.3], [hx - hr * 0.2, hy - hr * 1.56]]), LINE.inner, part));
  items.push(inkLine(curve([[hx + hr * 0.3, hy - hr * 0.8], [hx + hr * 0.42, hy - hr * 1.3], [hx + hr * 0.2, hy - hr * 1.56]]), LINE.inner, part));
  items.push(ink(circle(hx - hr * 0.2, hy - hr * 1.56, hr * 0.15), part));
  items.push(ink(circle(hx + hr * 0.2, hy - hr * 1.56, hr * 0.15), part));
  items.push(region(`${id}-head`, circle(hx, hy, hr), { hint: '#D7C2FF', part }));
  const fx = hx + dir * hr * 0.1;
  items.push(...cuteEye(fx - hr * 0.34, hy - hr * 0.08, hr * 0.56, { part: eyePart ?? part }));
  items.push(...cuteEye(fx + hr * 0.34, hy - hr * 0.08, hr * 0.56, { part: eyePart ?? part }));
  items.push(blush(fx - hr * 0.6, hy + hr * 0.36, hr * 0.17, hr * 0.11, part));
  items.push(blush(fx + hr * 0.6, hy + hr * 0.36, hr * 0.17, hr * 0.11, part));
  items.push(inkLine(smile(fx, hy + hr * 0.34, hr * 0.32, hr * 0.1), LINE.fine + 0.5, part));
  return items;
}

/** picket with a soft pointed top; (x, top) = left edge / tip height */
export function picket(x: number, top: number, w: number, bottom: number): string {
  return roundPoly(
    [
      [x, top + w * 0.42],
      [x + w / 2, top],
      [x + w, top + w * 0.42],
      [x + w, bottom],
      [x, bottom],
    ],
    0.16,
  );
}

/**
 * cute snail facing right. (cx, cy) = centre of the shell. r = shell radius.
 * regions: <id>-body, <id>-shell. eyes use `eyePart` (blink).
 */
export function snail(id: string, cx: number, cy: number, r: number, hints: { body: string; shell: string }, eyePart?: string): ArtItem[] {
  const k = r / 70;
  const P = (x: number, y: number): Pt => [cx + x * k, cy + y * k];
  const body = smooth([
    P(-110, 92),
    P(-96, 70),
    P(-20, 66),
    P(60, 58),
    P(96, 26),
    P(102, -24),
    P(130, -48),
    P(170, -38),
    P(184, 0),
    P(168, 50),
    P(130, 84),
    P(60, 98),
    P(-40, 100),
  ]);
  const hx = cx + 142 * k;
  const hy = cy - 4 * k;
  const spiral = curve([P(4, 6), P(16, -8), P(6, -26), P(-22, -22), P(-32, 6), P(-14, 34), P(22, 38), P(46, 12), P(44, -26), P(16, -52), P(-28, -50)]);
  const antL = curve([P(124, -40), P(112, -78), P(100, -100)]);
  const antR = curve([P(150, -42), P(160, -80), P(172, -98)]);
  return [
    inkLine(antL, LINE.inner),
    inkLine(antR, LINE.inner),
    ink(circle(...P(98, -104), 9 * k)),
    ink(circle(...P(174, -102), 9 * k)),
    region(`${id}-body`, body, { hint: hints.body }),
    region(`${id}-shell`, circle(cx, cy, r), { hint: hints.shell }),
    inkLine(spiral, LINE.inner),
    ...cuteEye(hx - 17 * k, hy - 6 * k, 26 * k, { part: eyePart }),
    ...cuteEye(hx + 17 * k, hy - 6 * k, 26 * k, { part: eyePart }),
    blush(hx - 30 * k, hy + 20 * k, 9 * k, 6 * k),
    blush(hx + 30 * k, hy + 20 * k, 9 * k, 6 * k),
    inkLine(smile(hx, hy + 18 * k, 14 * k, 4 * k), LINE.fine + 0.5),
  ];
}

/** little music note ♪ (decor) */
export function note(x: number, y: number, size: number, part?: string): DecorItem[] {
  const hr = size * 0.22;
  return [
    ink(ellipse(x, y, hr * 1.25, hr, -22), part),
    inkLine(`M${x + hr * 1.1} ${y - hr * 0.3}L${x + hr * 1.1} ${y - size}`, LINE.inner, part),
    inkLine(curve([[x + hr * 1.1, y - size], [x + hr * 2.4, y - size * 0.82], [x + hr * 2.6, y - size * 0.5]]), LINE.inner, part),
  ];
}

/**
 * Friendly watering can with a face. Drawn in a local frame: body centred at
 * (0, 0), spout to the right (use mirror to point it left).
 */
export function wateringCan(
  id: string,
  t: Frame & { mirror?: boolean },
  hints: { body: string; spout: string; handle: string; rose: string },
  part?: string,
): ArtItem[] {
  const M = (d: string) => xf(t.mirror ? mirrorX(d, 0) : d, t);
  const body = roundPoly(
    [
      [-92, -74],
      [92, -74],
      [108, 86],
      [-108, 86],
    ],
    0.2,
  );
  const spout = shape([
    [64, 26, 1],
    [184, -146, 1],
    [212, -128, 1],
    [94, 58, 1],
  ]);
  const roseD = rotate(roundPoly([[-26, -18], [26, -30], [26, 30], [-26, 18]], 0.25), -56, 0, 0);
  const items: ArtItem[] = [
    region(`${id}-handle`, M(ringSegment(0, -74, 56, 84, 180, 360)), { hint: hints.handle, part }),
    region(`${id}-spout`, M(spout), { hint: hints.spout, part }),
    region(`${id}-rose`, M(translate(roseD, 204, -146)), { hint: hints.rose, part }),
    region(`${id}`, M(body), { hint: hints.body, part }),
    { kind: 'decor', d: M(curve([[-94, -44], [0, -38], [94, -44]])), stroke: INK, width: LINE.inner, part },
  ];
  const e1 = xp([t.mirror ? 30 : -30, 6], t);
  const e2 = xp([t.mirror ? -30 : 30, 6], t);
  const mm = xp([0, 34], t);
  const b1 = xp([-56, 34], t);
  const b2 = xp([56, 34], t);
  items.push(...cuteEye(e1[0], e1[1], 40 * t.s, { part }));
  items.push(...cuteEye(e2[0], e2[1], 40 * t.s, { part }));
  items.push(...openSmile(mm[0], mm[1] - 4 * t.s, 22 * t.s, part));
  items.push(blush(b1[0], b1[1], 13 * t.s, 8 * t.s, part));
  items.push(blush(b2[0], b2[1], 13 * t.s, 8 * t.s, part));
  return items;
}

/** chubby bee facing left. regions: wings, body, two stripes. */
export function bee(id: string, cx: number, cy: number, s: number, part?: string): ArtItem[] {
  const t: Frame = { cx, cy, s };
  const X = (d: string) => xf(d, t);
  const items: ArtItem[] = [
    region(`${id}-wing-back`, X(ellipse(28, -58, 28, 42, 28)), { hint: '#FFFFFF', part }),
    region(`${id}-wing-front`, X(ellipse(-8, -62, 28, 44, -14)), { hint: '#D9EEFF', part }),
    { kind: 'decor', d: X(shape([[62, -10], [92, 0, 1], [62, 10]])), fill: INK, part },
    region(`${id}`, X(ellipse(0, 0, 68, 54)), { hint: '#FFE27A', part }),
    region(`${id}-stripe-1`, X(ellipseBand(0, 0, 68, 54, 4, 26)), { hint: '#C99A74', part }),
    region(`${id}-stripe-2`, X(ellipseBand(0, 0, 68, 54, 38, 60)), { hint: '#C99A74', part }),
    { kind: 'decor', d: X(curve([[-38, -46], [-48, -76], [-66, -90]])), stroke: INK, width: LINE.inner, part },
    { kind: 'decor', d: X(curve([[-20, -50], [-20, -84], [-30, -104]])), stroke: INK, width: LINE.inner, part },
    { kind: 'decor', d: X(circle(-68, -92, 8)), fill: INK, part },
    { kind: 'decor', d: X(circle(-31, -106, 8)), fill: INK, part },
  ];
  const e1 = xp([-48, -4], t);
  const e2 = xp([-20, -4], t);
  items.push(...cuteEye(e1[0], e1[1], 28 * s, { part }));
  items.push(...cuteEye(e2[0], e2[1], 28 * s, { part }));
  const m = xp([-34, 16], t);
  items.push(inkLine(smile(m[0], m[1], 14 * s, 4 * s), LINE.fine + 0.5, part));
  const b1 = xp([-60, 14], t);
  items.push(blush(b1[0], b1[1], 9 * s, 6 * s, part));
  const b2 = xp([-8, 14], t);
  items.push(blush(b2[0], b2[1], 9 * s, 6 * s, part));
  return items;
}

export { WHITE };
