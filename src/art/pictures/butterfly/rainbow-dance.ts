import { circle, cloud, curve, decor, heart, INK, inkLine, LINE, rect, region, ringSegment, scallop, shape, twinkle } from '../../dsl';
import type { ArtItem, PartAnim, Picture } from '../../types';
import { butterfly, note, stemLeaf, sunFace, tulip } from './helpers';

const pink = butterfly({
  prefix: 'pink-',
  cx: 262,
  cy: 318,
  s: 0.52,
  rot: 10,
  style: {
    top: '#FFB8D9',
    bottom: '#FFD98A',
    topSpot: '#D7C2FF',
    bottomSpot: '#FFFFFF',
    body: '#FFADB9',
    head: '#FFF4E6',
  },
  pattern: 'hearts',
  bottomSpots: false,
  parts: { left: 'pink-wings-left', right: 'pink-wings-right', eyes: 'pink-eyes' },
  look: [0.7, 0.1],
  lashes: true,
  tips: 'heart',
  mouth: 'open',
});

const blue = butterfly({
  prefix: 'blue-',
  cx: 738,
  cy: 318,
  s: 0.52,
  rot: -10,
  style: {
    top: '#9ED6FF',
    bottom: '#C9B8FF',
    topSpot: '#FFF0A0',
    bottomSpot: '#FFFFFF',
    body: '#B9D8FF',
    head: '#FFF4E6',
  },
  pattern: 'dots',
  bottomSpots: false,
  parts: { left: 'blue-wings-left', right: 'blue-wings-right', eyes: 'blue-eyes' },
  look: [-0.7, 0.1],
  tips: 'ball',
  mouth: 'open',
  phase: 0.5,
});

// rainbow arch
const RX = 500;
const RY = 930;
const BANDS = [
  { id: 'rainbow-1', rIn: 318, rOut: 362, hint: '#FFADB9' },
  { id: 'rainbow-2', rIn: 274, rOut: 318, hint: '#FFF0A0' },
  { id: 'rainbow-3', rIn: 230, rOut: 274, hint: '#B9D8FF' },
];
const FLOWER_ANGLES = [210, 240, 270, 300, 330];
const FLOWER_HINTS = ['#FFFFFF', '#D7C2FF', '#FFC9DD', '#D7C2FF', '#FFFFFF'];

const flowers: ArtItem[] = [];
const flowerParts: Record<string, PartAnim> = {};
FLOWER_ANGLES.forEach((a, i) => {
  const rad = (a * Math.PI) / 180;
  const x = Math.round(RX + Math.cos(rad) * 340);
  const y = Math.round(RY + Math.sin(rad) * 340);
  const part = `rainbow-flower-${i + 1}`;
  flowers.push(region(part, scallop(x, y, 25, 5, 0.65, a + 90), { part, hint: FLOWER_HINTS[i] }));
  flowers.push(region(`${part}-mid`, circle(x, y, 21), { part, hint: '#FFE27A' }));
  flowerParts[part] = { anim: 'sway', pivot: [x, y], amp: 14, speed: 0.9, phase: i * 0.2 };
});

/** Two butterfly friends dance around the sun above a flowery rainbow. */
export const rainbowDance: Picture = {
  id: 'butterfly-rainbow-dance',
  category: 'butterfly',
  title: 'Dans Eden Kelebekler',
  parts: {
    ...pink.parts,
    ...blue.parts,
    ...flowerParts,
    rays: { anim: 'spin', pivot: [500, 108], speed: 0.12 },
    heart: { anim: 'pulse', pivot: [500, 372], amp: 0.12, speed: 1.4 },
    'tulip-left': { anim: 'sway', pivot: [424, 935], amp: 6, speed: 0.8 },
    'tulip-right': { anim: 'sway', pivot: [576, 935], amp: 6, speed: 0.8, phase: 0.5 },
    notes: { anim: 'bob', pivot: [500, 500], amp: 10, speed: 1.2 },
  },
  celebrate: { sound: 'flutter', particles: 'petals' },
  items: [
    region('sky', rect(0, 0, 1000, 1000), { outline: false, hint: '#E3D4FF' }),
    ...sunFace(500, 108, 48, 'rays'),
    decor(twinkle(90, 90, 15), { fill: '#FFFFFF', stroke: INK, width: 3 }),
    decor(twinkle(910, 90, 15), { fill: '#FFFFFF', stroke: INK, width: 3 }),
    decor(twinkle(320, 560, 12), { fill: '#FFFFFF', stroke: INK, width: 3 }),
    decor(twinkle(680, 560, 12), { fill: '#FFFFFF', stroke: INK, width: 3 }),
    decor(twinkle(500, 740, 14), { fill: '#FFFFFF', stroke: INK, width: 3 }),

    // rainbow with flowers
    ...BANDS.map((b) => region(b.id, ringSegment(RX, RY, b.rIn, b.rOut, 180, 360), { hint: b.hint })),
    ...flowers,
    region('cloud-left', cloud(150, 905, 240, 124), { hint: '#FFFFFF' }),
    region('cloud-right', cloud(850, 905, 240, 124), { hint: '#FFFFFF' }),

    region('ground', shape([[-20, 1020, 1], [-20, 930], [250, 905], [500, 930], [750, 905], [1020, 930], [1020, 1020, 1]]), {
      hint: '#9FE0B2',
    }),
    inkLine(curve([[300, 975], [312, 948], [322, 978]]), LINE.fine),
    inkLine(curve([[680, 975], [692, 948], [702, 978]]), LINE.fine),

    // little tulips under the arch
    ...stemLeaf('tulip-left-stem', 424, 960, 810, 20, 880, 62, -1, '#9FE0B2', 'tulip-left'),
    ...tulip('tulip-left', 424, 794, 84, { cup: '#FFC9DD' }, 'tulip-left', true),
    ...stemLeaf('tulip-right-stem', 576, 960, 810, 20, 880, 62, 1, '#9FE0B2', 'tulip-right'),
    ...tulip('tulip-right', 576, 794, 84, { cup: '#FFE27A' }, 'tulip-right', true),

    // the dancers
    ...pink.items,
    ...blue.items,
    region('heart', heart(500, 372, 84, 78), { part: 'heart', hint: '#FFADB9' }),
    ...note(90, 620, 58, 'notes'),
    ...note(880, 620, 52, 'notes'),
    ...note(470, 510, 44, 'notes'),
  ],
};
