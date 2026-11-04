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
  petal,
  rect,
  region,
  scallop,
  shape,
  smile,
  smooth,
  star,
  twinkle,
  WHITE,
} from '../../dsl';
import type { Picture } from '../../types';
import { capsule } from './helpers';
import { fairy } from './kit';

const sparkle = (x: number, y: number, r: number, part?: string) =>
  decor(twinkle(x, y, r), { fill: WHITE, stroke: INK, width: 3, part });

const sitter = fairy({
  id: 'fairy',
  x: 480,
  y: 318,
  s: 0.92,
  hair: 'braids',
  skin: '#D9A27E',
  hairHint: '#9C7A6A',
  dress: '#D7C2FF',
  top: '#FFC9DD',
  wingTop: '#9ED6FF',
  wingBottom: '#BDEBC8',
  shoeHint: '#FFADB9',
  wings4: true,
  wingTilt: 4,
  skirt: 'sit',
  arms: [
    [-30, 100, -112, 166],
    [30, 100, 112, 38],
  ],
  legs: [
    [-20, 220, -28, 318],
    [20, 220, 32, 312],
  ],
  legW: 24,
  shoes: [
    [-30, 326, -12],
    [34, 320, 12],
  ],
  legPart: 'legs',
  wingPart: 'wings',
  eyePart: 'eyes',
  look: [-0.4, 0.2],
  extraMid: [region('wand-stick', capsule(106, 62, 178, -96, 16), { hint: '#FFF4E6' })],
  extraTop: [
    region('wand-star', star(184, -120, 46), { part: 'wand', hint: '#FFE27A' }),
    decor(twinkle(238, -156, 11), { fill: WHITE, stroke: INK, width: 3, part: 'wand' }),
    decor(twinkle(130, -170, 8), { fill: WHITE, stroke: INK, width: 3, part: 'wand' }),
  ],
});

const C: [number, number] = [480, 566];

