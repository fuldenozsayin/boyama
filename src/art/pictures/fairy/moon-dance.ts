import {
  blush,
  circle,
  cloud,
  curve,
  cuteEye,
  decor,
  ellipse,
  happyEye,
  ink,
  INK,
  inkLine,
  LINE,
  line,
  rect,
  region,
  shape,
  smile,
  smooth,
  star,
  twinkle,
  WHITE,
} from '../../dsl';
import type { ArtItem, Picture } from '../../types';
import { lilyPad, shapeLoose, treeline } from './helpers';
import { fairy } from './kit';

const sparkle = (x: number, y: number, r: number, part?: string) =>
  decor(twinkle(x, y, r), { fill: WHITE, stroke: INK, width: 3, part });

/** toadstool: flared stem + round cap with white spots (decor) */
function toadstool(id: string, x: number, y: number, w: number, capHint: string, part?: string): ArtItem[] {
  const h = w * 0.7;
  const capY = y - h;
  return [
    region(
      `${id}-stem`,
      smooth([
        [x - w * 0.16, capY + w * 0.1],
        [x + w * 0.16, capY + w * 0.1],
        [x + w * 0.2, y - w * 0.1],
        [x + w * 0.24, y],
        [x, y + w * 0.04],
        [x - w * 0.24, y],
        [x - w * 0.2, y - w * 0.1],
      ]),
      { hint: '#FFF4E6', part },
    ),
    region(
      `${id}-cap`,
      smooth([
        [x, capY - w * 0.34],
        [x + w * 0.34, capY - w * 0.26],
        [x + w * 0.54, capY + w * 0.02],
        [x + w * 0.46, capY + w * 0.14],
        [x, capY + w * 0.18],
        [x - w * 0.46, capY + w * 0.14],
        [x - w * 0.54, capY + w * 0.02],
        [x - w * 0.34, capY - w * 0.26],
      ]),
      { hint: capHint, part },
    ),
    decor(ellipse(x - w * 0.22, capY - w * 0.08, w * 0.09, w * 0.07), { fill: WHITE, stroke: INK, width: LINE.fine, part }),
    decor(ellipse(x + w * 0.12, capY - w * 0.18, w * 0.08, w * 0.06), { fill: WHITE, stroke: INK, width: LINE.fine, part }),
    decor(ellipse(x + w * 0.3, capY + w * 0.02, w * 0.07, w * 0.055), { fill: WHITE, stroke: INK, width: LINE.fine, part }),
  ];
}

/** water lily flower (pointed petals) */
function lily(id: string, x: number, y: number, k: number, hint: string, part?: string): ArtItem[] {
  const p = (dx: number, dy: number, sharp = false): [number, number] | [number, number, 1] =>
    sharp ? [x + dx * k, y + dy * k, 1] : [x + dx * k, y + dy * k];
  return [
    region(
      id,
      shape([
        p(-44, 2),
        p(-50, -24, true),
        p(-26, -14),
        p(-18, -46, true),
        p(0, -24),
        p(18, -46, true),
        p(26, -14),
        p(50, -24, true),
        p(44, 2),
        p(0, 12),
      ]),
      { hint, part },
    ),
    inkLine(curve([p(-26, -14) as [number, number], p(-16, 0) as [number, number]]), LINE.fine, part),
    inkLine(curve([p(0, -24) as [number, number], p(0, 4) as [number, number]]), LINE.fine, part),
    inkLine(curve([p(26, -14) as [number, number], p(16, 0) as [number, number]]), LINE.fine, part),
  ];
}

