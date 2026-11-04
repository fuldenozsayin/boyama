/**
 * Pıtırcık – the original mascot (a happy paint drop), shared by the
 * in-app <Mascot> component and the icon/splash generator.
 * Drawn in a 210 x 210 box.
 */
import { arc, circle, drop, ellipse, INK, line, petal, twinkle } from './dsl';

export const MASCOT = {
  shadow: ellipse(100, 196, 50, 8),
  body: drop(100, 122, 62, 44, -90),
  shine: ellipse(72, 92, 13, 20, 30),
  footL: ellipse(78, 184, 18, 10),
  footR: ellipse(122, 184, 18, 10),
  armL: ellipse(40, 136, 11, 16, 30),
  armR: ellipse(160, 130, 11, 16, -30),
  handle: line([
    [162, 128],
    [186, 86],
  ]),
  tip: petal([186, 86], [194, 58], 8),
  smile: arc(100, 140, 12, 20, 160),
  curl: 'M100 18 C108 8 122 12 118 22',
  eyeL: ellipse(80, 120, 11, 14),
  eyeR: ellipse(120, 120, 11, 14),
  shineL: circle(84, 114, 4.5),
  shineR: circle(124, 114, 4.5),
  dotL: circle(77, 125, 2),
  dotR: circle(117, 125, 2),
  closedL: arc(80, 124, 11, 200, 340),
  closedR: arc(120, 124, 11, 200, 340),
  cheekL: ellipse(66, 140, 10, 6),
  cheekR: ellipse(134, 140, 10, 6),
  spark1: twinkle(30, 60, 10),
  spark2: twinkle(176, 30, 7),
};

export const MASCOT_COLOR = '#FFB3D1';
export const MASCOT_BRUSH_TIP = '#6CC0FF';

/** SVG markup (no <svg> wrapper) for scripts that render PNGs. */
export function mascotMarkup(opts: { color?: string; sparkles?: boolean; mono?: string } = {}): string {
  const c = opts.mono ?? opts.color ?? MASCOT_COLOR;
  const ink = opts.mono ? opts.mono : INK;
  const M = MASCOT;
  const p = (d: string, attrs: string) => `<path d="${d}" ${attrs}/>`;
  if (opts.mono) {
    // single-colour silhouette (Android themed icon)
    return [M.footL, M.footR, M.armL, M.body, M.armR, M.tip].map((d) => p(d, `fill="${c}"`)).join('') + p(M.handle, `stroke="${c}" stroke-width="13" stroke-linecap="round"`);
  }
  return [
    p(M.shadow, 'fill="rgba(78,61,99,0.12)"'),
    p(M.footL, `fill="${c}" stroke="${ink}" stroke-width="5"`),
    p(M.footR, `fill="${c}" stroke="${ink}" stroke-width="5"`),
    p(M.armL, `fill="${c}" stroke="${ink}" stroke-width="5"`),
    p(M.body, `fill="${c}" stroke="${ink}" stroke-width="6" stroke-linejoin="round"`),
    p(M.shine, 'fill="#fff" opacity="0.75"'),
    p(M.curl, `fill="none" stroke="${ink}" stroke-width="5" stroke-linecap="round"`),
    p(M.eyeL, `fill="${ink}"`),
    p(M.eyeR, `fill="${ink}"`),
    p(M.shineL, 'fill="#fff"'),
    p(M.shineR, 'fill="#fff"'),
    p(M.dotL, 'fill="#fff"'),
    p(M.dotR, 'fill="#fff"'),
    p(M.cheekL, 'fill="#FF8FB8" opacity="0.7"'),
    p(M.cheekR, 'fill="#FF8FB8" opacity="0.7"'),
    p(M.smile, `fill="none" stroke="${ink}" stroke-width="5" stroke-linecap="round"`),
    p(M.handle, `stroke="${ink}" stroke-width="13" stroke-linecap="round"`),
    p(M.handle, 'stroke="#FFD98A" stroke-width="6" stroke-linecap="round"'),
    p(M.tip, `fill="${MASCOT_BRUSH_TIP}" stroke="${ink}" stroke-width="4.5" stroke-linejoin="round"`),
    p(M.armR, `fill="${c}" stroke="${ink}" stroke-width="5"`),
    opts.sparkles === false ? '' : p(M.spark1, `fill="#FFE27A" stroke="${ink}" stroke-width="3"`),
    opts.sparkles === false ? '' : p(M.spark2, `fill="#fff" stroke="${ink}" stroke-width="3"`),
  ].join('');
}
