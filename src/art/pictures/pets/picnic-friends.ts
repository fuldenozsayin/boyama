import {
  blush,
  circle,
  cloud,
  curve,
  decor,
  ellipse,
  happyEye,
  heart,
  ink,
  inkLine,
  LINE,
  rect,
  region,
  roundPoly,
  shape,
  smile,
  smooth,
  type Pt,
} from '../../dsl';
import type { DecorItem, Picture } from '../../types';
import {
  balloon,
  balloonString,
  bunnyFace,
  catEars,
  catFace,
  chubbyHead,
  dogFace,
  dogHead,
  floppyEar,
  longEar,
  sitBody,
  sunRays,
  toes,
  tube,
} from './helpers';

// cat (left)
const CX = 212;
const CY = 482;
const CR = 116;
// bunny (middle)
const BX = 500;
const BY = 470;
const BR = 110;
// dog (right)
const DX = 790;
const DY = 482;
const DR = 116;

const [catEarL, catEarInL, catEarR, catEarInR] = catEars(CX, CY, CR);
const bEarL = { base: [BX - 42, BY - 76] as Pt, tip: [BX - 84, BY - 304] as Pt };
const bEarR = { base: [BX + 42, BY - 76] as Pt, tip: [BX + 92, BY - 300] as Pt };
const innerEar = (e: { base: Pt; tip: Pt }): [Pt, Pt] => [
  [e.base[0] + (e.tip[0] - e.base[0]) * 0.1, e.base[1] + (e.tip[1] - e.base[1]) * 0.1],
  [e.base[0] + (e.tip[0] - e.base[0]) * 0.84, e.base[1] + (e.tip[1] - e.base[1]) * 0.84],
];

/** tiny hearts printed on the blanket */
const prints: Pt[] = [
  [86, 828],
  [366, 826],
  [632, 826],
  [912, 828],
  [56, 904],
  [380, 902],
  [622, 902],
  [884, 904],
  [150, 956],
  [330, 958],
  [676, 958],
  [852, 958],
];
const blanketPrints: DecorItem[] = prints.map(([x, y]) =>
  decor(heart(x, y, 26, 22), { fill: '#FFFFFF', stroke: '#4E3D63', width: 3.5 }),
);

