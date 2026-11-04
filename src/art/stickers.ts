import {
  arc,
  circle,
  cloud,
  curve,
  drop,
  ellipse,
  heart,
  petal,
  poly,
  rect,
  rotate,
  roundPoly,
  scallop,
  shape,
  smooth,
  star,
  twinkle,
  translate,
  mirrorX,
  type Pt,
} from './dsl';
import {
  CHEEK_DEEP,
  R,
  cheek,
  crescent,
  eye,
  face,
  fillD,
  gloss,
  inkFill,
  smileLine,
  catMouth,
  segments,
  sparkle,
  thin,
  THIN,
} from './sticker-helpers';
import type { ArtItem, StickerDef } from './types';

// ---------------------------------------------------------------------------
// Reward stickers. Each one lives in a 200 x 200 box (~14 units margin) and is
// always shown in its hint colours; the app adds the white die-cut border.
// ---------------------------------------------------------------------------

/** move a whole sticker (all items) by dx, dy */
const shift = (items: ArtItem[], dx: number, dy: number): ArtItem[] => items.map((it) => ({ ...it, d: translate(it.d, dx, dy) }));

const lerp = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

// 1 ─ star ------------------------------------------------------------------
const starSticker: ArtItem[] = [
  R('star', star(100, 108, 90, 54), '#FFE27A'),
  gloss(82, 50, 4.5, 9, 25),
  ...face(100, 108, { size: 26, gap: 40, mouth: 'smile' }),
];

// 2 ─ heart -----------------------------------------------------------------
const heartSticker: ArtItem[] = [
  R('heart', heart(100, 104, 170, 152), '#FFA9C4'),
  gloss(52, 64, 8, 13, 40),
  ...face(100, 104, { size: 27, gap: 42, cheekColor: CHEEK_DEEP }),
];

// 3 ─ rainbow ---------------------------------------------------------------
/** one rainbow band: an arch with straight legs going down into the clouds */
function archBand(cx: number, cy: number, rIn: number, rOut: number, leg: number): string {
  const outer = arc(cx, cy, rOut, 180, 360);
  const inner = arc(cx, cy, rIn, 360, 180);
  return (
    `M${cx - rOut} ${cy + leg}L${cx - rOut} ${cy}` +
    outer.replace(/^M[^C]*/, '') +
    `L${cx + rOut} ${cy + leg}L${cx + rIn} ${cy + leg}L${cx + rIn} ${cy}` +
    inner.replace(/^M[^C]*/, '') +
    `L${cx - rIn} ${cy + leg}Z`
  );
}
const rbY = 112;
const rbBands = ['#FFADB9', '#FFD3A5', '#FFF0A0', '#BDEBC8', '#B9D8FF'];
const rbCloud = (side: 'left' | 'right', cx: number): ArtItem[] => [
  R(`cloud-${side}`, cloud(cx, 148, 68, 58), '#FFFFFF'),
  ...face(cx, 154, { size: 16, gap: 20, cheekDx: 17, cheekDy: 8, cheekR: 4.5, mouthW: 7, mouthDy: 7 }),
];
const rainbowSticker: ArtItem[] = [
  ...rbBands.map((hint, i) => R(`band-${i + 1}`, archBand(100, rbY, 82 - (i + 1) * 11, 82 - i * 11, 26), hint)),
  ...rbCloud('left', 51),
  ...rbCloud('right', 149),
];

// 4 ─ flower ----------------------------------------------------------------
const flowerSticker: ArtItem[] = [
  R('stem', rect(94, 120, 12, 64, 6), '#9FE0B2'),
  R('leaf-left', petal([98, 170], [52, 146], 15), '#9FE0B2'),
  R('leaf-right', petal([102, 162], [148, 138], 15), '#BDEBC8'),
  R('petals', scallop(100, 82, 38, 5, 0.62), '#FFB8D9'),
  R('center', circle(100, 82, 32), '#FFE27A'),
  ...face(100, 80, { size: 20, gap: 26, cheekDx: 20, cheekR: 5 }),
];

