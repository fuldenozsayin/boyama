import {
  blush,
  circle,
  cloud,
  curve,
  ellipse,
  happyEye,
  inkLine,
  LINE,
  rect,
  region,
  scallop,
  shape,
  smile,
  smooth,
  symmetric,
  type Pt,
} from '../../dsl';
import type { Picture } from '../../types';
import { bird, bunnyFace, carrot, carrotLines, chubbyHead, leafFan, longEar, sunRays, toes, tube } from './helpers';

// mother bunny head
const HX = 345;
const HY = 455;
const R = 128;
// baby bunny head
const BX = 668;
const BY = 668;
const RB = 84;

const earL = { base: [HX - 46, HY - 78] as Pt, tip: [HX - 112, HY - 338] as Pt };
const earR = { base: [HX + 46, HY - 78] as Pt, tip: [HX + 100, HY - 342] as Pt };
const bEarL = { base: [BX - 28, BY - 52] as Pt, tip: [BX - 58, BY - 222] as Pt };
const bEarR = { base: [BX + 30, BY - 50] as Pt, tip: [BX + 166, BY - 128] as Pt };

const inner = (e: { base: Pt; tip: Pt }, k = 0.84): [Pt, Pt] => [
  [e.base[0] + (e.tip[0] - e.base[0]) * 0.1, e.base[1] + (e.tip[1] - e.base[1]) * 0.1],
  [e.base[0] + (e.tip[0] - e.base[0]) * k, e.base[1] + (e.tip[1] - e.base[1]) * k],
];

// carrot held by mum
const cTop: Pt = [HX + 100, 616];
const cTip: Pt = [HX - 92, 794];