/** Cat, bunny and puppy friends having a picnic with balloons. */
export const picnicFriends: Picture = {
  id: 'pets-picnic-friends',
  category: 'pets',
  title: 'Dostlarla Piknik',
  parts: {
    'cat-tail': { anim: 'wag', pivot: [CX - 100, 782], amp: 13, speed: 1.4 },
    'dog-tail': { anim: 'wag', pivot: [DX + 104, 776], amp: 20, speed: 2.4 },
    'bunny-ear-l': { anim: 'wag', pivot: bEarL.base, amp: 6, speed: 1.1 },
    'bunny-ear-r': { anim: 'wag', pivot: bEarR.base, amp: 6, speed: 1.1, phase: 0.5 },
    'cat-eyes': { anim: 'blink', pivot: [CX, CY + 0.06 * CR], speed: 0.42 },
    'bunny-eyes': { anim: 'blink', pivot: [BX, BY + 0.04 * BR], speed: 0.42, phase: 0.33 },
    'dog-eyes': { anim: 'blink', pivot: [DX, DY], speed: 0.42, phase: 0.66 },
    'balloon-1': { anim: 'sway', pivot: [722, 300], amp: 6, speed: 0.7 },
    'balloon-2': { anim: 'sway', pivot: [838, 262], amp: 6, speed: 0.6, phase: 0.4 },
    'balloon-3': { anim: 'sway', pivot: [930, 360], amp: 6, speed: 0.8, phase: 0.7 },
    rays: { anim: 'spin', pivot: [96, 100], speed: 0.15 },
  },
  celebrate: { sound: 'meow', particles: 'hearts' },
  items: [
    region('sky', rect(0, 0, 1000, 1000), { outline: false, hint: '#D9EEFF' }),

    // sun
    ...sunRays(96, 100, 74, 98, 10, 'rays'),
    region('sun', circle(96, 100, 54), { hint: '#FFE27A' }),
    happyEye(77, 94, 18),
    happyEye(115, 94, 18),
    inkLine(smile(96, 114, 22, 6)),
    blush(66, 116, 8),
    blush(126, 116, 8),
    region('cloud', cloud(286, 128, 200, 96), { hint: '#FFFFFF' }),

    // balloons (drawn early: they float behind nobody)
    balloonString(722, 300, 70, 'balloon-1'),
    region('balloon-1', balloon(722, 210, 54), { part: 'balloon-1', hint: '#FFADB9' }),
    decor(ellipse(704, 180, 10, 16, 25), { fill: '#FFFFFF', part: 'balloon-1' }),
    balloonString(838, 262, 74, 'balloon-2'),
    region('balloon-2', balloon(838, 166, 58), { part: 'balloon-2', hint: '#B9D8FF' }),
    decor(ellipse(818, 134, 10, 17, 25), { fill: '#FFFFFF', part: 'balloon-2' }),
    balloonString(930, 360, 60, 'balloon-3'),
    region('balloon-3', balloon(930, 270, 52), { part: 'balloon-3', hint: '#FFF0A0' }),
    decor(ellipse(913, 241, 9, 15, 25), { fill: '#FFFFFF', part: 'balloon-3' }),

    // land
    region('hill', shape([[-20, 1020, 1], [-20, 560], [200, 530], [460, 566], [720, 528], [1020, 556], [1020, 1020, 1]]), {
      hint: '#C8F0D0',
    }),
    region('grass', shape([[-20, 1020, 1], [-20, 640], [260, 622], [520, 642], [780, 618], [1020, 636], [1020, 1020, 1]]), {
      hint: '#9FE0B2',
    }),
    region('blanket', roundPoly([[70, 690], [930, 690], [1000, 975], [0, 975]], 0.05), { hint: '#FFB8D9' }),
    ...blanketPrints,

    // ---- cat ----
    region('cat-tail', tube([[CX - 76, 784], [CX - 140, 790], [CX - 178, 752], [CX - 184, 694], [CX - 158, 654]], 40, 36), {
      part: 'cat-tail',
      hint: '#FFD3A5',
    }),
    region('cat-body', sitBody(CX, 572, 802, 118), { hint: '#FFD3A5' }),
    region('cat-paw-left', ellipse(CX - 36, 786, 36, 26), { hint: '#FFF4E6' }),
    region('cat-paw-right', ellipse(CX + 36, 786, 36, 26), { hint: '#FFF4E6' }),
    ...toes(CX - 36, 812, 50),
    ...toes(CX + 36, 812, 50),
    region('cat-ear-left', catEarL, { hint: '#FFD3A5' }),
    region('cat-ear-left-inner', catEarInL, { hint: '#FFC9DD' }),
    region('cat-ear-right', catEarR, { hint: '#FFD3A5' }),
    region('cat-ear-right-inner', catEarInR, { hint: '#FFC9DD' }),
    region('cat-head', chubbyHead(CX, CY, CR), { hint: '#FFD3A5' }),
    inkLine(curve([[CX, CY - 0.8 * CR], [CX, CY - 0.64 * CR]]), LINE.inner),
    inkLine(curve([[CX - 0.16 * CR, CY - 0.77 * CR], [CX - 0.13 * CR, CY - 0.64 * CR]]), LINE.inner),
    inkLine(curve([[CX + 0.16 * CR, CY - 0.77 * CR], [CX + 0.13 * CR, CY - 0.64 * CR]]), LINE.inner),
    ...catFace(CX, CY, CR, { eyePart: 'cat-eyes' }),

    // ---- bunny ----
    region('bunny-ear-left', longEar(bEarL.base, bEarL.tip, 38), { part: 'bunny-ear-l', hint: '#FFF8FC' }),
    region('bunny-ear-left-inner', longEar(...innerEar(bEarL), 20), { part: 'bunny-ear-l', hint: '#FFC9DD' }),
    region('bunny-ear-right', longEar(bEarR.base, bEarR.tip, 38), { part: 'bunny-ear-r', hint: '#FFF8FC' }),
    region('bunny-ear-right-inner', longEar(...innerEar(bEarR), 20), { part: 'bunny-ear-r', hint: '#FFC9DD' }),
    region('bunny-body', sitBody(BX, 560, 804, 116), { hint: '#FFF8FC' }),
    // cupcake held in both paws
    region('cupcake-top', cloud(BX, 664, 128, 92, 4), { hint: '#FFC9DD' }),
    region('cupcake-base', roundPoly([[BX - 54, 684], [BX + 54, 684], [BX + 40, 760], [BX - 40, 760]], 0.12), { hint: '#B9D8FF' }),
    inkLine(curve([[BX - 20, 694], [BX - 16, 752]]), LINE.fine),
    inkLine(curve([[BX + 20, 694], [BX + 16, 752]]), LINE.fine),
    decor(circle(BX, 614, 13), { fill: '#FF8FAB', stroke: '#4E3D63', width: 4 }),
    inkLine(curve([[BX, 602], [BX + 6, 588], [BX + 16, 582]]), LINE.fine),
    inkLine(curve([[BX - 30, 662], [BX - 22, 668]]), LINE.inner),
    inkLine(curve([[BX + 8, 652], [BX + 16, 646]]), LINE.inner),
    inkLine(curve([[BX + 30, 670], [BX + 38, 664]]), LINE.inner),
    region('bunny-paw-left', ellipse(BX - 56, 722, 25, 29, 12), { hint: '#FFF8FC' }),
    region('bunny-paw-right', ellipse(BX + 56, 722, 25, 29, -12), { hint: '#FFF8FC' }),
    inkLine(curve([[BX - 44, 712], [BX - 35, 714]]), LINE.fine),
    inkLine(curve([[BX - 44, 728], [BX - 35, 730]]), LINE.fine),
    inkLine(curve([[BX + 44, 712], [BX + 35, 714]]), LINE.fine),
    inkLine(curve([[BX + 44, 728], [BX + 35, 730]]), LINE.fine),
    region('bunny-head', chubbyHead(BX, BY, BR, 0.86), { hint: '#FFF8FC' }),
    ...bunnyFace(BX, BY, BR, { eyePart: 'bunny-eyes', lashes: true, whiskers: false }),

    // ---- puppy ----
    region('dog-tail', tube([[DX + 80, 782], [DX + 134, 770], [DX + 164, 728], [DX + 170, 680]], 38, 32), {
      part: 'dog-tail',
      hint: '#E8C4A0',
    }),
    region('dog-body', sitBody(DX, 572, 802, 118), { hint: '#E8C4A0' }),
    region('dog-paw-left', ellipse(DX - 36, 786, 36, 26), { hint: '#FFF4E6' }),
    region('dog-paw-right', ellipse(DX + 36, 786, 36, 26), { hint: '#FFF4E6' }),
    ...toes(DX - 36, 812, 50),
    ...toes(DX + 36, 812, 50),
    region('dog-head', dogHead(DX, DY, DR), { hint: '#E8C4A0' }),
    region('dog-muzzle', ellipse(DX, DY + 0.44 * DR, 0.4 * DR, 0.29 * DR), { hint: '#FFF4E6' }),
    region('dog-ear-left', floppyEar(DX, DY, DR, -1), { hint: '#C99A74' }),
    region('dog-ear-right', floppyEar(DX, DY, DR, 1), { hint: '#C99A74' }),
    ...dogFace(DX, DY, DR, { eyePart: 'dog-eyes' }),

    // ---- picnic food ----
    region('melon-rind', smooth([[178, 852], [342, 852], [326, 904], [260, 936], [194, 904]]), { hint: '#9FE0B2' }),
    region('melon', smooth([[190, 852], [330, 852], [314, 890], [260, 916], [206, 890]]), { hint: '#FFADB9' }),
    ink(ellipse(230, 870, 4, 6.5)),
    ink(ellipse(260, 888, 4, 6.5)),
    ink(ellipse(290, 870, 4, 6.5)),
    region('basket-handle', tube([[432, 862], [446, 808], [500, 782], [554, 808], [568, 862]], 22, 22), { hint: '#C99A74' }),
    region('basket', roundPoly([[414, 846], [586, 846], [570, 944], [430, 944]], 0.12), { hint: '#E8C4A0' }),
    inkLine(curve([[426, 878], [500, 884], [574, 878]]), LINE.fine),
    inkLine(curve([[432, 910], [500, 916], [568, 910]]), LINE.fine),
    region('apple', smooth([[740, 856], [770, 846], [800, 866], [798, 910], [770, 934], [740, 926], [716, 934], [688, 910], [686, 866], [712, 846]]), {
      hint: '#FFADB9',
    }),
    inkLine(curve([[742, 858], [744, 838], [752, 824]]), LINE.inner),
    region('apple-leaf', smooth([[746, 838], [768, 808], [808, 798], [798, 828], [764, 846]]), { hint: '#9FE0B2' }),
    decor(ellipse(712, 876, 7, 11, 20), { fill: '#FFFFFF' }),
  ],
};
