import { circle, cloud, curve, ellipse, heart, inkLine, LINE, rect, region, shape, smooth, star, symmetric } from '../../dsl';
import type { Picture } from '../../types';
import { bangsFor, bangsLines, crown, crownTips, gem, pearl, princessFace, sparkle } from './helpers';

/** Picture 1 (easiest): a big smiling princess portrait with hearts and stars. */
export const princessPortrait: Picture = {
  id: 'princess-smiling-portrait',
  category: 'princess',
  title: 'Gülümseyen Prenses',
  parts: {
    eyes: { anim: 'blink', pivot: [500, 500], speed: 0.45 },
    crown: { anim: 'pulse', pivot: [500, 282], amp: 0.06, speed: 1.1 },
    star1: { anim: 'twinkle', pivot: [878, 420] },
    star2: { anim: 'twinkle', pivot: [125, 790], phase: 0.5 },
    heart1: { anim: 'pulse', pivot: [122, 440], amp: 0.12, speed: 1.3 },
    heart2: { anim: 'pulse', pivot: [875, 790], amp: 0.12, speed: 1.3, phase: 0.5 },
  },
  celebrate: { sound: 'magic', particles: 'sparkles' },
  items: [
    region('sky', rect(0, 0, 1000, 1000), { outline: false, hint: '#E3F0FF' }),

    region('cloud-left', cloud(160, 175, 230, 115), { hint: '#FFFFFF' }),
    region('cloud-right', cloud(845, 160, 210, 105), { hint: '#FFFFFF' }),
    region('heart-left', heart(122, 440, 104), { part: 'heart1', hint: '#FFB8D9' }),
    region('heart-right', heart(875, 790, 100), { part: 'heart2', hint: '#FFADB9' }),
    region('star-right', star(878, 420, 56), { part: 'star1', hint: '#FFE27A' }),
    region('star-left', star(125, 790, 56), { part: 'star2', hint: '#FFF0A0' }),
    sparkle(300, 88, 18),
    sparkle(690, 95, 14),
    sparkle(80, 600, 16),
    sparkle(925, 600, 16),
    sparkle(220, 940, 14),
    sparkle(790, 950, 14),

    // ---- princess ----
    // long wavy hair behind
    region(
      'hair-back',
      smooth(
        symmetric([
          [500, 232],
          [612, 244],
          [700, 298],
          [748, 398],
          [760, 505],
          [790, 600],
          [776, 700],
          [810, 792],
          [786, 872],
          [724, 884],
          [690, 836],
          [600, 772],
          [500, 760],
        ]),
      ),
      { hint: '#FFE27A' },
    ),
    inkLine(curve([[726, 430], [736, 520], [758, 600]]), LINE.fine),
    inkLine(curve([[752, 700], [770, 780], [760, 840]]), LINE.fine),
    inkLine(curve([[274, 430], [264, 520], [242, 600]]), LINE.fine),
    inkLine(curve([[248, 700], [230, 780], [240, 840]]), LINE.fine),
    region('neck', rect(462, 570, 76, 130, 28), { hint: '#FFE0CC' }),

    // dress + puffy sleeves
    region(
      'dress',
      shape([
        [262, 1020, 1],
        [268, 860],
        [306, 735],
        [400, 680],
        [500, 700],
        [600, 680],
        [694, 735],
        [732, 860],
        [738, 1020, 1],
      ]),
      { hint: '#D7C2FF' },
    ),
    region('sleeve-left', smooth([[322, 688], [398, 716], [410, 806], [348, 852], [266, 830], [250, 742]]), {
      hint: '#C9B8FF',
    }),
    region('sleeve-right', smooth([[678, 688], [750, 742], [734, 830], [652, 852], [590, 806], [602, 716]]), {
      hint: '#C9B8FF',
    }),
    region(
      'collar',
      smooth([
        [420, 680],
        [500, 702],
        [580, 680],
        [614, 726],
        [562, 782],
        [500, 764],
        [438, 782],
        [386, 726],
      ]),
      { hint: '#FFF8FC' },
    ),
    region('necklace-gem', gem(500, 812, 62), { hint: '#9ED6FF' }),

    // face
    region('face', ellipse(500, 450, 190, 172), { hint: '#FFE0CC' }),
    ...princessFace(500, 502, 188, { eyePart: 'eyes' }),

    // bangs with two side locks framing the face
    region('bangs', bangsFor(500, 450, 190), { hint: '#FFE27A' }),
    ...bangsLines(500, 450, 190),

    // crown
    region('crown', crown(500, 282, 236, 136), { part: 'crown', hint: '#FFD98A' }),
    region('gem-middle', gem(500, 236, 58), { part: 'crown', hint: '#FFADB9' }),
    region('gem-left', circle(430, 256, 22), { part: 'crown', hint: '#9ED6FF' }),
    region('gem-right', circle(570, 256, 22), { part: 'crown', hint: '#BDEBC8' }),
    ...crownTips(500, 282, 236, 136).map(([x, y]) => pearl(x, y - 7, 14, 'crown')),
  ],
};