// 5 ─ crown -----------------------------------------------------------------
const crownSticker: ArtItem[] = [
  R(
    'crown',
    roundPoly(
      [
        [32, 150],
        [26, 64],
        [64, 102],
        [100, 46],
        [136, 102],
        [174, 64],
        [168, 150],
      ],
      0.14,
    ),
    '#FFDA70',
  ),
  R('ball-left', circle(27, 60, 11), '#FFB8D9'),
  R('ball-mid', circle(100, 40, 12), '#FFB8D9'),
  R('ball-right', circle(173, 60, 11), '#FFB8D9'),
  R('band', rect(24, 134, 152, 36, 13), '#FFC46B'),
  R('gem-mid', heart(100, 152, 26, 24), '#FF9FC0'),
  R('gem-left', circle(56, 152, 8), '#9ED6FF'),
  R('gem-right', circle(144, 152, 8), '#9ED6FF'),
  gloss(50, 112, 4, 8, 15),
  ...face(100, 104, { size: 23, gap: 38 }),
];

// 6 ─ cupcake ---------------------------------------------------------------
const cupcakeSticker: ArtItem[] = [
  R('wrapper', roundPoly([[44, 116], [156, 116], [140, 184], [60, 184]], 0.1), '#C9B8FF'),
  ...segments(
    [
      [[57, 124], [67, 178]],
      [[143, 124], [133, 178]],
    ],
    2.6,
  ),
  R(
    'frosting',
    smooth([
      [30, 112],
      [36, 88],
      [60, 74],
      [100, 70],
      [140, 74],
      [164, 88],
      [170, 112],
      [158, 126],
      [143, 119],
      [128, 129],
      [113, 122],
      [100, 131],
      [87, 122],
      [72, 129],
      [57, 119],
      [42, 126],
    ]),
    '#FFB8D9',
  ),
  R(
    'frosting-top',
    smooth([
      [50, 88],
      [58, 66],
      [80, 52],
      [100, 47],
      [120, 52],
      [142, 66],
      [150, 88],
      [126, 96],
      [100, 98],
      [74, 96],
    ]),
    '#FFC9DD',
  ),
  thin(curve([[100, 28], [104, 18], [114, 14]]), THIN),
  R('cherry', circle(100, 38, 12), '#FF7FA3'),
  gloss(95, 34, 3, 4.5, 20),
  // sprinkles
  fillD(rect(66, 76, 11, 5, 2.5), '#9ED6FF'),
  fillD(rotate(rect(124, 66, 11, 5, 2.5), 40, 129, 68), '#FFE27A'),
  fillD(rotate(rect(86, 82, 11, 5, 2.5), -35, 91, 84), '#9FE0B2'),
  fillD(rotate(rect(112, 84, 11, 5, 2.5), 20, 117, 86), '#C9B8FF'),
  fillD(rotate(rect(40, 102, 11, 5, 2.5), 50, 45, 104), '#FFE27A'),
  fillD(rotate(rect(150, 100, 11, 5, 2.5), -40, 155, 102), '#9ED6FF'),
  ...face(100, 146, { size: 22, gap: 36, cheekDx: 30, cheekDy: 12, cheekR: 6.5 }),
];

