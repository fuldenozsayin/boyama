import {
  arc,
  circle,
  curve,
  ellipse,
  happyEye,
  inkLine,
  LINE,
  rect,
  region,
  shape,
  smile,
  smooth,
  star,
  type Pt,
} from '../../dsl';
import type { ArtItem, Picture } from '../../types';
import {
  bangs,
  bubble,
  bumpSeg,
  coral,
  curlyBlob,
  face,
  fanShell,
  fish,
  jellyfish,
  miniBubble,
  place,
  placer,
  seaweed,
  tube,
  waveBand,
} from './helpers';

const SKIN = '#A8724F';
const HAIR = '#FFB8D9';

// ---- giant clam ----
const CLAM_C: Pt = [500, 770];
const clamFan = (rx: number, ry: number, n: number, bump: number): string => {
  const pts: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const a = ((188 + (164 * i) / n) * Math.PI) / 180;
    pts.push([CLAM_C[0] + rx * Math.cos(a), CLAM_C[1] + ry * Math.sin(a)]);
  }
  let d = `M${CLAM_C[0]} ${CLAM_C[1] + 40}L${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < n; i++) d += bumpSeg(pts[i], pts[i + 1], bump, CLAM_C);
  return d + 'Z';
};
const ribs: ArtItem[] = [];
for (let i = 1; i < 8; i++) {
  const a = ((188 + (164 * i) / 8) * Math.PI) / 180;
  const p0: Pt = [CLAM_C[0] + 262 * Math.cos(a), CLAM_C[1] + 322 * Math.sin(a)];
  const p1: Pt = [CLAM_C[0] + 318 * Math.cos(a), CLAM_C[1] + 386 * Math.sin(a)];
  ribs.push(inkLine(curve([p0, p1]), LINE.fine));
}

// ---- mermaid (1:1 drawing, enlarged into the clam) ----
const M = placer(20, 92, 1.15, 470, 612);

const frillPts: Pt[] = [
  [544, 600],
  [518, 634],
  [488, 644],
  [456, 644],
  [426, 634],
  [398, 600],
];
const frill = `M398 600C440 588 502 588 544 600${frillPts
  .slice(0, -1)
  .map((p, i) => bumpSeg(p, frillPts[i + 1], 0.42, [471, 520]))
  .join('')}Z`;

const mermaid: ArtItem[] = [
  region('bun-left', curlyBlob(382, 300, 52, 50, 7, 0.35), { hint: HAIR }),
  region('bun-right', curlyBlob(558, 300, 52, 50, 7, 0.35), { hint: HAIR }),
  region('hair-back', smooth([[470, 284], [556, 304], [598, 370], [604, 450], [584, 510], [470, 520], [356, 510], [336, 450], [342, 370], [384, 304]]), {
    hint: HAIR,
  }),
  region(
    'tail-fin',
    shape([[668, 574], [664, 520], [690, 476], [720, 474], [722, 526, 1], [766, 500], [796, 518], [774, 566], [716, 600]]),
    { part: 'tail', hint: '#D7C2FF' },
  ),
  inkLine(curve([[684, 560], [690, 520], [702, 492]]), LINE.fine, 'tail'),
  inkLine(curve([[700, 574], [736, 552], [774, 530]]), LINE.fine, 'tail'),
  region('tail', tube([[470, 600], [530, 606], [590, 600], [640, 580], [684, 548]], [150, 116, 92, 70, 50], false), {
    part: 'tail',
    hint: '#9FE0B2',
  }),
  inkLine(curve([[560, 560], [570, 600], [562, 640]]), LINE.fine, 'tail'),
  inkLine(curve([[612, 554], [624, 590], [618, 626]]), LINE.fine, 'tail'),
  region('torso', smooth([[470, 468], [512, 486], [526, 524], [514, 572], [508, 614], [432, 614], [426, 572], [414, 524], [428, 486]]), {
    hint: SKIN,
  }),
  region('arm-left', tube([[430, 504], [404, 546], [380, 576], [350, 598]], [32, 30, 30, 32]), { hint: SKIN }),
  region('arm-right', tube([[510, 504], [536, 546], [560, 574], [590, 592]], [32, 30, 30, 32]), { hint: SKIN }),
  region('shell-left', fanShell(447, 540, 52, 46, -12), { hint: '#C9B8FF' }),
  region('shell-right', fanShell(493, 540, 52, 46, 12), { hint: '#C9B8FF' }),
  region('tail-frill', frill, { hint: '#FFF0A0' }),
  region('head', ellipse(470, 398, 108, 100), { hint: SKIN }),
  ...face(470, 422, { gap: 84, eye: 60, lashes: true, eyePart: 'eyes', smileY: 464, smileW: 30, cheekDx: 70, cheekY: 458, cheek: 17 }),
  region('bangs', bangs(470, 398, 108, 100, { a0: 174, a1: 366, pad: 10, hairY: 336, n: 5, bump: 0.36 }), { hint: HAIR }),
  region('tiara', fanShell(470, 296, 64, 54), { hint: '#FFE27A' }),
];

// ---- little castle in the back ----
const castle: ArtItem[] = [
  region('castle-roof', shape([[86, 352, 1], [134, 236, 1], [182, 352, 1]], 1), { hint: '#FFB8D9' }),
  region(
    'castle-wall',
    shape([
      [20, 800, 1], [20, 470, 1], [44, 470, 1], [44, 448, 1], [70, 448, 1], [70, 470, 1], [196, 470, 1], [196, 448, 1], [222, 448, 1],
      [222, 470, 1], [246, 470, 1], [246, 800, 1],
    ]),
    { hint: '#E3D4FF' },
  ),
  region('castle-tower', rect(92, 346, 84, 300, 6), { hint: '#D7C2FF' }),
  region('castle-window', shape([[112, 470, 1], [112, 430], [134, 406], [156, 430], [156, 470, 1]]), { hint: '#FFF0A0' }),
  region('castle-door', shape([[104, 646, 1], [104, 590], [134, 560], [164, 590], [164, 646, 1]]), { hint: '#E8C4A0' }),
  inkLine(curve([[40, 540], [70, 540]]), LINE.fine),
  inkLine(curve([[200, 520], [228, 520]]), LINE.fine),
  inkLine(curve([[192, 700], [224, 700]]), LINE.fine),
];

/** Mermaid sitting in a giant clam shell, with jellyfish, fish and a little castle. */
export const clamCastle: Picture = {
  id: 'mermaid-clam-castle',
  category: 'mermaid',
  title: 'İstiridye Tahtı',
  parts: {
    eyes: { anim: 'blink', pivot: M(470, 422), speed: 0.4 },
    tail: { anim: 'wag', pivot: M(470, 612), amp: 7, speed: 1.1 },
    jelly1: { anim: 'bob', pivot: [150, 120], amp: 14, speed: 0.6 },
    jelly2: { anim: 'bob', pivot: [880, 186], amp: 14, speed: 0.7, phase: 0.5 },
    fish1: { anim: 'sway', pivot: [870, 450], amp: 7, speed: 0.9 },
    fish2: { anim: 'sway', pivot: [160, 880], amp: 7, speed: 0.8, phase: 0.3 },
    pearl: { anim: 'pulse', pivot: [318, 690], amp: 0.06, speed: 1.2 },
    bubbles: { anim: 'bob', pivot: [500, 120], amp: 14, speed: 0.6 },
  },
  celebrate: { sound: 'bubbles', particles: 'bubbles' },
  items: [
    region('water', rect(0, 0, 1000, 1000), { outline: false, hint: '#D9EEFF' }),
    region('water-deep', waveBand(430, 14, 2, 0.5), { hint: '#B9D8FF' }),

    ...jellyfish('jelly-1', 150, 120, 124, { part: 'jelly1', bell: '#E3D4FF', frill: '#FFC9DD' }),
    ...jellyfish('jelly-2', 880, 186, 110, { part: 'jelly2', bell: '#FFC9DD', frill: '#FFF0A0' }),
    ...fish('fish-1', 870, 450, 52, { dir: -1, part: 'fish1', body: '#FFE27A', tail: '#FFB8D9' }),

    region('seaweed-right', seaweed(960, 860, 330, 50, 1.4, 16, 1.4), { hint: '#9FE0B2' }),
    ...place(castle, placer(0, 30)),
    region('coral', coral(850, 860, 0.95), { hint: '#FFADB9' }),
    region('sand', waveBand(820, 12, 2, 0.2), { hint: '#FFE9B8' }),
    ...([[300, 950], [330, 930], [640, 960], [700, 935], [960, 950]] as Pt[]).map(([x, y]) => inkLine(circle(x, y, 3), LINE.fine)),

    // giant clam: upper shell standing open behind the mermaid
    region('clam-top', clamFan(330, 400, 8, 0.3), { hint: '#FFD3A5' }),
    region('clam-inner', clamFan(256, 316, 1, 0.42), { hint: '#FFF4E6' }),
    ...ribs,

    region('pearl', circle(318, 690, 48), { part: 'pearl', hint: '#FFF8FC' }),
    inkLine(arc(318, 690, 31, 200, 260), LINE.fine, 'pearl'),

    // mermaid
    ...place(mermaid, M),

    // lower shell
    region('clam-bottom', shape([[170, 736, 1], [500, 726], [830, 736, 1], [790, 806], [680, 864], [500, 884], [320, 864], [210, 806]]), {
      hint: '#FFC9A0',
    }),
    ...([[-150, 0.62], [-75, 0.82], [0, 1], [75, 0.82], [150, 0.62]] as [number, number][]).map(([dx, k]) =>
      inkLine(curve([[500 + dx * 0.25, 870], [500 + dx * 0.8, 800], [500 + dx * 1.6 * k + dx * 0.4, 744]]), LINE.fine),
    ),

    // front sea floor friends
    ...fish('fish-2', 160, 880, 50, { part: 'fish2', body: '#BDEBC8', tail: '#9ED6FF' }),
    region('starfish', star(880, 920, 52, 28, 5, -96), { hint: '#FFE27A' }),
    happyEye(868, 916, 12),
    happyEye(892, 916, 12),
    inkLine(smile(880, 932, 12, 4), LINE.fine),

    ...bubble('bubble-1', 300, 330, 28, { part: 'bubbles' }),
    ...bubble('bubble-2', 380, 160, 36, { part: 'bubbles' }),
    ...bubble('bubble-3', 640, 120, 30, { part: 'bubbles' }),
    miniBubble(330, 250, 10, 'bubbles'),
    miniBubble(700, 200, 9, 'bubbles'),
    miniBubble(560, 60, 8, 'bubbles'),
  ],
};
