import {
  arc,
  blush,
  circle,
  cloud,
  curve,
  decor,
  ellipse,
  inkLine,
  LINE,
  rect,
  region,
  scale,
  shape,
  smooth,
  star,
  translate,
  twinkle,
} from '../../dsl';
import type { Picture } from '../../types';
import { crescent, curlLock, sideHead } from './helpers';

const sparkle = (x: number, y: number, r: number) => decor(twinkle(x, y, r), { fill: '#FFFFFF', stroke: '#4E3D63', width: 3 });

// the unicorn is drawn in design units and scaled up around a point on the cloud
const SC = 1.16;
const CX = 470;
const CY = 770;
const U = (d: string) => scale(d, SC, SC, CX, CY);
const P = (x: number, y: number): [number, number] => [CX + (x - CX) * SC, CY + (y - CY) * SC];
const M = (d: string) => translate(d, -24, 8);

const head = sideHead({ x: P(560, 498)[0], y: P(560, 498)[1], s: 0.92 * SC, part: 'head', look: [0.45, -0.55] });

/** A unicorn resting on a cloud bed, dreamily watching the sleepy moon. */
export const moonDream: Picture = {
  id: 'unicorn-moon-dream',
  category: 'unicorn',
  title: 'Bulutta Rüya',
  parts: {
    eye: { anim: 'blink', pivot: head.eye, speed: 0.4, parent: 'head' },
    head: { anim: 'sway', pivot: P(500, 600), amp: 2, speed: 0.5 },
    tail: { anim: 'wag', pivot: P(255, 652), amp: 8, speed: 1.1 },
    moon: { anim: 'sway', pivot: [796, 208], amp: 6, speed: 0.45 },
    star1: { anim: 'twinkle', pivot: [110, 140] },
    star2: { anim: 'twinkle', pivot: [400, 95], phase: 0.33 },
    star3: { anim: 'twinkle', pivot: [300, 340], phase: 0.66 },
    clouds: { anim: 'bob', amp: 8, speed: 0.5, pivot: [0, 0] },
  },
  celebrate: { sound: 'magic', particles: 'stars' },
  items: [
    region('sky', rect(0, 0, 1000, 1000), { outline: false, hint: '#C9B8FF' }),

    // stars + little clouds
    region('star-1', star(110, 140, 52), { part: 'star1', hint: '#FFE27A' }),
    region('star-2', star(400, 95, 42), { part: 'star2', hint: '#FFF0A0' }),
    region('star-3', star(300, 340, 46), { part: 'star3', hint: '#FFE27A' }),
    sparkle(250, 210, 16),
    sparkle(560, 160, 14),
    sparkle(80, 470, 18),
    sparkle(940, 600, 16),
    sparkle(640, 60, 12),
    sparkle(120, 950, 16),
    sparkle(520, 965, 12),
    sparkle(880, 940, 18),
    region('cloud-1', cloud(140, 300, 190, 90, 4), { part: 'clouds', hint: '#E3D4FF' }),
    region('cloud-2', cloud(880, 470, 200, 92, 4), { part: 'clouds', hint: '#D9EEFF' }),

    // sleepy moon in a nightcap
    region('moon', M(crescent(820, 200, 128, -72, -22, 114)), { part: 'moon', hint: '#FFF0A0' }),
    inkLine(M(arc(885, 196, 17, 20, 160)), LINE.inner + 1, 'moon'),
    inkLine(M(curve([[858, 250], [874, 262], [892, 258]])), LINE.inner, 'moon'),
    blush(888, 240, 15, 10, 'moon'),
    region('cap', M(shape([[770, 96], [800, 50], [870, 40], [935, 70], [972, 150], [978, 214, 1], [930, 140], [880, 110], [820, 108]])), {
      part: 'moon',
      hint: '#B9D8FF',
    }),
    region('pompom', circle(952, 236, 26), { part: 'moon', hint: '#FFFFFF' }),

    // cloud bed
    region('cloud-bed', cloud(480, 790, 900, 330, 6), { hint: '#FFFFFF' }),

    // ---- unicorn ----
    region('tail-1', U(curlLock([[262, 640], [210, 606], [156, 612], [126, 652]], 66, 30, -1)), { part: 'tail', hint: '#FFB8D9' }),
    region('tail-2', U(curlLock([[256, 668], [204, 680], [176, 724]], 58, 26, -1)), { part: 'tail', hint: '#B9D8FF' }),

    region('leg-front-far', U(rect(560, 674, 126, 50, 25)), { hint: '#F6E9FA' }),
    region('hoof-front-far', U(rect(664, 672, 50, 54, 18)), { hint: '#C9B6F2' }),

    region('body', U(ellipse(420, 662, 172, 92)), { hint: '#FFF8FC' }),
    region('haunch', U(ellipse(322, 690, 74, 56, -14)), { hint: '#FFF8FC' }),
    region('hoof-back', U(rect(376, 722, 54, 46, 17)), { hint: '#B9A2F0' }),

    region('leg-front-near', U(rect(526, 716, 118, 56, 28)), { hint: '#FFF8FC' }),
    region('hoof-front-near', U(rect(620, 714, 56, 60, 20)), { hint: '#B9A2F0' }),

    region('neck', U(smooth([[452, 650], [540, 652], [610, 590], [600, 500], [520, 470], [462, 560]])), { part: 'head', hint: '#FFF8FC' }),
    region('mane-neck', U(curlLock([[512, 462], [474, 510], [456, 566], [462, 612]], 62, 28, 1)), { part: 'head', hint: '#C9B8FF' }),
    ...head.items,
  ],
};