// 7 ─ ice cream -------------------------------------------------------------
const coneA: Pt = [56, 110];
const coneB: Pt = [144, 110];
const coneC: Pt = [100, 188];
const waffle: [Pt, Pt][] = [];
for (const t of [0.2, 0.45, 0.7]) {
  const p = lerp(coneA, coneB, t);
  waffle.push([p, lerp(coneB, coneC, 1 - t)]);
  waffle.push([lerp(coneA, coneB, 1 - t), lerp(coneA, coneC, 1 - t)]);
}
const iceCreamSticker: ArtItem[] = [
  R('cone', roundPoly([coneA, coneB, coneC], 0.08), '#FFD3A5'),
  ...segments(waffle, 2.6),
  R(
    'scoop',
    smooth([
      [32, 98],
      [38, 64],
      [64, 40],
      [100, 32],
      [136, 40],
      [162, 64],
      [168, 98],
      [158, 116],
      [144, 110],
      [134, 128],
      [120, 114],
      [100, 122],
      [82, 114],
      [70, 126],
      [58, 110],
      [42, 116],
    ]),
    '#BDEBC8',
  ),
  R('cherry', circle(100, 30, 12), '#FF7FA3'),
  thin(curve([[102, 20], [106, 16], [114, 15]]), THIN),
  gloss(95, 26, 3, 4.5, 20),
  gloss(52, 66, 5, 10, 35),
  ...face(100, 82, { size: 25, gap: 40 }),
];

// 8 ─ balloon ---------------------------------------------------------------
const balloonSticker: ArtItem[] = [
  thin(curve([[140, 112], [136, 134], [116, 152], [104, 170]]), 2.6),
  thin(curve([[84, 150], [86, 160], [98, 164], [104, 170]]), 2.6),
  thin(curve([[104, 170], [98, 178], [104, 186]]), 2.6),
  R('balloon-back', ellipse(140, 64, 36, 42), '#C9B8FF'),
  R('knot-back', roundPoly([[133, 114], [147, 114], [140, 103]], 0.2), '#C9B8FF'),
  gloss(125, 44, 4.5, 9, 30),
  R('balloon', ellipse(82, 82, 58, 64), '#FFADC6'),
  R('knot', roundPoly([[74, 156], [90, 156], [82, 143]], 0.2), '#FFADC6'),
  gloss(55, 48, 7, 14, 35),
  R('bow-left', petal([104, 168], [80, 156], 11), '#FFE27A'),
  R('bow-right', petal([104, 168], [128, 156], 11), '#FFE27A'),
  R('bow-knot', circle(104, 168, 6.5), '#FFE27A'),
  ...face(82, 86, { size: 27, gap: 42, cheekColor: CHEEK_DEEP }),
];

// 9 ─ unicorn (front-facing head) -------------------------------------------
const unicornSticker: ArtItem[] = [
  R('mane-left', smooth([[58, 56], [34, 82], [28, 124], [34, 160], [52, 176], [62, 150], [60, 110]]), '#FFB8D9'),
  R('mane-left-2', smooth([[52, 120], [42, 146], [46, 172], [64, 180], [70, 150]]), '#D7C2FF'),
  R('mane-right', smooth([[142, 56], [166, 82], [172, 120], [164, 150], [148, 152], [146, 110]]), '#D7C2FF'),
  R('ear-left', petal([66, 66], [52, 26], 13), '#FFF8FC'),
  R('ear-right', petal([134, 66], [148, 26], 13), '#FFF8FC'),
  fillD(petal([65, 60], [55, 36], 5), '#FFC9DD'),
  fillD(petal([135, 60], [145, 36], 5), '#FFC9DD'),
  R('horn', drop(100, 53, 12, 25, -90), '#FFE27A'),
  thin(curve([[92, 44], [100, 40], [108, 38]]), 2.4),
  thin(curve([[94, 32], [100, 29], [105, 27]]), 2.4),
  R('head', ellipse(100, 104, 58, 54), '#FFF8FC'),
  R('forelock', smooth([[60, 74], [70, 56], [92, 50], [102, 60], [96, 74], [80, 84]]), '#FFB8D9'),
  R('forelock-2', smooth([[104, 58], [120, 50], [140, 62], [146, 80], [128, 76], [110, 72]]), '#B9D8FF'),
  R('muzzle', ellipse(100, 138, 38, 22), '#FFE0EE'),
  fillD(ellipse(88, 134, 3.2, 4), '#4E3D63'),
  fillD(ellipse(112, 134, 3.2, 4), '#4E3D63'),
  smileLine(100, 146, 12, 3.5),
  ...face(100, 104, { size: 26, gap: 44, lashes: true, mouth: 'none', cheekDx: 40, cheekDy: 12 }),
];

