import {
  arc,
  blush,
  circle,
  cloud,
  cuteEye,
  curve,
  decor,
  drop,
  ellipse,
  happyEye,
  INK,
  inkLine,
  LINE,
  rect,
  region,
  roundPoly,
  shape,
  smile,
  smooth,
  star,
  twinkle,
  type Pt,
} from '../../dsl';
import type { ArtItem, Picture } from '../../types';
import { bangs, bumpSeg, curlyBlob, face, fanShell, fanShellRidges, place, placer, tube } from './helpers';

const SKIN = '#D9A27E';
const HAIR = '#C9B8FF';

// ---- little seagull (drawn around the origin, placed in the sky) ----
const G = placer(122, 292, 1.2);
const gull: ArtItem[] = [
  decor(roundPoly([[60, -14], [102, 0], [60, 14]], 0.3), { fill: '#FFD98A', stroke: INK, width: LINE.inner, part: 'gull' }),
  region('gull', shape([[-96, -12, 1], [-60, -4], [-30, -16], [8, -24], [38, -38], [66, -24], [72, 4], [52, 24], [0, 30], [-50, 22], [-96, 14, 1], [-80, 0, 1]]), {
    part: 'gull',
    hint: '#FFFFFF',
  }),
  region('gull-wing', smooth([[-34, -2], [-62, -34], [-62, -84], [-36, -100], [-12, -64], [16, -14]]), { part: 'gull', hint: '#E3E8F2' }),
  ...cuteEye(46, -12, 20, { part: 'gull' }),
  blush(40, 8, 7, 4.5, 'gull'),
];

// ---- mermaid (drawn at 1:1, then enlarged a little) ----
const M = placer(-20, 12, 1.25, 470, 612);

// hip frill: straight-ish top, round scallops hanging down
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
  region('hair-back', curlyBlob(470, 418, 162, 152, 13, 0.42), { hint: HAIR }),
  region('tail-fin', shape([[700, 716], [690, 656], [708, 600], [738, 594], [756, 652, 1], [798, 616], [832, 628], [816, 684], [752, 730]]), {
    part: 'tail',
    hint: '#FFB8D9',
  }),
  inkLine(curve([[716, 696], [716, 650], [726, 618]]), LINE.fine, 'tail'),
  inkLine(curve([[742, 706], [776, 680], [808, 650]]), LINE.fine, 'tail'),
  region(
    'tail',
    tube(
      [[470, 610], [474, 660], [500, 724], [555, 766], [622, 776], [680, 752], [716, 706]],
      [120, 146, 128, 100, 76, 56, 42],
      false,
    ),
    { part: 'tail', hint: '#9FE0B2' },
  ),
  ...([[440, 668], [476, 668], [512, 668], [460, 694], [496, 694], [532, 694], [480, 720], [516, 720]] as Pt[]).map(([x, y]) =>
    inkLine(arc(x, y, 11, 20, 160), LINE.fine, 'tail'),
  ),
  region('torso', smooth([[470, 468], [512, 486], [526, 524], [514, 572], [508, 614], [432, 614], [426, 572], [414, 524], [428, 486]]), {
    hint: SKIN,
  }),
  region('arm-left', tube([[430, 504], [410, 562], [396, 616]], [32, 30, 30]), { hint: SKIN }),
  region(
    'arm-right',
    shape([
      [500, 522, 1], [548, 516], [590, 500], [618, 476], [640, 468], [656, 446], [654, 416], [640, 400], [622, 400], [612, 414],
      [598, 414], [588, 428], [598, 442], [596, 462], [570, 478], [536, 488], [504, 490, 1],
    ]),
    { part: 'arm', hint: SKIN },
  ),
  region('shell-left', fanShell(447, 540, 52, 46, -12), { hint: '#FFC9DD' }),
  region('shell-right', fanShell(493, 540, 52, 46, 12), { hint: '#FFC9DD' }),
  region('tail-frill', frill, { hint: '#FFF0A0' }),
  region('head', ellipse(470, 398, 108, 100), { hint: SKIN }),
  ...face(470, 420, { gap: 84, eye: 60, lashes: true, eyePart: 'eyes', smileY: 462, smileW: 30, cheekDx: 70, cheekY: 456, cheek: 17 }),
  region('bangs', bangs(470, 398, 108, 100, { a0: 166, a1: 374, pad: 12, hairY: 338, n: 5, bump: 0.5 }), { hint: HAIR }),
  region('hair-star', star(564, 314, 38, 21, 5, -70), { hint: '#FFE27A' }),
];

