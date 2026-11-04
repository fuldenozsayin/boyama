import {
  arc,
  blush,
  circle,
  cloud,
  curve,
  decor,
  ellipse,
  happyEye,
  INK,
  inkLine,
  LINE,
  line,
  rect,
  region,
  scallop,
  shape,
  smile,
  smooth,
  star,
} from '../../dsl';
import type { Picture } from '../../types';
import {
  baluster,
  bangsFor,
  bangsLines,
  crescent,
  crown,
  crownTips,
  pearl,
  princessFace,
  sparkle,
} from './helpers';

const SKIN = '#D9A27E';
const HAIR = '#7E5F86';

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

/** arched opening (round top) */
const arch = (cx: number, top: number, w: number, h: number) =>
  shape([
    [cx - w / 2, top + h, 1],
    [cx - w / 2, top + w * 0.45],
    [cx - w * 0.3, top + w * 0.1],
    [cx, top],
    [cx + w * 0.3, top + w * 0.1],
    [cx + w / 2, top + w * 0.45],
    [cx + w / 2, top + h, 1],
  ]);

/** Picture 5 (richest): a princess on the castle balcony holding a little star she caught. */
export const princessStarryBalcony: Picture = {
  id: 'princess-starry-balcony',
  category: 'princess',
  title: 'Yıldızlı Balkon',
  parts: {
    eyes: { anim: 'blink', pivot: [500, 512], speed: 0.4 },
    tiara: { anim: 'pulse', pivot: [500, 384], amp: 0.08, speed: 1.1 },
    friend: { anim: 'twinkle', pivot: [500, 656], amp: 0.12, speed: 1.2 },
    moon: { anim: 'sway', pivot: [300, 150], amp: 6, speed: 0.5 },
    star1: { anim: 'twinkle', pivot: [560, 90] },
    star2: { anim: 'twinkle', pivot: [470, 196], phase: 0.3 },
    star3: { anim: 'twinkle', pivot: [80, 90], phase: 0.6 },
    star4: { anim: 'twinkle', pivot: [940, 80], phase: 0.8 },
    flowerL: { anim: 'sway', pivot: [272, 698], amp: 9, speed: 0.9 },
    flowerR: { anim: 'sway', pivot: [728, 698], amp: 9, speed: 0.9, phase: 0.5 },
  },
  celebrate: { sound: 'magic', particles: 'sparkles' },
  items: [
    region('sky', rect(0, 0, 1000, 1000), { outline: false, hint: '#C9B8FF' }),

    // moon + stars
    region('moon', crescent(300, 150, 92, 44, -30, 80), { part: 'moon', hint: '#FFF0A0' }),
    inkLine(arc(258, 150, 13, 20, 160), LINE.inner + 1, 'moon'),
    inkLine(smile(266, 186, 22, 6), LINE.inner, 'moon'),
    blush(238, 176, 11, 7, 'moon'),
    region('star-1', star(560, 90, 38), { part: 'star1', hint: '#FFE27A' }),
    region('star-2', star(470, 196, 30), { part: 'star2', hint: '#FFF0A0' }),
    region('star-3', star(80, 90, 32), { part: 'star3', hint: '#FFF0A0' }),
    region('star-4', star(940, 80, 30), { part: 'star4', hint: '#FFE27A' }),
    region('cloud', cloud(752, 140, 210, 96), { hint: '#E3D4FF' }),
    sparkle(430, 50, 14),
    sparkle(680, 40, 12),
    sparkle(160, 230, 14),
    sparkle(620, 190, 12),
    sparkle(880, 230, 12),

    // castle wall with battlements
    region(
      'wall',
      shape([
        [150, 1020, 1],
        [150, 260, 1],
        [210, 260, 1],
        [210, 222, 1],
        [262, 222, 1],
        [262, 260, 1],
        [322, 260, 1],
        [322, 222, 1],
        [374, 222, 1],
        [374, 260, 1],
        [626, 260, 1],
        [626, 222, 1],
        [678, 222, 1],
        [678, 260, 1],
        [738, 260, 1],
        [738, 222, 1],
        [790, 222, 1],
        [790, 260, 1],
        [850, 260, 1],
        [850, 1020, 1],
      ]),
      { hint: '#FFF4E6' },
    ),
    inkLine(line([[190, 340], [236, 340]]), LINE.fine),
    inkLine(line([[214, 420], [260, 420]]), LINE.fine),
    inkLine(line([[764, 360], [810, 360]]), LINE.fine),
    inkLine(line([[740, 440], [786, 440]]), LINE.fine),
    inkLine(line([[180, 560], [226, 560]]), LINE.fine),
    inkLine(line([[770, 600], [816, 600]]), LINE.fine),

    // doorway with warm light + curtains
    region('doorway', arch(500, 262, 380, 600), { hint: '#FFF0A0' }),
    region('curtain-left', shape([[316, 340], [350, 292], [400, 280], [384, 420], [352, 560], [378, 700], [312, 760, 1]]), {
      hint: '#FFB8D9',
    }),
    region('curtain-right', shape([[684, 340], [650, 292], [600, 280], [616, 420], [648, 560], [622, 700], [688, 760, 1]]), {
      hint: '#FFB8D9',
    }),

    // side towers
    region('tower-left', rect(-20, 380, 196, 660, 8), { hint: '#FFF8FC' }),
    region('tower-right', rect(824, 380, 196, 660, 8), { hint: '#FFF8FC' }),
    region('roof-left', roof(78, 392, 118, 200), { hint: '#9ED6FF' }),
    region('roof-right', roof(922, 392, 118, 200), { hint: '#9ED6FF' }),
    region('window-left', arch(80, 470, 70, 104), { hint: '#FFE27A' }),
    region('window-right', arch(920, 470, 70, 104), { hint: '#FFE27A' }),
    inkLine(line([[80, 474], [80, 572]]), LINE.fine),
    inkLine(line([[920, 474], [920, 572]]), LINE.fine),
    inkLine(line([[30, 700], [76, 700]]), LINE.fine),
    inkLine(line([[96, 780], [142, 780]]), LINE.fine),
    inkLine(line([[860, 720], [906, 720]]), LINE.fine),
    inkLine(line([[924, 800], [970, 800]]), LINE.fine),

    // ---- princess ----
    region('bun', circle(500, 340, 56), { hint: HAIR }),
    inkLine(curve([[474, 316], [498, 302], [526, 310]]), LINE.fine),
    region('skirt', shape([[430, 700, 1], [570, 700, 1], [640, 800], [680, 920, 1], [320, 920, 1], [360, 800]]), {
      hint: '#B9D8FF',
    }),
    region('bodice', shape([[436, 586], [500, 598], [564, 586], [580, 626], [566, 712, 1], [434, 712, 1], [420, 626]]), {
      hint: '#9ED6FF',
    }),

    // the little star friend she is holding
    region('star-friend', star(500, 652, 70, 42), { part: 'friend', hint: '#FFE27A' }),
    happyEye(481, 648, 17, 'friend'),
    happyEye(519, 648, 17, 'friend'),
    inkLine(smile(500, 664, 14, 5), LINE.inner, 'friend'),
    blush(470, 666, 7, 4.5, 'friend'),
    blush(530, 666, 7, 4.5, 'friend'),
    region('arm-left', smooth([[432, 616], [446, 650], [450, 682], [478, 690], [486, 712], [460, 724], [426, 708], [412, 664], [414, 626]]), {
      hint: SKIN,
    }),
    region('arm-right', smooth([[568, 616], [554, 650], [550, 682], [522, 690], [514, 712], [540, 724], [574, 708], [588, 664], [586, 626]]), {
      hint: SKIN,
    }),
    region('sleeve-left', ellipse(434, 610, 38, 30, -25), { hint: '#D9EEFF' }),
    region('sleeve-right', ellipse(566, 610, 38, 30, 25), { hint: '#D9EEFF' }),

    region('face', ellipse(500, 480, 112, 100), { hint: SKIN }),
    ...princessFace(500, 512, 110, { eyePart: 'eyes', look: [0, -0.6] }),
    region('bangs', bangsFor(500, 480, 112, true), { hint: HAIR }),
    ...bangsLines(500, 480, 112, true),
    region('tiara', crown(500, 388, 118, 66, 6), { part: 'tiara', hint: '#FFD98A' }),
    ...crownTips(500, 388, 118, 66).map(([x, y]) => pearl(x, y - 4, 9, 'tiara')),
    decor(star(500, 366, 13), { fill: '#FFFFFF', stroke: INK, width: LINE.fine, part: 'tiara' }),

    // ---- balcony ----
    region('flowers-left', scallop(272, 678, 30, 5, 0.6), { part: 'flowerL', hint: '#FFADB9' }),
    region('flowers-right', scallop(728, 678, 30, 5, 0.6, -70), { part: 'flowerR', hint: '#FFC9DD' }),
    region('pot-left', shape([[230, 694, 1], [314, 694, 1], [302, 736, 1], [242, 736, 1]]), { hint: '#FFD3A5' }),
    region('pot-right', shape([[686, 694, 1], [770, 694, 1], [758, 736, 1], [698, 736, 1]]), { hint: '#FFD3A5' }),
    region('rail', rect(214, 730, 572, 48, 18), { hint: '#FFF8FC' }),
    region('post-1', baluster(316, 778, 898, 60), { hint: '#E3D4FF' }),
    region('post-2', baluster(436, 778, 898, 60), { hint: '#E3D4FF' }),
    region('post-3', baluster(564, 778, 898, 60), { hint: '#E3D4FF' }),
    region('post-4', baluster(684, 778, 898, 60), { hint: '#E3D4FF' }),
    region('balcony-base', rect(196, 894, 608, 46, 14), { hint: '#FFF8FC' }),
    region('balcony-ledge', shape([[230, 936, 1], [770, 936, 1], [720, 980], [620, 1020, 1], [380, 1020, 1], [280, 980]]), {
      hint: '#E3D4FF',
    }),
  ],
};
