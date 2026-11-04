/**
 * Fairy kit: a chibi fairy drawn in local coordinates and placed on the page.
 *
 * Local frame: the face is an ellipse centred on (0, 0) with rx 100 / ry 92.
 * The body hangs below (shoulders ≈ y 100, waist ≈ y 136, hem ≈ y 290).
 * Wings attach at the upper back (≈ (0, 130)).
 */
import { mapPath, type Pt } from '../../../engine/path';
import {
  blush,
  combine,
  curve,
  cuteEye,
  decor,
  ellipse,
  happyEye,
  INK,
  inkLine,
  LINE,
  mirrorX,
  region,
  rotatePt,
  roundPoly,
  scale,
  shape,
  smile,
  smooth,
  symmetric,
} from '../../dsl';
import type { ArtItem } from '../../types';
import { capsule } from './helpers';

export type HairStyle = 'long' | 'puffs' | 'bob' | 'pony' | 'braids';
export type Skirt = 'petal' | 'leaf' | 'sit';

type SPt = Pt | [number, number, 1];

export interface FairyCfg {
  /** region id prefix, e.g. 'fairy' → 'fairy-face' */
  id: string;
  x: number;
  y: number;
  s: number;
  rot?: number;
  hair: HairStyle;
  ears?: boolean;
  skin: string;
  hairHint: string;
  dress: string;
  top?: string;
  wingTop: string;
  wingBottom?: string;
  shoeHint?: string;
  /** arm capsules [x0, y0, x1, y1] in local units (shoulder → hand) */
  arms: [number, number, number, number][];
  /** leg capsules [x0, y0, x1, y1] (hip → ankle) */
  legs: [number, number, number, number][];
  legW?: number;
  /** animation part for legs + shoes (e.g. dangling legs) */
  legPart?: string;
  /** shoe ellipses [cx, cy, rotDeg] */
  shoes?: [number, number, number][];
  skirt?: Skirt;
  /** one region for top + skirt (small fairies) */
  dressOne?: boolean;
  /** 4 separate wing regions (true) or one region per side (false) */
  wings4?: boolean;
  wingScale?: number;
  /** extra rotation of the wing pair (degrees, local) */
  wingTilt?: number;
  wingPart: string;
  eyePart: string;
  look?: [number, number];
  lashes?: boolean;
  /** closed happy eyes instead of glossy ones */
  happy?: boolean;
  /** local-coordinate extras */
  extraBack?: ArtItem[];
  extraMid?: ArtItem[];
  extraTop?: ArtItem[];
  /** default part for every non-wing / non-eye item (e.g. a bobbing fairy) */
  bodyPart?: string;
}

// ---------------------------------------------------------------------------
// local shapes
// ---------------------------------------------------------------------------

/** face ellipse; with ears = one outline with two pointed elf ears */
function facePath(ears: boolean): string {
  if (!ears) return ellipse(0, 0, 100, 92);
  const at = (deg: number): Pt => [100 * Math.cos((deg * Math.PI) / 180), 92 * Math.sin((deg * Math.PI) / 180)];
  const right: SPt[] = [at(-90), at(-70), at(-50), at(-32), at(-14), [152, -20, 1], [124, 22], at(32), at(52), at(72)];
  const pts: SPt[] = [];
  for (const p of right) pts.push(p);
  pts.push(at(90));
  const left = right
    .slice(1)
    .reverse()
    .map((p) => (p.length === 3 ? ([-p[0], p[1], 1] as [number, number, 1]) : ([-p[0], p[1]] as Pt)));
  // left side goes bottom → top
  for (const p of left) pts.push(p);
  return shape(pts);
}

/** fluffy round curl (afro puff) */
export function fluffy(cx: number, cy: number, r: number, n = 9, depth = 0.12, rot = 0): string {
  const pts: Pt[] = [];
  for (let i = 0; i < n * 2; i++) {
    const a = ((rot - 90 + (180 / n) * i) * Math.PI) / 180;
    const rr = i % 2 === 0 ? r : r * (1 - depth);
    pts.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]);
  }
  return smooth(pts, 0.9);
}

