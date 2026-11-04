/// <reference types="jest" />
import { circle, rect, ringSegment, star } from '../../art/dsl';
import type { Picture } from '../../art/types';
import { compilePicture, hitTest } from '../compile';
import { flattenPath, mapPath, parsePath, pointInPolys } from '../path';

describe('path parser', () => {
  it('normalises relative and shorthand commands to absolute M/L/C/Q/Z', () => {
    const segs = parsePath('m10 10 h20 v20 l-20 0 z');
    expect(segs.map((s) => s.c).join('')).toBe('MLLLZ');
    expect(segs[1]).toEqual({ c: 'L', p: [30, 10] });
    expect(segs[2]).toEqual({ c: 'L', p: [30, 30] });
  });

  it('reflects control points for S and T', () => {
    const segs = parsePath('M0 0 C0 10 10 10 10 0 S20 -10 20 0');
    const s = segs[2];
    expect(s.c).toBe('C');
    if (s.c === 'C') expect(s.c1).toEqual([10, -10]);
  });

  it('rejects arcs explicitly', () => {
    expect(() => parsePath('M0 0 A10 10 0 0 1 20 0')).toThrow(/Arc/);
  });

  it('maps coordinates (mirroring)', () => {
    const d = mapPath('M10 0L20 0', ([x, y]) => [100 - x, y]);
    expect(d).toBe('M90 0L80 0');
  });
});

describe('point in polygon', () => {
  const sq = flattenPath(rect(0, 0, 100, 100));
  it('detects inside / outside', () => {
    expect(pointInPolys(50, 50, sq)).toBe(true);
    expect(pointInPolys(150, 50, sq)).toBe(false);
  });

  it('supports even-odd holes', () => {
    const ring = flattenPath(`${circle(100, 100, 80)} ${circle(100, 100, 40)}`);
    expect(pointInPolys(100, 100, ring, true)).toBe(false);
    expect(pointInPolys(100, 40, ring, true)).toBe(true);
  });

  it('handles curved shapes', () => {
    const c = flattenPath(circle(500, 500, 100));
    expect(pointInPolys(500, 420, c)).toBe(true);
    expect(pointInPolys(580, 580, c)).toBe(false); // outside the arc, inside the bbox
  });
});

describe('hit testing respects z-order', () => {
  const pic: Picture = {
    id: 't',
    category: 'unicorn',
    title: 't',
    items: [
      { kind: 'region', id: 'bg', d: rect(0, 0, 1000, 1000) },
      { kind: 'region', id: 'band', d: ringSegment(500, 600, 200, 300, 180, 360) },
      { kind: 'region', id: 'star', d: star(500, 350, 60) },
      { kind: 'decor', d: circle(500, 350, 10), fill: '#000' },
    ],
  };
  const cp = compilePicture(pic);
  it('returns the top-most region', () => {
    expect(hitTest(cp, 500, 350)?.id).toBe('star');
    expect(hitTest(cp, 290, 560)?.id).toBe('band');
    expect(hitTest(cp, 500, 550)?.id).toBe('bg');
  });
  it('decor never blocks taps', () => {
    expect(hitTest(cp, 500, 350)?.id).toBe('star');
  });
});
