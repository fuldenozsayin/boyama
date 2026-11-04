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
import type { Picture } from '../../types';

/** Reference picture: chibi unicorn in front of a rainbow. */
export const rainbowHill: Picture = {
  id: 'unicorn-rainbow-hill',
  category: 'unicorn',
  title: 'Gökkuşağı Tepesi',
  parts: {
    eye: { anim: 'blink', pivot: [655, 448], speed: 0.45 },
    tail: { anim: 'wag', pivot: [312, 668], amp: 9, speed: 1.4 },
    rays: { anim: 'spin', pivot: [845, 150], speed: 0.12 },
    star1: { anim: 'twinkle', pivot: [130, 330] },
    star2: { anim: 'twinkle', pivot: [930, 420], phase: 0.5 },
    head: { anim: 'sway', pivot: [600, 560], amp: 3, speed: 0.7 },
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

    // ---- unicorn ----
    // tail (behind body)
    region('tail-1', smooth([[318, 628], [262, 572], [192, 566], [148, 606], [176, 642], [222, 626], [272, 652]]), {
      part: 'tail',
      hint: '#FFB8D9',
    }),
    region('tail-2', smooth([[312, 656], [236, 648], [176, 690], [168, 752], [208, 764], [222, 716], [276, 692]]), {
      part: 'tail',
      hint: '#D7C2FF',
    }),
    region('tail-3', smooth([[318, 690], [266, 712], [236, 772], [252, 824], [290, 812], [282, 764], [322, 728]]), {
      part: 'tail',
      hint: '#B6E3FF',
    }),

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
    region('mane-2', smooth([[530, 446], [476, 474], [454, 540], [470, 596], [508, 586], [518, 526], [552, 492]]), {
      part: 'head',
      hint: '#FFC2DE',
    }),
    region('mane-3', smooth([[508, 560], [470, 598], [468, 650], [504, 668], [524, 628], [538, 590]]), {
      part: 'head',
      hint: '#C9B8FF',
    }),

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
    region('forelock', smooth([[668, 352], [610, 334], [562, 362], [560, 412], [596, 404], [628, 384]]), {
      part: 'head',
      hint: '#FFC2DE',
    }),
    region('mane-1', smooth([[586, 352], [530, 362], [492, 410], [500, 462], [536, 452], [552, 408]]), {
      part: 'head',
      hint: '#D7C2FF',
    }),

    // face details (decor, part of the head so they move with it)
    ...cuteEye(655, 448, 64, { lashes: 'right', part: 'eye' }),
    blush(626, 500, 22, 14, 'head'),

    // flowers
    region('flower-1', scallop(120, 905, 34), { hint: '#FFB1C8' }),
    region('flower-1-mid', circle(120, 905, 20), { hint: '#FFE27A' }),
    region('flower-2', scallop(870, 915, 36, 5, 0.65, -70), { hint: '#C9B8FF' }),
    region('flower-2-mid', circle(870, 915, 21), { hint: '#FFE27A' }),
    region('flower-3', scallop(700, 945, 32, 5, 0.65, -80), { hint: '#9ED6FF' }),
    region('flower-3-mid', circle(700, 945, 20), { hint: '#FFF4B0' }),
  ],
};