// 10 ─ kitten ---------------------------------------------------------------
const kittenSticker: ArtItem[] = [
  R('ear-left', roundPoly([[34, 92], [44, 22], [96, 60]], 0.18), '#FFCB94'),
  R('ear-right', roundPoly([[166, 92], [156, 22], [104, 60]], 0.18), '#FFCB94'),
  R('ear-left-in', roundPoly([[50, 74], [52, 40], [78, 60]], 0.22), '#FFC9DD'),
  R('ear-right-in', roundPoly([[150, 74], [148, 40], [122, 60]], 0.22), '#FFC9DD'),
  R('head', smooth(ellipsePtsLocal(100, 112, 74, 58, 14)), '#FFCB94'),
  thin(curve([[92, 58], [94, 66], [92, 72]]), 3, '#E8955A'),
  thin(curve([[100, 56], [100, 64], [100, 72]]), 3, '#E8955A'),
  thin(curve([[108, 58], [106, 66], [108, 72]]), 3, '#E8955A'),
  fillD(roundPoly([[93, 119], [107, 119], [100, 127]], 0.3), '#FF8FB1'),
  catMouth(100, 128, 16),
  thin(curve([[30, 118], [44, 120]]), 2.4),
  thin(curve([[32, 130], [46, 128]]), 2.4),
  thin(curve([[170, 118], [156, 120]]), 2.4),
  thin(curve([[168, 130], [154, 128]]), 2.4),
  ...face(100, 104, { size: 26, gap: 52, mouth: 'none', lashes: true, cheekDx: 44, cheekDy: 18 }),
];

function ellipsePtsLocal(cx: number, cy: number, rx: number, ry: number, n: number): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (2 * Math.PI * i) / n;
    // slightly squarer bottom for a chubby cat head
    const k = Math.sin(a) > 0 ? 0.94 : 1;
    pts.push([cx + rx * Math.cos(a), cy + ry * k * Math.sin(a)]);
  }
  return pts;
}

// 11 ─ puppy ----------------------------------------------------------------
const puppySticker: ArtItem[] = [
  R('head', ellipse(100, 104, 62, 56), '#FFF4E6'),
  R('patch', smooth([[118, 76], [140, 78], [150, 98], [140, 116], [120, 116], [108, 98]]), '#E8C4A0'),
  R('ear-left', smooth([[62, 58], [40, 60], [24, 92], [26, 130], [42, 140], [56, 118], [64, 84]]), '#C99A74'),
  R('ear-right', smooth([[138, 58], [160, 60], [176, 92], [174, 130], [158, 140], [144, 118], [136, 84]]), '#C99A74'),
  R('muzzle', ellipse(100, 130, 30, 22), '#FFFFFF'),
  R('tongue', smooth([[92, 140], [108, 140], [108, 154], [100, 160], [92, 154]]), '#FF9FB8'),
  thin(curve([[100, 144], [100, 152]]), 2.2),
  thin(`M88 136Q94 144 100 136Q106 144 112 136`, 2.8),
  inkFill(ellipse(100, 124, 9, 6.5)),
  gloss(97, 122, 3, 1.8, 0, 1),
  ...face(100, 98, { size: 26, gap: 46, mouth: 'none', cheekDx: 44, cheekDy: 24 }),
];

