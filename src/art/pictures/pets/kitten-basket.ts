import {
  blush,
  circle,
  cuteEye,
  curve,
  decor,
  ellipse,
  heart,
  inkLine,
  LINE,
  rect,
  region,
  roundPoly,
  shape,
  smile,
  smooth,
  star,
  type Pt,
} from '../../dsl';
import type { Picture } from '../../types';
import { catEars, catFace, chubbyHead, leafFan, rotItems, tinyHeart, tinyTwinkle, toes, tube, zee } from './helpers';

// window centre x
const WX = 330;
// basket rim ellipse
const BX = 585;
const BY = 706;
const BRX = 266;
const BRY = 62;
// kitten head (tilted, resting on its paws)
const HX = 468;
const HY = 650;
const R = 102;
const TILT = -8;

/** points on the lower (front) half of the basket rim, left → right */
const rimFront = (n = 10, dy = 0): Pt[] =>
  Array.from({ length: n + 1 }, (_, i) => {
    const a = Math.PI - (Math.PI * i) / n;
    return [BX + BRX * Math.cos(a), BY + dy + BRY * Math.sin(a)] as Pt;
  });

/** tied-back curtain (s = 1 left, -1 right; points are written for the left one) */
const curtain = (s: number) =>
  shape(
    (
      [
        [-292, 88, 1],
        [-140, 88, 1],
        [-146, 160],
        [-186, 258],
        [-230, 330],
        [-210, 402],
        [-168, 470],
        [-152, 534],
        [-222, 548],
        [-290, 536],
        [-284, 430],
        [-266, 332],
        [-290, 222],
        [-296, 140],
      ] as [number, number, 1?][]
    ).map(([x, y, k]) => (k ? [WX + s * x, y, 1] : [WX + s * x, y])) as (Pt | [number, number, 1])[],
  );

const [earL, earInL, earR, earInR] = catEars(HX, HY, R).map((d) => rotItems([{ d }], TILT, HX, HY)[0].d);

