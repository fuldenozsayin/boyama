import {
  blush,
  circle,
  cloud,
  curve,
  cuteEye,
  decor,
  ellipse,
  happyEye,
  inkLine,
  LINE,
  mirrorX,
  rect,
  region,
  roundPoly,
  scale,
  scallop,
  shape,
  smile,
  smooth,
  star,
  symmetric,
  twinkle,
  INK,
  WHITE,
} from '../../dsl';
import type { Picture } from '../../types';
import { capsule } from './helpers';

// ---- wings (drawn once on the left, mirrored for the right) ----
const wingTopL = smooth([
  [478, 540],
  [420, 462],
  [338, 340],
  [256, 232],
  [168, 192],
  [96, 236],
  [88, 344],
  [146, 446],
  [268, 520],
  [400, 562],
]);
const wingBotL = smooth([
  [478, 582],
  [400, 586],
  [300, 600],
  [222, 650],
  [212, 738],
  [276, 784],
  [356, 748],
  [432, 664],
]);
const wingTopInL = scale(wingTopL, 0.6, 0.6, 210, 330);
const wingBotInL = scale(wingBotL, 0.55, 0.55, 286, 700);

const sparkle = (x: number, y: number, r: number, part?: string) =>
  decor(twinkle(x, y, r), { fill: WHITE, stroke: INK, width: 3, part });

