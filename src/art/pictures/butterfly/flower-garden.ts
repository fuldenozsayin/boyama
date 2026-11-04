import { circle, cloud, combine, curve, decor, ink, INK, inkLine, LINE, rect, region, shape, twinkle } from '../../dsl';
import type { Picture } from '../../types';
import { butterfly, daisy, ladybug, picket, rose, snail, stemLeaf, sunFace, tulip } from './helpers';

const bf = butterfly({
  cx: 492,
  cy: 282,
  s: 0.62,
  rot: -5,
  style: {
    top: '#FFD98A',
    bottom: '#FFB8D9',
    topSpot: '#FFADB9',
    bottomSpot: '#FFF0A0',
    body: '#D7C2FF',
    head: '#FFF4E6',
  },
  pattern: 'hearts',
  parts: { left: 'wings-left', right: 'wings-right', eyes: 'eyes' },
  look: [0, 0.4],
  lashes: true,
  tips: 'heart',
  mouth: 'open',
});

const FENCE_TOP = 540;
const FENCE_BOTTOM = 800;
const PICKETS = [20, 190, 360, 530, 700, 870];

/** A cosy flower garden by the picket fence with a snail and a ladybug. */
export const flowerGarden: Picture = {
  id: 'butterfly-flower-garden',
  category: 'butterfly',
  title: 'Çiçek Bahçesi',
  parts: {
    ...bf.parts,
    rays: { anim: 'spin', pivot: [868, 118], speed: 0.12 },
    tulip: { anim: 'sway', pivot: [168, 990], amp: 4, speed: 0.7 },
    rose: { anim: 'sway', pivot: [604, 990], amp: 4, speed: 0.7, phase: 0.33 },
    daisy: { anim: 'sway', pivot: [878, 990], amp: 4, speed: 0.7, phase: 0.66 },
    'snail-eyes': { anim: 'blink', pivot: [348, 826], speed: 0.35, phase: 0.6 },
    ladybug: { anim: 'bob', pivot: [772, 906], amp: 5, speed: 1.1 },
  },
  celebrate: { sound: 'flutter', particles: 'petals' },
  items: [
    region('sky', rect(0, 0, 1000, 1000), { outline: false, hint: '#D9EEFF' }),
    ...sunFace(868, 118, 54, 'rays'),
    region('cloud', cloud(140, 130, 210, 96), { hint: '#FFFFFF' }),
    decor(twinkle(300, 70, 14), { fill: '#FFFFFF', stroke: INK, width: 3 }),
    decor(twinkle(720, 60, 12), { fill: '#FFFFFF', stroke: INK, width: 3 }),
    decor(twinkle(90, 400, 13), { fill: '#FFFFFF', stroke: INK, width: 3 }),
    decor(twinkle(930, 420, 13), { fill: '#FFFFFF', stroke: INK, width: 3 }),

    // picket fence
    region('fence-rails', combine(rect(-20, 604, 1040, 38, 8), rect(-20, 716, 1040, 38, 8)), { hint: '#F5C9A6' }),
    ...PICKETS.map((x, i) => region(`fence-${i + 1}`, picket(x, FENCE_TOP, 98, FENCE_BOTTOM), { hint: '#FFF4E6' })),
    ...PICKETS.flatMap((x) => [ink(circle(x + 49, 623, 5)), ink(circle(x + 49, 735, 5))]),

    region('ground', shape([[-20, 1020, 1], [-20, 790], [220, 772], [500, 796], [760, 770], [1020, 790], [1020, 1020, 1]]), {
      hint: '#9FE0B2',
    }),
    inkLine(curve([[480, 960], [492, 932], [502, 962]]), LINE.fine),
    inkLine(curve([[60, 900], [72, 872], [82, 902]]), LINE.fine),
    inkLine(curve([[940, 975], [952, 948], [962, 976]]), LINE.fine),

    // tulip (left)
    ...stemLeaf('tulip-stem', 168, 990, 560, 26, 740, 104, 1, '#9FE0B2', 'tulip'),
    ...tulip('tulip', 168, 528, 150, { cup: '#FFADB9', front: '#FFC9DD' }, 'tulip'),

    // rose (middle)
    ...stemLeaf('rose-stem', 604, 990, 640, 26, 770, 100, -1, '#9FE0B2', 'rose'),
    ...rose('rose', 604, 590, 100, { outer: '#FFB8D9', bud: '#FFC9DD' }, 'rose'),

    // daisy (right)
    ...stemLeaf('daisy-stem', 878, 990, 580, 26, 750, 96, -1, '#9FE0B2', 'daisy'),
    ...daisy('daisy', 878, 530, 54, { petals: '#FFFFFF', mid: '#FFE27A' }, { part: 'daisy', n: 8, depth: 0.5 }),

    // friends on the grass
    ...snail('snail', 300, 856, 62, { body: '#C8F0D0', shell: '#D7C2FF' }, 'snail-eyes'),
    ...ladybug('ladybug', 772, 906, 54, -1, 'ladybug'),

    ...bf.items,
  ],
};