// ---- the two dancers ----
const left = fairy({
  id: 'fairy-left',
  x: 282,
  y: 518,
  s: 0.7,
  hair: 'pony',
  ears: true,
  skin: '#FFE5D4',
  hairHint: '#FFB38A',
  dress: '#FFC9DD',
  wingTop: '#B9D8FF',
  arms: [
    [-30, 100, -142, 70],
    [30, 100, 120, 130],
  ],
  legs: [
    [-16, 240, -22, 344],
    [16, 240, 66, 326],
  ],
  legW: 27,
  skirt: 'petal',
  dressOne: true,
  wingPart: 'wingsLeft',
  eyePart: 'eyesLeft',
  lashes: true,
  look: [0.5, 0],
  extraMid: [inkLine(line([[-146, 80], [-188, -40]]), 12), decor(line([[-146, 80], [-188, -40]]), { stroke: WHITE, width: 4 })],
  extraTop: [
    region('wand-star', star(-194, -66, 56), { part: 'wand', hint: '#FFE27A' }),
    // freckles
    ink(circle(-70, 46, 4)),
    ink(circle(-58, 54, 4)),
    ink(circle(-74, 60, 4)),
    ink(circle(70, 46, 4)),
    ink(circle(58, 54, 4)),
    ink(circle(74, 60, 4)),
  ],
});

const right = fairy({
  id: 'fairy-right',
  x: 718,
  y: 518,
  s: 0.7,
  hair: 'long',
  ears: true,
  skin: '#8D5A3B',
  hairHint: '#7A5A66',
  dress: '#C9B8FF',
  wingTop: '#BDEBC8',
  arms: [
    [-30, 100, -120, 130],
    [30, 100, 142, 70],
  ],
  legs: [
    [16, 240, 22, 344],
    [-16, 240, -66, 326],
  ],
  legW: 27,
  skirt: 'leaf',
  dressOne: true,
  wingPart: 'wingsRight',
  eyePart: 'eyesRight',
  lashes: true,
  look: [-0.5, 0],
  extraTop: [
    decor(twinkle(176, 10, 24), { fill: WHITE, stroke: INK, width: 3, part: 'magic' }),
    decor(twinkle(150, -40, 15), { fill: WHITE, stroke: INK, width: 3, part: 'magic' }),
    decor(twinkle(214, -30, 12), { fill: WHITE, stroke: INK, width: 3, part: 'magic' }),
  ],
});