/** Picture 1 (easiest): a little fairy with big wings, a flower crown and a star wand. */
export const flowerCrown: Picture = {
  id: 'fairy-flower-crown',
  category: 'fairy',
  title: 'Çiçek Taçlı Peri',
  parts: {
    wings: { anim: 'flap', pivot: [500, 560], amp: 0.35, speed: 1.6 },
    eyes: { anim: 'blink', pivot: [500, 392], speed: 0.45 },
    wand: { anim: 'twinkle', pivot: [752, 352], amp: 0.22, speed: 1.2 },
    sparkleA: { anim: 'twinkle', pivot: [330, 110], amp: 0.35, speed: 1.1 },
    sparkleB: { anim: 'twinkle', pivot: [925, 600], amp: 0.35, speed: 1.1, phase: 0.5 },
    flower: { anim: 'sway', pivot: [150, 975], amp: 6, speed: 0.7 },
  },
  celebrate: { sound: 'magic', particles: 'sparkles' },
  items: [
    region('sky', rect(0, 0, 1000, 1000), { outline: false, hint: '#EDE4FF' }),

    // sun + cloud
    region('sun', circle(100, 90, 56), { hint: '#FFF0A0' }),
    happyEye(80, 84, 18),
    happyEye(120, 84, 18),
    inkLine(smile(100, 104, 22, 6)),
    blush(70, 106, 9),
    blush(130, 106, 9),
    region('cloud', cloud(868, 92, 224, 106), { hint: '#FFFFFF' }),

    sparkle(330, 110, 20, 'sparkleA'),
    sparkle(640, 92, 14),
    sparkle(60, 600, 14),
    sparkle(925, 600, 20, 'sparkleB'),
    sparkle(800, 800, 12),

    // ground
    region('hill', shape([[-20, 1020, 1], [-20, 872], [220, 842], [500, 862], [780, 838], [1020, 866], [1020, 1020, 1]]), {
      hint: '#BDEBC8',
    }),
    inkLine(curve([[300, 930], [312, 902], [322, 932]]), LINE.fine),
    // hill flower
    inkLine(curve([[150, 975], [144, 940], [150, 900]]), LINE.inner, 'flower'),
    inkLine(curve([[146, 950], [118, 930], [102, 938], [124, 956], [146, 950]]), LINE.fine, 'flower'),
    region('hill-flower', scallop(150, 888, 36, 5, 0.65, -90), { part: 'flower', hint: '#D7C2FF' }),
    decor(circle(150, 888, 19), { stroke: INK, width: LINE.fine, part: 'flower' }),
    inkLine(curve([[690, 940], [702, 912], [712, 942]]), LINE.fine),
    inkLine(curve([[880, 960], [892, 932], [902, 962]]), LINE.fine),

    // ---- fairy ----
    // wings (behind everything)
    region('wing-top-left', wingTopL, { part: 'wings', hint: '#C9B8FF' }),
    region('wing-top-right', mirrorX(wingTopL), { part: 'wings', hint: '#C9B8FF' }),
    region('wing-bottom-left', wingBotL, { part: 'wings', hint: '#FFC9DD' }),
    region('wing-bottom-right', mirrorX(wingBotL), { part: 'wings', hint: '#FFC9DD' }),
    decor(wingTopInL, { stroke: INK, width: LINE.fine, part: 'wings' }),
    decor(mirrorX(wingTopInL), { stroke: INK, width: LINE.fine, part: 'wings' }),
    decor(wingBotInL, { stroke: INK, width: LINE.fine, part: 'wings' }),
    decor(mirrorX(wingBotInL), { stroke: INK, width: LINE.fine, part: 'wings' }),

    // long wavy hair behind the head
    region(
      'hair-back',
      smooth(
        symmetric([
          [500, 186],
          [604, 198],
          [676, 262],
          [702, 362],
          [694, 452],
          [716, 532],
          [690, 598],
          [636, 600],
          [612, 548],
          [560, 520],
          [500, 516],
        ]),
      ),
      { hint: '#C99A74' },
    ),

    // wand stick (under the hand)
    region('wand-stick', capsule(600, 604, 736, 396, 18), { hint: '#FFF4E6' }),

    // legs + shoes (peek out under the skirt)
    region('legs', [rect(458, 740, 32, 112, 16), rect(510, 740, 32, 112, 16)].join(' '), { hint: '#F5C9A6' }),
    region('shoes', [ellipse(465, 856, 32, 19, -6), ellipse(535, 856, 32, 19, 6)].join(' '), { hint: '#FFADB9' }),

    // arms (behind the dress at the shoulders)
    region(
      'arms',
      [capsule(452, 500, 390, 590, 42), capsule(548, 500, 612, 584, 42)].join(' '),
      { hint: '#F5C9A6' },
    ),

    // dress
    region(
      'skirt',
      shape([
        [446, 556, 1],
        [554, 556, 1],
        [610, 620],
        [656, 692],
        [672, 740, 1],
        [640, 778],
        [604, 754, 1],
        [570, 790],
        [534, 762, 1],
        [500, 796],
        [466, 762, 1],
        [430, 790],
        [396, 754, 1],
        [360, 778],
        [328, 740, 1],
        [344, 692],
        [390, 620],
      ]),
      { hint: '#FFB8D9' },
    ),
    region('bodice', roundPoly([[452, 466], [548, 466], [566, 572], [434, 572]], 0.28), { hint: '#FFE27A' }),
    inkLine(curve([[470, 520], [500, 534], [530, 520]]), LINE.fine),

    // head
    region('face', ellipse(500, 352, 150, 138), { hint: '#F5C9A6' }),
    region(
      'bangs',
      shape([
        [352, 384, 1],
        [340, 296],
        [384, 220],
        [500, 186],
        [616, 220],
        [660, 296],
        [648, 384, 1],
        [626, 316],
        [572, 270],
        [500, 286, 1],
        [428, 270],
        [374, 316],
      ]),
      { hint: '#C99A74' },
    ),

    // face details
    ...cuteEye(448, 392, 66, { lashes: 'left', part: 'eyes' }),
    ...cuteEye(552, 392, 66, { lashes: 'right', part: 'eyes' }),
    inkLine(smile(500, 440, 34, 9)),
    blush(410, 432, 22),
    blush(590, 432, 22),

    // flower crown
    region('flower-left', scallop(406, 222, 26, 5, 0.65, -100), { hint: '#FFADB9' }),
    decor(circle(406, 222, 14), { stroke: INK, width: LINE.fine }),
    region('flower-right', scallop(594, 222, 26, 5, 0.65, -80), { hint: '#9ED6FF' }),
    decor(circle(594, 222, 14), { stroke: INK, width: LINE.fine }),
    region('flower-middle', scallop(500, 192, 32, 5, 0.65, -90), { hint: '#FFF0A0' }),
    decor(circle(500, 192, 17), { stroke: INK, width: LINE.fine }),

    // wand star
    region('wand-star', star(752, 352, 56), { part: 'wand', hint: '#FFE27A' }),
    decor(twinkle(780, 290, 10), { fill: WHITE, stroke: INK, width: 3, part: 'wand' }),
  ],
};
