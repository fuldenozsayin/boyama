import {
  circle,
  combine,
  curve,
  decor,
  drop,
  ellipse,
  heart,
  ink,
  inkLine,
  LINE,
  rect,
  region,
  roundPoly,
  smooth,
  twinkle,
  shape,
  type Pt,
} from '../../dsl';
import type { DecorItem, Picture } from '../../types';
import { curlLock, sideHead } from './helpers';

const sparkle = (x: number, y: number, r: number, part?: string) =>
  decor(twinkle(x, y, r), { fill: '#FFFFFF', stroke: '#4E3D63', width: 3, part });
const dot = (x: number, y: number, r = 6): DecorItem => decor(circle(x, y, r), { fill: '#FFFFFF', stroke: '#4E3D63', width: 3 });

const head = sideHead({ x: 470, y: 438, s: 1.0, look: [0.4, 0.1] });

// bunting: two swags meeting at the top centre
const swagY = (x: number) => (x < 500 ? 46 + 70 * Math.sin((Math.PI * (x + 10)) / 510) : 46 + 70 * Math.sin((Math.PI * (x - 500)) / 510));
const flag = (x: number) => {
  const yl = swagY(x - 44) - 3;
  const yr = swagY(x + 44) - 3;
  return roundPoly([[x - 44, yl], [x + 44, yr], [x, (yl + yr) / 2 + 92]], 0.14);
};
const FLAG_X = [86, 240, 396, 604, 760, 914];

// cake
const CAKE_X = 730;

