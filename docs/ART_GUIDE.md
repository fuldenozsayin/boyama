# Minik Renkler Dünyası – Art Guide

Every colouring page, cover and sticker is drawn **in code** with the tiny DSL in
`src/art/dsl.ts`. The same data drives rendering, tap-to-fill hit-testing,
brush clipping and the celebration animations, so the art must follow a few
rules. Audience: children aged 3–7 who cannot read yet.

## 1. Canvas and layering

- Canvas is **1000 × 1000** units. (0,0) is top-left.
- `picture.items` is drawn in order; later items sit on top (paper cut-outs).
- **`region(id, d, opts)`** = a shape the child colours. It gets an automatic
  outline (`LINE.outer` = 7). An upper region hides the outline of the regions
  beneath it, so build characters from overlapping simple shapes:
  back leg → body → front leg → neck → head → muzzle → eye decor.
- **`decor(d, opts)`** / `ink()` / `inkLine()` / `shine()` / `blush()` /
  `cuteEye()` / `happyEye()` = fixed artwork that is never coloured (pupils,
  eye shines, smiles, whiskers, cheeks, tiny sparkles, grass strokes). Decor
  never blocks taps — a tap falls through to the region underneath.
- The **first item must be a full-canvas background region** (usually
  `region('sky', rect(0, 0, 1000, 1000), { outline: false, hint })`) so every
  tap lands somewhere.
- Shapes may extend past the canvas edge (e.g. ground from x = -20 to 1020).

## 2. DSL cheat sheet (`src/art/dsl.ts`)

| helper | what it makes |
| --- | --- |
| `circle(cx, cy, r)`, `ellipse(cx, cy, rx, ry, rotDeg?)` | round shapes |
| `rect(x, y, w, h, radius?)` | (rounded) rectangle |
| `poly(pts)`, `roundPoly(pts, round=0.2)` | polygon, polygon with soft corners |
| `smooth(pts, tension=1)` | **smooth closed blob through points** – bodies, hair, hills, tails |
| `shape(pts)` | like `smooth`, but points written `[x, y, 1]` become sharp corners (tips, bottoms of scenes) |
| `curve(pts)`, `line(pts)`, `arc(cx, cy, r, a0, a1)`, `smile(cx, cy, w, depth)` | **open** paths for decor lines |
| `star(cx, cy, rOut, rIn?, n=5)` | chubby rounded star |
| `heart(cx, cy, w, h?)` | heart |
| `cloud(cx, cy, w, h, bumps=5)` | cartoon cloud with flat bottom |
| `scallop(cx, cy, r, n=5, depth=0.65)` | flower head with round petals (add a `circle` centre region on top) |
| `petal(base, tip, halfWidth)` | leaf / petal / ear / wing-lobe |
| `drop(cx, cy, r, tipLen, angleDeg)` | teardrop (water, flame, gem) |
| `ringSegment(cx, cy, rIn, rOut, a0, a1)` | rainbow band (180 → 360 = upper half) |
| `twinkle(cx, cy, r)` | four-point sparkle |
| `wavePts(x0, x1, y, amp, waves)` | points for wavy edges (use inside `smooth`/`shape`) |
| `ellipsePts`, `symmetric(rightHalf, axis)`, `mirrorPts`, `rotatePt` | point helpers |
| `translate(d, dx, dy)`, `scale(d, sx, sy, cx, cy)`, `rotate(d, deg, cx, cy)`, `mirrorX(d, axis)`, `mirrorY(d, axis)` | transform a finished path (draw a wing once, mirror it) |
| `combine(...ds)` | several sub-paths in one shape (use `evenOdd: true` for holes) |
| `cuteEye(cx, cy, size, { lashes: 'left'|'right', part, look: [dx, dy] })` | glossy cartoon eye (returns an array → spread it `...cuteEye(...)`) |
| `happyEye(cx, cy, w)` | closed happy eye ∩ |
| `blush(cx, cy, rx, ry?)` | rosy cheek |

Constants: `INK` (line colour), `WHITE`, `BLUSH`, `LINE.outer / inner / fine`.
Never use arcs (`A`) in raw path strings – the parser does not support them.
If you need a helper that does not exist, write it in your own folder
(e.g. `src/art/pictures/<category>/helpers.ts`), don't edit `dsl.ts`.

## 3. Style rules (the important part)

1. **Cute first.** Chibi proportions: big round heads (≈ body size), big
   glossy eyes (`cuteEye`) low on the face, tiny smiles, pink cheeks. Soft,
   round, bouncy shapes. Nothing scary, sharp, sad or violent.
2. **Original designs only.** No look-alikes of existing brands/characters
   (no Disney/Frozen/Ariel, My Little Pony, Hello Kitty, Pokémon, Barbie…).