// 12 ─ bunny ----------------------------------------------------------------
const bunnySticker: ArtItem[] = [
  R('ear-left', ellipse(74, 56, 18, 41, -14), '#F4EEFF'),
  R('ear-right', ellipse(126, 56, 18, 41, 14), '#F4EEFF'),
  fillD(ellipse(74, 60, 8, 27, -14), '#FFC9DD'),
  fillD(ellipse(126, 60, 8, 27, 14), '#FFC9DD'),
  R('head', ellipse(100, 128, 62, 52), '#F4EEFF'),
  R('flower', scallop(134, 82, 9, 5, 0.6), '#FFE27A'),
  fillD(circle(134, 82, 6), '#FF9FBF'),
  fillD(roundPoly([[94, 136], [106, 136], [100, 143]], 0.3), '#FF8FB1'),
  catMouth(100, 144, 14),
  ...face(100, 124, { size: 25, gap: 48, mouth: 'none', cheekDx: 42, cheekDy: 18 }),
];

// 13 ─ butterfly ------------------------------------------------------------
const wingTop = smooth([[96, 96], [80, 56], [52, 30], [26, 34], [18, 64], [32, 96], [64, 110]]);
const wingBottom = smooth([[96, 112], [64, 112], [36, 130], [34, 160], [56, 172], [82, 156], [96, 130]]);
const butterflySticker: ArtItem[] = [
  R('wing-top-left', wingTop, '#FFB8D9'),
  R('wing-top-right', mirrorX(wingTop, 100), '#FFB8D9'),
  R('wing-bottom-left', wingBottom, '#D7C2FF'),
  R('wing-bottom-right', mirrorX(wingBottom, 100), '#D7C2FF'),
  R('spot-1', circle(44, 62, 11), '#FFF0A0'),
  R('spot-2', circle(156, 62, 11), '#FFF0A0'),
  R('spot-3', circle(58, 146, 8), '#B9D8FF'),
  R('spot-4', circle(142, 146, 8), '#B9D8FF'),
  thin(curve([[92, 56], [86, 38], [74, 26]]), 2.8),
  thin(curve([[108, 56], [114, 38], [126, 26]]), 2.8),
  R('antenna-left', circle(72, 24, 6), '#FFB8D9'),
  R('antenna-right', circle(128, 24, 6), '#FFB8D9'),
  R('body', rect(87, 92, 26, 82, 13), '#C9B8FF'),
  R('head', circle(100, 74, 26), '#E3D4FF'),
  ...face(100, 74, { size: 17, gap: 22, cheekDx: 15, cheekDy: 8, cheekR: 4.5, mouthW: 8 }),
];

// 14 ─ mushroom -------------------------------------------------------------
const mushroomSticker: ArtItem[] = [
  R('stem', smooth([[62, 112], [138, 112], [146, 150], [138, 180], [100, 186], [62, 180], [54, 150]]), '#FFF4E6'),
  R(
    'cap',
    smooth([[18, 108], [28, 66], [60, 34], [100, 24], [140, 34], [172, 66], [182, 108], [142, 120], [100, 122], [58, 120]]),
    '#FF9AAE',
  ),
  R('dot-1', circle(58, 62, 13), '#FFFFFF'),
  R('dot-2', circle(102, 46, 12), '#FFFFFF'),
  R('dot-3', circle(146, 66, 13), '#FFFFFF'),
  R('dot-4', ellipse(34, 98, 8, 7), '#FFFFFF'),
  R('dot-5', ellipse(166, 100, 8, 7), '#FFFFFF'),
  R('dot-6', ellipse(100, 92, 10, 8), '#FFFFFF'),
  ...face(100, 146, { size: 24, gap: 38, cheekDx: 32, cheekDy: 12 }),
];

