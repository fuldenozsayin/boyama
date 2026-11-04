import { cloud, curve, decor, drop, heart, INK, inkLine, LINE, rect, region, shape, smooth, twinkle } from '../../dsl';
import type { Picture } from '../../types';
import { bee, butterfly, daisy, ladybug, rose, stemLeaf, sunFace, tulip, wateringCan, xp, type Frame } from './helpers';

const bf = butterfly({
  cx: 470,
  cy: 300,
  s: 0.6,
  style: {
    top: '#D7C2FF',
    topInner: '#FFC9DD',
    topSpot: '#FFF0A0',
    bottom: '#9ED6FF',
    bottomInner: '#D9EEFF',
    bottomSpot: '#FFB8D9',
    body: '#C9B8FF',
    head: '#FFF4E6',
  },
  pattern: 'hearts',
  parts: { left: 'wings-left', right: 'wings-right', eyes: 'eyes' },
  look: [0.3, 0.3],
  lashes: true,
  tips: 'heart',
  mouth: 'open',
});

const CAN: Frame & { mirror: boolean } = { cx: 814, cy: 842, s: 0.9, rot: 0, mirror: true };
const roseTip = xp([-204, -146], CAN);

/** The richest page: a butterfly garden with a bee, a smiling watering can and a flower bed. */
export const butterflyGarden: Picture = {
  id: 'butterfly-garden-party',
  category: 'butterfly',
  title: 'Kelebek Bahçesi',
  parts: {
    ...bf.parts,
    rays: { anim: 'spin', pivot: [122, 118], speed: 0.12 },
    bee: { anim: 'bob', pivot: [858, 470], amp: 12, speed: 1.1 },
    ladybug: { anim: 'bob', pivot: [296, 856], amp: 4, speed: 1.3 },
    can: { anim: 'wag', pivot: [814, 920], amp: 4, speed: 0.8 },
    drops: { anim: 'bob', pivot: [580, 710], amp: 8, speed: 1.6 },
    tulip: { anim: 'sway', pivot: [120, 800], amp: 4, speed: 0.7 },
    rose: { anim: 'sway', pivot: [310, 800], amp: 4, speed: 0.7, phase: 0.33 },
    daisy: { anim: 'sway', pivot: [500, 800], amp: 4, speed: 0.7, phase: 0.66 },
  },
  celebrate: { sound: 'flutter', particles: 'petals' },
  items: [
    region('sky', rect(0, 0, 1000, 1000), { outline: false, hint: '#D9EEFF' }),
    ...sunFace(122, 118, 50, 'rays'),
    region('cloud', cloud(850, 120, 220, 100), { hint: '#FFFFFF' }),
    decor(twinkle(300, 60, 14), { fill: '#FFFFFF', stroke: INK, width: 3 }),
    decor(twinkle(680, 70, 12), { fill: '#FFFFFF', stroke: INK, width: 3 }),
    decor(twinkle(60, 420, 13), { fill: '#FFFFFF', stroke: INK, width: 3 }),
    decor(twinkle(960, 300, 12), { fill: '#FFFFFF', stroke: INK, width: 3 }),

    region('ground', shape([[-20, 1020, 1], [-20, 770], [240, 748], [520, 768], [800, 800], [1020, 776], [1020, 1020, 1]]), {
      hint: '#9FE0B2',
    }),
    inkLine(curve([[700, 960], [712, 932], [722, 962]]), LINE.fine),
    inkLine(curve([[960, 950], [970, 924], [980, 952]]), LINE.fine),

    // flowers (stems disappear into the soil)
    ...stemLeaf('tulip-stem', 120, 820, 600, 24, 726, 80, -1, '#9FE0B2', 'tulip'),
    ...tulip('tulip', 120, 590, 124, { cup: '#FFADB9', front: '#FFC9DD' }, 'tulip'),
    ...stemLeaf('rose-stem', 310, 820, 640, 24, 742, 70, 1, '#9FE0B2', 'rose'),
    ...rose('rose', 310, 600, 92, { outer: '#FFB8D9', bud: '#FFC9DD' }, 'rose'),
    ...stemLeaf('daisy-stem', 500, 820, 600, 24, 704, 70, -1, '#9FE0B2', 'daisy'),
    ...daisy('daisy', 500, 572, 50, { petals: '#FFFFFF', mid: '#FFE27A' }, { part: 'daisy', n: 8, depth: 0.5 }),

    // flower bed
    region('soil', smooth([[36, 806], [64, 772], [180, 760], [310, 766], [440, 758], [560, 770], [588, 806], [310, 816]]), {
      hint: '#C99A74',
    }),
    region('bed', rect(24, 790, 576, 124, 22), { hint: '#FFD3A5' }),
    inkLine('M216 800L216 904', LINE.inner),
    inkLine('M408 800L408 904', LINE.inner),
    inkLine(heart(120, 852, 42), LINE.fine + 0.5),
    ...ladybug('ladybug', 296, 856, 40, 1, 'ladybug'),
    inkLine(heart(504, 852, 42), LINE.fine + 0.5),

    // watering can friend + drops
    ...wateringCan('can', CAN, { body: '#B9D8FF', spout: '#9ED6FF', handle: '#9ED6FF', rose: '#FFE27A' }, 'can'),
    ...[
      [-32, -14, -30],
      [-60, 12, -45],
      [-34, 36, -60],
      [-64, 54, -70],
    ].map(([dx, dy, a]) =>
      decor(drop(roseTip[0] + dx, roseTip[1] + dy, 9, 12, a), { fill: '#FFFFFF', stroke: INK, width: 3.5, part: 'drops' }),
    ),

    // bee friend
    ...bee('bee', 858, 470, 1.04, 'bee'),

    ...bf.items,
  ],
};
