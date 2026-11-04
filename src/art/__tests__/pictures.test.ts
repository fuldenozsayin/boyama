/// <reference types="jest" />
import { ALL_PICTURES, CATEGORIES, getPicture } from '..';
import { STICKERS } from '../stickers';
import { qa } from '../qa';

describe('colouring book content', () => {
  it('has six categories with at least five pictures each', () => {
    expect(CATEGORIES).toHaveLength(6);
    for (const c of CATEGORIES) expect(c.pictures.length).toBeGreaterThanOrEqual(5);
  });

  it('uses globally unique picture ids prefixed by their category', () => {
    const ids = ALL_PICTURES.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const p of ALL_PICTURES) expect(p.id.startsWith(`${p.category}-`)).toBe(true);
  });

  it('every category cover points at one of its own pictures', () => {
    for (const c of CATEGORIES) {
      const p = getPicture(c.cover.pictureId);
      expect(p?.category).toBe(c.id);
    }
  });

  it.each(ALL_PICTURES.map((p) => [p.id, p] as const))('%s passes art QA (every region tappable)', (_id, pic) => {
    const r = qa(pic);
    expect(r.errors).toEqual([]);
  });

  it('has 24 uniquely named stickers', () => {
    expect(STICKERS).toHaveLength(24);
    expect(new Set(STICKERS.map((s) => s.id)).size).toBe(24);
  });
});