// 15 ─ seashell -------------------------------------------------------------
const shellPts: Pt[] = [];
const shellRidges: [Pt, Pt][] = [];
{
  const cx = 100;
  const cy = 134;
  const hinge: Pt = [100, 176];
  const n = 8;
  const a0 = 204;
  const a1 = 336;
  const at = (deg: number, k: number): Pt => [cx + 84 * k * Math.cos((deg * Math.PI) / 180), cy + 104 * k * Math.sin((deg * Math.PI) / 180)];
  for (let i = 0; i <= n; i++) {
    const a = a0 + ((a1 - a0) * i) / n;
    const v = at(a, 0.96);
    shellPts.push(v);
    if (i > 0 && i < n) {
      const dx = hinge[0] - v[0];
      const dy = hinge[1] - v[1];
      const l = Math.hypot(dx, dy);
      shellRidges.push([[v[0] + (dx / l) * 6, v[1] + (dy / l) * 6], [v[0] + (dx / l) * 34, v[1] + (dy / l) * 34]]);
    }
    if (i < n) shellPts.push(at(a + (a1 - a0) / n / 2, 1.04));
  }
  shellPts.push([150, 140], [116, 170], [100, 174], [84, 170], [50, 140]);
}
const seashellSticker: ArtItem[] = [
  R('hinge', roundPoly([[72, 156], [128, 156], [140, 184], [60, 184]], 0.22), '#FFE0E6'),
  R('shell', smooth(shellPts, 0.9), '#FFC2CF'),
  ...segments(shellRidges, 2.6),
  R('pearl', circle(146, 168, 13), '#F6F1FF'),
  gloss(141, 163, 4, 3, -30, 1),
  ...face(100, 116, { size: 25, gap: 40 }),
];

// 16 ─ fish -----------------------------------------------------------------
const fishSticker: ArtItem[] = [
  R('tail', smooth([[62, 96], [36, 60], [18, 66], [26, 100], [18, 134], [36, 140], [62, 108]]), '#FFB8D9'),
  R('fin-top', smooth([[86, 58], [100, 32], [128, 30], [146, 52], [120, 62]]), '#FFB8D9'),
  R('fin-bottom', smooth([[104, 140], [96, 164], [112, 170], [128, 146]]), '#FFB8D9'),
  R('body', ellipse(108, 100, 64, 52), '#9ED6FF'),
  gloss(94, 66, 9, 5, -20),
  thin(curve([[62, 84], [70, 100], [62, 116]]), 2.6),
  thin(curve([[72, 76], [82, 100], [72, 124]]), 2.6),
  ...face(126, 96, { size: 24, gap: 34, cheekDx: 28, cheekDy: 14 }),
  R('bubble-1', circle(176, 52, 9), '#D9EEFF'),
  R('bubble-2', circle(164, 28, 6), '#D9EEFF'),
  gloss(173, 49, 2.5, 2, 0, 1),
];

// 17 ─ sun ------------------------------------------------------------------
const sunSticker: ArtItem[] = [
  R('rays', star(100, 100, 86, 66, 12, -90, 0.32), '#FFD98A'),
  R('sun', circle(100, 100, 56), '#FFF1A0'),
  ...face(100, 96, { size: 26, gap: 42, mouth: 'open', mouthW: 18, mouthDy: 16, cheekDy: 16 }),
];

// 18 ─ moon -----------------------------------------------------------------
const moonSticker: ArtItem[] = [
  R('moon', crescent(98, 102, 80, 142, 72, 62), '#FFE98A'),
  gloss(40, 82, 5, 11, 25),
  R('star', star(150, 92, 22, 12), '#FFC9DD'),
  ...face(64, 124, { eyes: 'sleepy', size: 22, gap: 34, cheekDx: 26, cheekDy: 12 }),
  sparkle(132, 44, 8),
];

// 19 ─ cloud ----------------------------------------------------------------
const cloudSticker: ArtItem[] = [
  R('drop-1', drop(66, 162, 8, 9, -90), '#9ED6FF'),
  R('drop-2', drop(100, 170, 8, 9, -90), '#9ED6FF'),
  R('drop-3', drop(134, 162, 8, 9, -90), '#9ED6FF'),
  R('cloud', cloud(100, 94, 166, 116, 5), '#EAF4FF'),
  ...face(100, 102, { size: 26, gap: 42 }),
];

