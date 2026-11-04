import {
  blush,
  cloud,
  curve,
  happyEye,
  heart,
  inkLine,
  ink,
  circle,
  line,
  LINE,
  rect,
  region,
  scallop,
  shape,
  smile,
  star,
} from '../../dsl';
import type { Picture } from '../../types';
import { sparkle } from './helpers';

/** cone roof with a softly curved rim */
const roof = (cx: number, baseY: number, halfW: number, h: number) =>
  shape([
    [cx - halfW, baseY, 1],
    [cx - halfW * 0.42, baseY - h * 0.55],
    [cx, baseY - h, 1],
    [cx + halfW * 0.42, baseY - h * 0.55],
    [cx + halfW, baseY, 1],
    [cx, baseY + 18],
  ]);

/** waving pennant attached to a pole at (x, y) (top of the flag) */
const pennant = (x: number, y: number, len: number, h: number) =>
  shape([
    [x, y, 1],
    [x + len * 0.5, y + h * 0.02],
    [x + len, y + h * 0.42, 1],
    [x + len * 0.5, y + h * 0.78],
    [x, y + h, 1],
  ]);

/** arched window (round top) */
const archWindow = (cx: number, top: number, w: number, h: number) =>
  shape([
    [cx - w / 2, top + h, 1],
    [cx - w / 2, top + w * 0.45],
    [cx - w * 0.3, top + w * 0.1],
    [cx, top],
    [cx + w * 0.3, top + w * 0.1],
    [cx + w / 2, top + w * 0.45],
    [cx + w / 2, top + h, 1],
  ]);