/** Picture 5 (richest): fairies dancing in a toadstool ring under the moon, by a lily pond. */
export const moonDance: Picture = {
  id: 'fairy-moon-dance',
  category: 'fairy',
  title: 'Ay Işığında Dans',
  parts: {
    wingsLeft: { anim: 'flap', pivot: left.wingPivot, amp: 0.4, speed: 1.8 },
    wingsRight: { anim: 'flap', pivot: right.wingPivot, amp: 0.4, speed: 1.8, phase: 0.5 },
    eyesLeft: { anim: 'blink', pivot: left.eyePivot, speed: 0.45 },
    eyesRight: { anim: 'blink', pivot: right.eyePivot, speed: 0.4, phase: 0.3 },
    wand: { anim: 'twinkle', pivot: left.P(-194, -66), amp: 0.25, speed: 1.2 },
    magic: { anim: 'twinkle', pivot: right.P(176, -10), amp: 0.2, speed: 1 },
    moon: { anim: 'sway', pivot: [500, 160], amp: 6, speed: 0.4 },
    star1: { anim: 'twinkle', pivot: [140, 110] },
    star2: { anim: 'twinkle', pivot: [862, 120], phase: 0.5 },
    frog: { anim: 'bob', pivot: [612, 890], amp: 8, speed: 1.1 },
    lilies: { anim: 'bob', pivot: [500, 900], amp: 4, speed: 0.6 },
  },
  celebrate: { sound: 'magic', particles: 'sparkles' },
  items: [
    region('sky', rect(0, 0, 1000, 1000), { outline: false, hint: '#C9C2F2' }),

    // moon + stars
    region('moon', circle(500, 160, 90), { part: 'moon', hint: '#FFF0A0' }),
    happyEye(470, 150, 30, 'moon'),
    happyEye(530, 150, 30, 'moon'),
    inkLine(smile(500, 182, 34, 9), LINE.inner, 'moon'),
    blush(456, 184, 13, 8, 'moon'),
    blush(544, 184, 13, 8, 'moon'),
    decor(circle(452, 106, 10), { stroke: INK, width: LINE.fine, part: 'moon' }),
    decor(circle(556, 214, 8), { stroke: INK, width: LINE.fine, part: 'moon' }),
    region('cloud-left', cloud(250, 250, 200, 86, 4), { hint: '#FFFFFF' }),
    region('cloud-right', cloud(760, 270, 180, 80, 4), { hint: '#FFFFFF' }),
    region('star-1', star(140, 110, 38), { part: 'star1', hint: '#FFE27A' }),
    region('star-2', star(862, 120, 42), { part: 'star2', hint: '#FFE27A' }),
    sparkle(300, 60, 14),
    sparkle(690, 60, 12),
    sparkle(950, 260, 12),
    sparkle(50, 250, 12),
    sparkle(380, 180, 10),
    sparkle(640, 200, 10),

    // forest + meadow
    region('forest', shapeLoose([[1040, 640, 1], [-40, 640, 1], ...treeline(-40, 1040, 452, 9, 74)]), { hint: '#9FE0B2' }),
    inkLine(curve([[60, 420], [84, 404], [110, 412]]), LINE.fine),
    inkLine(curve([[400, 410], [424, 394], [450, 402]]), LINE.fine),
    inkLine(curve([[880, 416], [904, 400], [930, 408]]), LINE.fine),
    region('meadow', shape([[-20, 1020, 1], [-20, 556], [250, 528], [500, 546], [750, 526], [1020, 552], [1020, 1020, 1]]), {
      hint: '#C8F0D0',
    }),
    inkLine(curve([[40, 800], [52, 772], [62, 802]]), LINE.fine),
    inkLine(curve([[440, 760], [452, 732], [462, 762]]), LINE.fine),
    inkLine(curve([[540, 780], [552, 752], [562, 782]]), LINE.fine),
    inkLine(curve([[950, 800], [962, 772], [972, 802]]), LINE.fine),

    // toadstools at the back of the ring
    ...toadstool('toadstool-left', 46, 780, 104, '#FFADB9'),
    ...toadstool('toadstool-back', 500, 676, 110, '#FFC9DD'),
    ...toadstool('toadstool-right', 954, 780, 104, '#FFADB9'),

    // ---- dancers ----
    ...left.items,
    ...right.items,

    // pond with lilies and a frog
    region('pond', ellipse(500, 902, 232, 72), { hint: '#B9D8FF' }),
    inkLine(curve([[310, 930], [330, 940], [352, 938]]), LINE.fine),
    inkLine(curve([[660, 960], [690, 958], [710, 948]]), LINE.fine),
    inkLine(curve([[470, 950], [500, 958], [530, 952]]), LINE.fine),
    region('lily-pad-left', lilyPad(398, 904, 66, 25, -40), { part: 'lilies', hint: '#9FE0B2' }),
    region('lily-pad-right', lilyPad(616, 920, 72, 27, -140), { part: 'frog', hint: '#9FE0B2' }),
    ...lily('lily-left', 386, 900, 0.95, '#FFB8D9', 'lilies'),
    ...lily('lily-right', 500, 872, 0.75, '#FFF4E6', 'lilies'),

    // frog
    region(
      'frog',
      [ellipse(616, 900, 46, 26), ellipse(616, 872, 42, 28), circle(594, 850, 17), circle(638, 850, 17)].join(' '),
      { part: 'frog', hint: '#BDEBC8' },
    ),
    ...cuteEye(594, 852, 22, { part: 'frog' }),
    ...cuteEye(638, 852, 22, { part: 'frog' }),
    inkLine(smile(616, 880, 30, 7), LINE.inner, 'frog'),
    blush(588, 884, 8, 5, 'frog'),
    blush(644, 884, 8, 5, 'frog'),

    // front toadstools of the ring
    ...toadstool('toadstool-front-left', 150, 930, 150, '#D7C2FF'),
    ...toadstool('toadstool-front-right', 850, 930, 150, '#D7C2FF'),

    sparkle(130, 840, 10),
    sparkle(870, 830, 10),
    sparkle(500, 770, 12),
  ],
};
