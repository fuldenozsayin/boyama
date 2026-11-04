/**
 * Minimal, dependency-free SVG path toolkit.
 *
 * - `parsePath` normalises any path string (absolute/relative M L H V C S Q T Z)
 *   into absolute M / L / C / Q / Z segments.
 * - `flattenPath` turns curves into polygons for fast hit-testing.
 * - `pointInPolys` implements non-zero and even-odd fill rules.
 *
 * Arcs (A/a) are intentionally unsupported: the art DSL never emits them, and
 * keeping the parser tiny keeps hit-testing identical on every platform.
 */

export type Pt = [number, number];

export type Seg =
  | { c: 'M'; p: Pt }
  | { c: 'L'; p: Pt }
  | { c: 'C'; c1: Pt; c2: Pt; p: Pt }
  | { c: 'Q'; c1: Pt; p: Pt }
  | { c: 'Z' };

const TOKEN = /([MmLlHhVvCcSsQqTtZzAa])|(-?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?)/g;

export function parsePath(d: string): Seg[] {
  const tokens: (string | number)[] = [];
  let m: RegExpExecArray | null;
  TOKEN.lastIndex = 0;
  while ((m = TOKEN.exec(d))) {
    if (m[1]) tokens.push(m[1]);
    else tokens.push(parseFloat(m[2]));
  }

  const out: Seg[] = [];
  let i = 0;
  let cmd = '';
  let cx = 0;
  let cy = 0;
  let sx = 0;
  let sy = 0;
  // last control points for S / T reflection
  let lastC2: Pt | null = null;
  let lastQ: Pt | null = null;

  const num = (): number => {
    const t = tokens[i++];
    if (typeof t !== 'number') throw new Error(`Bad path data near token ${i}: ${d.slice(0, 80)}`);
    return t;
  };

  while (i < tokens.length) {
    const t = tokens[i];
    if (typeof t === 'string') {
      cmd = t;
      i++;
      if (cmd === 'Z' || cmd === 'z') {
        out.push({ c: 'Z' });
        cx = sx;
        cy = sy;
        lastC2 = lastQ = null;
        continue;
      }
    } else if (!cmd) {
      throw new Error('Path must start with a command');
    }
    const rel = cmd === cmd.toLowerCase();
    const ox = rel ? cx : 0;
    const oy = rel ? cy : 0;
    switch (cmd.toUpperCase()) {
      case 'M': {
        const p: Pt = [num() + ox, num() + oy];
        out.push({ c: 'M', p });
        cx = sx = p[0];
        cy = sy = p[1];
        // subsequent implicit pairs are line-tos
        cmd = rel ? 'l' : 'L';
        lastC2 = lastQ = null;
        break;
      }
      case 'L': {
        const p: Pt = [num() + ox, num() + oy];
        out.push({ c: 'L', p });
        [cx, cy] = p;
        lastC2 = lastQ = null;
        break;
      }
      case 'H': {
        const p: Pt = [num() + ox, cy];
        out.push({ c: 'L', p });
        cx = p[0];
        lastC2 = lastQ = null;
        break;
      }
      case 'V': {
        const p: Pt = [cx, num() + oy];
        out.push({ c: 'L', p });
        cy = p[1];
        lastC2 = lastQ = null;
        break;
      }
      case 'C': {
        const c1: Pt = [num() + ox, num() + oy];
        const c2: Pt = [num() + ox, num() + oy];
        const p: Pt = [num() + ox, num() + oy];
        out.push({ c: 'C', c1, c2, p });
        lastC2 = c2;
        lastQ = null;
        [cx, cy] = p;
        break;
      }
      case 'S': {
        const c1: Pt = lastC2 ? [2 * cx - lastC2[0], 2 * cy - lastC2[1]] : [cx, cy];
        const c2: Pt = [num() + ox, num() + oy];
        const p: Pt = [num() + ox, num() + oy];
        out.push({ c: 'C', c1, c2, p });
        lastC2 = c2;
        lastQ = null;
        [cx, cy] = p;
        break;
      }
      case 'Q': {
        const c1: Pt = [num() + ox, num() + oy];
        const p: Pt = [num() + ox, num() + oy];
        out.push({ c: 'Q', c1, p });
        lastQ = c1;
        lastC2 = null;
        [cx, cy] = p;
        break;
      }
      case 'T': {
        const c1: Pt = lastQ ? [2 * cx - lastQ[0], 2 * cy - lastQ[1]] : [cx, cy];
        const p: Pt = [num() + ox, num() + oy];
        out.push({ c: 'Q', c1, p });
        lastQ = c1;
        lastC2 = null;
        [cx, cy] = p;
        break;
      }
      case 'A':
        throw new Error('Arc commands are not supported; use the art DSL helpers instead.');
      default:
        throw new Error(`Unknown path command ${cmd}`);
    }
  }
  return out;
}