// 20 ─ magic wand -----------------------------------------------------------
const wandStick = (d: string) => rotate(d, 45, 70, 138);
const magicWandSticker: ArtItem[] = [
  R('stick', wandStick(rect(62, 92, 16, 96, 8)), '#D7C2FF'),
  R('stripe-1', wandStick(rect(62, 122, 16, 11)), '#FFB8D9'),
  R('stripe-2', wandStick(rect(62, 150, 16, 11)), '#FFB8D9'),
  R('star', star(126, 72, 58, 34, 5, -98), '#FFE27A'),
  ...face(126, 76, { size: 22, gap: 34 }),
  R('sparkle-1', twinkle(46, 52, 14), '#FFF0A0'),
  R('sparkle-2', twinkle(170, 150, 11), '#FFC9DD'),
];

// 21 ─ gem ------------------------------------------------------------------
const gemSticker: ArtItem[] = [
  R('crown-left', poly([[50, 46], [76, 46], [62, 88], [20, 88]]), '#B9D8FF'),
  R('crown-mid', poly([[76, 46], [124, 46], [138, 88], [62, 88]]), '#D9EEFF'),
  R('crown-right', poly([[124, 46], [150, 46], [180, 88], [138, 88]]), '#9ED6FF'),
  R('side-left', poly([[20, 88], [62, 88], [100, 178]]), '#9ED6FF'),
  R('side-mid', poly([[62, 88], [138, 88], [100, 178]]), '#C4E2FF'),
  R('side-right', poly([[138, 88], [180, 88], [100, 178]]), '#7FC4F5'),
  fillD(twinkle(70, 58, 8), '#FFFFFF'),
  ...face(100, 104, { size: 23, gap: 32, cheekDx: 21, cheekDy: 14, cheekR: 5.5 }),
];

// 22 ─ ladybug --------------------------------------------------------------
const ladybugSticker: ArtItem[] = [
  thin(curve([[86, 40], [80, 26], [70, 20]]), 2.8),
  thin(curve([[114, 40], [120, 26], [130, 20]]), 2.8),
  R('antenna-left', circle(68, 20, 6), '#6E5C86'),
  R('antenna-right', circle(132, 20, 6), '#6E5C86'),
  R('body', circle(100, 118, 64), '#FF8E9E'),
  thin(curve([[100, 90], [100, 182]]), 3),
  R('spot-1', circle(68, 102, 12), '#6E5C86'),
  R('spot-2', circle(132, 102, 12), '#6E5C86'),
  R('spot-3', circle(62, 142, 10), '#6E5C86'),
  R('spot-4', circle(138, 142, 10), '#6E5C86'),
  R('spot-5', circle(84, 166, 8), '#6E5C86'),
  R('spot-6', circle(116, 166, 8), '#6E5C86'),
  gloss(60, 76, 5, 10, 40),
  R('head', ellipse(100, 64, 40, 32), '#6E5C86'),
  // white-ringed eyes on the dark head
  fillD(ellipse(84, 62, 11, 12.5), '#FFFFFF'),
  fillD(ellipse(116, 62, 11, 12.5), '#FFFFFF'),
  ...eye(85, 63, 18),
  ...eye(115, 63, 18),
  thin('M94 78Q100 85 106 78', 2.8, '#FFE0EE'),
  cheek(70, 78, 6),
  cheek(130, 78, 6),
];

// 23 ─ strawberry -----------------------------------------------------------
const strawberrySticker: ArtItem[] = [
  R(
    'berry',
    smooth([[100, 50], [142, 44], [170, 64], [172, 100], [156, 140], [126, 170], [100, 180], [74, 170], [44, 140], [28, 100], [30, 64], [58, 44]]),
    '#FF8FA8',
  ),
  ...[
    [52, 86], [148, 86], [44, 118], [156, 118], [66, 150], [134, 150], [100, 160], [82, 168], [118, 168], [70, 64], [130, 64],
  ].map(([x, y]) => fillD(ellipse(x, y, 2.6, 3.6), '#FFF4B0')),
  R(
    'leaves',
    shape([
      [48, 56, 1],
      [74, 50],
      [70, 28, 1],
      [92, 40],
      [100, 22, 1],
      [108, 40],
      [130, 28, 1],
      [126, 50],
      [152, 56, 1],
      [124, 64],
      [100, 66],
      [76, 64],
    ]),
    '#9FE0B2',
  ),
  R('stalk', roundPoly([[96, 30], [101, 15], [109, 16], [104, 31]], 0.25), '#7FCF96'),
  gloss(52, 80, 4.5, 9, 30),
  ...face(100, 108, { size: 26, gap: 42, cheekColor: '#FF5E8A' }),
];