/** Picture 2: a fairy-tale castle on a hill with a smiling sun. */
export const princessCastle: Picture = {
  id: 'princess-fairy-castle',
  category: 'princess',
  title: 'Masal Şatosu',
  parts: {
    rays: { anim: 'spin', pivot: [858, 150], speed: 0.12 },
    sunFace: { anim: 'pulse', pivot: [858, 150], amp: 0.05, speed: 1 },
    flagMid: { anim: 'wag', pivot: [503, 70], amp: 10, speed: 1.4 },
    flagLeft: { anim: 'wag', pivot: [298, 215], amp: 10, speed: 1.4, phase: 0.3 },
    flagRight: { anim: 'wag', pivot: [708, 215], amp: 10, speed: 1.4, phase: 0.6 },
    heartWindow: { anim: 'pulse', pivot: [500, 372], amp: 0.1, speed: 1.2 },
    cloud1: { anim: 'bob', pivot: [180, 175], amp: 10, speed: 0.5 },
    cloud2: { anim: 'bob', pivot: [880, 420], amp: 10, speed: 0.5, phase: 0.5 },
    sparkle1: { anim: 'twinkle', pivot: [130, 330] },
    sparkle2: { anim: 'twinkle', pivot: [610, 70], phase: 0.5 },
  },
  celebrate: { sound: 'magic', particles: 'sparkles' },
  items: [
    region('sky', rect(0, 0, 1000, 1000), { outline: false, hint: '#D9EEFF' }),

    // sun with a happy face
    region('sun-rays', star(858, 150, 108, 82, 12, -90, 0.32), { part: 'rays', hint: '#FFD98A' }),
    region('sun', circle(858, 150, 66), { part: 'sunFace', hint: '#FFF1A0' }),
    happyEye(835, 142, 22, 'sunFace'),
    happyEye(881, 142, 22, 'sunFace'),
    inkLine(smile(858, 168, 28, 8), LINE.inner, 'sunFace'),
    blush(821, 170, 11, 7, 'sunFace'),
    blush(895, 170, 11, 7, 'sunFace'),

    region('cloud-left', cloud(180, 175, 250, 120), { part: 'cloud1', hint: '#FFFFFF' }),
    region('cloud-right', cloud(880, 420, 200, 100), { part: 'cloud2', hint: '#FFFFFF' }),
    sparkle(130, 330, 20, 'sparkle1'),
    sparkle(610, 70, 16, 'sparkle2'),
    sparkle(80, 520, 14),
    sparkle(940, 290, 14),

    // ---- castle ----
    // central tall tower
    region('tower-middle', rect(420, 270, 160, 470, 6), { hint: '#FFF4E6' }),
    inkLine(line([[503, 104], [503, 44]]), LINE.inner),
    region('flag-middle', pennant(503, 44, 84, 52), { part: 'flagMid', hint: '#FFADB9' }),
    region('roof-middle', roof(500, 282, 104, 182), { hint: '#C9B8FF' }),
    region('heart-window', heart(500, 380, 88, 80), { part: 'heartWindow', hint: '#FFC9DD' }),

    // front wall with battlements
    region(
      'wall',
      shape([
        [330, 760, 1],
        [330, 500, 1],
        [384, 500, 1],
        [384, 462, 1],
        [430, 462, 1],
        [430, 500, 1],
        [478, 500, 1],
        [478, 462, 1],
        [522, 462, 1],
        [522, 500, 1],
        [570, 500, 1],
        [570, 462, 1],
        [616, 462, 1],
        [616, 500, 1],
        [670, 500, 1],
        [670, 760, 1],
      ]),
      { hint: '#FFF8FC' },
    ),
    region(
      'door',
      archWindow(500, 580, 124, 170),
      { hint: '#E8C4A0' },
    ),
    inkLine(line([[500, 584], [500, 712]]), LINE.inner),
    ink(circle(484, 660, 6)),
    ink(circle(516, 660, 6)),

    // side towers
    region('tower-left', rect(232, 390, 136, 370, 8), { hint: '#FFF4E6' }),
    region('tower-right', rect(632, 390, 136, 370, 8), { hint: '#FFF4E6' }),
    inkLine(line([[300, 236], [300, 172]]), LINE.inner),
    inkLine(line([[700, 236], [700, 172]]), LINE.inner),
    region('flag-left', pennant(300, 172, 76, 48), { part: 'flagLeft', hint: '#FFE27A' }),
    region('flag-right', pennant(700, 172, 76, 48), { part: 'flagRight', hint: '#BDEBC8' }),
    region('roof-left', roof(300, 400, 92, 166), { hint: '#FFB8D9' }),
    region('roof-right', roof(700, 400, 92, 166), { hint: '#FFB8D9' }),
    region('window-left', archWindow(300, 470, 62, 92), { hint: '#B9D8FF' }),
    region('window-right', archWindow(700, 470, 62, 92), { hint: '#B9D8FF' }),
    inkLine(line([[300, 474], [300, 560]]), LINE.fine),
    inkLine(line([[700, 474], [700, 560]]), LINE.fine),
    // a few bricks
    inkLine(line([[252, 620], [290, 620]]), LINE.fine),
    inkLine(line([[318, 660], [352, 660]]), LINE.fine),
    inkLine(line([[648, 630], [686, 630]]), LINE.fine),
    inkLine(line([[714, 672], [748, 672]]), LINE.fine),
    inkLine(line([[384, 552], [418, 552]]), LINE.fine),
    inkLine(line([[582, 552], [616, 552]]), LINE.fine),
    inkLine(line([[392, 650], [424, 650]]), LINE.fine),
    inkLine(line([[576, 650], [608, 650]]), LINE.fine),
    inkLine(line([[434, 444], [464, 444]]), LINE.fine),
    inkLine(line([[540, 326], [568, 326]]), LINE.fine),

    // ---- land ----
    region(
      'hill',
      shape([
        [-20, 1020, 1],
        [-20, 800],
        [180, 736],
        [400, 714],
        [600, 714],
        [820, 736],
        [1020, 800],
        [1020, 1020, 1],
      ]),
      { hint: '#BDEBC8' },
    ),
    region(
      'path',
      shape([
        [446, 716, 1],
        [554, 716, 1],
        [580, 800],
        [650, 900],
        [700, 1020, 1],
        [400, 1020, 1],
        [430, 900],
        [440, 800],
      ]),
      { hint: '#FFD3A5' },
    ),
    region('bush-left', cloud(236, 742, 196, 118, 4), { hint: '#9FE0B2' }),
    region('bush-right', cloud(764, 742, 196, 118, 4), { hint: '#9FE0B2' }),
    inkLine(curve([[190, 778], [206, 762], [228, 764]]), LINE.fine),
    inkLine(curve([[810, 778], [794, 762], [772, 764]]), LINE.fine),

    // flowers
    region('flower-1', scallop(140, 900, 40), { hint: '#FFB1C8' }),
    region('flower-1-mid', circle(140, 900, 23), { hint: '#FFE27A' }),
    region('flower-2', scallop(860, 905, 40, 5, 0.65, -70), { hint: '#C9B8FF' }),
    region('flower-2-mid', circle(860, 905, 23), { hint: '#FFE27A' }),
    inkLine(curve([[290, 900], [300, 872], [310, 902]]), LINE.fine),
    inkLine(curve([[760, 960], [770, 932], [780, 962]]), LINE.fine),
    inkLine(curve([[40, 980], [50, 952], [60, 982]]), LINE.fine),
  ],
};
