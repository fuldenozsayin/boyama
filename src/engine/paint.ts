/**
 * Paint state for one artwork + an undo/redo history.
 *
 * Everything is immutable: each action returns new objects but shares
 * untouched data with the previous state, so keeping ~60 undo steps is cheap
 * and every region's stroke array keeps its identity unless it changes
 * (which lets the renderer memoise per region).
 */

export type PaintKind = 'solid' | 'glitter' | 'rainbow' | 'dots' | 'stars' | 'hearts' | 'stripes';

export interface Paint {
  k: PaintKind;
  /** base colour (hex). Rainbow ignores it. */
  c: string;
}

export interface Stroke {
  id: string;
  /** null = eraser stroke (reveals the region fill / paper) */
  paint: Paint | null;
  /** width in canvas units */
  w: number;
  /** flat list of integer canvas coordinates [x0, y0, x1, y1, ...] */
  pts: number[];
}

export interface PlacedSticker {
  uid: string;
  id: string;
  x: number;
  y: number;
  /** scale (1 = 200 canvas units wide) */
  s: number;
}

export interface PaintState {
  fills: Record<string, Paint>;
  strokes: Record<string, Stroke[]>;
  stickers: PlacedSticker[];
}

export const EMPTY_STATE: PaintState = { fills: {}, strokes: {}, stickers: [] };

export type PaintAction =
  | { type: 'fill'; region: string; paint: Paint }
  | { type: 'clear'; region: string }
  | { type: 'stroke'; region: string; stroke: Stroke }
  | { type: 'sticker-add'; sticker: PlacedSticker }
  | { type: 'sticker-move'; uid: string; x: number; y: number }
  | { type: 'sticker-remove'; uid: string }
  | { type: 'reset' };

export const samePaint = (a?: Paint | null, b?: Paint | null) =>
  !!a && !!b && a.k === b.k && (a.k === 'rainbow' || a.c.toLowerCase() === b.c.toLowerCase());

/** Apply an action. Returns the *same* object when nothing changes. */
export function applyPaint(s: PaintState, a: PaintAction): PaintState {
  switch (a.type) {
    case 'fill':
      if (samePaint(s.fills[a.region], a.paint)) return s;
      return { ...s, fills: { ...s.fills, [a.region]: a.paint } };
    case 'clear': {
      if (!s.fills[a.region] && !s.strokes[a.region]?.length) return s;
      const fills = { ...s.fills };
      const strokes = { ...s.strokes };
      delete fills[a.region];
      delete strokes[a.region];
      return { ...s, fills, strokes };
    }
    case 'stroke': {
      const list = s.strokes[a.region] ?? [];
      return { ...s, strokes: { ...s.strokes, [a.region]: [...list, a.stroke] } };
    }
    case 'sticker-add':
      return { ...s, stickers: [...s.stickers, a.sticker] };
    case 'sticker-move': {
      const idx = s.stickers.findIndex((st) => st.uid === a.uid);
      if (idx < 0) return s;
      const cur = s.stickers[idx];
      if (cur.x === a.x && cur.y === a.y) return s;
      // moving a sticker also brings it to the front
      const rest = s.stickers.filter((st) => st.uid !== a.uid);
      return { ...s, stickers: [...rest, { ...cur, x: a.x, y: a.y }] };
    }
    case 'sticker-remove':
      if (!s.stickers.some((st) => st.uid === a.uid)) return s;
      return { ...s, stickers: s.stickers.filter((st) => st.uid !== a.uid) };
    case 'reset':
      if (isBlank(s)) return s;
      return EMPTY_STATE;
  }
}

export function isBlank(s: PaintState): boolean {
  return !Object.keys(s.fills).length && !Object.values(s.strokes).some((l) => l.length) && !s.stickers.length;
}

/** A region counts as coloured once it has a fill or at least one paint stroke. */
export function isColored(s: PaintState, regionId: string): boolean {
  return !!s.fills[regionId] || !!s.strokes[regionId]?.some((st) => st.paint);
}

export function coloredRatio(s: PaintState, regionIds: string[]): number {
  if (!regionIds.length) return 0;
  let n = 0;
  for (const id of regionIds) if (isColored(s, id)) n++;
  return n / regionIds.length;
}

// ---------------------------------------------------------------------------
// History
// ---------------------------------------------------------------------------

export interface History {
  past: PaintState[];
  present: PaintState;
  future: PaintState[];
}

export const HISTORY_LIMIT = 60;