// 24 ─ bow ------------------------------------------------------------------
const loop = smooth([[98, 94], [70, 58], [36, 50], [20, 80], [28, 116], [60, 124], [96, 108]]);
const tail = shape([[92, 112], [74, 138], [58, 172, 1], [72, 166], [80, 180, 1], [96, 146], [104, 118]]);
const bowSticker: ArtItem[] = [
  R('tail-left', tail, '#FF9EBB'),
  R('tail-right', mirrorX(tail, 100), '#FF9EBB'),
  R('loop-left', loop, '#FFADC6'),
  R('loop-right', mirrorX(loop, 100), '#FFADC6'),
  fillD(circle(48, 76, 5), '#FFFFFF'),
  fillD(circle(40, 100, 4), '#FFFFFF'),
  fillD(circle(64, 108, 4), '#FFFFFF'),
  fillD(circle(152, 76, 5), '#FFFFFF'),
  fillD(circle(160, 100, 4), '#FFFFFF'),
  fillD(circle(136, 108, 4), '#FFFFFF'),
  R('knot', rect(72, 70, 56, 54, 22), '#FF94B6'),
  ...face(100, 94, { size: 19, gap: 26, cheekDx: 19, cheekDy: 11, cheekR: 5, mouthW: 9, cheekColor: CHEEK_DEEP }),
];

export const STICKERS: StickerDef[] = [
  { id: 'star', title: 'Yıldız', items: starSticker },
  { id: 'heart', title: 'Kalp', items: shift(heartSticker, 0, -4) },
  { id: 'rainbow', title: 'Gökkuşağı', items: rainbowSticker },
  { id: 'flower', title: 'Çiçek', items: flowerSticker },
  { id: 'crown', title: 'Taç', items: crownSticker },
  { id: 'cupcake', title: 'Kek', items: cupcakeSticker },
  { id: 'ice-cream', title: 'Dondurma', items: iceCreamSticker },
  { id: 'balloon', title: 'Balon', items: balloonSticker },
  { id: 'unicorn', title: 'Unicorn', items: unicornSticker },
  { id: 'kitten', title: 'Kedicik', items: kittenSticker },
  { id: 'puppy', title: 'Köpekçik', items: shift(puppySticker, 0, -4) },
  { id: 'bunny', title: 'Tavşan', items: bunnySticker },
  { id: 'butterfly', title: 'Kelebek', items: butterflySticker },
  { id: 'mushroom', title: 'Mantar', items: shift(mushroomSticker, 0, -3) },
  { id: 'seashell', title: 'Deniz Kabuğu', items: shift(seashellSticker, 0, -4) },
  { id: 'fish', title: 'Balık', items: fishSticker },
  { id: 'sun', title: 'Güneş', items: sunSticker },
  { id: 'moon', title: 'Ay', items: moonSticker },
  { id: 'cloud', title: 'Bulut', items: shift(cloudSticker, 0, -8) },
  { id: 'magic-wand', title: 'Sihirli Değnek', items: shift(magicWandSticker, -6, 2) },
  { id: 'gem', title: 'Mücevher', items: shift(gemSticker, 0, -10) },
  { id: 'ladybug', title: 'Uğur Böceği', items: ladybugSticker },
  { id: 'strawberry', title: 'Çilek', items: strawberrySticker },
  { id: 'bow', title: 'Fiyonk', items: shift(bowSticker, 0, -12) },
];
