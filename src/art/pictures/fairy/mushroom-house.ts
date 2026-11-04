import {
  circle,
  cloud,
  curve,
  decor,
  ellipse,
  INK,
  inkLine,
  ink,
  LINE,
  line,
  rect,
  region,
  roundPoly,
  scallop,
  shape,
  smooth,
  star,
  twinkle,
  WHITE,
} from '../../dsl';
import type { Picture } from '../../types';
import { fairy } from './kit';

const sparkle = (x: number, y: number, r: number, part?: string) =>
  decor(twinkle(x, y, r), { fill: WHITE, stroke: INK, width: 3, part });

const flyer = fairy({
  id: 'fairy',
  x: 828,
  y: 580,
  s: 0.64,
  hair: 'puffs',
  ears: true,
  skin: '#A8724F',
  hairHint: '#7A5A66',
  dress: '#9FE0B2',
  wingTop: '#B9D8FF',
  arms: [
    [-30, 100, -122, 70],
    [30, 100, 112, 118],
  ],
  legs: [
    [-14, 240, -22, 346],
    [14, 240, 38, 332],
  ],
  legW: 26,
  skirt: 'leaf',
  dressOne: true,
  wingPart: 'wings',
  eyePart: 'eyes',
  lashes: true,
  extraMid: [inkLine(line([[116, 136], [162, 10]]), 12), decor(line([[116, 136], [162, 10]]), { stroke: WHITE, width: 4 })],
  extraTop: [region('wand-star', star(166, -14, 52), { part: 'wand', hint: '#FFE27A' })],
});

