import {
  blush,
  circle,
  curve,
  cuteEye,
  decor,
  ellipse,
  INK,
  inkLine,
  LINE,
  line,
  mirrorX,
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
import { bumpy, crescent, place } from './helpers';
import { fairy } from './kit';

const sparkle = (x: number, y: number, r: number, part?: string) =>
  decor(twinkle(x, y, r), { fill: WHITE, stroke: INK, width: 3, part });

const flyer = fairy({
  id: 'fairy',
  x: 200,
  y: 596,
  s: 0.6,
  hair: 'bob',
  ears: true,
  skin: '#FFE0CC',
  hairHint: '#8C7BA0',
  dress: '#FFB8D9',
  wingTop: '#D7C2FF',
  arms: [
    [-30, 100, -96, 160],
    [30, 100, 116, 64],
  ],
  legs: [
    [-14, 240, -24, 344],
    [14, 240, 38, 330],
  ],
  legW: 28,
  skirt: 'petal',
  dressOne: true,
  wingPart: 'fairyWings',
  eyePart: 'fairyEyes',
  lashes: true,
  look: [0.4, 0],
  extraMid: [inkLine(line([[112, 76], [170, -36]]), 7)],
  extraTop: [region('wand-star', star(176, -62, 54), { part: 'wand', hint: '#FFE27A' })],
});

/** glowing mushroom: stem + cap + glow dashes */
function mushroom(id: string, x: number, y: number, w: number, capHint: string, part: string): ArtItem[] {
  const h = w * 0.62;
  const cap = smooth([
    [x, y - h - w * 0.2],
    [x + w * 0.36, y - h - w * 0.1],
    [x + w * 0.56, y - h + w * 0.2],
    [x + w * 0.42, y - h + w * 0.34],
    [x, y - h + w * 0.38],
    [x - w * 0.42, y - h + w * 0.34],
    [x - w * 0.56, y - h + w * 0.2],
    [x - w * 0.36, y - h - w * 0.1],
  ]);
  const glow: ArtItem[] = [];
  for (const a of [-160, -125, -90, -55, -20]) {
    const r0 = w * 0.66;
    const r1 = w * 0.8;
    const cx = x;
    const cy = y - h + w * 0.05;
    const c = Math.cos((a * Math.PI) / 180);
    const s = Math.sin((a * Math.PI) / 180);
    glow.push(inkLine(line([[cx + c * r0, cy + s * r0 * 0.8], [cx + c * r1, cy + s * r1 * 0.8]]), LINE.fine, part));
  }
  return [
    region(`${id}-stem`, rect(x - w * 0.17, y - h + w * 0.2, w * 0.34, h - w * 0.12, w * 0.12), { hint: '#FFF4E6', part }),
    region(`${id}-cap`, cap, { hint: capHint, part }),
    decor(circle(x - w * 0.2, y - h - w * 0.02, w * 0.07), { stroke: INK, width: LINE.fine, part }),
    decor(circle(x + w * 0.16, y - h - w * 0.08, w * 0.055), { stroke: INK, width: LINE.fine, part }),
    decor(circle(x + w * 0.04, y - h + w * 0.14, w * 0.06), { stroke: INK, width: LINE.fine, part }),
    ...glow,
  ];
}

/** firefly: glowing tail region + tiny wings and head */
function firefly(id: string, x: number, y: number, part: string): ArtItem[] {
  return [
    decor(ellipse(x - 13, y - 22, 9, 13, -30), { fill: WHITE, stroke: INK, width: 3, part }),
    decor(ellipse(x + 13, y - 22, 9, 13, 30), { fill: WHITE, stroke: INK, width: 3, part }),
    decor(circle(x, y - 20, 9), { fill: INK, part }),
    region(id, circle(x, y + 2, 21), { part, hint: '#FFF0A0' }),
    inkLine(line([[x - 34, y + 6], [x - 44, y + 8]]), LINE.fine, part),
    inkLine(line([[x + 34, y + 6], [x + 44, y + 8]]), LINE.fine, part),
    inkLine(line([[x, y + 34], [x, y + 44]]), LINE.fine, part),
  ];
}

// ---- owl (local coords around its body centre) ----
const O = place(745, 396, 1.15);
const owlWingL = smooth([
  [-52, 6],
  [-68, 30],
  [-70, 60],
  [-54, 82],
  [-38, 60],
  [-38, 24],
]);
const owl: ArtItem[] = [
  region(
    'owl',
    O.d(
      shape([
        [0, -64],
        [30, -68],
        [52, -98, 1],
        [62, -50],
        [64, 0],
        [54, 52],
        [30, 80],
        [0, 84],
        [-30, 80],
        [-54, 52],
        [-64, 0],
        [-62, -50],
        [-52, -98, 1],
        [-30, -68],
      ]),
    ),
    { hint: '#E8C4A0' },
  ),
  region('owl-belly', O.d(ellipse(0, 44, 34, 32)), { hint: '#FFF4E6' }),
  inkLine(O.d(curve([[-16, 34], [-10, 42], [-4, 34]])), LINE.fine),
  inkLine(O.d(curve([[4, 34], [10, 42], [16, 34]])), LINE.fine),
  inkLine(O.d(curve([[-6, 54], [0, 62], [6, 54]])), LINE.fine),
  region('owl-face', [O.d(circle(-23, -22, 28)), O.d(circle(23, -22, 28))].join(' '), { hint: '#FFF4E6' }),
  ...cuteEye(O.p(-23, -20)[0], O.p(-23, -20)[1], 38, { part: 'owlEyes' }),
  ...cuteEye(O.p(23, -20)[0], O.p(23, -20)[1], 38, { part: 'owlEyes' }),
  decor(O.d(shape([[-9, 0, 1], [9, 0, 1], [0, 17, 1]])), { fill: INK, stroke: INK, width: LINE.fine }),
  region('owl-wing-left', O.d(owlWingL), { part: 'owlWingL', hint: '#C99A74' }),
  region('owl-wing-right', O.d(mirrorX(owlWingL, 0)), { part: 'owlWingR', hint: '#C99A74' }),
  decor(O.d(ellipse(-15, 88, 11, 7)), { fill: WHITE, stroke: INK, width: LINE.fine }),
  decor(O.d(ellipse(15, 88, 11, 7)), { fill: WHITE, stroke: INK, width: LINE.fine }),
];

/** Picture 4: an enchanted tree with a friendly face, an owl, glowing mushrooms and fireflies. */
export const enchantedTree: Picture = {
  id: 'fairy-enchanted-tree',
  category: 'fairy',
  title: 'Sihirli Ağaç',
  parts: {
    treeEyes: { anim: 'blink', pivot: [500, 646], speed: 0.4 },
    owlEyes: { anim: 'blink', pivot: O.p(0, -20), speed: 0.5, phase: 0.45 },
    owlWingL: { anim: 'wag', pivot: O.p(-46, 12), amp: 12, speed: 1.4 },
    owlWingR: { anim: 'wag', pivot: O.p(46, 12), amp: -12, speed: 1.4 },
    fairyWings: { anim: 'flap', pivot: flyer.wingPivot, amp: 0.4, speed: 2 },
    fairyEyes: { anim: 'blink', pivot: flyer.eyePivot, speed: 0.45, phase: 0.2 },
    wand: { anim: 'twinkle', pivot: flyer.P(176, -62), amp: 0.25, speed: 1.2 },
    flies1: { anim: 'bob', pivot: [0, 0], amp: 12, speed: 0.9 },
    flies2: { anim: 'bob', pivot: [0, 0], amp: 12, speed: 0.9, phase: 0.5 },
    glow1: { anim: 'pulse', pivot: [130, 900], amp: 0.06, speed: 1.1 },
    glow2: { anim: 'pulse', pivot: [296, 936], amp: 0.06, speed: 1.1, phase: 0.33 },
    glow3: { anim: 'pulse', pivot: [850, 900], amp: 0.06, speed: 1.1, phase: 0.66 },
    star1: { anim: 'twinkle', pivot: [400, 70] },
    star2: { anim: 'twinkle', pivot: [900, 170], phase: 0.5 },
  },
  celebrate: { sound: 'magic', particles: 'sparkles' },
  items: [
    region('sky', rect(0, 0, 1000, 1000), { outline: false, hint: '#C9C6F2' }),

    // moon + stars
    region('moon', crescent(120, 130, 72, 152, 106, 62), { hint: '#FFF0A0' }),
    region('star-1', star(400, 70, 34), { part: 'star1', hint: '#FFE27A' }),
    region('star-2', star(900, 170, 38), { part: 'star2', hint: '#FFE27A' }),
    sparkle(260, 60, 14),
    sparkle(620, 40, 12),
    sparkle(960, 330, 12),
    sparkle(40, 300, 12),

    // ground
    region('hill', shape([[-20, 1020, 1], [-20, 856], [250, 826], [500, 846], [760, 822], [1020, 846], [1020, 1020, 1]]), {
      hint: '#9FE0B2',
    }),
    inkLine(curve([[60, 960], [72, 932], [82, 962]]), LINE.fine),
    inkLine(curve([[560, 975], [572, 948], [582, 978]]), LINE.fine),
    inkLine(curve([[930, 965], [942, 938], [952, 968]]), LINE.fine),

    // ---- tree ----
    region(
      'trunk',
      shape([
        [414, 380],
        [586, 380],
        [582, 560],
        [594, 700],
        [620, 800],
        [690, 862],
        [736, 888, 1],
        [640, 880],
        [596, 900, 1],
        [544, 884],
        [500, 900, 1],
        [456, 884],
        [404, 900, 1],
        [360, 880],
        [264, 888, 1],
        [310, 862],
        [380, 800],
        [406, 700],
        [418, 560],
      ]),
      { hint: '#C99A74' },
    ),
    inkLine(curve([[430, 770], [440, 800], [436, 830]]), LINE.fine),
    inkLine(curve([[574, 760], [566, 790], [572, 820]]), LINE.fine),
    inkLine(curve([[440, 540], [448, 566], [444, 590]]), LINE.fine),
    region('branch', shape([[574, 528], [700, 494], [826, 478], [846, 492], [830, 508], [706, 526], [580, 566, 1]]), {
      hint: '#C99A74',
    }),
    // tree face
    ...cuteEye(452, 646, 68, { part: 'treeEyes', lashes: 'left' }),
    ...cuteEye(548, 646, 68, { part: 'treeEyes', lashes: 'right' }),
    inkLine(smile(500, 712, 52, 14)),
    blush(420, 704, 22),
    blush(580, 704, 22),

    // crown
    region('crown-middle', bumpy(500, 250, 200, 170, 9, 0.16, 10), { hint: '#9FE0B2' }),
    region('crown-left', bumpy(300, 372, 150, 124, 7, 0.18, 20), { hint: '#BDEBC8' }),
    region('crown-right', bumpy(700, 372, 150, 124, 7, 0.18, -10), { hint: '#BDEBC8' }),
    inkLine(curve([[420, 180], [450, 160], [484, 168]]), LINE.fine),
    inkLine(curve([[560, 300], [590, 284], [620, 294]]), LINE.fine),
    inkLine(curve([[230, 330], [260, 312], [292, 320]]), LINE.fine),

    // ---- owl ----
    ...owl,

    // ---- glowing mushrooms ----
    ...mushroom('mushroom-1', 130, 900, 130, '#FFB8D9', 'glow1'),
    ...mushroom('mushroom-2', 296, 936, 108, '#9ED6FF', 'glow2'),
    ...mushroom('mushroom-3', 850, 900, 140, '#D7C2FF', 'glow3'),

    // ---- fireflies ----
    ...firefly('firefly-1', 80, 450, 'flies1'),
    ...firefly('firefly-2', 900, 620, 'flies2'),
    ...firefly('firefly-3', 660, 800, 'flies1'),
    ...firefly('firefly-4', 940, 400, 'flies2'),

    // ---- little fairy ----
    ...flyer.items,
  ],
};
