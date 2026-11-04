import React, { memo } from 'react';
import { Circle, Defs, LinearGradient, Path, Pattern, Rect, Stop } from 'react-native-svg';
import { heart, star, twinkle } from '../art/dsl';
import { darken, lighten, luminance } from '../theme';
import type { BBox } from './path';
import type { Paint, PaintKind } from './paint';

export const RAINBOW_STOPS = ['#FF7A93', '#FFB06A', '#FFE45C', '#7FDB8E', '#6CC0FF', '#B48CFF'];

export const MAGIC_KINDS: PaintKind[] = ['glitter', 'rainbow', 'dots', 'stars', 'hearts', 'stripes'];

export function paintKey(p: Paint): string {
  return p.k === 'rainbow' ? 'rainbow' : `${p.k}-${p.c.replace('#', '').toLowerCase()}`;
}

/** SVG paint value for filling a region */
export function fillRef(p: Paint | undefined, prefix: string, regionId: string): string | undefined {
  if (!p) return undefined;
  if (p.k === 'solid') return p.c;
  if (p.k === 'rainbow') return `url(#${prefix}rb-${regionId})`;
  return `url(#${prefix}${paintKey(p)})`;
}

/** SVG paint value for a brush stroke */
export function strokeRef(p: Paint, prefix: string): string {
  if (p.k === 'solid') return p.c;
  if (p.k === 'rainbow') return `url(#${prefix}rbs)`;
  return `url(#${prefix}${paintKey(p)})`;
}

/** contrasting accent used by patterned paints */
function accent(c: string): string {
  return luminance(c) > 0.78 ? darken(c, 0.28) : lighten(c, 0.62);
}

const TW_SMALL = [
  [14, 18, 7],
  [58, 10, 5],
  [44, 50, 8.5],
  [10, 62, 4.5],
  [70, 66, 5.5],
] as const;
const TINT_DOTS = [
  [30, 30, 2.6],
  [66, 38, 2.1],
  [22, 44, 1.9],
  [52, 74, 2.3],
  [76, 24, 1.7],
  [36, 6, 1.9],
  [4, 8, 1.6],
] as const;
const SHADE_DOTS = [
  [6, 36, 1.6],
  [48, 28, 1.5],
  [62, 54, 1.7],
  [28, 72, 1.4],
  [74, 4, 1.3],
] as const;

const STAR_A = star(18, 20, 10);
const STAR_B = star(54, 54, 10);
const HEART_A = heart(16, 17, 17);
const HEART_B = heart(48, 49, 17);

function PatternBody({ p }: { p: Paint }) {
  const c = p.c;
  switch (p.k) {
    case 'glitter': {
      const light = luminance(c) > 0.82;
      const spark = light ? '#FFD45E' : '#FFFFFF';
      const tint = light ? darken(c, 0.12) : lighten(c, 0.55);
      const shade = darken(c, light ? 0.3 : 0.2);
      return (
        <>
          <Rect x={0} y={0} width={80} height={80} fill={c} />
          {SHADE_DOTS.map(([x, y, r], i) => (
            <Circle key={`s${i}`} cx={x} cy={y} r={r} fill={shade} opacity={0.55} />
          ))}
          {TINT_DOTS.map(([x, y, r], i) => (
            <Circle key={`t${i}`} cx={x} cy={y} r={r} fill={tint} />
          ))}
          {TW_SMALL.map(([x, y, r], i) => (
            <Path key={`w${i}`} d={twinkle(x, y, r)} fill={spark} opacity={0.95} />
          ))}
        </>
      );
    }
    case 'dots':
      return (
        <>
          <Rect x={0} y={0} width={56} height={56} fill={c} />
          <Circle cx={14} cy={14} r={8} fill={accent(c)} />
          <Circle cx={42} cy={42} r={8} fill={accent(c)} />
        </>
      );
    case 'stars':
      return (
        <>
          <Rect x={0} y={0} width={72} height={72} fill={c} />
          <Path d={STAR_A} fill={accent(c)} />
          <Path d={STAR_B} fill={accent(c)} />
        </>
      );
    case 'hearts':
      return (
        <>
          <Rect x={0} y={0} width={64} height={64} fill={c} />
          <Path d={HEART_A} fill={accent(c)} />
          <Path d={HEART_B} fill={accent(c)} />
        </>
      );
    case 'stripes': {
      const a = 8;
      const band = `M0 ${40 - a}L${40 - a} 0L40 0L40 ${a}L${a} 40L0 40Z M0 0L${a} 0L0 ${a}Z M40 ${40 - a}L40 40L${40 - a} 40Z`;
      return (
        <>
          <Rect x={0} y={0} width={40} height={40} fill={c} />
          <Path d={band} fill={accent(c)} />
        </>
      );
    }
    default:
      return <Rect x={0} y={0} width={10} height={10} fill={c} />;
  }
}

const TILE: Record<PaintKind, number> = {
  solid: 10,
  rainbow: 10,
  glitter: 80,
  dots: 56,
  stars: 72,
  hearts: 64,
  stripes: 40,
};

export interface DefsSpec {
  patterns: Paint[];
  rainbowRegions: { id: string; bbox: BBox }[];
  rainbowStroke: boolean;
}

/** All gradient / pattern definitions needed to render a paint state. */
export const PaintDefs = memo(function PaintDefs({ spec, prefix }: { spec: DefsSpec; prefix: string }) {
  if (!spec.patterns.length && !spec.rainbowRegions.length && !spec.rainbowStroke) return null;
  const cycles = 3;
  return (
    <Defs>
      {spec.patterns.map((p) => {
        const t = TILE[p.k];
        return (
          <Pattern
            key={paintKey(p)}
            id={`${prefix}${paintKey(p)}`}
            patternUnits="userSpaceOnUse"
            x={0}
            y={0}
            width={t}
            height={t}
          >
            <PatternBody p={p} />
          </Pattern>
        );
      })}
      {spec.rainbowRegions.map(({ id, bbox }) => (
        <LinearGradient
          key={id}
          id={`${prefix}rb-${id}`}
          gradientUnits="userSpaceOnUse"
          x1={bbox.x0}
          y1={bbox.y0}
          x2={bbox.x1}
          y2={bbox.y1}
        >
          {RAINBOW_STOPS.map((c, i) => (
            <Stop key={i} offset={i / (RAINBOW_STOPS.length - 1)} stopColor={c} />
          ))}
        </LinearGradient>
      ))}
      {spec.rainbowStroke && (
        <LinearGradient id={`${prefix}rbs`} gradientUnits="userSpaceOnUse" x1={0} y1={0} x2={1000} y2={600}>
          {Array.from({ length: cycles * RAINBOW_STOPS.length + 1 }, (_, i) => (
            <Stop
              key={i}
              offset={i / (cycles * RAINBOW_STOPS.length)}
              stopColor={RAINBOW_STOPS[i % RAINBOW_STOPS.length]}
            />
          ))}
        </LinearGradient>
      )}
    </Defs>
  );
});
