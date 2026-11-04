/// <reference types="jest" />
import {
  applyPaint,
  coloredRatio,
  deserialize,
  EMPTY_STATE,
  historyReducer,
  HISTORY_LIMIT,
  initHistory,
  serialize,
  simplifyStroke,
  strokeToD,
  type Paint,
} from '../paint';

const pink: Paint = { k: 'solid', c: '#FF8FC7' };
const blue: Paint = { k: 'solid', c: '#7CC8FF' };
const stroke = (id: string) => ({ id, paint: pink, w: 20, pts: [0, 0, 10, 10, 20, 5] });

describe('paint actions', () => {
  it('fills and ignores identical re-fills', () => {
    const a = applyPaint(EMPTY_STATE, { type: 'fill', region: 'sky', paint: pink });
    expect(a.fills.sky).toEqual(pink);
    expect(applyPaint(a, { type: 'fill', region: 'sky', paint: { ...pink } })).toBe(a);
  });

  it('keeps untouched stroke arrays identical (cheap memoised rendering)', () => {
    let s = applyPaint(EMPTY_STATE, { type: 'stroke', region: 'a', stroke: stroke('1') });
    const aStrokes = s.strokes.a;
    s = applyPaint(s, { type: 'stroke', region: 'b', stroke: stroke('2') });
    expect(s.strokes.a).toBe(aStrokes);
  });

  it('clear removes fill and strokes of one region only', () => {
    let s = applyPaint(EMPTY_STATE, { type: 'fill', region: 'a', paint: pink });
    s = applyPaint(s, { type: 'stroke', region: 'a', stroke: stroke('1') });
    s = applyPaint(s, { type: 'fill', region: 'b', paint: blue });
    s = applyPaint(s, { type: 'clear', region: 'a' });
    expect(s.fills.a).toBeUndefined();
    expect(s.strokes.a).toBeUndefined();
    expect(s.fills.b).toEqual(blue);
  });

  it('eraser strokes do not count as colouring', () => {
    const s = applyPaint(EMPTY_STATE, { type: 'stroke', region: 'a', stroke: { ...stroke('1'), paint: null } });
    expect(coloredRatio(s, ['a', 'b'])).toBe(0);
    const s2 = applyPaint(s, { type: 'fill', region: 'b', paint: blue });
    expect(coloredRatio(s2, ['a', 'b'])).toBe(0.5);
  });

  it('moves stickers to the front', () => {
    let s = applyPaint(EMPTY_STATE, { type: 'sticker-add', sticker: { uid: 'x', id: 'star', x: 1, y: 1, s: 1 } });
    s = applyPaint(s, { type: 'sticker-add', sticker: { uid: 'y', id: 'heart', x: 2, y: 2, s: 1 } });
    s = applyPaint(s, { type: 'sticker-move', uid: 'x', x: 50, y: 60 });
    expect(s.stickers.map((k) => k.uid)).toEqual(['y', 'x']);
    expect(s.stickers[1]).toMatchObject({ x: 50, y: 60 });
  });
});

describe('history', () => {
  it('undoes and redoes, and a new action clears redo', () => {
    let h = initHistory();
    h = historyReducer(h, { type: 'fill', region: 'a', paint: pink });
    h = historyReducer(h, { type: 'fill', region: 'a', paint: blue });
    h = historyReducer(h, { type: 'undo' });
    expect(h.present.fills.a).toEqual(pink);
    h = historyReducer(h, { type: 'redo' });
    expect(h.present.fills.a).toEqual(blue);
    h = historyReducer(h, { type: 'undo' });
    h = historyReducer(h, { type: 'fill', region: 'b', paint: pink });
    expect(h.future).toHaveLength(0);
  });

  it('reset is undoable', () => {
    let h = historyReducer(initHistory(), { type: 'fill', region: 'a', paint: pink });
    h = historyReducer(h, { type: 'reset' });
    expect(h.present.fills).toEqual({});
    h = historyReducer(h, { type: 'undo' });
    expect(h.present.fills.a).toEqual(pink);
  });

  it('no-op actions do not create history entries', () => {
    const h = historyReducer(initHistory(), { type: 'reset' });
    expect(h.past).toHaveLength(0);
  });

  it('caps the history length', () => {
    let h = initHistory();
    for (let i = 0; i < HISTORY_LIMIT + 20; i++) h = historyReducer(h, { type: 'fill', region: 'a', paint: { k: 'solid', c: `#0000${(i % 256).toString(16).padStart(2, '0')}` } });
    expect(h.past.length).toBe(HISTORY_LIMIT);
  });
});

describe('persistence', () => {
  it('round-trips and rejects garbage', () => {
    const s = applyPaint(EMPTY_STATE, { type: 'stroke', region: 'a', stroke: stroke('1') });
    expect(deserialize(serialize(s))).toEqual(s);
    expect(deserialize('not json')).toBeNull();
    expect(deserialize(JSON.stringify({ v: 999, s }))).toBeNull();
    expect(deserialize(null)).toBeNull();
  });

  it('builds smooth stroke paths, including single taps', () => {
    expect(strokeToD([5, 5])).toMatch(/^M5 5L5\.1 5\.1$/);
    expect(strokeToD([0, 0, 10, 10, 20, 0])).toContain('Q');
  });
});

describe('stroke simplification', () => {
  it('drops points on straight runs but keeps corners and ends', () => {
    const pts: number[] = [];
    for (let x = 0; x <= 100; x += 2) pts.push(x, 0); // straight line
    for (let y = 2; y <= 100; y += 2) pts.push(100, y); // then a corner
    const out = simplifyStroke(pts);
    expect(out).toEqual([0, 0, 100, 0, 100, 100]);
  });

  it('keeps visible wiggles', () => {
    const pts = [0, 0, 10, 8, 20, 0, 30, 8, 40, 0];
    expect(simplifyStroke(pts)).toEqual(pts);
  });

  it('leaves tiny strokes untouched', () => {
    expect(simplifyStroke([5, 5])).toEqual([5, 5]);
    expect(simplifyStroke([5, 5, 6, 6])).toEqual([5, 5, 6, 6]);
  });
});