/** Birthday party: a unicorn sits by a big cake with balloons and bunting. */
export const birthdayParty: Picture = {
  id: 'unicorn-birthday-party',
  category: 'unicorn',
  title: 'Doğum Günü Partisi',
  parts: {
    eye: { anim: 'blink', pivot: head.eye, speed: 0.45 },
    tail: { anim: 'wag', pivot: [222, 790], amp: 10, speed: 1.3 },
    balloons: { anim: 'sway', pivot: [905, 770], amp: 5, speed: 0.6 },
    flame: { anim: 'pulse', pivot: [CAKE_X, 432], amp: 0.14, speed: 2.2 },
    flags: { anim: 'sway', pivot: [500, 40], amp: 1.5, speed: 0.8 },
    spark1: { anim: 'twinkle', pivot: [150, 300], amp: 0.4 },
    spark2: { anim: 'twinkle', pivot: [620, 300], amp: 0.4, phase: 0.33 },
    spark3: { anim: 'twinkle', pivot: [960, 620], amp: 0.4, phase: 0.66 },
  },
  celebrate: { sound: 'magic', particles: 'stars' },
  items: [
    region('wall', rect(0, 0, 1000, 1000), { outline: false, hint: '#E3D4FF' }),
    region('floor', rect(-20, 868, 1040, 160), { hint: '#FFD3A5' }),
    inkLine(curve([[60, 930], [140, 926]]), LINE.fine),
    inkLine(curve([[560, 950], [660, 946]]), LINE.fine),
    inkLine(curve([[820, 920], [900, 916]]), LINE.fine),

    // bunting
    inkLine(curve(Array.from({ length: 21 }, (_, i) => [-10 + i * 25.5, swagY(-10 + i * 25.5)] as Pt)), LINE.inner, 'flags'),
    inkLine(curve(Array.from({ length: 21 }, (_, i) => [500 + i * 25.5, swagY(500 + i * 25.5)] as Pt)), LINE.inner, 'flags'),
    ...FLAG_X.map((x, i) =>
      region(`flag-${i + 1}`, flag(x), { part: 'flags', hint: ['#FFADB9', '#FFF0A0', '#B9D8FF', '#BDEBC8', '#FFD3A5', '#D7C2FF'][i] }),
    ),

    // confetti
    sparkle(150, 300, 18, 'spark1'),
    sparkle(620, 300, 14, 'spark2'),
    sparkle(960, 620, 16, 'spark3'),
    dot(90, 470),
    dot(260, 220, 5),
    dot(590, 200, 5),
    dot(980, 420, 5),

    // balloons (strings first)
    inkLine(curve([[860, 382], [870, 470], [850, 560], [880, 680], [905, 770]]), LINE.fine, 'balloons'),
    inkLine(curve([[700, 336], [716, 420], [760, 520], [800, 640], [905, 770]]), LINE.fine, 'balloons'),
    region('balloon-heart', heart(860, 290, 170), { part: 'balloons', hint: '#FFADB9' }),
    decor(ellipse(812, 256, 14, 24, 30), { fill: '#FFFFFF', opacity: 0.85, part: 'balloons' }),
    region('balloon-round', ellipse(700, 250, 62, 76), { part: 'balloons', hint: '#B9D8FF' }),
    ink(roundPoly([[690, 338], [710, 338], [700, 324]], 0.2), 'balloons'),
    ink(roundPoly([[850, 384], [870, 384], [860, 368]], 0.2), 'balloons'),
    decor(ellipse(672, 220, 10, 18, 25), { fill: '#FFFFFF', opacity: 0.85, part: 'balloons' }),

    // cake on a stand
    region('cake-stand', shape([[620, 728], [840, 728], [820, 754, 1], [758, 760], [770, 868, 1], [690, 868, 1], [702, 760], [640, 754, 1]]), {
      hint: '#FFF4E6',
    }),
    region('cake-bottom', rect(630, 600, 200, 130, 22), { hint: '#FFC9DD' }),
    region('cake-top', rect(662, 498, 136, 110, 20), { hint: '#FFF0A0' }),
    region('icing', shape([[652, 492, 1], [808, 492, 1], [808, 528], [796, 552], [782, 540], [770, 530], [754, 556], [738, 538], [722, 530], [706, 552], [690, 538], [676, 530], [664, 552], [652, 528]]), {
      hint: '#FFFFFF',
    }),
    dot(682, 640, 5),
    dot(726, 668, 5),
    dot(770, 640, 5),
    dot(806, 680, 5),
    dot(656, 690, 5),
    region('candle', rect(CAKE_X - 17, 438, 34, 60, 8), { hint: '#B9D8FF' }),
    inkLine(curve([[CAKE_X - 17, 458], [CAKE_X + 17, 448]]), LINE.fine),
    inkLine(curve([[CAKE_X - 17, 480], [CAKE_X + 17, 470]]), LINE.fine),
    region('flame', drop(CAKE_X, 420, 20, 30), { part: 'flame', hint: '#FFE27A' }),

    // gift
    region('gift-box', rect(846, 770, 124, 104, 10), { hint: '#BDEBC8' }),
    region('gift-lid', rect(836, 742, 144, 38, 10), { hint: '#9FE0B2' }),
    region('gift-bow', combine(ellipse(876, 722, 32, 19, -28), ellipse(934, 722, 32, 19, 28)), { hint: '#FFADB9' }),
    decor(circle(905, 738, 13), { fill: '#FFFFFF', stroke: '#4E3D63', width: LINE.inner }),
    inkLine(curve([[908, 750], [908, 870]]), LINE.fine),

    // ---- unicorn (sitting) ----
    region('tail-1', curlLock([[232, 770], [170, 738], [114, 752], [92, 802]], 70, 30, -1), { part: 'tail', hint: '#FFB8D9' }),
    region('tail-2', curlLock([[230, 804], [176, 820], [146, 858]], 60, 26, -1), { part: 'tail', hint: '#B9D8FF' }),

    region('leg-front-far', rect(474, 680, 52, 176, 26), { hint: '#F6E9FA' }),
    region('hoof-front-far', rect(468, 830, 64, 44, 16), { hint: '#C9B6F2' }),

    region('body', ellipse(360, 690, 150, 100, -42), { hint: '#FFF8FC' }),
    region('haunch', ellipse(292, 790, 100, 88), { hint: '#FFF8FC' }),
    region('hoof-back', rect(350, 838, 82, 46, 18), { hint: '#B9A2F0' }),

    region('leg-front-near', rect(418, 690, 58, 182, 29), { hint: '#FFF8FC' }),
    region('hoof-front-near', rect(411, 844, 72, 46, 17), { hint: '#B9A2F0' }),

    region('neck', smooth([[372, 640], [470, 640], [520, 560], [500, 470], [420, 456], [380, 540]]), { hint: '#FFF8FC' }),
    region('mane-neck', curlLock([[418, 450], [380, 504], [362, 566], [368, 616]], 64, 28, 1), { hint: '#C9B8FF' }),
    ...head.items,
    sparkle(130, 610, 14),

    // cupcake on the floor (front)
    region('cupcake-liner', shape([[546, 900, 1], [656, 900, 1], [642, 978, 1], [560, 978, 1]]), { hint: '#B9D8FF' }),
    inkLine(curve([[574, 906], [580, 972]]), LINE.fine),
    inkLine(curve([[601, 906], [601, 972]]), LINE.fine),
    inkLine(curve([[628, 906], [622, 972]]), LINE.fine),
    region('cupcake-frosting', shape([[534, 904, 1], [540, 872], [566, 856], [580, 832], [604, 820], [626, 834], [636, 856], [662, 870], [668, 904, 1]]), {
      hint: '#FFC9DD',
    }),
    decor(heart(602, 806, 30), { fill: '#FFFFFF', stroke: '#4E3D63', width: LINE.fine }),
    sparkle(560, 760, 12),
  ],
};
