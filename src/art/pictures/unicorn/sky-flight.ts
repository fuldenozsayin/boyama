import {
  blush,
  circle,
  cloud,
  decor,
  ellipse,
  happyEye,
  inkLine,
  line,
  LINE,
  rect,
  region,
  rotatePt,
  smile,
  smooth,
  star,
  twinkle,
  type Pt,
} from '../../dsl';
import type { Picture } from '../../types';
import { curlLock, featherWing, hoofAt, limb, ribbon, sideHead } from './helpers';

const sparkle = (x: number, y: number, r: number) => decor(twinkle(x, y, r), { fill: '#FFFFFF', stroke: '#4E3D63', width: 3 });

const head = sideHead({ x: 712, y: 318, s: 0.95, look: [0.2, 0] });
const WING_NEAR = featherWing([488, 436], 1.02, 1, 6);
const WING_FAR = featherWing([552, 418], 0.86, 1, -14);

// legs (spines from hip/shoulder to hoof)
const FRONT_NEAR: Pt[] = [[640, 540], [672, 600], [640, 646]];
const FRONT_FAR: Pt[] = [[600, 548], [624, 606], [590, 646]];
const BACK_NEAR: Pt[] = [[430, 550], [394, 608], [342, 636]];
const BACK_FAR: Pt[] = [[470, 560], [500, 620], [474, 662]];

// rainbow trail from the bottom-left corner up to the unicorn
const TRAIL = ribbon([[-40, 830], [150, 770], [330, 690], [520, 540]], [-64, -32, 0, 32, 64]);

const sunRays = Array.from({ length: 8 }, (_, i) => {
  const a = i * 45 + 22;
  const p0 = rotatePt([140 + 92, 140], a, 140, 140);
  const p1 = rotatePt([140 + 122, 140], a, 140, 140);
  return inkLine(line([p0, p1]), LINE.inner, 'rays');
});

/** A winged unicorn flying over the clouds with a rainbow trail. */
export const skyFlight: Picture = {
  id: 'unicorn-sky-flight',
  category: 'unicorn',
  title: 'Uçan Unicorn',
  parts: {
    eye: { anim: 'blink', pivot: head.eye, speed: 0.5 },
    wings: { anim: 'flap', pivot: [500, 430], amp: 0.4, speed: 1.6 },
    tail: { anim: 'wag', pivot: [392, 505], amp: 10, speed: 1.3 },
    rays: { anim: 'spin', pivot: [140, 140], speed: 0.12 },
    star1: { anim: 'twinkle', pivot: [560, 105] },
    star2: { anim: 'twinkle', pivot: [905, 610], phase: 0.5 },
    clouds: { anim: 'bob', pivot: [0, 0], amp: 7, speed: 0.6 },
  },
  celebrate: { sound: 'magic', particles: 'stars' },
  items: [
    region('sky', rect(0, 0, 1000, 1000), { outline: false, hint: '#D9EEFF' }),

    // sun
    ...sunRays,
    region('sun', circle(140, 140, 78), { hint: '#FFE27A' }),
    happyEye(116, 132, 24),
    happyEye(164, 132, 24),
    inkLine(smile(140, 160, 30, 9)),
    blush(102, 162, 12),
    blush(178, 162, 12),

    region('star-1', star(560, 105, 44), { part: 'star1', hint: '#FFF0A0' }),
    region('star-2', star(905, 610, 46), { part: 'star2', hint: '#FFC9DD' }),
    sparkle(360, 70, 16),
    sparkle(930, 470, 14),
    sparkle(250, 380, 18),
    sparkle(780, 700, 15),

    // rainbow trail
    region('rainbow-1', TRAIL[0], { hint: '#FFADB9' }),
    region('rainbow-2', TRAIL[1], { hint: '#FFF0A0' }),
    region('rainbow-3', TRAIL[2], { hint: '#BDEBC8' }),
    region('rainbow-4', TRAIL[3], { hint: '#B9D8FF' }),

    // ---- unicorn ----
    region('wing-far', WING_FAR.d, { part: 'wings', hint: '#E3D4FF' }),
    region('tail-1', curlLock([[396, 490], [342, 448], [280, 438], [234, 462]], 70, 30, -1), { part: 'tail', hint: '#FFB8D9' }),
    region('tail-2', curlLock([[392, 516], [336, 514], [284, 532], [254, 566]], 62, 28, -1), { part: 'tail', hint: '#D7C2FF' }),

    region('leg-back-far', limb(BACK_FAR, 50), { hint: '#F6E9FA' }),
    region('hoof-back-far', hoofAt(BACK_FAR, 54, 40), { hint: '#C9B6F2' }),
    region('leg-front-far', limb(FRONT_FAR, 50), { hint: '#F6E9FA' }),
    region('hoof-front-far', hoofAt(FRONT_FAR, 54, 40), { hint: '#C9B6F2' }),

    region('body', ellipse(526, 494, 150, 92, -8), { hint: '#FFF8FC' }),

    region('leg-back-near', limb(BACK_NEAR, 54), { hint: '#FFF8FC' }),
    region('hoof-back-near', hoofAt(BACK_NEAR, 58, 42), { hint: '#B9A2F0' }),
    region('leg-front-near', limb(FRONT_NEAR, 54), { hint: '#FFF8FC' }),
    region('hoof-front-near', hoofAt(FRONT_NEAR, 58, 42), { hint: '#B9A2F0' }),

    region('neck', smooth([[566, 476], [650, 478], [706, 420], [700, 340], [636, 322], [588, 400]]), { hint: '#FFF8FC' }),
    region('mane-neck', curlLock([[640, 318], [600, 362], [580, 420], [584, 470]], 62, 28, 1), { hint: '#C9B8FF' }),

    region('wing-near', WING_NEAR.d, { part: 'wings', hint: '#FFF8FC' }),
    ...WING_NEAR.lines.map((d) => inkLine(d, LINE.fine, 'wings')),

    ...head.items,

    // clouds in front
    region('cloud-1', cloud(150, 885, 360, 180, 5), { part: 'clouds', hint: '#FFFFFF' }),
    region('cloud-2', cloud(520, 950, 420, 170, 5), { part: 'clouds', hint: '#FFF4E6' }),
    region('cloud-3', cloud(870, 880, 330, 170, 5), { part: 'clouds', hint: '#FFFFFF' }),
  ],
};
