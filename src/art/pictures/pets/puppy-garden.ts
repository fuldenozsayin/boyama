import {
  circle,
  cloud,
  curve,
  decor,
  ellipse,
  happyEye,
  inkLine,
  LINE,
  rect,
  region,
  roundPoly,
  scallop,
  shape,
  smile,
  smooth,
  blush,
  type Pt,
} from '../../dsl';
import type { Picture } from '../../types';
import { ballBand, bird, bone, dogFace, dogHead, floppyEar, sunRays, toes, tube } from './helpers';

// puppy head
const HX = 556;
const HY = 468;
const R = 148;

const P = (u: number, v: number): Pt => [HX + u * R, HY + v * R];

/** Puppy with a ball and a bone in the garden, next to its doghouse. */
export const puppyGarden: Picture = {
  id: 'pets-puppy-garden',
  category: 'pets',
  title: 'Bahçedeki Köpekçik',
  parts: {
    eyes: { anim: 'blink', pivot: [HX, HY], speed: 0.4 },
    tail: { anim: 'wag', pivot: [812, 680], amp: 20, speed: 2.4 },
    ball: { anim: 'bob', pivot: [902, 890], amp: 16, speed: 1.2 },
    rays: { anim: 'spin', pivot: [868, 135], speed: 0.15 },
  },
  celebrate: { sound: 'woof', particles: 'hearts' },
  items: [
    region('sky', rect(0, 0, 1000, 1000), { outline: false, hint: '#D9EEFF' }),

    // sun
    ...sunRays(868, 135, 84, 112, 10, 'rays'),
    region('sun', circle(868, 135, 64), { hint: '#FFE27A' }),
    happyEye(846, 128, 22),
    happyEye(890, 128, 22),
    inkLine(smile(868, 152, 26, 8)),
    blush(832, 154, 10),
    blush(904, 154, 10),

    region('cloud', cloud(560, 150, 240, 115), { hint: '#FFFFFF' }),
    bird(250, 120, 44),
    bird(320, 170, 32),

    // land
    region('hill', shape([[-20, 1020, 1], [-20, 585], [220, 548], [470, 590], [720, 548], [1020, 578], [1020, 1020, 1]]), {
      hint: '#C8F0D0',
    }),
    region('grass', shape([[-20, 1020, 1], [-20, 712], [250, 690], [520, 714], [790, 682], [1020, 700], [1020, 1020, 1]]), {
      hint: '#9FE0B2',
    }),
    inkLine(curve([[60, 980], [72, 952], [82, 982]]), LINE.fine),
    inkLine(curve([[480, 978], [492, 950], [502, 980]]), LINE.fine),
    inkLine(curve([[700, 985], [712, 958], [722, 986]]), LINE.fine),
    inkLine(curve([[930, 660], [940, 636], [950, 662]]), LINE.fine),

    // doghouse
    region('house-wall', roundPoly([[62, 772], [62, 468], [174, 356], [286, 468], [286, 772]], 0.05), { hint: '#FFD98A' }),
    region('roof', roundPoly([[174, 288], [344, 458], [316, 488], [174, 352], [32, 488], [4, 458]], 0.12), {
      hint: '#FFADB9',
    }),
    region('door', shape([[122, 772, 1], [122, 642], [140, 594], [174, 576], [208, 594], [226, 642], [226, 772, 1]]), {
      hint: '#C99A74',
    }),
    decor(bone(174, 502, 74, 28), { stroke: '#4E3D63', width: 4, fill: '#FFFFFF' }),

    // food bowl
    region('food', smooth([[274, 812], [292, 784], [320, 774], [340, 782], [366, 770], [394, 790], [398, 816], [336, 826]]), {
      hint: '#E8C4A0',
    }),
    region('bowl', roundPoly([[262, 800], [408, 800], [390, 866], [280, 866]], 0.18), { hint: '#B9D8FF' }),
    inkLine(curve([[306, 834], [335, 844], [364, 834]]), LINE.fine),

    // ---- puppy ----
    region('tail', tube([[800, 694], [836, 650], [856, 600], [850, 556]], 40, 34), { part: 'tail', hint: '#E8C4A0' }),
    region('leg-back-far', rect(778, 724, 58, 124, 29), { hint: '#D9B08C' }),
    region('leg-front-far', rect(566, 724, 58, 124, 29), { hint: '#D9B08C' }),
    ...toes(807, 848, 56),
    ...toes(595, 848, 56),
    region('body', ellipse(652, 702, 176, 102), { hint: '#E8C4A0' }),
    region('spot', smooth([[680, 620], [736, 606], [782, 630], [776, 674], [726, 682], [686, 666]]), { hint: '#C99A74' }),
    region('leg-back', rect(722, 740, 64, 126, 32), { hint: '#E8C4A0' }),
    ...toes(754, 866, 60),
    region('leg-front', rect(510, 740, 64, 126, 32), { hint: '#E8C4A0' }),
    ...toes(542, 866, 60),

    region('collar', ellipse(HX + 6, HY + 0.84 * R + 8, 94, 34, -5), { hint: '#9ED6FF' }),
    region('tag', circle(HX + 4, HY + 0.84 * R + 52, 23), { hint: '#FFE27A' }),
    decor(circle(HX + 4, HY + 0.84 * R + 52, 9), { stroke: '#4E3D63', width: 3 }),

    region('head', dogHead(HX, HY, R), { hint: '#E8C4A0' }),
    region('patch', smooth([P(0.12, -0.3), P(0.36, -0.36), P(0.6, -0.24), P(0.66, 0.06), P(0.5, 0.24), P(0.2, 0.2), P(0.1, -0.04)]), {
      hint: '#C99A74',
    }),
    region('muzzle', ellipse(HX, HY + 0.44 * R, 0.4 * R, 0.29 * R), { hint: '#FFF4E6' }),
    region('ear-left', floppyEar(HX, HY, R, -1), { hint: '#C99A74' }),
    region('ear-right', floppyEar(HX, HY, R, 1), { hint: '#C99A74' }),
    ...dogFace(HX, HY, R, { eyePart: 'eyes' }),

    // toys
    region('bone', bone(612, 922, 150, 52, -8), { hint: '#FFF4E6' }),
    region('ball', circle(902, 890, 60), { part: 'ball', hint: '#FFADB9' }),
    region('ball-stripe', ballBand(902, 890, 60, -19, 17, 8), { part: 'ball', hint: '#FFF0A0' }),
    decor(ellipse(876, 856, 13, 8, -35), { fill: '#FFFFFF', part: 'ball' }),

    // flowers
    region('flower-1', scallop(80, 880, 36), { hint: '#FFB8D9' }),
    region('flower-1-mid', circle(80, 880, 21), { hint: '#FFE27A' }),
    region('flower-2', scallop(420, 940, 32, 5, 0.65, -70), { hint: '#C9B8FF' }),
    region('flower-2-mid', circle(420, 940, 20), { hint: '#FFF4B0' }),
  ],
};
