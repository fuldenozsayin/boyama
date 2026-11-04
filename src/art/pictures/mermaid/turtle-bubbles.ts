import {
  curve,
  cuteEye,
  ellipse,
  happyEye,
  ink,
  inkLine,
  LINE,
  rect,
  region,
  roundPoly,
  shape,
  smile,
  smooth,
  star,
  circle,
  type Pt,
} from '../../dsl';
import type { ArtItem, Picture } from '../../types';
import { bubble, face, fanShell, fanShellRidges, miniBubble, paddle, place, placer, seaweed, waveBand } from './helpers';

// the turtle is drawn in its own coordinates and then scaled into the scene
const T = placer(-40, -62, 1.15, 480, 560, -6);

const turtle: ArtItem[] = [
  region('turtle-tail', smooth([[318, 566], [262, 570], [224, 596], [262, 616], [318, 618]]), { hint: '#C8F0D0' }),
  region('flipper-back', paddle([360, 604], [236, 684], 40), { hint: '#C8F0D0' }),
  region('flipper-front-far', paddle([546, 606], [576, 716], 34), { hint: '#B5E6BF' }),
  region('shell', shape([[292, 590, 1], [316, 478], [396, 398], [488, 370], [580, 390], [646, 458], [672, 590, 1]]), {
    hint: '#9FE0B2',
  }),
  region('shell-plate-left', smooth([[332, 556], [346, 488], [392, 446], [416, 506], [400, 560]]), { hint: '#C8F0D0' }),
  region('shell-plate-mid', roundPoly([[482, 414], [546, 446], [546, 528], [482, 560], [418, 528], [418, 446]], 0.22), {
    hint: '#FFF0A0',
  }),
  region('shell-plate-right', smooth([[632, 556], [618, 488], [572, 446], [548, 506], [564, 560]]), { hint: '#C8F0D0' }),
  region('shell-rim', rect(276, 568, 412, 56, 28), { hint: '#FFE27A' }),
  region('flipper-front', paddle([600, 600], [758, 704], 46), { part: 'flipper', hint: '#C8F0D0' }),
  region('head', ellipse(738, 470, 114, 102), { hint: '#C8F0D0' }),
  ...face(738, 478, { gap: 76, eye: 58, eyePart: 'eyes', smileY: 520, smileW: 34, cheekY: 522, cheekDx: 68, cheek: 18 }),
];

/** EASY page: a smiling baby sea turtle blowing bubbles. */
export const turtleBubbles: Picture = {
  id: 'mermaid-turtle-bubbles',
  category: 'mermaid',
  title: 'Gülen Kaplumbağa',
  parts: {
    eyes: { anim: 'blink', pivot: T(738, 478), speed: 0.45 },
    flipper: { anim: 'wag', pivot: T(612, 606), amp: 14, speed: 1.3 },
    fish: { anim: 'sway', pivot: [232, 178], amp: 8, speed: 0.9 },
    bubbles: { anim: 'bob', pivot: [900, 200], amp: 16, speed: 0.7 },
    weed: { anim: 'sway', pivot: [92, 860], amp: 4, speed: 0.5 },
  },
  celebrate: { sound: 'bubbles', particles: 'bubbles' },
  items: [
    region('water', rect(0, 0, 1000, 1000), { outline: false, hint: '#D9EEFF' }),
    region('water-deep', waveBand(700, 16, 2, 0.4), { hint: '#B9D8FF' }),

    // little fish
    region('fish-tail', roundPoly([[170, 178], [100, 128], [94, 230]], 0.3), { part: 'fish', hint: '#FFD3A5' }),
    region('fish', ellipse(240, 178, 84, 62), { part: 'fish', hint: '#FFE27A' }),
    inkLine(curve([[206, 124], [192, 178], [206, 232]]), LINE.inner, 'fish'),
    ...cuteEye(276, 168, 40, { part: 'fish' }),
    inkLine(smile(298, 204, 20, 7), LINE.inner, 'fish'),

    // seaweed
    region('seaweed-left', seaweed(92, 870, 400, 58, 1.6, 22, 0), { part: 'weed', hint: '#9FE0B2' }),
    region('seaweed-right', seaweed(930, 870, 300, 54, 1.2, 18, 2), { hint: '#BDEBC8' }),

    region('sand', waveBand(838, 12, 2, 1.3), { hint: '#FFE9B8' }),
    ...([[330, 905], [352, 930], [520, 960], [560, 915], [660, 950], [940, 960]] as Pt[]).map(([x, y]) =>
      ink(circle(x, y, 4)),
    ),

    // starfish + shell on the sand
    region('starfish', star(170, 905, 62, 32, 5, -100), { hint: '#FFB8D9' }),
    happyEye(155, 900, 15),
    happyEye(185, 900, 15),
    inkLine(smile(170, 918, 13, 4), LINE.fine),
    region('seashell', fanShell(820, 910, 110, 92, 8), { hint: '#FFC9DD' }),
    ...fanShellRidges(820, 910, 110, 92, 8),

    // ---- turtle ----
    ...place(turtle, T),

    // bubbles
    ...bubble('bubble-1', 884, 268, 27, { part: 'bubbles' }),
    ...bubble('bubble-2', 918, 182, 34, { part: 'bubbles' }),
    ...bubble('bubble-3', 862, 86, 44, { part: 'bubbles' }),
    miniBubble(842, 214, 9, 'bubbles'),
    miniBubble(944, 70, 8, 'bubbles'),
    miniBubble(430, 120, 12),
    miniBubble(462, 76, 8),
    miniBubble(600, 170, 10),
  ],
};
