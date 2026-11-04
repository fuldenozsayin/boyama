import {
  arc,
  blush,
  circle,
  cuteEye,
  curve,
  ellipse,
  happyEye,
  inkLine,
  LINE,
  rect,
  region,
  scallop,
  shape,
  smooth,
  star,
  type Pt,
} from '../../dsl';
import type { ArtItem, Picture } from '../../types';
import { bubble, bumpSeg, coral, curlyBlob, face, fanShell, fanShellRidges, fish, miniBubble, place, placer, seaweed, tube, waveBand } from './helpers';

const SKIN = '#FFE0CC';
const HAIR = '#FFD98A';

// ---- mermaid: body is tilted forward (swimming), head tilted a little less ----
const WAIST: Pt = [446, 594];
// the reaching arm is drawn in scene units relative to the original waist (430, 600)
const A = placer(WAIST[0] - 430, WAIST[1] - 600);
const B = placer(WAIST[0] - 470, WAIST[1] - 612, 1.2, 470, 612, 40);
const NECK = B(470, 480);
const H = placer(NECK[0] - 470, NECK[1] - 480, 1.2, 470, 480, 12);

const frillPts: Pt[] = [
  [544, 600],
  [518, 634],
  [488, 644],
  [456, 644],
  [426, 634],
  [398, 600],
];
const frill = `M398 600C440 588 502 588 544 600${frillPts
  .slice(0, -1)
  .map((p, i) => bumpSeg(p, frillPts[i + 1], 0.42, [471, 520]))
  .join('')}Z`;

const hairBack: ArtItem[] = [
  region(
    'hair-back',
    smooth([
      [470, 282], [556, 298], [602, 356], [610, 430], [594, 488], [544, 506], [476, 512], [410, 522], [350, 542], [300, 558],
      [258, 572], [232, 558], [240, 532], [268, 520], [228, 514], [204, 492], [216, 466], [252, 458], [222, 438], [210, 410],
      [232, 392], [272, 386], [306, 338], [358, 300], [414, 284],
    ]),
    { hint: HAIR },
  ),
  inkLine(curve([[372, 506], [318, 520], [262, 540]]), LINE.fine),
  inkLine(curve([[352, 340], [300, 384], [250, 420]]), LINE.fine),
];

const body: ArtItem[] = [
  region('arm-back', tube([[430, 504], [404, 556], [384, 604]], [30, 28, 28]), { hint: SKIN }),
  region(
    'tail-fin',
    shape([[262, 790], [214, 812], [168, 800], [150, 770], [196, 752, 1], [168, 718], [176, 690], [222, 704], [262, 750]]),
    { part: 'tail', hint: '#FFB8D9' },
  ),
  inkLine(curve([[236, 770], [200, 776], [174, 782]]), LINE.fine, 'tail'),
  inkLine(curve([[238, 748], [214, 730], [192, 712]]), LINE.fine, 'tail'),
  region(
    'tail',
    tube([[470, 610], [476, 668], [462, 738], [420, 788], [356, 806], [296, 790], [252, 760]], [120, 146, 128, 102, 80, 60, 46], false),
    { part: 'tail', hint: '#D7C2FF' },
  ),
  ...([[440, 668], [476, 668], [512, 668], [454, 694], [490, 694], [436, 720], [472, 720], [508, 720]] as Pt[]).map(([x, y]) =>
    inkLine(arc(x, y, 11, 20, 160), LINE.fine, 'tail'),
  ),
  region('torso', smooth([[470, 468], [512, 486], [526, 524], [514, 572], [508, 614], [432, 614], [426, 572], [414, 524], [428, 486]]), {
    hint: SKIN,
  }),
  region('shell-left', fanShell(447, 540, 52, 46, -12), { hint: '#FFADB9' }),
  region('shell-right', fanShell(493, 540, 52, 46, 12), { hint: '#FFADB9' }),
  region('tail-frill', frill, { hint: '#BDEBC8' }),
];