export type HistoryAction = PaintAction | { type: 'undo' } | { type: 'redo' } | { type: 'load'; state: PaintState };

export function initHistory(state: PaintState = EMPTY_STATE): History {
  return { past: [], present: state, future: [] };
}

export function historyReducer(h: History, a: HistoryAction): History {
  switch (a.type) {
    case 'undo': {
      if (!h.past.length) return h;
      const prev = h.past[h.past.length - 1];
      return { past: h.past.slice(0, -1), present: prev, future: [h.present, ...h.future] };
    }
    case 'redo': {
      if (!h.future.length) return h;
      const [next, ...rest] = h.future;
      return { past: [...h.past, h.present], present: next, future: rest };
    }
    case 'load':
      return initHistory(a.state);
    default: {
      const next = applyPaint(h.present, a);
      if (next === h.present) return h;
      const past = [...h.past, h.present];
      if (past.length > HISTORY_LIMIT) past.shift();
      return { past, present: next, future: [] };
    }
  }
}

// ---------------------------------------------------------------------------
// Persistence helpers
// ---------------------------------------------------------------------------

const SAVE_VERSION = 1;

export function serialize(s: PaintState): string {
  return JSON.stringify({ v: SAVE_VERSION, s });
}

export function deserialize(raw: string | null | undefined): PaintState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.v !== SAVE_VERSION || typeof parsed.s !== 'object') return null;
    const s = parsed.s as PaintState;
    return {
      fills: s.fills ?? {},
      strokes: s.strokes ?? {},
      stickers: Array.isArray(s.stickers) ? s.stickers : [],
    };
  } catch {
    return null;
  }
}

let uidCounter = 0;
export function uid(prefix = 'u'): string {
  uidCounter = (uidCounter + 1) % 1e6;
  return `${prefix}${Date.now().toString(36)}${uidCounter.toString(36)}`;
}

/** Smooth SVG path for a stroke (quadratic curves through midpoints). */
export function strokeToD(pts: number[]): string {
  const n = pts.length / 2;
  if (n === 0) return '';
  if (n === 1) return `M${pts[0]} ${pts[1]}L${pts[0] + 0.1} ${pts[1] + 0.1}`;
  if (n === 2) return `M${pts[0]} ${pts[1]}L${pts[2]} ${pts[3]}`;
  let d = `M${pts[0]} ${pts[1]}`;
  for (let i = 1; i < n - 1; i++) {
    const x = pts[i * 2];
    const y = pts[i * 2 + 1];
    const mx = (x + pts[i * 2 + 2]) / 2;
    const my = (y + pts[i * 2 + 3]) / 2;
    d += `Q${x} ${y} ${mx} ${my}`;
  }
  d += `L${pts[(n - 1) * 2]} ${pts[(n - 1) * 2 + 1]}`;
  return d;
}

/**
 * Ramer–Douglas–Peucker simplification of a flat [x0, y0, x1, y1, ...] list.
 * With a tolerance around one canvas unit the smoothed stroke looks the same,
 * but saved drawings get several times smaller.
 */
export function simplifyStroke(pts: number[], tolerance = 1.2): number[] {
  const n = pts.length / 2;
  if (n <= 2) return pts.slice();
  const keep = new Uint8Array(n);
  keep[0] = 1;
  keep[n - 1] = 1;
  const stack: [number, number][] = [[0, n - 1]];
  const tol2 = tolerance * tolerance;
  while (stack.length) {
    const [a, b] = stack.pop()!;
    const ax = pts[a * 2];
    const ay = pts[a * 2 + 1];
    const bx = pts[b * 2];
    const by = pts[b * 2 + 1];
    const dx = bx - ax;
    const dy = by - ay;
    const len2 = dx * dx + dy * dy;
    let maxD = -1;
    let idx = -1;
    for (let i = a + 1; i < b; i++) {
      const px = pts[i * 2];
      const py = pts[i * 2 + 1];
      let d2: number;
      if (len2 === 0) d2 = (px - ax) ** 2 + (py - ay) ** 2;
      else {
        const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2));
        d2 = (px - (ax + t * dx)) ** 2 + (py - (ay + t * dy)) ** 2;
      }
      if (d2 > maxD) {
        maxD = d2;
        idx = i;
      }
    }
    if (idx > 0 && maxD > tol2) {
      keep[idx] = 1;
      stack.push([a, idx], [idx, b]);
    }
  }
  const out: number[] = [];
  for (let i = 0; i < n; i++) if (keep[i]) out.push(pts[i * 2], pts[i * 2 + 1]);
  return out;
}