/** Mermaid with big curly hair sitting on a rock, waving hello. */
export const rockWave: Picture = {
  id: 'mermaid-rock-wave',
  category: 'mermaid',
  title: 'Kayadaki Deniz Kızı',
  parts: {
    eyes: { anim: 'blink', pivot: M(470, 420), speed: 0.4 },
    tail: { anim: 'wag', pivot: M(470, 612), amp: 6, speed: 1.1 },
    arm: { anim: 'wag', pivot: M(512, 508), amp: 12, speed: 1.6 },
    rays: { anim: 'spin', pivot: [850, 130], speed: 0.1 },
    gull: { anim: 'bob', pivot: G(0, 0), amp: 14, speed: 0.6 },
    boat: { anim: 'sway', pivot: [846, 446], amp: 5, speed: 0.7 },
  },
  celebrate: { sound: 'bubbles', particles: 'bubbles' },
  items: [
    region('sky', rect(0, 0, 1000, 1000), { outline: false, hint: '#D9EEFF' }),

    // sun
    region('sun-rays', star(850, 130, 102, 78, 10, -90, 0.32), { part: 'rays', hint: '#FFD98A' }),
    region('sun', circle(850, 130, 62), { hint: '#FFF0A0' }),
    happyEye(829, 123, 21),
    happyEye(871, 123, 21),
    inkLine(smile(850, 148, 24, 8)),
    blush(817, 148, 10),
    blush(883, 148, 10),

    region('cloud-1', cloud(250, 96, 220, 100), { hint: '#FFFFFF' }),
    region('cloud-2', cloud(640, 86, 150, 72, 4), { hint: '#FFFFFF' }),
    decor(twinkle(450, 56, 15), { fill: '#FFFFFF', stroke: INK, width: 3 }),
    decor(twinkle(724, 230, 12), { fill: '#FFFFFF', stroke: INK, width: 3 }),
    decor(twinkle(60, 170, 11), { fill: '#FFFFFF', stroke: INK, width: 3 }),

    ...place(gull, G),

    // little sail boat on the horizon
    region('boat-sail', shape([[838, 296], [838, 414, 1], [906, 414, 1]], 1), { part: 'boat', hint: '#FFC9DD' }),
    region('boat', shape([[780, 414, 1], [916, 414, 1], [894, 450], [802, 450]]), { part: 'boat', hint: '#FFD3A5' }),

    // sea
    region('sea-far', rect(-20, 434, 1040, 620), { hint: '#B9D8FF' }),
    region('sea', shape([[-20, 1020, 1], [-20, 566], [180, 552], [420, 570], [700, 552], [1020, 566], [1020, 1020, 1]]), {
      hint: '#9ED6FF',
    }),
    inkLine(curve([[60, 486], [80, 476], [100, 486]]), LINE.fine),
    inkLine(curve([[720, 498], [740, 488], [760, 498]]), LINE.fine),
    inkLine(curve([[880, 640], [904, 628], [928, 640]]), LINE.fine),
    inkLine(curve([[40, 650], [64, 638], [88, 650]]), LINE.fine),

    // rocks
    region('rock-small', smooth([[60, 910], [74, 812], [130, 770], [200, 786], [226, 910]]), { hint: '#E3D4FF' }),
    region('rock', smooth([[176, 930], [190, 800], [256, 712], [360, 664], [480, 652], [600, 664], [712, 712], [790, 800], [806, 930]]), {
      hint: '#D7C2FF',
    }),
    inkLine(curve([[236, 840], [258, 820], [286, 826]]), LINE.inner),
    inkLine(curve([[690, 860], [718, 842], [750, 848]]), LINE.inner),
    region('starfish', star(296, 772, 44, 24, 5, -80), { hint: '#FFADB9' }),
    region('seashell', fanShell(132, 850, 72, 62, -10), { hint: '#FFF4E6' }),
    ...fanShellRidges(132, 850, 72, 62, -10),

    // ---- mermaid ----
    ...place(mermaid, M),

    // splash + front waves
    decor(drop(918, 590, 10, 16, -60), { fill: '#FFFFFF', stroke: INK, width: LINE.fine }),
    decor(drop(944, 640, 8, 12, -30), { fill: '#FFFFFF', stroke: INK, width: LINE.fine }),
    region('wave-front', shape([[-20, 1020, 1], [-20, 892], [120, 870], [260, 898], [400, 874], [540, 900], [680, 872], [820, 896], [1020, 874], [1020, 1020, 1]]), {
      hint: '#B9D8FF',
    }),
    inkLine(curve([[160, 952], [190, 938], [220, 952]]), LINE.fine),
    inkLine(curve([[600, 962], [630, 948], [660, 962]]), LINE.fine),
  ],
};