const HAIR: Record<HairStyle, { back?: string[]; bangs: string; braids?: string[]; front?: string[] }> = {
  long: {
    back: [
      smooth(
        symmetric([
          [0, -98],
          [66, -90],
          [114, -54],
          [135, 7],
          [129, 67],
          [144, 120],
          [127, 164],
          [91, 165],
          [75, 131],
          [40, 112],
          [0, 109],
        ], 0),
      ),
    ],
    bangs: shape([
      [-99, 21, 1],
      [-107, -37],
      [-77, -88],
      [0, -111],
      [77, -88],
      [107, -37],
      [99, 21, 1],
      [84, -24],
      [48, -55],
      [0, -44, 1],
      [-48, -55],
      [-84, -24],
    ]),
  },
  bob: {
    back: [
      smooth(
        symmetric([
          [0, -100],
          [78, -92],
          [124, -52],
          [142, 8],
          [140, 60],
          [120, 88],
          [86, 84],
          [60, 62],
          [0, 56],
        ], 0),
      ),
    ],
    bangs: shape([
      [-101, 12, 1],
      [-110, -44],
      [-80, -96],
      [0, -117],
      [80, -96],
      [110, -44],
      [101, 12, 1],
      [92, -24],
      [70, -40],
      [50, -30, 1],
      [26, -44],
      [0, -32, 1],
      [-26, -44],
      [-50, -30, 1],
      [-70, -40],
      [-92, -24],
    ]),
  },
  puffs: {
    back: [combine(fluffy(-92, -80, 54, 9, 0.13), fluffy(92, -80, 54, 9, 0.13, 10))],
    bangs: smooth([
      [-102, 4],
      [-112, -42],
      [-86, -92],
      [0, -116],
      [86, -92],
      [112, -42],
      [102, 4],
      [92, -24],
      [72, -42],
      [52, -34],
      [34, -52],
      [12, -40],
      [-10, -54],
      [-30, -38],
      [-52, -50],
      [-72, -34],
      [-92, -26],
    ]),
  },
  pony: {
    back: [
      smooth([
        [30, -112],
        [110, -128],
        [172, -96],
        [194, -24],
        [184, 54],
        [156, 112],
        [134, 70],
        [140, 6],
        [118, -54],
        [60, -84],
      ]),
    ],
    bangs: shape([
      [-100, 14, 1],
      [-110, -42],
      [-82, -94],
      [0, -116],
      [82, -94],
      [110, -42],
      [100, 14, 1],
      [92, -30],
      [66, -62],
      [24, -70],
      [-28, -58],
      [-70, -32],
      [-92, -4],
    ]),
  },
  braids: {
    back: [
      smooth(
        symmetric([
          [0, -96],
          [84, -88],
          [124, -46],
          [128, 20],
          [108, 46],
          [0, 30],
        ], 0),
      ),
    ],
    braids: [braid(1), braid(-1)],
    bangs: shape([
      [-100, 14, 1],
      [-110, -42],
      [-82, -94],
      [0, -116],
      [82, -94],
      [110, -42],
      [100, 14, 1],
      [86, -28],
      [46, -58],
      [6, -50, 1],
      [-40, -60],
      [-84, -30],
    ]),
  },
};

function braid(side: 1 | -1): string {
  const x = 112 * side;
  const lobes = [
    [x, 40],
    [x + 4 * side, 92],
    [x + 6 * side, 142],
  ];
  const pts: Pt[] = [];
  // outer side down, inner side up – three round lobes
  pts.push([x - 20 * side, 0], [x + 18 * side, 0]);
  for (const [lx, ly] of lobes) pts.push([lx + 34 * side, ly - 4], [lx + 24 * side, ly + 22]);
  pts.push([x + 22 * side, 196], [x + 6 * side, 214], [x - 10 * side, 196]);
  for (const [lx, ly] of [...lobes].reverse()) pts.push([lx - 22 * side, ly + 22], [lx - 32 * side, ly - 4]);
  return smooth(side === 1 ? pts : pts.reverse());
}

function braidDetails(side: 1 | -1): string[] {
  const x = 112 * side;
  return [62, 114, 164].map((y, i) => curve([[x - (16 - i) * side, y - 2], [x + 2 * side, y + 4], [x + (18 + i) * side, y - 2]]));
}

// wings, left side (root near (−15, 125))
const WING_TOP: Pt[] = [
  [-15, 125],
  [-53, 73],
  [-108, -8],
  [-163, -80],
  [-221, -107],
  [-269, -77],
  [-275, -5],
  [-236, 63],
  [-155, 112],
  [-67, 140],
];
const WING_BOT: Pt[] = [
  [-15, 153],
  [-67, 156],
  [-133, 165],
  [-185, 199],
  [-192, 257],
  [-149, 288],
  [-96, 264],
  [-45, 208],
];

