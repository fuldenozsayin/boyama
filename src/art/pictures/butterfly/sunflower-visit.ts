import {
  blush,
  circle,
  cloud,
  cuteEye,
  curve,
  decor,
  heart,
  ink,
  inkLine,
  INK,
  LINE,
  rect,
  region,
  shape,
  twinkle,
} from '../../dsl';
import type { ArtItem, Picture } from '../../types';
import { butterfly, daisy, dashedTrail, leaf, openSmile, petalRing, stemPath, tulip } from './helpers';

const bf = butterfly({
  cx: 238,
  cy: 400,
  s: 0.62,
  rot: 4,
  style: {
    top: '#B9D8FF',
    bottom: '#FFC9DD',
    topSpot: '#FFF0A0',
    bottomSpot: '#D7C2FF',
    body: '#C9B8FF',
    head: '#FFF4E6',
  },
  pattern: 'dots',
  parts: { left: 'wings-left', right: 'wings-right', eyes: 'eyes' },
  look: [0.8, 0.1],
  tips: 'ball',
});

// sunflower geometry
const SX = 652;
const SY = 248;
const SR = 96;

const seeds: ArtItem[] = [];
for (let i = 0; i < 18; i++) {
  const a = (i / 18) * Math.PI * 2;
  seeds.push(ink(circle(SX + Math.cos(a) * (SR - 16), SY + Math.sin(a) * (SR - 16), 3.6), 'sunflower'));
}

/** A butterfly visits a big smiling sunflower and two tulips in a pot. */
export const sunflowerVisit: Picture = {
  id: 'butterfly-sunflower-visit',
  category: 'butterfly',
  title: 'Ayçiçeği Ziyareti',
  parts: {
    ...bf.parts,
    sunflower: { anim: 'sway', pivot: [652, 790], amp: 4, speed: 0.6 },
    'sunflower-eyes': { anim: 'blink', pivot: [652, 242], speed: 0.4, phase: 0.35 },
    'tulip-left': { anim: 'sway', pivot: [610, 790], amp: 6, speed: 0.75, phase: 0.2 },
    'tulip-right': { anim: 'sway', pivot: [694, 790], amp: 6, speed: 0.75, phase: 0.7 },
    daisy: { anim: 'sway', pivot: [116, 966], amp: 7, speed: 0.9, phase: 0.4 },
  },
  celebrate: { sound: 'flutter', particles: 'petals' },
  items: [
    region('sky', rect(0, 0, 1000, 1000), { outline: false, hint: '#D9EEFF' }),
    region('cloud-left', cloud(150, 110, 210, 96), { hint: '#FFFFFF' }),
    region('cloud-right', cloud(905, 520, 170, 80), { hint: '#FFFFFF' }),
    decor(twinkle(430, 70, 15), { fill: '#FFFFFF', stroke: INK, width: 3 }),
    decor(twinkle(910, 110, 15), { fill: '#FFFFFF', stroke: INK, width: 3 }),
    decor(twinkle(880, 340, 11), { fill: '#FFFFFF', stroke: INK, width: 3 }),
    decor(twinkle(40, 250, 12), { fill: '#FFFFFF', stroke: INK, width: 3 }),

    region('ground', shape([[-20, 1020, 1], [-20, 870], [200, 840], [430, 868], [700, 846], [1020, 872], [1020, 1020, 1]]), {
      hint: '#9FE0B2',
    }),
    inkLine(curve([[90, 950], [102, 922], [112, 952]]), LINE.fine),
    inkLine(curve([[300, 975], [312, 948], [322, 978]]), LINE.fine),
    inkLine(curve([[880, 960], [892, 932], [902, 962]]), LINE.fine),

    // looping flight trail
    ...dashedTrail([
      [380, 836],
      [320, 800],
      [262, 760],
      [236, 708],
      [262, 668],
      [306, 676],
      [312, 722],
      [270, 742],
      [222, 718],
      [196, 664],
      [196, 620],
    ]),

    // little daisy in the grass (leaves are just lines on the ground)
    inkLine(curve([[112, 966], [74, 934], [42, 944], [66, 964], [112, 966]]), LINE.inner),
    inkLine(curve([[120, 966], [160, 928], [194, 936], [172, 962], [120, 966]]), LINE.inner),
    ...daisy('daisy', 116, 888, 34, { petals: '#FFFFFF', mid: '#FFE27A' }, { part: 'daisy', n: 7 }),

    // sunflower (behind the pot)
    region('sunflower-stem', stemPath([[652, 800], [646, 640], [654, 470], [652, 330]], 28), { part: 'sunflower', hint: '#9FE0B2' }),
    ...leaf('sunflower-leaf-left', [646, 516], [516, 468], 38, '#BDEBC8', 'sunflower'),
    ...leaf('sunflower-leaf-right', [654, 480], [786, 428], 38, '#BDEBC8', 'sunflower'),
    region('sunflower-petals-back', petalRing(SX, SY, SR * 0.92, SR * 1.78, 12, -75), { part: 'sunflower', hint: '#FFD98A' }),
    region('sunflower-petals', petalRing(SX, SY, SR * 0.92, SR * 1.6, 12, -90), { part: 'sunflower', hint: '#FFE27A' }),
    region('sunflower-face', circle(SX, SY, SR), { part: 'sunflower', hint: '#E8C4A0' }),
    ...seeds,
    ...cuteEye(SX - 32, SY - 6, 44, { part: 'sunflower-eyes', look: [-0.6, 0] }),
    ...cuteEye(SX + 32, SY - 6, 44, { part: 'sunflower-eyes', look: [-0.6, 0] }),
    blush(SX - 56, SY + 24, 13, 8, 'sunflower'),
    blush(SX + 56, SY + 24, 13, 8, 'sunflower'),
    ...openSmile(SX, SY + 26, 24, 'sunflower'),

    // tulips (also in the pot)
    region('tulip-left-stem', stemPath([[612, 800], [588, 720], [548, 630]], 24), { part: 'tulip-left', hint: '#9FE0B2' }),
    ...tulip('tulip-left', 544, 620, 98, { cup: '#FFADB9' }, 'tulip-left', true),
    region('tulip-right-stem', stemPath([[692, 800], [716, 720], [756, 630]], 24), { part: 'tulip-right', hint: '#9FE0B2' }),
    ...tulip('tulip-right', 760, 620, 98, { cup: '#D7C2FF' }, 'tulip-right', true),

    // pot
    region('pot', shape([[494, 770], [810, 770], [780, 962, 1], [524, 962, 1]]), { hint: '#FFD3A5' }),
    region('pot-rim', rect(472, 712, 360, 68, 28), { hint: '#F5C9A6' }),
    region('pot-heart', heart(652, 872, 108, 98), { hint: '#FFB8D9' }),

    // little hearts between the friends
    decor(heart(430, 168, 32), { fill: '#FFFFFF', stroke: INK, width: 3.5 }),
    decor(heart(392, 118, 22), { fill: '#FFFFFF', stroke: INK, width: 3.5 }),

    ...bf.items,
  ],
};