/** Sleepy kitten tucked into its basket, a smiling moon watching from the window. */
export const kittenBasket: Picture = {
  id: 'pets-kitten-basket',
  category: 'pets',
  title: 'Uykucu Kedicik',
  parts: {
    tail: { anim: 'wag', pivot: [748, 752], amp: 12, speed: 1.1 },
    'moon-eyes': { anim: 'blink', pivot: [252, 182], speed: 0.4 },
    star1: { anim: 'twinkle', pivot: [415, 182] },
    star2: { anim: 'twinkle', pivot: [240, 346], phase: 0.5 },
    zzz: { anim: 'bob', pivot: [716, 470], amp: 12, speed: 0.6 },
    heart: { anim: 'pulse', pivot: [865, 214], amp: 0.12, speed: 1.2 },
  },
  celebrate: { sound: 'meow', particles: 'hearts' },
  items: [
    region('wall', rect(0, 0, 1000, 1000), { outline: false, hint: '#FFF4E6' }),
    region('floor', rect(-20, 600, 1040, 430), { hint: '#FFD98A' }),

    // window
    region('window-frame', rect(WX - 186, 96, 372, 342, 22), { hint: '#FFFFFF' }),
    region('pane-1', rect(WX - 163, 119, 152, 137, 8), { hint: '#B9D8FF' }),
    region('pane-2', rect(WX + 11, 119, 152, 137, 8), { hint: '#B9D8FF' }),
    region('pane-3', rect(WX - 163, 278, 152, 137, 8), { hint: '#B9D8FF' }),
    region('pane-4', rect(WX + 11, 278, 152, 137, 8), { hint: '#B9D8FF' }),
    region('moon', circle(252, 188, 52), { hint: '#FFF0A0' }),
    ...cuteEye(234, 182, 21, { part: 'moon-eyes' }),
    ...cuteEye(270, 182, 21, { part: 'moon-eyes' }),
    inkLine(smile(252, 204, 18, 5), LINE.fine),
    blush(222, 204, 8),
    blush(282, 204, 8),
    region('star1', star(415, 182, 32), { part: 'star1', hint: '#FFE27A' }),
    region('star2', star(240, 346, 30), { part: 'star2', hint: '#FFE27A' }),
    tinyTwinkle(196, 140, 10),
    tinyTwinkle(452, 232, 9),

    // potted plant on the sill
    region('plant', leafFan([440, 384], -90, 70, 90, 3, 0.24), { hint: '#9FE0B2' }),
    region('pot', roundPoly([[404, 376], [476, 376], [466, 434], [414, 434]], 0.16), { hint: '#FFADB9' }),
    region('sill', rect(WX - 206, 430, 412, 30, 12), { hint: '#FFFFFF' }),

    // curtains
    region('curtain-rod', rect(WX - 296, 64, 592, 22, 11), { hint: '#C99A74' }),
    decor(circle(WX - 302, 75, 15), { fill: '#FFFFFF', stroke: '#4E3D63', width: LINE.inner }),
    decor(circle(WX + 302, 75, 15), { fill: '#FFFFFF', stroke: '#4E3D63', width: LINE.inner }),
    region('curtain-left', curtain(1), { hint: '#FFB8D9' }),
    region('curtain-right', curtain(-1), { hint: '#FFB8D9' }),
    inkLine(curve([[WX - 250, 110], [WX - 262, 200], [WX - 250, 300]]), LINE.fine),
    inkLine(curve([[WX - 236, 372], [WX - 216, 450], [WX - 196, 520]]), LINE.fine),
    inkLine(curve([[WX + 250, 110], [WX + 262, 200], [WX + 250, 300]]), LINE.fine),
    inkLine(curve([[WX + 236, 372], [WX + 216, 450], [WX + 196, 520]]), LINE.fine),
    region('tie-left', ellipse(WX - 250, 332, 32, 21, -12), { hint: '#FFE27A' }),
    region('tie-right', ellipse(WX + 250, 332, 32, 21, 12), { hint: '#FFE27A' }),

    // heart picture on the wall
    region('picture-frame', rect(790, 140, 150, 148, 22), { hint: '#C9B8FF' }),
    region('picture-heart', heart(865, 214, 78), { part: 'heart', hint: '#FFADB9' }),

    // rug
    region('rug', ellipse(560, 880, 430, 94), { hint: '#BDEBC8' }),
    inkLine(curve([[160, 880], [210, 928], [360, 956], [560, 962], [760, 956], [910, 928], [960, 880]]), LINE.fine),

    // ---- basket + sleeping kitten ----
    region('basket-back', ellipse(BX, BY, BRX, BRY), { hint: '#E8C4A0' }),
    region('cushion', ellipse(BX, BY + 12, BRX - 36, BRY - 22), { hint: '#FFC9DD' }),
    region(
      'body',
      smooth([
        [430, 640],
        [520, 580],
        [640, 568],
        [742, 600],
        [776, 662],
        [740, 726],
        [560, 740],
        [440, 728],
      ]),
      { hint: '#E6E1EE' },
    ),
    region(
      'blanket',
      smooth([
        [566, 640],
        [650, 618],
        [738, 624],
        [796, 666],
        [800, 728],
        [640, 746],
        [548, 732],
        [536, 684],
      ]),
      { hint: '#C9B8FF' },
    ),
    tinyHeart(610, 678, 24),
    tinyHeart(690, 656, 22),
    tinyHeart(752, 698, 22),
    tinyHeart(672, 716, 18),
    region(
      'basket-front',
      shape([
        [BX - BRX, BY, 1],
        ...rimFront(10).slice(1, -1),
        [BX + BRX, BY, 1],
        [BX + BRX - 18, BY + 92],
        [BX + BRX - 70, BY + 168],
        [BX, BY + 190],
        [BX - BRX + 70, BY + 168],
        [BX - BRX + 18, BY + 92],
      ]),
      { hint: '#E8C4A0' },
    ),
    inkLine(curve(rimFront(10, 62).slice(1, -1).map(([x, y]) => [BX + (x - BX) * 0.93, y] as Pt)), LINE.fine),
    inkLine(curve(rimFront(10, 118).slice(2, -2).map(([x, y]) => [BX + (x - BX) * 0.86, y] as Pt)), LINE.fine),
    region('basket-rim', tube(rimFront(12), 38, 38), { hint: '#C99A74' }),

    // tail hanging over the rim
    region('tail', tube([[742, 744], [772, 790], [784, 850], [764, 896], [720, 904]], 40, 36), { part: 'tail', hint: '#E6E1EE' }),

    // paws on the rim, head resting on them
    region('paw-left', ellipse(HX - 34, 762, 38, 28, -6), { hint: '#FFFFFF' }),
    region('paw-right', ellipse(HX + 40, 768, 38, 28, 6), { hint: '#FFFFFF' }),
    ...toes(HX - 34, 790, 56),
    ...toes(HX + 40, 796, 56),
    region('ear-left', earL, { hint: '#E6E1EE' }),
    region('ear-left-inner', earInL, { hint: '#FFC9DD' }),
    region('ear-right', earR, { hint: '#E6E1EE' }),
    region('ear-right-inner', earInR, { hint: '#FFC9DD' }),
    region('head', rotItems([{ d: chubbyHead(HX, HY, R) }], TILT, HX, HY)[0].d, { hint: '#E6E1EE' }),
    ...rotItems(catFace(HX, HY, R, { sleep: true, eyeY: 0.1 }), TILT, HX, HY),

    // sleepy Zzz
    zee(664, 540, 26, 'zzz'),
    zee(712, 476, 34, 'zzz'),
    zee(770, 396, 44, 'zzz'),

    // yarn ball on the rug
    region('yarn', circle(170, 836, 62), { hint: '#FFB8D9' }),
    inkLine(curve([[124, 800], [170, 786], [216, 802]]), LINE.inner),
    inkLine(curve([[112, 836], [168, 818], [228, 834]]), LINE.inner),
    inkLine(curve([[124, 872], [172, 856], [218, 870]]), LINE.inner),
    inkLine(curve([[226, 862], [262, 900], [300, 884], [330, 904]]), LINE.inner),
  ],
};