const r1 = (n: number) => Math.round(n * 10) / 10;
const fp = (p: Pt) => `${r1(p[0])} ${r1(p[1])}`;

export function segsToD(segs: Seg[]): string {
  let s = '';
  for (const g of segs) {
    switch (g.c) {
      case 'M':
        s += `M${fp(g.p)}`;
        break;
      case 'L':
        s += `L${fp(g.p)}`;
        break;
      case 'C':
        s += `C${fp(g.c1)} ${fp(g.c2)} ${fp(g.p)}`;
        break;
      case 'Q':
        s += `Q${fp(g.c1)} ${fp(g.p)}`;
        break;
      case 'Z':
        s += 'Z';
        break;
    }
  }
  return s;
}

/** Apply a point transform to every coordinate of a path. */
export function mapPath(d: string, fn: (p: Pt) => Pt): string {
  const segs = parsePath(d).map((g): Seg => {
    switch (g.c) {
      case 'M':
      case 'L':
        return { c: g.c, p: fn(g.p) };
      case 'C':
        return { c: 'C', c1: fn(g.c1), c2: fn(g.c2), p: fn(g.p) };
      case 'Q':
        return { c: 'Q', c1: fn(g.c1), p: fn(g.p) };
      default:
        return g;
    }
  });
  return segsToD(segs);
}

/** Flatten a path into closed polygons (one per sub-path). */
export function flattenPath(d: string, steps = 10): Pt[][] {
  const polys: Pt[][] = [];
  let cur: Pt[] = [];
  let last: Pt = [0, 0];
  let start: Pt = [0, 0];
  for (const g of parsePath(d)) {
    switch (g.c) {
      case 'M':
        if (cur.length > 1) polys.push(cur);
        cur = [g.p];
        last = start = g.p;
        break;
      case 'L':
        cur.push(g.p);
        last = g.p;
        break;
      case 'C': {
        const [x0, y0] = last;
        for (let k = 1; k <= steps; k++) {
          const t = k / steps;
          const u = 1 - t;
          const a = u * u * u;
          const b = 3 * u * u * t;
          const c = 3 * u * t * t;
          const e = t * t * t;
          cur.push([
            a * x0 + b * g.c1[0] + c * g.c2[0] + e * g.p[0],
            a * y0 + b * g.c1[1] + c * g.c2[1] + e * g.p[1],
          ]);
        }
        last = g.p;
        break;
      }
      case 'Q': {
        const [x0, y0] = last;
        for (let k = 1; k <= steps; k++) {
          const t = k / steps;
          const u = 1 - t;
          cur.push([
            u * u * x0 + 2 * u * t * g.c1[0] + t * t * g.p[0],
            u * u * y0 + 2 * u * t * g.c1[1] + t * t * g.p[1],
          ]);
        }
        last = g.p;
        break;
      }
      case 'Z':
        if (cur.length > 1) polys.push(cur);
        cur = [start];
        last = start;
        break;
    }
  }
  if (cur.length > 2) polys.push(cur);
  return polys.filter((p) => p.length > 2);
}

export type BBox = { x0: number; y0: number; x1: number; y1: number };

export function bboxOf(polys: Pt[][]): BBox {
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const poly of polys) {
    for (const [x, y] of poly) {
      if (x < x0) x0 = x;
      if (y < y0) y0 = y;
      if (x > x1) x1 = x;
      if (y > y1) y1 = y;
    }
  }
  return { x0, y0, x1, y1 };
}

/** Point in polygon set, using the non-zero winding rule or even-odd. */
export function pointInPolys(x: number, y: number, polys: Pt[][], evenOdd = false): boolean {
  if (evenOdd) {
    let inside = false;
    for (const poly of polys) {
      const n = poly.length;
      for (let i = 0, j = n - 1; i < n; j = i++) {
        const [xi, yi] = poly[i];
        const [xj, yj] = poly[j];
        if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
      }
    }
    return inside;
  }
  // non-zero winding number (Dan Sunday's algorithm)
  let winding = 0;
  for (const poly of polys) {
    const n = poly.length;
    for (let i = 0, j = n - 1; i < n; j = i++) {
      const [xj, yj] = poly[j]; // edge start
      const [xi, yi] = poly[i]; // edge end
      const isLeft = (xi - xj) * (y - yj) - (x - xj) * (yi - yj);
      if (yj <= y) {
        if (yi > y && isLeft > 0) winding++;
      } else if (yi <= y && isLeft < 0) {
        winding--;
      }
    }
  }
  return winding !== 0;
}