/** Picture 2: a mushroom house in a magic forest with a little fairy flying by. */
export const mushroomHouse: Picture = {
  id: 'fairy-mushroom-house',
  category: 'fairy',
  title: 'Mantar Ev',
  parts: {
    wings: { anim: 'flap', pivot: flyer.wingPivot, amp: 0.4, speed: 2 },
    eyes: { anim: 'blink', pivot: flyer.eyePivot, speed: 0.45 },
    lantern: { anim: 'sway', pivot: [215, 500], amp: 7, speed: 0.8 },
    smoke: { anim: 'bob', pivot: [640, 70], amp: 10, speed: 0.7 },
    flowers: { anim: 'sway', pivot: [700, 930], amp: 5, speed: 0.6 },
    sparkle: { anim: 'twinkle', pivot: [470, 70], amp: 0.35, speed: 1.1 },
    wand: { anim: 'twinkle', pivot: flyer.P(166, -14), amp: 0.25, speed: 1.2 },
  },
  celebrate: { sound: 'magic', particles: 'sparkles' },
  items: [
    region('sky', rect(0, 0, 1000, 1000), { outline: false, hint: '#D9EEFF' }),
    region('cloud', cloud(830, 120, 250, 116), { hint: '#FFFFFF' }),
    sparkle(470, 70, 20, 'sparkle'),
    sparkle(330, 120, 12),
    sparkle(950, 300, 14),

    // forest behind
    region(
      'forest',
      shape([
        [-40, 780, 1],
        [-40, 560, 1],
        [20, 500],
        [80, 540, 1],
        [140, 490],
        [210, 540, 1],
        [270, 520],
        [330, 570, 1],
        [450, 560],
        [570, 580, 1],
        [660, 540],
        [740, 580, 1],
        [810, 560],
        [880, 600, 1],
        [940, 560],
        [1040, 590, 1],
        [1040, 780, 1],
      ]),
      { hint: '#C8F0D0' },
    ),
    region('tree-trunk', rect(60, 380, 64, 420, 24), { hint: '#C99A74' }),
    region(
      'tree-crown',
      smooth([
        [92, 160],
        [170, 176],
        [222, 240],
        [236, 320],
        [206, 400],
        [130, 432],
        [52, 420],
        [-10, 380],
        [-20, 280],
        [20, 196],
      ]),
      { hint: '#9FE0B2' },
    ),
    inkLine(curve([[60, 300], [80, 280], [104, 290]]), LINE.fine),
    inkLine(curve([[130, 230], [150, 214], [172, 226]]), LINE.fine),
    inkLine(curve([[150, 360], [170, 344], [192, 356]]), LINE.fine),

    // ground + path
    region('ground', shape([[-20, 1020, 1], [-20, 800], [250, 790], [520, 812], [800, 790], [1020, 806], [1020, 1020, 1]]), {
      hint: '#9FE0B2',
    }),
    region('path', shape([[404, 852], [500, 852], [536, 900], [524, 950], [580, 1020, 1], [300, 1020, 1], [340, 950], [376, 900]]), {
      hint: '#FFE7C2',
    }),
    decor(ellipse(452, 892, 30, 11), { stroke: INK, width: LINE.fine }),
    decor(ellipse(440, 944, 38, 13), { stroke: INK, width: LINE.fine }),
    decor(ellipse(446, 1000, 46, 15), { stroke: INK, width: LINE.fine }),
    inkLine(curve([[110, 930], [122, 902], [132, 932]]), LINE.fine),
    inkLine(curve([[880, 960], [892, 932], [902, 962]]), LINE.fine),
    inkLine(curve([[620, 990], [632, 962], [642, 992]]), LINE.fine),

    // ---- house ----
    region('chimney', [rect(586, 150, 54, 120, 10), rect(576, 134, 74, 30, 12)].join(' '), { hint: '#E8C4A0' }),
    decor(circle(626, 100, 13), { stroke: INK, width: LINE.fine, part: 'smoke' }),
    decor(circle(650, 66, 17), { stroke: INK, width: LINE.fine, part: 'smoke' }),
    decor(circle(632, 28, 21), { stroke: INK, width: LINE.fine, part: 'smoke' }),

    region(
      'house',
      shape([
        [318, 470, 1],
        [582, 470, 1],
        [600, 600],
        [616, 760],
        [632, 864, 1],
        [450, 874],
        [268, 864, 1],
        [284, 760],
        [300, 600],
      ]),
      { hint: '#FFF4E6' },
    ),
    region('cap-under', ellipse(450, 512, 262, 48), { hint: '#FFE1C7' }),
    ...[-180, -120, -60, 0, 60, 120, 180].map((dx) =>
      inkLine(line([[450 + dx * 0.92, 528], [450 + dx * 1.08, 552]]), LINE.fine),
    ),
    region(
      'cap',
      smooth([
        [450, 156],
        [592, 176],
        [702, 250],
        [756, 352],
        [758, 446],
        [706, 502],
        [450, 518],
        [194, 502],
        [142, 446],
        [144, 352],
        [198, 250],
        [308, 176],
      ]),
      { hint: '#FFADB9' },
    ),
    region('spot-1', ellipse(320, 300, 50, 44, -20), { hint: '#FFFFFF' }),
    region('spot-2', ellipse(500, 228, 44, 34), { hint: '#FFFFFF' }),
    region('spot-3', ellipse(640, 350, 46, 50, 15), { hint: '#FFFFFF' }),
    region('spot-4', ellipse(452, 400, 48, 40), { hint: '#FFFFFF' }),
    region('spot-5', ellipse(222, 430, 36, 30, 20), { hint: '#FFFFFF' }),

    // door
    region('door', shape([[395, 870, 1], [395, 712], [410, 670], [450, 652], [490, 670], [505, 712], [505, 870, 1]]), {
      hint: '#E8C4A0',
    }),
    decor(circle(450, 712, 18), { stroke: INK, width: LINE.fine }),
    inkLine(line([[432, 756], [432, 856]]), LINE.fine),
    inkLine(line([[468, 756], [468, 856]]), LINE.fine),
    ink(circle(488, 790, 7)),
    // windows
    region('window-left', circle(340, 620, 40), { hint: '#FFF0A0' }),
    inkLine(line([[340, 582], [340, 658]]), LINE.inner),
    inkLine(line([[302, 620], [378, 620]]), LINE.inner),
    region('window-right', circle(560, 620, 40), { hint: '#FFF0A0' }),
    inkLine(line([[560, 582], [560, 658]]), LINE.inner),
    inkLine(line([[522, 620], [598, 620]]), LINE.inner),

    // lantern (hangs from the cap and swings)
    inkLine(line([[215, 500], [215, 560]]), LINE.inner, 'lantern'),
    region(
      'lantern-frame',
      [roundPoly([[194, 560], [236, 560], [256, 594], [174, 594]], 0.3), rect(182, 646, 66, 18, 9)].join(' '),
      { part: 'lantern', hint: '#C9B8FF' },
    ),
    region('lantern-glass', rect(188, 590, 54, 60, 12), { part: 'lantern', hint: '#FFF0A0' }),
    decor(smooth([[215, 600], [228, 622], [215, 640], [202, 622]]), { stroke: INK, width: LINE.fine, part: 'lantern' }),

    // flowers
    inkLine(curve([[240, 905], [236, 880], [240, 850]]), LINE.inner, 'flowers'),
    region('flower-left', scallop(240, 842, 30, 5, 0.65, -90), { part: 'flowers', hint: '#D7C2FF' }),
    decor(circle(240, 842, 15), { stroke: INK, width: LINE.fine, part: 'flowers' }),
    inkLine(curve([[700, 930], [704, 900], [700, 870]]), LINE.inner, 'flowers'),
    region('flower-right', scallop(700, 862, 32, 5, 0.65, -80), { part: 'flowers', hint: '#FFE27A' }),
    decor(circle(700, 862, 16), { stroke: INK, width: LINE.fine, part: 'flowers' }),

    // ---- fairy ----
    ...flyer.items,
    sparkle(735, 760, 12),
  ],
};
