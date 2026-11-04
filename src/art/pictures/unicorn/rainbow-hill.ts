import {
  blush,
  cloud,
  cuteEye,
  curve,
  ellipse,
  happyEye,
  ink,
  inkLine,
  LINE,
  petal,
  rect,
  region,
  ringSegment,
  scallop,
  shape,
  smile,
  smooth,
  star,
  circle,
  twinkle,
  decor,
} from '../../dsl';
import { curlLock } from './helpers';
import type { Picture } from '../../types';

/** Reference picture: chibi unicorn in front of a rainbow. */
export const rainbowHill: Picture = {
  id: 'unicorn-rainbow-hill',
  category: 'unicorn',
  title: 'Gökkuşağı Tepesi',
  parts: {
    eye: { anim: 'blink', pivot: [655, 448], speed: 0.45, parent: 'head' },
    tail: { anim: 'wag', pivot: [312, 668], amp: 9, speed: 1.4 },
    rays: { anim: 'spin', pivot: [845, 150], speed: 0.12 },
    star1: { anim: 'twinkle', pivot: [130, 330] },
    star2: { anim: 'twinkle', pivot: [930, 420], phase: 0.5 },
    head: { anim: 'sway', pivot: [600, 560], amp: 2, speed: 0.7 },
  },
  celebrate: { sound: 'magic', particles: 'stars' },
  items: [
    region('sky', rect(0, 0, 1000, 1000), { outline: false, hint: '#D9EEFF' }),

    // sun
    region('sun-rays', star(845, 150, 108, 82, 12, -90, 0.32), { part: 'rays', hint: '#FFD98A' }),
    region('sun', circle(845, 150, 66), { hint: '#FFF1A0' }),
    happyEye(822, 142, 22),
    happyEye(868, 142, 22),
    inkLine(smile(845, 168, 28, 8)),
    blush(808, 170, 11),
    blush(882, 170, 11),

    region('cloud-top', cloud(215, 175, 250, 120), { hint: '#FFFFFF' }),
    region('star1', star(130, 330, 42), { part: 'star1', hint: '#FFE27A' }),
    region('star2', star(930, 420, 34), { part: 'star2', hint: '#FFC6E0' }),
    decor(twinkle(380, 120, 16), { fill: '#FFFFFF', stroke: '#4E3D63', width: 3 }),
    decor(twinkle(620, 200, 12), { fill: '#FFFFFF', stroke: '#4E3D63', width: 3 }),

    // rainbow
    region('rainbow-1', ringSegment(470, 760, 400, 432, 180, 360), { hint: '#FFADB9' }),
    region('rainbow-2', ringSegment(470, 760, 368, 400, 180, 360), { hint: '#FFD3A5' }),
    region('rainbow-3', ringSegment(470, 760, 336, 368, 180, 360), { hint: '#FFF0A0' }),
    region('rainbow-4', ringSegment(470, 760, 304, 336, 180, 360), { hint: '#BDEBC8' }),
    region('rainbow-5', ringSegment(470, 760, 272, 304, 180, 360), { hint: '#B9D8FF' }),
    region('cloud-left', cloud(105, 735, 260, 140), { hint: '#FFFFFF' }),
    region('cloud-right', cloud(845, 735, 260, 140), { hint: '#FFFFFF' }),

    // land
    region('hill', shape([[-20, 1020, 1], [-20, 790], [200, 745], [460, 785], [720, 735], [1020, 770], [1020, 1020, 1]]), {
      hint: '#C8F0D0',
    }),
    region('ground', shape([[-20, 1020, 1], [-20, 885], [260, 850], [520, 878], [800, 846], [1020, 872], [1020, 1020, 1]]), {
      hint: '#9FE0B2',
    }),
    inkLine(curve([[80, 960], [92, 930], [100, 962]]), LINE.fine),
    inkLine(curve([[560, 965], [572, 938], [582, 968]]), LINE.fine),
    inkLine(curve([[930, 975], [940, 948], [950, 976]]), LINE.fine),
    inkLine(curve([[690, 950], [700, 924], [708, 952]]), LINE.fine),
    inkLine(curve([[712, 954], [724, 932], [732, 958]]), LINE.fine),

    // ---- unicorn ----
    // tail (behind body): three curly, tapered locks fanning out
    region('tail-1', curlLock([[322, 652], [288, 612], [240, 590], [192, 598]], 70, 32, 1), { part: 'tail', hint: '#FFB8D9' }),
    region('tail-2', curlLock([[318, 672], [272, 680], [232, 708], [210, 750]], 66, 30, 1), { part: 'tail', hint: '#D7C2FF' }),
    region('tail-3', curlLock([[322, 694], [300, 736], [290, 784], [296, 820]], 58, 26, 1), { part: 'tail', hint: '#B6E3FF' }),

    // far legs (slightly behind)
    region('leg-back-far', rect(305, 735, 54, 118, 26), { hint: '#F6E9FA' }),
    region('hoof-back-far', rect(302, 826, 60, 40, 15), { hint: '#C9B6F2' }),
    region('leg-front-far', rect(495, 735, 54, 118, 26), { hint: '#F6E9FA' }),
    region('hoof-front-far', rect(492, 826, 60, 40, 15), { hint: '#C9B6F2' }),

    region('body', ellipse(452, 700, 158, 100), { hint: '#FFF8FC' }),

    // near legs
    region('leg-back-near', rect(362, 745, 56, 120, 27), { hint: '#FFF8FC' }),
    region('hoof-back-near', rect(359, 838, 62, 40, 15), { hint: '#B9A2F0' }),
    region('leg-front-near', rect(555, 745, 56, 120, 27), { hint: '#FFF8FC' }),
    region('hoof-front-near', rect(552, 838, 62, 40, 15), { hint: '#B9A2F0' }),

    // neck + mane
    region('neck', smooth([[520, 648], [602, 628], [652, 548], [622, 468], [540, 498], [500, 584]]), {
      part: 'head',
      hint: '#FFF8FC',
    }),
    region('mane-3', curlLock([[556, 480], [520, 530], [500, 590], [500, 628]], 60, 28, 1), { part: 'head', hint: '#C9B8FF' }),
    region('mane-2', curlLock([[575, 400], [530, 440], [500, 492], [488, 540]], 66, 30, 1), { part: 'head', hint: '#FFC2DE' }),

    // ear behind head
    region('ear', petal([598, 372], [568, 262], 40), { part: 'head', hint: '#FFF8FC' }),
    region('ear-inner', petal([598, 362], [575, 286], 21), { part: 'head', hint: '#FFC9DD' }),

    region('head', ellipse(640, 442, 118, 102, -6), { part: 'head', hint: '#FFF8FC' }),
    region('muzzle', ellipse(735, 492, 74, 58, -12), { part: 'head', hint: '#FFE1EC' }),
    ink(ellipse(770, 470, 7, 10, -12), 'head'),
    inkLine(curve([[722, 522], [742, 532], [764, 524]]), LINE.inner, 'head'),

    // horn + forelock
    region('horn', shape([[636, 358], [722, 212, 1], [694, 368]], 1.1), { part: 'head', hint: '#FFE39A' }),
    inkLine(curve([[648, 330], [672, 324], [692, 334]]), LINE.fine, 'head'),
    inkLine(curve([[665, 292], [684, 286], [700, 296]]), LINE.fine, 'head'),
    inkLine(curve([[683, 255], [698, 250], [708, 258]]), LINE.fine, 'head'),
    region('mane-1', curlLock([[590, 372], [544, 374], [506, 400], [484, 442]], 64, 30, 1), { part: 'head', hint: '#D7C2FF' }),
    region('forelock', curlLock([[686, 362], [644, 348], [602, 360], [582, 396]], 60, 26, -1), { part: 'head', hint: '#FFC2DE' }),

    // face details (decor, part of the head so they move with it)
    ...cuteEye(655, 448, 64, { lashes: 'right', part: 'eye' }),
    blush(626, 500, 22, 14, 'head'),

    // flowers
    region('flower-1', scallop(120, 905, 34), { hint: '#FFB1C8' }),
    region('flower-1-mid', circle(120, 905, 20), { hint: '#FFE27A' }),
    region('flower-2', scallop(870, 915, 36, 5, 0.65, -70), { hint: '#C9B8FF' }),
    region('flower-2-mid', circle(870, 915, 21), { hint: '#FFE27A' }),
  ],
};