/** Bunny mum with a carrot and her baby in a flowery meadow. */
export const bunnyMeadow: Picture = {
  id: 'pets-bunny-meadow',
  category: 'pets',
  title: 'Tavşan Ailesi',
  parts: {
    'ear-l': { anim: 'wag', pivot: earL.base, amp: 6, speed: 1.1 },
    'ear-r': { anim: 'wag', pivot: earR.base, amp: 6, speed: 1.1, phase: 0.5 },
    'baby-ear-l': { anim: 'wag', pivot: bEarL.base, amp: 8, speed: 1.4, phase: 0.25 },
    'baby-ear-r': { anim: 'wag', pivot: bEarR.base, amp: 8, speed: 1.4, phase: 0.75 },
    eyes: { anim: 'blink', pivot: [HX, HY + 0.04 * R], speed: 0.4 },
    'baby-eyes': { anim: 'blink', pivot: [BX, BY + 0.04 * RB], speed: 0.4, phase: 0.45 },
    rays: { anim: 'spin', pivot: [872, 128], speed: 0.15 },
    sprouts: { anim: 'sway', pivot: [905, 846], amp: 6, speed: 0.9 },
  },
  celebrate: { sound: 'boing', particles: 'hearts' },
  items: [
    region('sky', rect(0, 0, 1000, 1000), { outline: false, hint: '#D9EEFF' }),

    // sun
    ...sunRays(872, 128, 80, 106, 10, 'rays', 18),
    region('sun', circle(872, 128, 60), { hint: '#FFE27A' }),
    happyEye(851, 121, 20),
    happyEye(893, 121, 20),
    inkLine(smile(872, 144, 24, 7)),
    blush(838, 146, 9),
    blush(906, 146, 9),

    region('cloud', cloud(640, 165, 230, 108), { hint: '#FFFFFF' }),
    bird(110, 150, 40),
    bird(170, 205, 30),

    // land
    region('hill', shape([[-20, 1020, 1], [-20, 560], [240, 590], [520, 548], [790, 590], [1020, 560], [1020, 1020, 1]]), {
      hint: '#C8F0D0',
    }),
    region('meadow', shape([[-20, 1020, 1], [-20, 708], [230, 688], [500, 712], [760, 690], [1020, 712], [1020, 1020, 1]]), {
      hint: '#9FE0B2',
    }),
    inkLine(curve([[40, 760], [50, 736], [60, 762]]), LINE.fine),
    inkLine(curve([[580, 975], [592, 948], [602, 978]]), LINE.fine),
    inkLine(curve([[930, 742], [940, 718], [950, 744]]), LINE.fine),
    inkLine(curve([[250, 975], [262, 948], [272, 978]]), LINE.fine),

    // carrot patch
    region('sprout-a', leafFan([862, 852], -100, 92, 70, 3, 0.2), { part: 'sprouts', hint: '#9FE0B2' }),
    region('sprout-b', leafFan([950, 842], -80, 82, 70, 3, 0.2), { part: 'sprouts', hint: '#BDEBC8' }),
    region('carrot-a', ellipse(862, 872, 42, 36), { hint: '#FFC08A' }),
    region('carrot-b', ellipse(950, 864, 38, 32), { hint: '#FFC08A' }),
    region('soil', smooth([[782, 916], [806, 878], [860, 892], [906, 876], [960, 888], [1010, 870], [1030, 900], [1030, 950], [790, 950]]), {
      hint: '#C99A74',
    }),

    // ---- mum bunny ----
    region('ear-left', longEar(earL.base, earL.tip, 46), { part: 'ear-l', hint: '#FFF8FC' }),
    region('ear-left-inner', longEar(...inner(earL), 25), { part: 'ear-l', hint: '#FFC9DD' }),
    region('ear-right', longEar(earR.base, earR.tip, 46), { part: 'ear-r', hint: '#FFF8FC' }),
    region('ear-right-inner', longEar(...inner(earR), 25), { part: 'ear-r', hint: '#FFC9DD' }),
    region(
      'body',
      smooth(
        symmetric(
          [
            [HX, 525],
            [HX + 92, 548],
            [HX + 150, 628],
            [HX + 166, 724],
            [HX + 148, 806],
            [HX + 92, 852],
            [HX, 862],
          ],
          HX,
        ),
      ),
      { hint: '#FFF8FC' },
    ),
    region('belly', ellipse(HX, 726, 88, 104), { hint: '#FFE1EC' }),
    region('foot-left', ellipse(HX - 104, 856, 82, 36, -6), { hint: '#FFF8FC' }),
    region('foot-right', ellipse(HX + 104, 856, 82, 36, 6), { hint: '#FFF8FC' }),
    ...toes(HX - 168, 880, 50),
    ...toes(HX + 168, 880, 50),
    region('carrot-leaves', leafFan([cTop[0] + 8, cTop[1] - 8], -38, 100, 74, 3, 0.2), { hint: '#9FE0B2' }),
    region('carrot', carrot(cTop, cTip, 64), { hint: '#FFC08A' }),
    ...carrotLines(cTop, cTip, 64),
    // arms hugging the carrot
    region('arm-left', tube([[HX - 142, 628], [HX - 106, 700], [HX - 44, 736]], 50, 50), { hint: '#FFF8FC' }),
    region('arm-right', tube([[HX + 150, 650], [HX + 124, 690], [HX + 70, 680]], 48, 48), { hint: '#FFF8FC' }),
    region('head', chubbyHead(HX, HY, R, 0.86), { hint: '#FFF8FC' }),
    ...bunnyFace(HX, HY, R, { eyePart: 'eyes', lashes: true, whiskers: false }),

    // ---- baby bunny ----
    region('baby-ear-left', longEar(bEarL.base, bEarL.tip, 30), { part: 'baby-ear-l', hint: '#E8C4A0' }),
    region('baby-ear-left-inner', longEar(...inner(bEarL, 0.82), 16), { part: 'baby-ear-l', hint: '#FFC9DD' }),
    region('baby-ear-right', longEar(bEarR.base, bEarR.tip, 30), { part: 'baby-ear-r', hint: '#E8C4A0' }),
    region('baby-ear-right-inner', longEar(...inner(bEarR, 0.82), 16), { part: 'baby-ear-r', hint: '#FFC9DD' }),
    region(
      'baby-body',
      smooth(
        symmetric(
          [
            [BX, 718],
            [BX + 62, 732],
            [BX + 94, 784],
            [BX + 86, 834],
            [BX + 48, 856],
            [BX, 860],
          ],
          BX,
        ),
      ),
      { hint: '#E8C4A0' },
    ),
    region('baby-foot-left', ellipse(BX - 56, 856, 50, 25, -6), { hint: '#E8C4A0' }),
    region('baby-foot-right', ellipse(BX + 56, 856, 50, 25, 6), { hint: '#E8C4A0' }),
    ...toes(BX - 92, 872, 40),
    ...toes(BX + 92, 872, 40),
    region('baby-head', chubbyHead(BX, BY, RB, 0.86), { hint: '#E8C4A0' }),
    ...bunnyFace(BX, BY, RB, { eyePart: 'baby-eyes', look: [-0.4, -0.2], eye: 0.46, whiskers: false }),

    // flower
    region('flower', scallop(96, 880, 38), { hint: '#FFB8D9' }),
    region('flower-mid', circle(96, 880, 22), { hint: '#FFE27A' }),
    region('flower-2', scallop(500, 935, 30, 5, 0.65, -75), { hint: '#C9B8FF' }),
    region('flower-2-mid', circle(500, 935, 19), { hint: '#FFF4B0' }),
  ],
};