const armFront: ArtItem[] = [
  region(
    'arm-front',
    shape([
      [540, 512, 1], [604, 506], [656, 494], [664, 478], [680, 470], [690, 482], [706, 484], [720, 498], [718, 518], [702, 528],
      [676, 528], [610, 540], [546, 548, 1],
    ]),
    { hint: SKIN },
  ),
];

// side-swept bangs: outer edge follows the head, inner edge sweeps across the forehead
const bangPts = (): (Pt | [number, number, 1])[] => {
  const pts: (Pt | [number, number, 1])[] = [];
  for (let a = 160; a <= 380; a += 22) {
    const r = (a * Math.PI) / 180;
    pts.push([470 + 118 * Math.cos(r), 398 + 110 * Math.sin(r)]);
  }
  const first = pts[0] as Pt;
  const last = pts[pts.length - 1] as Pt;
  pts[0] = [first[0], first[1], 1];
  pts[pts.length - 1] = [last[0], last[1], 1];
  pts.push([566, 380], [528, 350], [478, 340], [436, 352], [398, 386, 1], [388, 366], [370, 400]);
  return pts;
};

const head: ArtItem[] = [
  region('head', ellipse(470, 398, 108, 100), { hint: SKIN }),
  ...face(470, 424, { gap: 84, eye: 60, lashes: true, eyePart: 'eyes', smileY: 466, smileW: 30, cheekDx: 70, cheekY: 460, cheek: 17 }),
  region('bangs', shape(bangPts()), { hint: HAIR }),
  region('flower', scallop(566, 312, 22, 5, 0.65), { hint: '#FFB8D9' }),
  region('flower-mid', circle(566, 312, 17), { hint: '#FFF0A0' }),
];

// ---- seahorse friend (drawn around the origin, facing left) ----
const SH = placer(846, 470, 1.15);
const seahorse: ArtItem[] = [
  region(
    'seahorse-tail',
    tube([[22, 92], [30, 150], [56, 186], [88, 190], [104, 164], [90, 140], [66, 148]], [46, 40, 32, 26, 22, 18, 14]),
    { part: 'seahorse', hint: '#FFD3A5' },
  ),
  region('seahorse-fin', shape([[54, -36, 1], [96, -30], [114, 2], [100, 36], [54, 40, 1]]), { part: 'seahorse', hint: '#FFB8D9' }),
  inkLine(line3([[60, -20], [100, -10]]), LINE.fine, 'seahorse'),
  inkLine(line3([[60, 2], [108, 4]]), LINE.fine, 'seahorse'),
  inkLine(line3([[60, 24], [98, 22]]), LINE.fine, 'seahorse'),
  region('seahorse-crest', curlyBlob(34, -150, 40, 26, 5, 0.5, -150), { part: 'seahorse', hint: '#FFB8D9' }),
  region(
    'seahorse',
    shape([
      [-10, -150], [30, -160], [58, -136], [62, -100], [50, -70], [62, -30], [66, 20], [56, 70], [34, 110], [8, 118], [-18, 96],
      [-40, 50], [-46, 0], [-36, -40], [-26, -70], [-44, -86], [-78, -90], [-100, -96, 1], [-100, -122, 1], [-72, -124], [-40, -132],
    ]),
    { part: 'seahorse', hint: '#FFD3A5' },
  ),
  region('seahorse-belly', smooth([[-26, -52], [-6, -54], [12, -24], [18, 22], [6, 74], [-14, 84], [-34, 46], [-38, 0]]), {
    part: 'seahorse',
    hint: '#FFF0A0',
  }),
  inkLine(curve([[-30, -20], [-10, -14], [10, -20]]), LINE.fine, 'seahorse'),
  inkLine(curve([[-34, 14], [-10, 20], [14, 14]]), LINE.fine, 'seahorse'),
  inkLine(curve([[-28, 48], [-8, 54], [10, 48]]), LINE.fine, 'seahorse'),
  ...cuteEye(-4, -110, 38, { part: 'seahorse', look: [-0.6, 0] }),
  blush(-26, -82, 9, 6, 'seahorse'),
];

