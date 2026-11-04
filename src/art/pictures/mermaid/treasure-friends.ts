import {
  blush,
  circle,
  combine,
  cuteEye,
  curve,
  drop,
  ellipse,
  ink,
  inkLine,
  LINE,
  petal,
  rect,
  region,
  shape,
  smile,
  smooth,
  star,
  type Pt,
} from '../../dsl';
import type { Picture } from '../../types';
import { bubble, face, fanShell, fanShellRidges, fish, miniBubble, seaweed, tube, waveBand } from './helpers';

const OCTO = '#D7C2FF';
const CRAB = '#FFADB9';

/** a round pincer opening upward-ish: circle with a wedge cut out (angle = opening direction) */
function pincer(cx: number, cy: number, r: number, angle: number): string {
  const pts: (Pt | [number, number, 1])[] = [];
  const gap = 26;
  for (let a = angle + gap; a <= angle + 360 - gap + 0.1; a += 30) {
    const t = (a * Math.PI) / 180;
    pts.push([cx + r * Math.cos(t), cy + r * Math.sin(t)]);
  }
  const first = pts[0] as Pt;
  const last = pts[pts.length - 1] as Pt;
  pts[0] = [first[0], first[1], 1];
  pts[pts.length - 1] = [last[0], last[1], 1];
  const t = (angle * Math.PI) / 180;
  pts.push([cx + r * 0.15 * Math.cos(t), cy + r * 0.15 * Math.sin(t), 1]);
  return shape(pts);
}

