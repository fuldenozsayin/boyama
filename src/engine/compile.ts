import type { Picture, RegionItem } from '../art/types';
import { bboxOf, flattenPath, pointInPolys, type BBox, type Pt } from './path';

export interface CompiledRegion {
  id: string;
  item: RegionItem;
  /** index in picture.items (z-order) */
  z: number;
  polys: Pt[][];
  bbox: BBox;
}

export interface CompiledPicture {
  picture: Picture;
  /** regions in z-order, bottom first */
  regions: CompiledRegion[];
  byId: Record<string, CompiledRegion>;
}

const cache = new WeakMap<Picture, CompiledPicture>();

/** Flatten all region paths once per picture (memoised). */
export function compilePicture(picture: Picture): CompiledPicture {
  const hit = cache.get(picture);
  if (hit) return hit;
  const regions: CompiledRegion[] = [];
  const byId: Record<string, CompiledRegion> = {};
  picture.items.forEach((item, z) => {
    if (item.kind !== 'region') return;
    const polys = flattenPath(item.d, 8);
    const r: CompiledRegion = { id: item.id, item, z, polys, bbox: bboxOf(polys) };
    regions.push(r);
    byId[item.id] = r;
  });
  const compiled = { picture, regions, byId };
  cache.set(picture, compiled);
  return compiled;
}

/** Top-most region under the point, or null. */
export function hitTest(cp: CompiledPicture, x: number, y: number): CompiledRegion | null {
  for (let i = cp.regions.length - 1; i >= 0; i--) {
    const r = cp.regions[i];
    const b = r.bbox;
    if (x < b.x0 || x > b.x1 || y < b.y0 || y > b.y1) continue;
    if (pointInPolys(x, y, r.polys, !!r.item.evenOdd)) return r;
  }
  return null;
}

/**
 * Sample the canvas on a grid and measure how much of each region is actually
 * visible (not hidden by shapes on top). Used by QA tooling and to pick a good
 * "hint" spot for a region.
 */
export function visibleSamples(cp: CompiledPicture, step = 5): Record<string, Pt[]> {
  const out: Record<string, Pt[]> = {};
  for (const r of cp.regions) out[r.id] = [];
  for (let y = step / 2; y < 1000; y += step) {
    for (let x = step / 2; x < 1000; x += step) {
      const r = hitTest(cp, x, y);
      if (r) out[r.id].push([x, y]);
    }
  }
  return out;
}