3. **Readable line art.** The uncoloured page must already look charming:
   clear silhouettes, no messy overlaps, no line soup. Leave breathing room.
4. **Tappable regions for small fingers.** Every region needs a visible area
   of at least ~1100 u² (≈ 33 × 33). Smaller details become *decor*. The QA
   tool warns about this — fix every warning.
5. **Scenes, not stickers.** Each page is a full scene (sky / water / room /
   forest + ground) with a main character and 3–8 fun extras (sun with face,
   clouds, stars, flowers, shells, bubbles, mushrooms…).
6. **Region count.** Picture 1 of each category is the easiest
   (≈ 15–22 big regions, for 3-year-olds); pictures get gradually richer;
   picture 5 may have up to ~40. Never more than 45.
7. **Hint colours.** Every region gets a `hint` (the "suggested" colour used
   for covers and previews). Use soft pastels: pinks `#FFB8D9 #FFC9DD
   #FFADB9`, lilacs `#D7C2FF #C9B8FF #E3D4FF`, mints `#BDEBC8 #9FE0B2
   #C8F0D0`, yellows `#FFF0A0 #FFE27A #FFD98A`, blues `#B9D8FF #9ED6FF
   #D9EEFF`, peach `#FFD3A5`, plus whites/creams for faces/fur
   `#FFF8FC #FFF4E6`, browns `#E8C4A0 #C99A74`, skin tones varied
   (`#FFE0CC #F5C9A6 #D9A27E #A8724F`).
8. **Diverse characters.** Princesses, fairies and mermaids should vary in
   skin tone and hair style across the pictures.
9. **Region ids** are kebab-case and descriptive (`wing-top-left`, `hair-1`,
   `tower-roof`). Picture ids are globally unique and start with the
   category: `pets-kitten-yarn`. Titles are short **Turkish** phrases.

## 4. Celebration animation parts

`picture.parts` names groups that move when the child finishes the page.
Set `part: 'name'` on regions/decor (and pass `part` to `cuteEye`, `blush`…).
Available `anim` kinds (see `src/art/types.ts`): `blink` (pivot = eye centre),
`wag` (tail, pivot = tail base), `flap` (wings, pivot = where the wing meets
the body; it squeezes horizontally toward the pivot), `bob`, `sway`
(pivot = bottom of the thing), `pulse`, `twinkle`, `spin`.

Every picture should have **at least two** animated parts, and the main
character should come alive. Category expectations:

- unicorn: eyes **blink**, stars twinkle, tail wags · `celebrate: { sound: 'magic', particles: 'stars' }`
- princess: sparkles/crown **twinkle**, eyes blink, dress sway · `{ sound: 'magic', particles: 'sparkles' }`
- pets: cat **tail wag + meow**, dog tail wag + woof, bunny ears wag + boing · `{ sound: 'meow' | 'woof' | 'boing', particles: 'hearts' }`
- fairy: wings **flap**, wand stars twinkle · `{ sound: 'magic', particles: 'sparkles' }`
- mermaid: tail **wag (swish)**, bubbles bob, fish sway · `{ sound: 'bubbles', particles: 'bubbles' }`
- butterfly: wings **flap**, flowers sway · `{ sound: 'flutter', particles: 'petals' }`

Parts can be nested with `parent`: e.g. `eye: { anim: 'blink', pivot, parent: 'head' }`
makes the eyes blink *and* follow a swaying head.

When a part rotates/scales, everything with that part (fill, outline, brush
strokes the child made, decor) moves together. Pick pivots carefully and
check the `--anim` preview row.

## 5. Files

```
src/art/pictures/<category>/
  index.ts          export const pictures: Picture[] (exactly 5, easiest first)
                    export const cover: CategoryCover
  <picture-name>.ts one picture per file, exported as a named const
```

`cover` picks one of the pictures, a square crop `viewBox: [x, y, w, h]`
focused on the main character, and optionally `hide: ['sky']` to drop the
background so the category card colour shows through.

## 6. Preview & QA loop (do this for every picture!)

```bash
npx tsx scripts/art-preview.ts <category>               # all pictures + cover
npx tsx scripts/art-preview.ts <category> <pictureId> --anim
```

It prints errors/warnings and writes `art-preview/<pictureId>.png` with three
panels: **line art**, **hint colours**, **region map** (each region in a random
colour with its id). Open the PNG and look at it critically:

- Does the line art alone look adorable and clear?
- In the region map, is every intended area its own region? Did two areas
  you meant to separate merge, or is something hidden?
- Are faces well placed and symmetric? Eyes not too small?
- Zero errors and zero warnings before you finish.

Also run `npx tsc --noEmit -p scripts` and fix any type errors in your files.