function line3(pts: Pt[]): string {
  return curve(pts);
}

/** Mermaid swimming with her seahorse friend among coral and seaweed. */
export const seahorseSwim: Picture = {
  id: 'mermaid-seahorse-swim',
  category: 'mermaid',
  title: 'Denizatı Arkadaşım',
  parts: {
    eyes: { anim: 'blink', pivot: H(470, 424), speed: 0.4 },
    tail: { anim: 'wag', pivot: WAIST, amp: 8, speed: 1.2 },
    seahorse: { anim: 'bob', pivot: SH(0, 0), amp: 14, speed: 0.7 },
    fish1: { anim: 'sway', pivot: [190, 170], amp: 7, speed: 0.9 },
    fish2: { anim: 'sway', pivot: [700, 800], amp: 7, speed: 0.8, phase: 0.4 },
    bubbles: { anim: 'bob', pivot: [700, 200], amp: 14, speed: 0.6 },
    weed: { anim: 'sway', pivot: [70, 900], amp: 4, speed: 0.5 },
  },
  celebrate: { sound: 'bubbles', particles: 'bubbles' },
  items: [
    region('water', rect(0, 0, 1000, 1000), { outline: false, hint: '#D9EEFF' }),
    region('water-deep', waveBand(640, 16, 2, 0.8), { hint: '#B9D8FF' }),

    ...fish('fish-1', 190, 170, 56, { part: 'fish1', body: '#FFB8D9', tail: '#D7C2FF' }),

    region('seaweed-left', seaweed(70, 900, 360, 54, 1.5, 20, 0.5), { part: 'weed', hint: '#9FE0B2' }),
    region('seaweed-right', seaweed(950, 900, 420, 52, 1.7, 18, 2.2), { hint: '#9FE0B2' }),
    region('coral-left', coral(190, 900, 1.05), { hint: '#FFADB9' }),
    region('coral-ball', curlyBlob(870, 850, 66, 56, 9, 0.45), { hint: '#FFD3A5' }),
    ...([[850, 836], [884, 826], [872, 862], [900, 856], [842, 868]] as Pt[]).map(([x, y]) => inkLine(circle(x, y, 5), LINE.fine)),

    region('sand', waveBand(870, 12, 2, 1.1), { hint: '#FFE9B8' }),
    region('seashell', fanShell(470, 932, 78, 66, -8), { hint: '#FFC9DD' }),
    ...fanShellRidges(470, 932, 78, 66, -8),
    region('starfish', star(620, 930, 44, 24, 5, -100), { hint: '#FFE27A' }),
    happyEye(609, 927, 11),
    happyEye(631, 927, 11),
    ...([[320, 930], [346, 950], [540, 965], [720, 940], [760, 965]] as Pt[]).map(([x, y]) => inkLine(circle(x, y, 3), LINE.fine)),

    ...place(seahorse, SH),

    // mermaid
    ...place(hairBack, H),
    ...place(armFront, A),
    ...place(body, B),
    ...place(head, H),

    ...fish('fish-2', 690, 790, 52, { dir: -1, part: 'fish2', body: '#BDEBC8', tail: '#FFE27A' }),

    ...bubble('bubble-1', 736, 196, 28, { part: 'bubbles' }),
    ...bubble('bubble-2', 668, 96, 40, { part: 'bubbles' }),
    ...bubble('bubble-3', 420, 100, 34, { part: 'bubbles' }),
    miniBubble(712, 260, 10, 'bubbles'),
    miniBubble(760, 130, 9, 'bubbles'),
    miniBubble(360, 160, 9, 'bubbles'),
    miniBubble(940, 260, 12),
  ],
};