/** skirt hem points (right side → left side, without the waist corners) */
function hemPts(kind: Skirt): SPt[] {
  if (kind === 'sit') {
    return [
      [80, 166],
      [122, 202],
      [142, 230, 1],
      [112, 250],
      [86, 236, 1],
      [58, 256],
      [29, 240, 1],
      [0, 260],
      [-29, 240, 1],
      [-58, 256],
      [-86, 236, 1],
      [-112, 250],
      [-142, 230, 1],
      [-122, 202],
      [-80, 166],
    ];
  }
  if (kind === 'leaf') {
    return [
      [76, 180],
      [108, 228],
      [124, 276, 1],
      [92, 262],
      [64, 294, 1],
      [40, 274],
      [0, 302, 1],
      [-40, 274],
      [-64, 294, 1],
      [-92, 262],
      [-124, 276, 1],
      [-108, 228],
      [-76, 180],
    ];
  }
  return [
    [73, 179],
    [104, 227],
    [115, 259, 1],
    [93, 284],
    [69, 268, 1],
    [47, 292],
    [23, 273, 1],
    [0, 296],
    [-23, 273, 1],
    [-47, 292],
    [-69, 268, 1],
    [-93, 284],
    [-115, 259, 1],
    [-104, 227],
    [-73, 179],
  ];
}

function skirtPath(kind: Skirt): string {
  return shape([[-36, 136, 1], [36, 136, 1], ...hemPts(kind)]);
}

/** one-piece dress silhouette: little top + skirt in a single outline */
function dressPath(kind: Skirt): string {
  return shape([[-30, 74, 1], [30, 74, 1], [38, 124], [44, 142], ...hemPts(kind), [-44, 142], [-38, 124]]);
}

// ---------------------------------------------------------------------------
// builder
// ---------------------------------------------------------------------------

