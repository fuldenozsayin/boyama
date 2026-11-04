/**
 * Data model for colouring pages.
 *
 * Every picture lives in a 1000 x 1000 canvas. Items are drawn in array order
 * (later = on top), like stacked paper cut-outs:
 *
 *  - `region`  a closed shape the child can colour (bucket fill or brush).
 *              It gets its own outline, so an upper shape naturally hides the
 *              outline of whatever is below it.
 *  - `decor`   fixed artwork that is never coloured: pupils, eye shines,
 *              smiles, whiskers, blush, small sparkles... Decor never blocks
 *              taps; a tap falls through to the region underneath.
 */

export const CANVAS = 1000;

export type CategoryId = 'princess' | 'unicorn' | 'pets' | 'fairy' | 'mermaid' | 'butterfly';

/** Animation recipes used by the completion celebration. */
export type AnimKind =
  /** quick eyelid close (scaleY → 0.1) every couple of seconds. pivot = eye centre */
  | 'blink'
  /** rotate back and forth around pivot, amp = degrees (default 12) */
  | 'wag'
  /** wing flap: scaleX squeeze towards pivot (the body), amp = 0..1 (default 0.45) */
  | 'flap'
  /** gentle float up/down, amp = canvas units (default 14) */
  | 'bob'
  /** slow rotate back and forth, amp = degrees (default 5) */
  | 'sway'
  /** scale up/down around pivot, amp = 0..1 (default 0.08) */
  | 'pulse'
  /** sparkle: scale + small rotation, amp = 0..1 (default 0.25) */
  | 'twinkle'
  /** continuous rotation around pivot, speed = turns per second (default 0.25) */
  | 'spin';

export interface PartAnim {
  anim: AnimKind;
  /** pivot / centre point in canvas units */
  pivot: [number, number];
  amp?: number;
  /** cycles per second (default depends on anim) */
  speed?: number;
  /** phase offset 0..1 so several parts don't move in lock-step */
  phase?: number;
}

export interface RegionItem {
  kind: 'region';
  /** unique inside the picture, kebab-case: 'mane-1', 'sky', 'wing-left' */
  id: string;
  /** SVG path data in canvas units (prefer the DSL helpers) */
  d: string;
  /** use even-odd fill rule (for rings / shapes with holes) */
  evenOdd?: boolean;
  /** animation part this region belongs to (see Picture.parts) */
  part?: string;
  /** suggested colour – used for covers, previews and the "example" view */
  hint?: string;
  /** draw the outline (default true). Background usually sets false. */
  outline?: boolean;
  /** outline width override (default LINE.outer) */
  line?: number;
}

export interface DecorItem {
  kind: 'decor';
  d: string;
  /** fixed fill colour (pupils, shines, blush). */
  fill?: string;
  /** stroke colour. If neither fill nor stroke is set the path is drawn as an ink line. */
  stroke?: string;
  width?: number;
  opacity?: number;
  part?: string;
}

export type ArtItem = RegionItem | DecorItem;

export type SoundKey =
  | 'meow'
  | 'woof'
  | 'boing'
  | 'magic'
  | 'bubbles'
  | 'flutter'
  | 'neigh'
  | 'chime';

export type ParticleKind = 'stars' | 'hearts' | 'sparkles' | 'bubbles' | 'petals' | 'rainbow';

export interface Picture {
  /** globally unique, kebab-case, prefixed with category: 'unicorn-rainbow-hill' */
  id: string;
  /** owning category ('free' only for the blank free-drawing page) */
  category: CategoryId | 'free';
  /** short Turkish title (for parents / accessibility) */
  title: string;
  items: ArtItem[];
  /** named animation parts used in the celebration */
  parts?: Record<string, PartAnim>;
  celebrate?: {
    /** extra character sound played with the celebration */
    sound?: SoundKey;
    particles?: ParticleKind;
  };
}

export interface CategoryCover {
  /** which picture to show, rendered with its hint colours */
  pictureId: string;
  /** crop window [x, y, w, h] in canvas units (square works best) */
  viewBox: [number, number, number, number];
  /** region ids to hide on the cover (e.g. the sky so the card colour shows) */
  hide?: string[];
}

export interface Category {
  id: CategoryId;
  title: string;
  /** card colour (pastel) and a deeper accent */
  color: string;
  accent: string;
  cover: CategoryCover;
  pictures: Picture[];
}

/** Reward sticker: drawn in a 200 x 200 box and always rendered with hint colours. */
export interface StickerDef {
  /** kebab-case, unique */
  id: string;
  /** short Turkish name */
  title: string;
  items: ArtItem[];
}
