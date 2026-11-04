/**
 * Pure art quality checks shared by the preview tool and the unit tests.
 */
import { compilePicture, hitTest, visibleSamples } from '../engine/compile';
import type { Picture } from './types';

export interface QAResult {
  errors: string[];
  warnings: string[];
  labels: Record<string, [number, number]>;
  stats: string;
}

export const MIN_AREA = 1100; // ~33 x 33 canvas units: comfortable for small fingers

export function qa(pic: Picture): QAResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const labels: Record<string, [number, number]> = {};
  const ids = new Set<string>();
  for (const it of pic.items) {
    if (it.kind !== 'region') continue;
    if (ids.has(it.id)) errors.push(`duplicate region id "${it.id}"`);
    ids.add(it.id);
    if (!it.hint) warnings.push(`region "${it.id}" has no hint colour`);
    if (it.part && !pic.parts?.[it.part]) errors.push(`region "${it.id}" uses unknown part "${it.part}"`);
  }
  for (const [name, part] of Object.entries(pic.parts ?? {})) {
    if (part.parent && !pic.parts?.[part.parent]) errors.push(`part "${name}" has unknown parent "${part.parent}"`);
  }
  for (const it of pic.items) {
    if (it.kind === 'decor' && it.part && !pic.parts?.[it.part]) errors.push(`decor uses unknown part "${it.part}"`);
  }
  let cp;
  try {
    cp = compilePicture(pic);
  } catch (e) {
    errors.push(`path error: ${(e as Error).message}`);
    return { errors, warnings, labels, stats: '' };
  }
  const step = 5;
  const samples = visibleSamples(cp, step);
  let tiny = 0;
  for (const r of cp.regions) {
    const pts = samples[r.id];
    const area = pts.length * step * step;
    if (area === 0) {
      errors.push(`region "${r.id}" is completely hidden (cannot be tapped)`);
      continue;
    }
    if (area < MIN_AREA) {
      tiny++;
      warnings.push(`region "${r.id}" visible area ${area}u² is very small (min ~${MIN_AREA}); make it bigger or turn it into decor`);
    }
    // label position: visible sample closest to the centroid of visible samples
    let sx = 0;
    let sy = 0;
    for (const [x, y] of pts) {
      sx += x;
      sy += y;
    }
    sx /= pts.length;
    sy /= pts.length;
    let best = pts[0];
    let bd = Infinity;
    for (const p of pts) {
      const dd = (p[0] - sx) ** 2 + (p[1] - sy) ** 2;
      if (dd < bd) {
        bd = dd;
        best = p;
      }
    }
    labels[r.id] = [best[0], best[1] + 6];
  }
  // uncovered canvas (no region underneath) – taps there would do nothing
  let empty = 0;
  for (let y = 2.5; y < 1000; y += 10) for (let x = 2.5; x < 1000; x += 10) if (!hitTest(cp, x, y)) empty++;
  if (empty > 0) warnings.push(`${empty} sample points hit no region at all (add a full-canvas background region)`);
  const n = cp.regions.length;
  if (n < 12) warnings.push(`only ${n} regions – aim for 15–40 for a fun page`);
  if (n > 50) warnings.push(`${n} regions – that is a lot for 3–7 year olds (aim for 15–40)`);
  const decorCount = pic.items.length - n;
  return { errors, warnings, labels, stats: `${n} regions, ${decorCount} decor, ${tiny} tiny` };
}

