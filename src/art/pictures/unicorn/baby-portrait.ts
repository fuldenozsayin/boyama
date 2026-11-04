import {
  blush,
  circle,
  curve,
  cuteEye,
  decor,
  ellipse,
  heart,
  ink,
  inkLine,
  LINE,
  mirrorX,
  petal,
  rect,
  region,
  scallop,
  shape,
  smooth,
  smile,
  star,
  twinkle,
} from '../../dsl';
import type { Picture } from '../../types';
import { curlLock, hornGrooves } from './helpers';

const LOCK_1 = curlLock([[430, 300], [336, 296], [270, 362], [250, 462], [262, 556]], 100, 40, 1);
const LOCK_2 = curlLock([[372, 520], [298, 584], [266, 690], [280, 800]], 96, 42, 1);

const sparkle = (x: number, y: number, r: number, part?: string) =>
  decor(twinkle(x, y, r), { fill: '#FFFFFF', stroke: '#4E3D63', width: 3, part });

/** EASY page: a big-eyed baby unicorn portrait with stars and hearts. */
export const babyPortrait: Picture = {
  id: 'unicorn-baby-portrait',
  category: 'unicorn',
  title: 'Minik Unicorn',
  parts: {
    eye: { anim: 'blink', pivot: [500, 462], speed: 0.45 },
    'ear-left': { anim: 'wag', pivot: [392, 300], amp: 7, speed: 1.1 },
    'ear-right': { anim: 'wag', pivot: [608, 300], amp: 7, speed: 1.1, phase: 0.5 },
    star1: { anim: 'twinkle', pivot: [165, 175] },
    star2: { anim: 'twinkle', pivot: [845, 150], phase: 0.5 },
    heart1: { anim: 'pulse', pivot: [112, 470], amp: 0.1, speed: 1.3 },
    heart2: { anim: 'pulse', pivot: [890, 800], amp: 0.1, speed: 1.3, phase: 0.5 },
    pendant: { anim: 'sway', pivot: [500, 752], amp: 8, speed: 0.9 },
  },
  celebrate: { sound: 'magic', particles: 'stars' },
  items: [
    region('sky', rect(0, 0, 1000, 1000), { outline: false, hint: '#E3D4FF' }),

    // sky friends
    region('star-1', star(165, 175, 62), { part: 'star1', hint: '#FFE27A' }),
    region('star-2', star(845, 150, 50), { part: 'star2', hint: '#FFF0A0' }),
    region('heart-1', heart(112, 470, 92), { part: 'heart1', hint: '#FFADB9' }),
    region('heart-2', heart(890, 800, 84), { part: 'heart2', hint: '#FFB8D9' }),
    sparkle(305, 92, 18),
    sparkle(700, 66, 14),
    sparkle(95, 760, 20),
    sparkle(150, 900, 13),
    sparkle(905, 470, 20),
    sparkle(858, 604, 13),

    // mane behind the head
    region('mane-left-2', LOCK_2, { hint: '#D7C2FF' }),
    region('mane-right-2', mirrorX(LOCK_2), { hint: '#FFC9DD' }),
    region('mane-left-1', LOCK_1, { hint: '#FFB8D9' }),
    region('mane-right-1', mirrorX(LOCK_1), { hint: '#B9D8FF' }),
    // neck + chest
    region('neck', smooth([[428, 590], [572, 590], [588, 700], [618, 800], [676, 880], [740, 950], [760, 1040], [240, 1040], [260, 950], [324, 880], [382, 800], [412, 700]]), {
      hint: '#FFF8FC',
    }),

    // ears (behind head)
    region('ear-left', petal([392, 306], [318, 170], 50), { part: 'ear-left', hint: '#FFF8FC' }),
    region('ear-left-inner', petal([390, 296], [332, 196], 26), { part: 'ear-left', hint: '#FFC9DD' }),
    region('ear-right', petal([608, 306], [682, 170], 50), { part: 'ear-right', hint: '#FFF8FC' }),
    region('ear-right-inner', petal([610, 296], [668, 196], 26), { part: 'ear-right', hint: '#FFC9DD' }),

    region('head', ellipse(500, 440, 200, 175), { hint: '#FFF8FC' }),
    region('muzzle', ellipse(500, 605, 135, 85), { hint: '#FFE1EC' }),
    ink(ellipse(458, 598, 10, 14, 15)),
    ink(ellipse(542, 598, 10, 14, -15)),
    inkLine(smile(500, 642, 56, 12)),

    // horn + bangs
    region('horn', shape([[452, 292], [500, 92, 1], [548, 292]], 1.1), { hint: '#FFE39A' }),
    ...hornGrooves([458, 280], [542, 280], [500, 92], 3),
    region('forelock-left', curlLock([[506, 290], [458, 276], [414, 298], [396, 340]], 64, 26, -1), { hint: '#D7C2FF' }),
    region('forelock-right', curlLock([[494, 290], [542, 276], [586, 298], [604, 340]], 64, 26, 1), { hint: '#FFB8D9' }),

    // face
    ...cuteEye(405, 462, 104, { lashes: 'left', part: 'eye' }),
    ...cuteEye(595, 462, 104, { lashes: 'right', part: 'eye' }),
    blush(352, 516, 26, 16),
    blush(648, 516, 26, 16),

    // flower behind the right ear
    region('flower', scallop(650, 318, 34, 5, 0.65, -60), { hint: '#FFF0A0' }),
    region('flower-mid', circle(650, 318, 20), { hint: '#FFADB9' }),

    // little heart pendant
    region('pendant', heart(500, 790, 70), { part: 'pendant', hint: '#FFADB9' }),
    inkLine(curve([[408, 690], [452, 736], [500, 752], [548, 736], [592, 690]]), LINE.inner),
  ],
};
