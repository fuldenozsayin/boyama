import {
  blush,
  circle,
  cloud,
  combine,
  cuteEye,
  curve,
  decor,
  drop,
  line,
  ellipse,
  happyEye,
  ink,
  INK,
  inkLine,
  LINE,
  petal,
  rect,
  region,
  scallop,
  shape,
  smile,
  smooth,
  star,
} from '../../dsl';
import type { Picture } from '../../types';
import { bangsFor, bangsLines, bow, bowKnot, braid, crown, crownTips, hemPts, pearl, princessFace, sparkle } from './helpers';

const SKIN = '#F5C9A6';
const HAIR = '#F4A87C';

const plait = braid([282, 396], [200, 664], 64, 3);

/** Picture 4: a princess offering a carrot to her bunny by the garden fountain. */
export const princessGardenBunny: Picture = {
  id: 'princess-garden-bunny',
  category: 'princess',
  title: 'Prenses ve Tavşan',
  parts: {
    eyes: { anim: 'blink', pivot: [380, 370], speed: 0.45 },
    bunnyEyes: { anim: 'blink', pivot: [702, 726], speed: 0.5, phase: 0.4 },
    ears: { anim: 'wag', pivot: [700, 664], amp: 8, speed: 1.3 },
    crown: { anim: 'pulse', pivot: [380, 240], amp: 0.08, speed: 1.1 },
    butterfly: { anim: 'flap', pivot: [600, 300], amp: 0.5, speed: 2 },
    rays: { anim: 'spin', pivot: [110, 110], speed: 0.12 },
    braid: { anim: 'wag', pivot: [282, 400], amp: 5, speed: 0.9 },
    swing: { anim: 'sway', pivot: [832, 436], amp: 7, speed: 0.8 },
  },
  celebrate: { sound: 'magic', particles: 'sparkles' },
  items: [
    region('sky', rect(0, 0, 1000, 1000), { outline: false, hint: '#D9EEFF' }),

    // sun + cloud
    region('sun-rays', star(110, 110, 96, 74, 12, -90, 0.32), { part: 'rays', hint: '#FFD98A' }),
    region('sun', circle(110, 110, 58), { hint: '#FFF1A0' }),
    happyEye(90, 104, 20),
    happyEye(130, 104, 20),
    inkLine(smile(110, 124, 24, 7)),
    blush(78, 128, 10, 6),
    blush(142, 128, 10, 6),
    region('cloud', cloud(590, 120, 240, 112), { hint: '#FFFFFF' }),
    sparkle(960, 60, 14),
    sparkle(690, 220, 12),

    // hedge + lawn
    region('hedge', shape([[-20, 720, 1], [1020, 720, 1], ...hemPts(-20, 1020, 568, 8, -52, 0)]), { hint: '#9FE0B2' }),
    region('lawn', shape([[-20, 1020, 1], [-20, 660], [300, 630], [700, 642], [1020, 618], [1020, 1020, 1]]), {
      hint: '#C8F0D0',
    }),

    // apple tree with a swing
    region('tree-trunk', shape([[904, 664, 1], [926, 600], [930, 476], [896, 446], [820, 442], [772, 442], [756, 428], [772, 414], [830, 412], [906, 414], [930, 360, 1], [990, 360, 1], [986, 420], [990, 600], [1014, 664, 1]]), {
      hint: '#E8C4A0',
    }),
    inkLine(curve([[950, 470], [958, 500], [952, 530]]), LINE.fine),
    region('tree-top', scallop(890, 262, 116, 9, 0.17), { hint: '#9FE0B2' }),
    region('apple-1', circle(800, 240, 23), { hint: '#FFADB9' }),
    region('apple-2', circle(910, 180, 23), { hint: '#FFADB9' }),
    region('apple-3', circle(930, 310, 23), { hint: '#FFADB9' }),
    inkLine(curve([[800, 218], [806, 206], [816, 202]]), LINE.fine),
    inkLine(curve([[910, 158], [916, 146], [926, 142]]), LINE.fine),
    inkLine(curve([[930, 288], [936, 276], [946, 272]]), LINE.fine),
    inkLine(line([[792, 438], [792, 600]]), LINE.inner, 'swing'),
    inkLine(line([[872, 436], [872, 600]]), LINE.inner, 'swing'),
    region('swing-seat', rect(770, 594, 124, 28, 12), { part: 'swing', hint: '#FFD3A5' }),

    // butterfly
    region('butterfly-left', smooth([[598, 298], [564, 252], [532, 252], [528, 284], [556, 304], [536, 326], [550, 350], [582, 336]]), {
      part: 'butterfly',
      hint: '#FFC9DD',
    }),
    region('butterfly-right', smooth([[602, 298], [636, 252], [668, 252], [672, 284], [644, 304], [664, 326], [650, 350], [618, 336]]), {
      part: 'butterfly',
      hint: '#FFC9DD',
    }),
    ink(ellipse(600, 304, 7, 26)),
    inkLine(curve([[596, 280], [588, 260], [578, 252]]), LINE.fine),
    inkLine(curve([[604, 280], [612, 260], [622, 252]]), LINE.fine),

    // ---- princess ----
    region('braid', plait.d, { part: 'braid', hint: HAIR }),
    ...plait.notches.map(([a, b]) => inkLine(curve([a, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 10], b]), LINE.fine, 'braid')),
    decor(bow(plait.tie[0], plait.tie[1], 58, 40), { fill: '#FFFFFF', stroke: INK, width: LINE.inner, part: 'braid' }),
    ...bowKnot(plait.tie[0], plait.tie[1], 58, 40, 'braid'),

    region(
      'skirt',
      shape([[338, 540, 1], [422, 540, 1], [468, 630], [520, 784, 1], ...hemPts(240, 520, 784, 6, 20, 12).slice(1, -1), [240, 784, 1], [292, 630]]),
      { hint: '#BDEBC8' },
    ),
    decor(circle(310, 720, 7), { fill: '#FFFFFF', stroke: INK, width: LINE.fine }),
    decor(circle(380, 680, 7), { fill: '#FFFFFF', stroke: INK, width: LINE.fine }),
    decor(circle(450, 720, 7), { fill: '#FFFFFF', stroke: INK, width: LINE.fine }),
    decor(circle(345, 610, 7), { fill: '#FFFFFF', stroke: INK, width: LINE.fine }),
    decor(circle(418, 610, 7), { fill: '#FFFFFF', stroke: INK, width: LINE.fine }),
    decor(circle(380, 760, 7), { fill: '#FFFFFF', stroke: INK, width: LINE.fine }),
    region('bodice', shape([[332, 440], [380, 452], [428, 440], [442, 480], [428, 552, 1], [332, 552, 1], [318, 480]]), {
      hint: '#FFB8D9',
    }),
    region('arm-left', smooth([[316, 466], [340, 482], [326, 530], [314, 560], [296, 576], [276, 564], [282, 530], [298, 476]]), {
      hint: SKIN,
    }),

    // carrot (held out to the bunny)
    region('carrot-leaves', combine(petal([560, 570], [524, 494], 15), petal([608, 572], [622, 494], 15), petal([582, 570], [574, 478], 17)), {
      hint: '#9FE0B2',
    }),
    region('carrot', drop(566, 586, 22, 84, 50), { hint: '#FFD3A5' }),
    inkLine(curve([[582, 618], [592, 614], [597, 606]]), LINE.fine),
    inkLine(curve([[598, 640], [607, 636], [611, 629]]), LINE.fine),
    region('arm-right', smooth([[428, 462], [470, 494], [516, 530], [546, 552], [566, 572], [550, 596], [520, 590], [478, 556], [430, 516], [418, 490]]), {
      hint: SKIN,
    }),
    region('sleeve-left', ellipse(324, 458, 36, 28, -25), { hint: '#FFC9DD' }),
    region('sleeve-right', ellipse(434, 458, 36, 28, 25), { hint: '#FFC9DD' }),

    region('face', ellipse(380, 335, 106, 96), { hint: SKIN }),
    ...princessFace(380, 368, 104, { eyePart: 'eyes', look: [1, 0.4] }),
    region('hair', bangsFor(380, 335, 106), { hint: HAIR }),
    ...bangsLines(380, 335, 106),
    region('crown', crown(380, 240, 124, 72, 6), { part: 'crown', hint: '#FFE27A' }),
    ...crownTips(380, 240, 124, 72).map(([x, y]) => pearl(x, y - 4, 9, 'crown')),
    decor(circle(380, 222, 11), { fill: '#FFFFFF', stroke: INK, width: LINE.fine, part: 'crown' }),

    // ---- bunny ----
    region('bunny-tail', circle(808, 872, 32), { hint: '#FFFFFF' }),
    region('bunny-body', ellipse(716, 838, 92, 76), { hint: '#FFF8FC' }),
    inkLine(curve([[668, 900], [680, 890], [694, 900]]), LINE.inner),
    inkLine(curve([[738, 900], [750, 890], [764, 900]]), LINE.inner),
    region('bunny-ear-left', petal([680, 668], [642, 524], 30), { part: 'ears', hint: '#FFF8FC' }),
    region('bunny-ear-right', petal([722, 666], [756, 522], 30), { part: 'ears', hint: '#FFF8FC' }),
    region('bunny-ear-left-inner', petal([678, 652], [650, 548], 15), { part: 'ears', hint: '#FFC9DD' }),
    region('bunny-ear-right-inner', petal([724, 650], [750, 546], 15), { part: 'ears', hint: '#FFC9DD' }),
    region('bunny-head', ellipse(700, 722, 80, 68), { hint: '#FFF8FC' }),
    ...cuteEye(672, 726, 40, { part: 'bunnyEyes', look: [-1, -0.6] }),
    ...cuteEye(732, 726, 40, { part: 'bunnyEyes', look: [-1, -0.6] }),
    ink(ellipse(702, 748, 9, 6)),
    inkLine(curve([[690, 762], [696, 768], [702, 760], [708, 768], [714, 762]]), LINE.fine),
    blush(654, 754, 13, 8),
    blush(750, 754, 13, 8),

    // flowers
    region('flower-1', scallop(110, 880, 42), { hint: '#FFB1C8' }),
    region('flower-1-mid', circle(110, 880, 24), { hint: '#FFE27A' }),
    region('flower-2', scallop(912, 930, 40, 5, 0.65, -70), { hint: '#C9B8FF' }),
    region('flower-2-mid', circle(912, 930, 23), { hint: '#FFE27A' }),
    inkLine(curve([[230, 900], [240, 872], [250, 902]]), LINE.fine),
    inkLine(curve([[520, 930], [530, 902], [540, 932]]), LINE.fine),
    inkLine(curve([[780, 960], [790, 932], [800, 962]]), LINE.fine),
    inkLine(curve([[40, 760], [50, 732], [60, 762]]), LINE.fine),
  ],
};