export function fairy(c: FairyCfg) {
  const rot = c.rot ?? 0;
  const P = (x: number, y: number): Pt => {
    const r = rotatePt([x, y], rot, 0, 0);
    return [c.x + r[0] * c.s, c.y + r[1] * c.s];
  };
  const T = (d: string) => mapPath(d, ([x, y]) => P(x, y));
  const id = (n: string) => `${c.id}-${n}`;
  const bp = c.bodyPart;
  const layers: Record<'wings' | 'back' | 'legs' | 'body' | 'head', ArtItem[]> = { wings: [], back: [], legs: [], body: [], head: [] };
  let layer: ArtItem[] = layers.wings;
  const add = (list: ArtItem[], part?: string) => {
    for (const it of list) layer.push({ ...it, d: T(it.d), part: it.part ?? part });
  };

  // ---- wings ----
  const ws = c.wingScale ?? 1;
  const tilt = c.wingTilt ?? 0;
  const wingD = (pts: Pt[]) => {
    const d = scale(smooth(pts), ws, ws, -15, 135);
    return tilt ? mapPath(d, (p) => rotatePt(p, tilt, 0, 135)) : d;
  };
  const wTopL = wingD(WING_TOP);
  const wBotL = wingD(WING_BOT);
  const wTopR = tilt ? mapPath(scale(smooth(WING_TOP), ws, ws, -15, 135), (p) => rotatePt([-p[0], p[1]], -tilt, 0, 135)) : mirrorX(wTopL, 0);
  const wBotR = tilt ? mapPath(scale(smooth(WING_BOT), ws, ws, -15, 135), (p) => rotatePt([-p[0], p[1]], -tilt, 0, 135)) : mirrorX(wBotL, 0);
  const inner = (d: string, cx: number, cy: number, k: number) =>
    decor(scale(d, k, k, cx, cy), { stroke: INK, width: LINE.fine, part: c.wingPart });
  const wingCentre = (pts: Pt[]): Pt => {
    const n = pts.length;
    return [pts.reduce((a, p) => a + p[0], 0) / n, pts.reduce((a, p) => a + p[1], 0) / n];
  };
  const ctr = (pts: Pt[], right: boolean): Pt => {
    let [x, y] = wingCentre(pts);
    // push the centre towards the outer lobe
    x = -15 + (x + 15) * 1.35 * ws;
    y = 135 + (y - 135) * 1.2 * ws;
    if (tilt) [x, y] = rotatePt([x, y], tilt, 0, 135);
    return right ? [-x, y] : [x, y];
  };
  const wingItems: ArtItem[] = [];
  const wingBot = c.wingBottom ?? c.wingTop;
  if (c.wings4) {
    wingItems.push(
      region(id('wing-top-left'), wTopL, { hint: c.wingTop }),
      region(id('wing-top-right'), wTopR, { hint: c.wingTop }),
      region(id('wing-bottom-left'), wBotL, { hint: wingBot }),
      region(id('wing-bottom-right'), wBotR, { hint: wingBot }),
    );
  } else {
    wingItems.push(
      region(id('wing-left'), combine(wBotL, wTopL), { hint: c.wingTop }),
      region(id('wing-right'), combine(wBotR, wTopR), { hint: c.wingTop }),
    );
  }
  const tl = ctr(WING_TOP, false);
  const bl = ctr(WING_BOT, false);
  wingItems.push(
    inner(wTopL, tl[0], tl[1], 0.58),
    inner(wTopR, -tl[0], tl[1], 0.58),
    inner(wBotL, bl[0], bl[1], 0.52),
    inner(wBotR, -bl[0], bl[1], 0.52),
  );
  add(wingItems, c.wingPart);

  // ---- hair behind (braids hang from under the back hair) ----
  layer = layers.back;
  const hair = HAIR[c.hair];
  const back: ArtItem[] = [];
  if (hair.braids) {
    back.push(
      region(id('braid-right'), hair.braids[0], { hint: c.hairHint }),
      region(id('braid-left'), hair.braids[1], { hint: c.hairHint }),
      ...[...braidDetails(1), ...braidDetails(-1)].map((d) => inkLine(d, LINE.fine)),
    );
  }
  (hair.back ?? []).forEach((d) => back.push(region(id(c.hair === 'pony' ? 'ponytail' : 'hair-back'), d, { hint: c.hairHint })));
  add(back, bp);
  if (c.extraBack) add(c.extraBack, bp);

  // ---- legs, shoes ----
  layer = layers.legs;
  const legs: ArtItem[] = [];
  const legW = c.legW ?? 22;
  if (c.legs.length) legs.push(region(id('legs'), c.legs.map(([a, b, x, y]) => capsule(a, b, x, y, legW)).join(' '), { hint: c.skin }));
  if (c.shoes?.length)
    legs.push(region(id('shoes'), c.shoes.map(([x, y, r]) => ellipse(x, y, 22, 13, r)).join(' '), { hint: c.shoeHint ?? c.dress }));
  add(legs, c.legPart ?? bp);

  layer = layers.body;
  if (c.extraMid) add(c.extraMid, bp);

  // ---- arms ----
  if (c.arms.length) add([region(id('arms'), c.arms.map(([a, b, x, y]) => capsule(a, b, x, y, 28)).join(' '), { hint: c.skin })], bp);

  // ---- dress ----
  const bodice = roundPoly([[-32, 76], [32, 76], [44, 147], [-44, 147]], 0.28);
  const skirt = skirtPath(c.skirt ?? 'petal');
  if (c.dressOne) {
    add([region(id('dress'), dressPath(c.skirt ?? 'petal'), { hint: c.dress }), inkLine(curve([[-40, 140], [0, 148], [40, 140]]), LINE.fine)], bp);
  } else {
    add([region(id('skirt'), skirt, { hint: c.dress }), region(id('top'), bodice, { hint: c.top ?? c.dress })], bp);
  }

  // ---- head ----
  layer = layers.head;
  const head: ArtItem[] = [region(id('face'), facePath(!!c.ears), { hint: c.skin })];
  if (c.ears) {
    head.push(inkLine(curve([[106, 4], [122, -4], [136, -12]]), LINE.fine));
    head.push(inkLine(curve([[-106, 4], [-122, -4], [-136, -12]]), LINE.fine));
  }
  head.push(region(id('bangs'), hair.bangs, { hint: c.hairHint }));
  add(head, bp);

  // face details
  const look = c.look ?? [0, 0];
  const lashes = c.lashes ?? c.s >= 0.75;
  const face: ArtItem[] = [];
  if (c.happy) {
    face.push(happyEye(-36, 24, 40, c.eyePart), happyEye(36, 24, 40, c.eyePart));
  } else {
    face.push(
      ...cuteEye(-35, 27, 46, { lashes: lashes ? 'left' : undefined, part: c.eyePart, look }),
      ...cuteEye(35, 27, 46, { lashes: lashes ? 'right' : undefined, part: c.eyePart, look }),
    );
  }
  face.push(inkLine(smile(0, 58, 22, 6)), blush(-62, 52, 15), blush(62, 52, 15));
  add(face, bp);

  if (c.extraTop) add(c.extraTop, bp);

  return {
    items: [...layers.wings, ...layers.back, ...layers.legs, ...layers.body, ...layers.head],
    layers,
    P,
    T,
    wingPivot: P(0, 135),
    eyePivot: P(0, 27),
  };
}
