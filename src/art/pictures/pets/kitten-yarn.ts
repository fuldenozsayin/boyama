import { circle, curve, decor, ellipse, ink, inkLine, LINE, rect, region, shape, smooth, symmetric } from '../../dsl';
import type { Picture } from '../../types';
import { catEars, catFace, chubbyHead, tinyHeart, tinyTwinkle, toes, tube } from './helpers';

// kitten head
const HX = 420;
const HY = 395;
const R = 172;
const [earL, earInL, earR, earInR] = catEars(HX, HY, R);

/** Easy page: a chubby kitten sitting on a rug with a ball of yarn. */
export const kittenYarn: Picture = {
  id: 'pets-kitten-yarn',
  category: 'pets',
  title: 'Yumaklı Kedicik',
  parts: {
    eyes: { anim: 'blink', pivot: [HX, HY + 0.06 * R], speed: 0.45 },
    tail: { anim: 'wag', pivot: [226, 832], amp: 13, speed: 1.5 },
    yarn: { anim: 'sway', pivot: [770, 800], amp: 10, speed: 0.8 },
    fish: { anim: 'wag', pivot: [770, 268], amp: 8, speed: 1.1, phase: 0.3 },
  },
  celebrate: { sound: 'meow', particles: 'hearts' },
  items: [
    region('wall', rect(0, 0, 1000, 1000), { outline: false, hint: '#E3D4FF' }),
    region('floor', rect(-20, 690, 1040, 340), { hint: '#FFD98A' }),

    // framed fish picture
    region('frame', rect(650, 160, 250, 205, 28), { hint: '#FFB8D9' }),
    region('frame-inner', rect(676, 186, 198, 153, 14), { hint: '#D9EEFF' }),
    region(
      'fish',
      shape([
        [704, 270],
        [728, 240],
        [770, 230],
        [808, 244],
        [826, 264, 1],
        [858, 236],
        [866, 246],
        [858, 270],
        [866, 294],
        [858, 304],
        [826, 276, 1],
        [808, 296],
        [770, 310],
        [728, 300],
      ]),
      { part: 'fish', hint: '#FFD3A5' },
    ),
    ink(circle(738, 262, 7), 'fish'),
    inkLine(curve([[712, 282], [722, 288], [732, 284]]), LINE.fine, 'fish'),
    inkLine(curve([[788, 246], [798, 270], [788, 294]]), LINE.fine, 'fish'),
    decor(circle(706, 216, 7), { fill: '#FFFFFF', stroke: '#4E3D63', width: 3 }),
    decor(circle(690, 200, 4.5), { fill: '#FFFFFF', stroke: '#4E3D63', width: 3 }),

    tinyHeart(160, 236, 44),
    tinyHeart(250, 176, 28),
    tinyHeart(868, 452, 34),
    tinyTwinkle(140, 460, 18),
    tinyTwinkle(668, 478, 15),
    tinyTwinkle(612, 178, 13),
    tinyHeart(470, 84, 30),
    tinyTwinkle(372, 112, 12),
    tinyTwinkle(80, 96, 14),

    // rug
    region('rug', ellipse(462, 862, 358, 94), { hint: '#FFB8D9' }),
    inkLine(curve([[150, 870], [205, 908], [320, 930], [462, 936], [604, 930], [719, 908], [774, 870]]), LINE.fine),

    // yarn string on the floor (under the kitten's paw)
    inkLine(curve([[694, 846], [646, 884], [584, 872], [520, 882]]), LINE.inner),

    // ---- kitten ----
    region('tail', tube([[280, 826], [208, 834], [152, 802], [128, 740], [136, 680], [174, 642]], 56, 50), {
      part: 'tail',
      hint: '#FFD3A5',
    }),
    region(
      'body',
      smooth(
        symmetric(
          [
            [HX, 515],
            [HX + 85, 522],
            [HX + 158, 600],
            [HX + 186, 700],
            [HX + 180, 800],
            [HX + 135, 852],
            [HX, 864],
          ],
          HX,
        ),
      ),
      { hint: '#FFD3A5' },
    ),
    // hind legs: round haunch + foot peeking forward
    region('leg-left', ellipse(HX - 136, 796, 66, 80, 12), { hint: '#FFD3A5' }),
    region('leg-right', ellipse(HX + 136, 796, 66, 80, -12), { hint: '#FFD3A5' }),
    ...toes(HX - 146, 874, 56),
    ...toes(HX + 146, 874, 56),
    region('belly', ellipse(HX, 718, 84, 104), { hint: '#FFF4E6' }),
    region('paw-left', ellipse(HX - 47, 840, 46, 36), { hint: '#FFF4E6' }),
    region('paw-right', ellipse(HX + 47, 840, 46, 36), { hint: '#FFF4E6' }),
    ...toes(HX - 47, 874, 64),
    ...toes(HX + 47, 874, 64),

    // collar under the chin
    region('collar', ellipse(HX, HY + 0.84 * R * 1.0 + 6, 124, 40), { hint: '#9ED6FF' }),
    region('ear-left', earL, { hint: '#FFD3A5' }),
    region('ear-left-inner', earInL, { hint: '#FFC9DD' }),
    region('ear-right', earR, { hint: '#FFD3A5' }),
    region('ear-right-inner', earInR, { hint: '#FFC9DD' }),
    region('head', chubbyHead(HX, HY, R), { hint: '#FFD3A5' }),
    region('bell', circle(HX, HY + 0.84 * R + 46, 25), { hint: '#FFE27A' }),
    inkLine(curve([[HX - 22, HY + 0.84 * R + 42], [HX, HY + 0.84 * R + 46], [HX + 22, HY + 0.84 * R + 42]]), LINE.fine),
    ink(circle(HX, HY + 0.84 * R + 56, 4.5)),

    // tabby marks on the forehead
    inkLine(curve([[HX, HY - 0.8 * R], [HX, HY - 0.64 * R]]), LINE.inner),
    inkLine(curve([[HX - 0.16 * R, HY - 0.77 * R], [HX - 0.13 * R, HY - 0.64 * R]]), LINE.inner),
    inkLine(curve([[HX + 0.16 * R, HY - 0.77 * R], [HX + 0.13 * R, HY - 0.64 * R]]), LINE.inner),
    ...catFace(HX, HY, R, { eyePart: 'eyes' }),

    // yarn balls
    region('yarn-small', circle(864, 906, 44), { hint: '#BDEBC8' }),
    inkLine(curve([[830, 886], [862, 876], [896, 888]]), LINE.fine),
    inkLine(curve([[822, 910], [862, 898], [906, 910]]), LINE.fine),
    inkLine(curve([[834, 932], [866, 922], [898, 932]]), LINE.fine),
    region('yarn', circle(770, 800, 92), { part: 'yarn', hint: '#9ED6FF' }),
    inkLine(curve([[700, 742], [760, 724], [826, 742]]), LINE.inner, 'yarn'),
    inkLine(curve([[682, 786], [756, 760], [848, 770]]), LINE.inner, 'yarn'),
    inkLine(curve([[688, 834], [770, 800], [856, 818]]), LINE.inner, 'yarn'),
    inkLine(curve([[720, 870], [790, 842], [840, 858]]), LINE.inner, 'yarn'),
  ],
};
