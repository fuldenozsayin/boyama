import { cloud, curve, decor, inkLine, LINE, rect, region, shape, twinkle, INK } from '../../dsl';
import type { Picture } from '../../types';
import { butterfly, daisy, stemLeaf, sunFace } from './helpers';

const bf = butterfly({
  cx: 500,
  cy: 484,
  s: 1.02,
  style: {
    top: '#FFB8D9',
    bottom: '#D7C2FF',
    topSpot: '#FFE27A',
    bottomSpot: '#9ED6FF',
    body: '#C9B8FF',
    head: '#FFF4E6',
    tips: '#FFADB9',
  },
  pattern: 'hearts',
  parts: { left: 'wings-left', right: 'wings-right', eyes: 'eyes' },
  lashes: true,
  mouth: 'open',
});

/** EASY: one big smiling butterfly with heart-patterned wings. */
export const happyButterfly: Picture = {
  id: 'butterfly-happy-wings',
  category: 'butterfly',
  title: 'Gülen Kelebek',
  parts: {
    ...bf.parts,
    sun: { anim: 'pulse', pivot: [908, 80], amp: 0.07, speed: 0.9 },
    'flower-left': { anim: 'sway', pivot: [112, 990], amp: 6, speed: 0.8 },
    'flower-right': { anim: 'sway', pivot: [888, 990], amp: 6, speed: 0.8, phase: 0.5 },
  },
  celebrate: { sound: 'flutter', particles: 'petals' },
  items: [
    region('sky', rect(0, 0, 1000, 1000), { outline: false, hint: '#D9EEFF' }),
    ...sunFace(908, 80, 48, 'sun', { single: true }),
    region('cloud', cloud(150, 130, 220, 100), { hint: '#FFFFFF' }),
    decor(twinkle(330, 70, 16), { fill: '#FFFFFF', stroke: INK, width: 3 }),
    decor(twinkle(700, 60, 13), { fill: '#FFFFFF', stroke: INK, width: 3 }),
    decor(twinkle(80, 330, 13), { fill: '#FFFFFF', stroke: INK, width: 3 }),
    decor(twinkle(930, 330, 15), { fill: '#FFFFFF', stroke: INK, width: 3 }),

    region('hill', shape([[-20, 1020, 1], [-20, 840], [240, 800], [520, 830], [780, 796], [1020, 830], [1020, 1020, 1]]), {
      hint: '#9FE0B2',
    }),
    inkLine(curve([[300, 930], [312, 902], [322, 932]]), LINE.fine),
    inkLine(curve([[640, 950], [652, 922], [662, 952]]), LINE.fine),
    inkLine(curve([[470, 975], [480, 950], [490, 976]]), LINE.fine),

    // flowers
    ...stemLeaf('stem-left', 112, 1000, 840, 22, 925, 74, 1, '#9FE0B2', 'flower-left'),
    ...daisy('flower-left', 112, 812, 40, { petals: '#FFADB9', mid: '#FFF0A0' }, { part: 'flower-left' }),
    ...stemLeaf('stem-right', 888, 1000, 840, 22, 925, 74, -1, '#9FE0B2', 'flower-right'),
    ...daisy('flower-right', 888, 812, 40, { petals: '#B9D8FF', mid: '#FFE27A' }, { part: 'flower-right', rot: -72 }),

    ...bf.items,
  ],
};