/** Octopus, crab and starfish friends around an open treasure chest. */
export const treasureFriends: Picture = {
  id: 'mermaid-treasure-friends',
  category: 'mermaid',
  title: 'Hazine Sandığı',
  parts: {
    'octo-eyes': { anim: 'blink', pivot: [196, 566], speed: 0.4 },
    'crab-eyes': { anim: 'blink', pivot: [800, 612], speed: 0.45, phase: 0.5 },
    'octo-arm': { anim: 'wag', pivot: [280, 610], amp: 10, speed: 1.2 },
    'claw-left': { anim: 'wag', pivot: [736, 690], amp: 12, speed: 1.5 },
    'claw-right': { anim: 'wag', pivot: [864, 690], amp: 12, speed: 1.5, phase: 0.5 },
    starfish: { anim: 'sway', pivot: [510, 900], amp: 6, speed: 0.8 },
    fish: { anim: 'sway', pivot: [440, 210], amp: 7, speed: 0.9 },
    bubbles: { anim: 'bob', pivot: [740, 160], amp: 14, speed: 0.6 },
  },
  celebrate: { sound: 'bubbles', particles: 'bubbles' },
  items: [
    region('water', rect(0, 0, 1000, 1000), { outline: false, hint: '#D9EEFF' }),
    region('water-deep', waveBand(370, 14, 2, 0.3), { hint: '#B9D8FF' }),

    ...fish('fish', 440, 210, 60, { part: 'fish', body: '#FFD3A5', tail: '#FFB8D9' }),
    ...bubble('bubble-1', 760, 250, 26, { part: 'bubbles' }),
    ...bubble('bubble-2', 700, 150, 36, { part: 'bubbles' }),
    ...bubble('bubble-3', 790, 70, 30, { part: 'bubbles' }),
    miniBubble(660, 230, 9, 'bubbles'),
    miniBubble(840, 170, 10, 'bubbles'),
    miniBubble(120, 300, 11),
    miniBubble(150, 250, 7),

    region('seaweed-left', seaweed(46, 700, 380, 52, 1.5, 18, 0.4), { hint: '#9FE0B2' }),
    region('seaweed-right', seaweed(962, 700, 420, 50, 1.6, 18, 2.4), { hint: '#BDEBC8' }),

    region('sand', waveBand(640, 14, 1.5, 0.9), { hint: '#FFE9B8' }),
    ...([[90, 900], [120, 930], [420, 950], [640, 960], [900, 940], [930, 965]] as Pt[]).map(([x, y]) => inkLine(circle(x, y, 3), LINE.fine)),

    // ---- treasure chest ----
    region('chest-lid', smooth([[384, 512], [380, 450], [430, 404], [520, 390], [610, 404], [660, 450], [656, 512]]), { hint: '#E8C4A0' }),
    inkLine(curve([[446, 410], [440, 460], [442, 506]]), LINE.inner),
    inkLine(curve([[594, 410], [600, 460], [598, 506]]), LINE.inner),
    region('chest-inside', ellipse(520, 518, 132, 26), { hint: '#C99A74' }),
    region('pearl-1', circle(466, 506, 26), { hint: '#FFF8FC' }),
    region('gem', drop(520, 500, 24, 24, -90), { hint: '#9ED6FF' }),
    region('pearl-2', circle(574, 506, 26), { hint: '#FFC9DD' }),
    region('chest', rect(388, 518, 264, 134, 16), { hint: '#E8C4A0' }),
    region('chest-band-left', rect(428, 518, 34, 134), { hint: '#FFE27A' }),
    region('chest-band-right', rect(578, 518, 34, 134), { hint: '#FFE27A' }),
    region('chest-lock', rect(498, 540, 44, 52, 10), { hint: '#FFE27A' }),
    ink(combine(circle(520, 560, 7), rect(517, 562, 6, 16, 2))),
    region('pearl-3', circle(366, 690, 22), { hint: '#FFF8FC' }),
    region('pearl-4', circle(676, 676, 20), { hint: '#E3D4FF' }),
    region('seashell', fanShell(880, 905, 84, 72, 10), { hint: '#FFC9DD' }),
    ...fanShellRidges(880, 905, 84, 72, 10),

    // ---- octopus ----
    region('octo-leg-1', tube([[120, 630], [86, 690], [68, 748], [86, 790], [120, 792], [126, 764]], [58, 52, 44, 34, 26, 20]), { hint: OCTO }),
    region('octo-leg-2', tube([[176, 650], [164, 712], [170, 772], [202, 800], [234, 790], [230, 764]], [58, 52, 44, 34, 26, 20]), { hint: OCTO }),
    region('octo-leg-3', tube([[236, 650], [256, 712], [290, 764], [330, 782], [356, 764], [340, 742]], [58, 52, 44, 34, 26, 20]), { hint: OCTO }),
    region('octo-arm', tube([[272, 612], [326, 572], [352, 512], [348, 450], [322, 422], [298, 436]], [56, 50, 42, 34, 26, 20]), {
      part: 'octo-arm',
      hint: OCTO,
    }),
    region('octo-head', smooth([[196, 426], [290, 452], [326, 532], [312, 616], [262, 662], [196, 672], [130, 662], [80, 616], [66, 532], [102, 452]]), {
      hint: OCTO,
    }),
    ...([[96, 760], [108, 784], [190, 784], [214, 796], [312, 770], [334, 772]] as Pt[]).map(([x, y]) => inkLine(circle(x, y, 4), LINE.fine)),
    ...face(196, 566, { gap: 92, eye: 60, eyePart: 'octo-eyes', smileY: 610, smileW: 32, cheekDx: 76, cheekY: 604, cheek: 18 }),
    inkLine(circle(150, 480, 14), LINE.fine),
    inkLine(circle(246, 474, 10), LINE.fine),
    inkLine(circle(200, 500, 8), LINE.fine),
    inkLine(circle(268, 516, 7), LINE.fine),

    // ---- crab ----
    region('crab-arm-left', tube([[742, 700], [714, 660], [706, 628]], [30, 28, 26]), { part: 'claw-left', hint: CRAB }),
    region('crab-claw-left', pincer(704, 598, 44, -70), { part: 'claw-left', hint: CRAB }),
    region('crab-arm-right', tube([[858, 700], [886, 660], [894, 628]], [30, 28, 26]), { part: 'claw-right', hint: CRAB }),
    region('crab-claw-right', pincer(896, 598, 44, -110), { part: 'claw-right', hint: CRAB }),
    inkLine(curve([[780, 672], [776, 640], [778, 620]]), LINE.outer),
    inkLine(curve([[820, 672], [824, 640], [822, 620]]), LINE.outer),
    region('crab-legs-left', combine(petal([724, 744], [672, 770], 14), petal([730, 770], [686, 806], 14), petal([748, 790], [716, 830], 14)), {
      hint: CRAB,
    }),
    region('crab-legs-right', combine(petal([876, 744], [928, 770], 14), petal([870, 770], [914, 806], 14), petal([852, 790], [884, 830], 14)), {
      hint: CRAB,
    }),
    region('crab', smooth([[800, 660], [878, 676], [906, 722], [880, 780], [800, 796], [720, 780], [694, 722], [722, 676]]), { hint: CRAB }),
    region('crab-eye-left', circle(776, 606, 26), { hint: '#FFFFFF' }),
    region('crab-eye-right', circle(824, 606, 26), { hint: '#FFFFFF' }),
    ...cuteEye(778, 610, 30, { part: 'crab-eyes' }),
    ...cuteEye(822, 610, 30, { part: 'crab-eyes' }),
    inkLine(smile(800, 728, 34, 12), LINE.inner),
    blush(748, 724, 16, 10),
    blush(852, 724, 16, 10),

    // ---- starfish ----
    region('starfish', star(510, 838, 98, 54, 5, -90), { part: 'starfish', hint: '#FFE27A' }),
    ...face(510, 840, { gap: 44, eye: 34, part: 'starfish', smileY: 866, smileW: 22, cheekDx: 40, cheekY: 864, cheek: 10 }),
    ...([[510, 768], [446, 822], [574, 822], [474, 900], [546, 900]] as Pt[]).map(([x, y]) => inkLine(circle(x, y, 4), LINE.fine, 'starfish')),
  ],
};
