import {
  curve,
  decor,
  ellipse,
  heart,
  INK,
  inkLine,
  LINE,
  rect,
  region,
  scallop,
  shape,
  smooth,
  star,
} from '../../dsl';
import type { Picture } from '../../types';
import { bow, bowKnot, crown, crownTips, gem, hemPts, pearl, princessFace, sparkle } from './helpers';

const SKIN = '#A8724F';
const HAIR = '#6E4B3E';

/** Picture 3: a princess in a big layered ball gown, waving in the ballroom. */
export const princessBallGown: Picture = {
  id: 'princess-ball-gown',
  category: 'princess',
  title: 'Balo Prensesi',
  parts: {
    eyes: { anim: 'blink', pivot: [500, 332], speed: 0.45 },
    wave: { anim: 'wag', pivot: [586, 462], amp: 14, speed: 1.6 },
    dress: { anim: 'sway', pivot: [500, 535], amp: 3, speed: 0.8 },
    tiara: { anim: 'pulse', pivot: [500, 196], amp: 0.08, speed: 1.2 },
    star1: { anim: 'twinkle', pivot: [288, 336] },
    star2: { anim: 'twinkle', pivot: [744, 250], phase: 0.5 },
  },
  celebrate: { sound: 'magic', particles: 'sparkles' },
  items: [
    region('wall', rect(0, 0, 1000, 1000), { outline: false, hint: '#E3D4FF' }),
    region('floor', rect(-20, 790, 1040, 240), { hint: '#D9EEFF' }),

    // curtains + valance
    region('curtain-left', shape([[-20, -20, 1], [262, -20, 1], [246, 170], [204, 390], [160, 520], [200, 670], [252, 830, 1], [-20, 830, 1]]), {
      hint: '#FFADB9',
    }),
    region(
      'curtain-right',
      shape([[1020, -20, 1], [1020, 830, 1], [748, 830, 1], [800, 670], [840, 520], [796, 390], [754, 170], [738, -20, 1]]),
      { hint: '#FFADB9' },
    ),
    inkLine(curve([[90, 120], [100, 330], [80, 520]]), LINE.fine),
    inkLine(curve([[160, 120], [150, 300], [118, 470]]), LINE.fine),
    inkLine(curve([[110, 590], [130, 700], [150, 810]]), LINE.fine),
    inkLine(curve([[910, 120], [900, 330], [920, 520]]), LINE.fine),
    inkLine(curve([[840, 120], [850, 300], [882, 470]]), LINE.fine),
    inkLine(curve([[890, 590], [870, 700], [850, 810]]), LINE.fine),
    region('tie-left', ellipse(150, 525, 50, 24, -12), { hint: '#FFE27A' }),
    region('tie-right', ellipse(850, 525, 50, 24, 12), { hint: '#FFE27A' }),
    region('valance', shape([[-20, -20, 1], [1020, -20, 1], ...hemPts(-20, 1020, 70, 8, 34, 0)]), { hint: '#FFD98A' }),

    region('star-left', star(288, 336, 40), { part: 'star1', hint: '#FFF0A0' }),
    region('star-right', star(744, 250, 36), { part: 'star2', hint: '#FFF0A0' }),
    sparkle(320, 170, 16),
    sparkle(690, 520, 14),
    sparkle(250, 640, 14),
    sparkle(770, 380, 12),

    region('rug', ellipse(500, 905, 360, 66), { hint: '#FFC9DD' }),

    // ---- princess ----
    // curly hair + puffs
    region('hair-back', scallop(500, 284, 132, 14, 0.15), { hint: HAIR }),
    region('puff-left', scallop(366, 162, 54, 10, 0.19), { hint: HAIR }),
    region('puff-right', scallop(634, 162, 54, 10, 0.19), { hint: HAIR }),
    region('neck', rect(478, 390, 44, 60, 16), { hint: SKIN }),

    // skirt layers (back → front)
    region(
      'skirt-bottom',
      shape([[430, 600, 1], [570, 600, 1], [690, 680], [770, 790], [798, 852, 1], ...hemPts(202, 798, 852, 9, 24, 10).slice(1, -1), [202, 852, 1], [230, 790], [310, 680]]),
      { part: 'dress', hint: '#FFD98A' },
    ),
    region(
      'skirt-middle',
      shape([[434, 560, 1], [566, 560, 1], [640, 620], [710, 706], [734, 762, 1], ...hemPts(266, 734, 762, 7, 22, 14).slice(1, -1), [266, 762, 1], [290, 706], [360, 620]]),
      { part: 'dress', hint: '#FFE27A' },
    ),
    region(
      'skirt-top',
      shape([[446, 530, 1], [554, 530, 1], [600, 570], [650, 622], [674, 660, 1], ...hemPts(326, 674, 660, 5, 20, 12).slice(1, -1), [326, 660, 1], [350, 622], [400, 570]]),
      { part: 'dress', hint: '#FFF0A0' },
    ),
    decor(heart(300, 810, 26), { stroke: INK, width: LINE.fine, part: 'dress' }),
    decor(heart(410, 820, 26), { stroke: INK, width: LINE.fine, part: 'dress' }),
    decor(heart(590, 820, 26), { stroke: INK, width: LINE.fine, part: 'dress' }),
    decor(heart(700, 810, 26), { stroke: INK, width: LINE.fine, part: 'dress' }),
    region('bow-left', bow(338, 676, 74, 52), { part: 'dress', hint: '#FFB8D9' }),
    ...bowKnot(338, 676, 74, 52, 'dress'),
    region('bow-right', bow(662, 676, 74, 52), { part: 'dress', hint: '#FFB8D9' }),
    ...bowKnot(662, 676, 74, 52, 'dress'),

    // shoes peeking out
    region('shoe-left', ellipse(452, 902, 40, 22), { hint: '#FFB8D9' }),
    region('shoe-right', ellipse(548, 902, 40, 22), { hint: '#FFB8D9' }),

    // bodice, sash, arms
    region('bodice', shape([[436, 438], [500, 448], [564, 438], [582, 474], [560, 546, 1], [440, 546, 1], [418, 474]]), {
      hint: '#FFE27A',
    }),
    region('sash', shape([[436, 520, 1], [564, 520, 1], [568, 554, 1], [500, 562], [432, 554, 1]]), { hint: '#FFB8D9' }),
    region('bow-waist', bow(500, 542, 76, 52), { hint: '#FFADB9' }),
    ...bowKnot(500, 542, 76, 52),
    region('arm-left', smooth([[404, 462], [434, 478], [420, 530], [410, 560], [392, 580], [368, 570], [372, 530], [386, 476]]), {
      hint: SKIN,
    }),
    region('arm-right', smooth([[580, 470], [606, 452], [636, 412], [648, 382], [674, 368], [690, 388], [664, 418], [626, 470], [596, 492]]), {
      part: 'wave',
      hint: SKIN,
    }),
    region('sleeve-left', ellipse(424, 456, 40, 31, -25), { hint: '#FFF0A0' }),
    region('sleeve-right', ellipse(576, 456, 40, 31, 25), { hint: '#FFF0A0' }),

    // face
    region('face', ellipse(500, 300, 118, 106), { hint: SKIN }),
    ...princessFace(500, 334, 116, { eyePart: 'eyes', mouth: 'open' }),

    // curly bangs
    region(
      'hair-front',
      shape([
        [382, 300, 1],
        [378, 236],
        [420, 194],
        [500, 178],
        [580, 194],
        [622, 236],
        [618, 300, 1],
        [608, 258],
        [574, 236],
        [532, 240],
        [500, 226, 1],
        [468, 240],
        [426, 236],
        [392, 258],
      ]),
      { hint: HAIR },
    ),

    // tiara
    region('tiara', crown(500, 198, 150, 84, 8), { part: 'tiara', hint: '#FFD98A' }),
    decor(gem(500, 168, 36), { fill: '#FFFFFF', stroke: INK, width: LINE.inner, part: 'tiara' }),
    ...crownTips(500, 198, 150, 84).map(([x, y]) => pearl(x, y - 5, 10, 'tiara')),
  ],
};