/** Picture 3: a fairy sitting on a big flower, with a ladybug and a snail friend. */
export const flowerSeat: Picture = {
  id: 'fairy-flower-seat',
  category: 'fairy',
  title: 'Çiçekteki Peri',
  parts: {
    wings: { anim: 'flap', pivot: sitter.wingPivot, amp: 0.35, speed: 1.6 },
    eyes: { anim: 'blink', pivot: sitter.eyePivot, speed: 0.45 },
    wand: { anim: 'twinkle', pivot: sitter.P(184, -120), amp: 0.25, speed: 1.2 },
    legs: { anim: 'wag', pivot: sitter.P(0, 220), amp: 6, speed: 1.1 },
    ladybug: { anim: 'bob', pivot: [300, 790], amp: 6, speed: 1.2 },
    snail: { anim: 'sway', pivot: [790, 950], amp: 3, speed: 0.6 },
    snailEyes: { anim: 'blink', pivot: [700, 862], speed: 0.4, phase: 0.5 },
    sparkle: { anim: 'twinkle', pivot: [880, 330], amp: 0.35, speed: 1 },
  },
  celebrate: { sound: 'magic', particles: 'sparkles' },
  items: [
    region('sky', rect(0, 0, 1000, 1000), { outline: false, hint: '#FFF4E6' }),

    // sun + cloud
    region('sun', circle(130, 130, 66), { hint: '#FFE27A' }),
    happyEye(106, 124, 22),
    happyEye(154, 124, 22),
    inkLine(smile(130, 146, 26, 7)),
    blush(94, 148, 10),
    blush(166, 148, 10),
    region('cloud', cloud(830, 150, 250, 116), { hint: '#FFFFFF' }),
    sparkle(880, 330, 18, 'sparkle'),
    sparkle(300, 90, 14),
    sparkle(90, 420, 12),

    // hills
    region('hill', shape([[-20, 1020, 1], [-20, 790], [220, 740], [480, 770], [760, 730], [1020, 770], [1020, 1020, 1]]), {
      hint: '#C8F0D0',
    }),

    // stem + leaves
    region(
      'stem',
      smooth([
        [466, 640],
        [496, 640],
        [492, 760],
        [482, 880],
        [488, 1010],
        [454, 1010],
        [448, 880],
        [460, 760],
      ]),
      { hint: '#9FE0B2' },
    ),
    region('leaf-left', petal([466, 860], [196, 780], 62), { hint: '#9FE0B2' }),
    inkLine(curve([[452, 852], [360, 818], [240, 788]]), LINE.fine),
    region('leaf-right', petal([480, 920], [760, 858], 54), { hint: '#BDEBC8' }),
    inkLine(curve([[494, 912], [600, 884], [720, 866]]), LINE.fine),

    // ground
    region('ground', shape([[-20, 1020, 1], [-20, 930], [260, 912], [520, 936], [780, 908], [1020, 926], [1020, 1020, 1]]), {
      hint: '#9FE0B2',
    }),
    inkLine(curve([[80, 980], [92, 952], [102, 982]]), LINE.fine),
    inkLine(curve([[600, 990], [612, 962], [622, 992]]), LINE.fine),

    // ---- flower seat ----
    region('petal-back-left', petal([C[0] - 10, C[1] - 6], [150, 500], 66), { hint: '#FFB8D9' }),
    region('petal-back-right', petal([C[0] + 10, C[1] - 6], [810, 500], 66), { hint: '#FFB8D9' }),

    // ---- fairy (wings + hair behind) ----
    ...sitter.layers.wings,
    ...sitter.layers.back,

    // front petals (the fairy sits on them, legs dangle over)
    region('petal-front-left', petal([C[0] - 6, C[1] + 10], [222, 650], 62), { hint: '#FFC9DD' }),
    region('petal-front-right', petal([C[0] + 6, C[1] + 10], [738, 650], 62), { hint: '#FFC9DD' }),
    region(
      'petal-front',
      smooth([
        [426, 572],
        [534, 572],
        [560, 636],
        [528, 694],
        [480, 712],
        [432, 694],
        [400, 636],
      ]),
      { hint: '#FFADB9' },
    ),
    inkLine(curve([[262, 640], [290, 628], [318, 628]]), LINE.fine),
    inkLine(curve([[698, 640], [670, 628], [642, 628]]), LINE.fine),

    ...sitter.layers.legs,
    ...sitter.layers.body,
    ...sitter.layers.head,

    // ---- ladybug on the left leaf ----
    inkLine(curve([[244, 772], [232, 750], [216, 744]]), LINE.fine, 'ladybug'),
    inkLine(curve([[266, 766], [268, 742], [258, 728]]), LINE.fine, 'ladybug'),
    ink(circle(216, 744, 5.5), 'ladybug'),
    ink(circle(258, 728, 5.5), 'ladybug'),
    region('ladybug-head', circle(254, 796, 30), { part: 'ladybug', hint: '#B8A6CC' }),
    decor(circle(240, 792, 8.5), { fill: WHITE, stroke: INK, width: 2.5, part: 'ladybug' }),
    decor(circle(263, 790, 8.5), { fill: WHITE, stroke: INK, width: 2.5, part: 'ladybug' }),
    ink(circle(239, 794, 4.5), 'ladybug'),
    ink(circle(262, 792, 4.5), 'ladybug'),
    inkLine(smile(251, 808, 12, 3.5), LINE.fine, 'ladybug'),
    region('ladybug', ellipse(330, 790, 52, 42, -12), { part: 'ladybug', hint: '#FF9FA8' }),
    inkLine(line([[318, 750], [342, 830]]), LINE.inner, 'ladybug'),
    ink(circle(304, 784, 9), 'ladybug'),
    ink(circle(318, 815, 7.5), 'ladybug'),
    ink(circle(352, 770, 9), 'ladybug'),
    ink(circle(360, 806, 7.5), 'ladybug'),

    // ---- snail on the ground ----
    region(
      'snail-body',
      smooth([
        [668, 950],
        [664, 908],
        [672, 864],
        [700, 840],
        [732, 852],
        [744, 900],
        [820, 912],
        [900, 920],
        [920, 944],
        [880, 956],
      ]),
      { part: 'snail', hint: '#FFE7C2' },
    ),
    inkLine(curve([[690, 846], [680, 812], [668, 796]]), LINE.inner, 'snail'),
    inkLine(curve([[716, 846], [724, 810], [738, 794]]), LINE.inner, 'snail'),
    ink(circle(667, 793, 8), 'snail'),
    ink(circle(739, 791, 8), 'snail'),
    ...cuteEye(690, 878, 24, { part: 'snailEyes' }),
    ...cuteEye(720, 878, 24, { part: 'snailEyes' }),
    inkLine(smile(705, 902, 14, 4), LINE.fine, 'snail'),
    blush(682, 900, 7, 5, 'snail'),
    blush(730, 900, 7, 5, 'snail'),
    region('snail-shell', circle(820, 862, 64), { part: 'snail', hint: '#C9B8FF' }),
    inkLine(
      curve([
        [820, 862],
        [836, 856],
        [838, 876],
        [816, 886],
        [796, 866],
        [806, 836],
        [840, 828],
        [866, 852],
        [862, 894],
        [826, 914],
      ]),
      LINE.inner,
      'snail',
    ),

    // little flower in the grass
    inkLine(curve([[110, 940], [106, 912], [112, 884]]), LINE.inner),
    region('daisy', scallop(112, 876, 28, 6, 0.6, -90), { hint: '#FFF0A0' }),
    decor(circle(112, 876, 14), { stroke: INK, width: LINE.fine }),
  ],
};
