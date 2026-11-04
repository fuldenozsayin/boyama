import React, { memo, useMemo, useSyncExternalStore } from 'react';
import Svg, { ClipPath, Defs, G, Path } from 'react-native-svg';
import { INK, LINE } from '../../art/dsl';
import { STICKERS } from '../../art/stickers';
import type { DecorItem, Picture, RegionItem, StickerDef } from '../../art/types';
import { matToString, resolvePart } from '../../engine/anim';
import { boxesOverlap, compilePicture } from '../../engine/compile';
import type { LiveStroke } from '../../engine/liveStroke';
import { strokeToD, type Paint, type PaintState, type PlacedSticker, type Stroke } from '../../engine/paint';
import { fillRef, paintKey, PaintDefs, strokeRef, type DefsSpec } from '../../engine/paints';

const PAPER = '#FFFFFF';

// ---------------------------------------------------------------------------
// strokes
// ---------------------------------------------------------------------------

const dCache = new WeakMap<Stroke, string>();
function strokeD(s: Stroke): string {
  let d = dCache.get(s);
  if (!d) {
    d = strokeToD(s.pts);
    dCache.set(s, d);
  }
  return d;
}

const StrokeView = memo(function StrokeView({
  stroke,
  prefix,
  eraseFill,
}: {
  stroke: Stroke;
  prefix: string;
  eraseFill: string;
}) {
  return (
    <Path
      d={strokeD(stroke)}
      fill="none"
      stroke={stroke.paint ? strokeRef(stroke.paint, prefix) : eraseFill}
      strokeWidth={stroke.w}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
});

function LiveStrokePath({ source, prefix, eraseFill }: { source: LiveStroke; prefix: string; eraseFill: string }) {
  useSyncExternalStore(source.subscribe, source.getVersion, source.getVersion);
  if (!source.pts.length) return null;
  return (
    <Path
      d={strokeToD(source.pts)}
      fill="none"
      stroke={source.paint ? strokeRef(source.paint, prefix) : eraseFill}
      strokeWidth={source.w}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

// ---------------------------------------------------------------------------
// regions & decor
// ---------------------------------------------------------------------------

interface RegionProps {
  item: RegionItem;
  fill: string;
  strokes: Stroke[] | undefined;
  prefix: string;
  transform?: string;
  liveSource?: LiveStroke;
  /** overlay mode: skip the fill (it is already visible underneath) */
  noBody?: boolean;
}

const RegionView = memo(function RegionView({ item, fill, strokes, prefix, transform, liveSource, noBody }: RegionProps) {
  const rule = item.evenOdd ? 'evenodd' : 'nonzero';
  const clipped = (strokes && strokes.length > 0) || !!liveSource;
  const clipId = `${prefix}c-${item.id}`;
  return (
    <G transform={transform}>
      {!noBody && <Path d={item.d} fill={fill} fillRule={rule} />}
      {clipped && (
        <>
          <Defs>
            <ClipPath id={clipId}>
              <Path d={item.d} clipRule={rule} />
            </ClipPath>
          </Defs>
          {/* Android reads the clip rule from the referencing element, not the clip child */}
          <G clipPath={`url(#${clipId})`} clipRule={rule}>
            {strokes?.map((s) => <StrokeView key={s.id} stroke={s} prefix={prefix} eraseFill={fill} />)}
            {liveSource && <LiveStrokePath source={liveSource} prefix={prefix} eraseFill={fill} />}
          </G>
        </>
      )}
      {item.outline !== false && (
        <Path
          d={item.d}
          fill="none"
          stroke={INK}
          strokeWidth={item.line ?? LINE.outer}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      )}
    </G>
  );
});

const DecorView = memo(function DecorView({ item, transform }: { item: DecorItem; transform?: string }) {
  const stroke = item.stroke ?? (item.fill ? undefined : INK);
  return (
    <Path
      d={item.d}
      transform={transform}
      fill={item.fill ?? 'none'}
      stroke={stroke}
      strokeWidth={stroke ? item.width ?? LINE.inner : undefined}
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={item.opacity}
    />
  );
});

// ---------------------------------------------------------------------------
// stickers
// ---------------------------------------------------------------------------

const stickerById = new Map<string, StickerDef>();
export function getSticker(id: string): StickerDef | undefined {
  if (!stickerById.size) for (const s of STICKERS) stickerById.set(s.id, s);
  return stickerById.get(id);
}

/** Sticker artwork in its own 200 x 200 space, with white die-cut border + shadow. */
function borderWidth(it: StickerDef['items'][number]): number {
  if (it.kind === 'region') return 18;
  return (it.fill ? 0 : it.width ?? LINE.inner) + 16;
}

function borderFill(it: StickerDef['items'][number], color: string): string {
  return it.kind === 'region' || it.fill ? color : 'none';
}

export const StickerArt = memo(function StickerArt({
  def,
  border = true,
  shadow = true,
}: {
  def: StickerDef;
  border?: boolean;
  shadow?: boolean;
}) {
  const shadowColor = 'rgba(78,61,99,0.16)';
  return (
    <>
      {border && (
        <>
          {/* soft shadow + white die-cut border traced around every piece, lines included */}
          <G transform="translate(3 6)" opacity={shadow ? 1 : 0}>
            {def.items.map((it, i) => (
              <Path key={`sh-${i}`} d={it.d} fill={borderFill(it, shadowColor)} stroke={shadowColor} strokeWidth={borderWidth(it)} strokeLinejoin="round" strokeLinecap="round" />
            ))}
          </G>
          {def.items.map((it, i) => (
            <Path key={`bd-${i}`} d={it.d} fill={borderFill(it, PAPER)} stroke={PAPER} strokeWidth={borderWidth(it)} strokeLinejoin="round" strokeLinecap="round" />
          ))}
        </>
      )}
      {def.items.map((it, i) =>
        it.kind === 'region' ? (
          <G key={it.id}>
            <Path d={it.d} fill={it.hint ?? PAPER} fillRule={it.evenOdd ? 'evenodd' : 'nonzero'} />
            {it.outline !== false && (
              <Path d={it.d} fill="none" stroke={INK} strokeWidth={it.line ?? 4} strokeLinejoin="round" strokeLinecap="round" />
            )}
          </G>
        ) : (
          <DecorView key={i} item={it} />
        ),
      )}
    </>
  );
});

const PlacedStickerView = memo(function PlacedStickerView({
  sticker,
  x,
  y,
  selected,
  shadow = true,
}: {
  sticker: PlacedSticker;
  x: number;
  y: number;
  selected: boolean;
  shadow?: boolean;
}) {
  const def = getSticker(sticker.id);
  if (!def) return null;
  const s = sticker.s * (selected ? 1.08 : 1);
  return (
    <G transform={`matrix(${s} 0 0 ${s} ${x - 100 * s} ${y - 100 * s})`}>
      <StickerArt def={def} shadow={shadow} />
    </G>
  );
});

// ---------------------------------------------------------------------------
// the picture
// ---------------------------------------------------------------------------

export interface ArtSvgProps {
  picture: Picture;
  state: PaintState;
  /** rendered width/height in px */
  size: number;
  /** unique id prefix for gradients / clip paths of this instance */
  prefix: string;
  /** celebration animation time in seconds (undefined = still) */
  time?: number;
  live?: LiveStroke;
  liveRegion?: string | null;
  /** paint currently selected in the toolbar (its pattern must exist while drawing) */
  activePaint?: Paint | null;
  /** render suggested colours instead of the child's paint (covers / examples) */
  useHints?: boolean;
  viewBox?: [number, number, number, number];
  hide?: string[];
  showStickers?: boolean;
  /** sticker being dragged: drawn by a separate light overlay, hidden here */
  hiddenSticker?: string | null;
  /**
   * Overlay mode for the stroke being drawn: render only the live region's
   * new stroke plus everything that sits above it inside `viewBox`. Keeps
   * the big picture SVG from being re-rasterised on every brush frame.
   */
  liveOnly?: boolean;
  /** explicit pixel size for non-square overlays */
  width?: number;
  height?: number;
}

function buildDefs(picture: Picture, state: PaintState, activePaint?: Paint | null): DefsSpec {
  const cp = compilePicture(picture);
  const patterns = new Map<string, Paint>();
  const rainbowRegions: DefsSpec['rainbowRegions'] = [];
  let rainbowStroke = false;
  const addPattern = (p: Paint) => {
    if (p.k === 'solid' || p.k === 'rainbow') return;
    patterns.set(paintKey(p), p);
  };
  for (const [id, p] of Object.entries(state.fills)) {
    if (p.k === 'rainbow') {
      const r = cp.byId[id];
      if (r) rainbowRegions.push({ id, bbox: r.bbox });
    } else addPattern(p);
  }
  for (const list of Object.values(state.strokes)) {
    for (const s of list) {
      if (!s.paint) continue;
      if (s.paint.k === 'rainbow') rainbowStroke = true;
      else addPattern(s.paint);
    }
  }
  if (activePaint) {
    if (activePaint.k === 'rainbow') rainbowStroke = true;
    else addPattern(activePaint);
  }
  return { patterns: [...patterns.values()], rainbowRegions, rainbowStroke };
}

function ArtSvgImpl({
  picture,
  state,
  size,
  prefix,
  time,
  live,
  liveRegion,
  activePaint,
  useHints,
  viewBox,
  hide,
  showStickers = true,
  hiddenSticker,
  liveOnly,
  width,
  height,
}: ArtSvgProps) {
  const defs = useMemo(
    () => (useHints ? { patterns: [], rainbowRegions: [], rainbowStroke: false } : buildDefs(picture, state, activePaint)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [picture, state.fills, state.strokes, activePaint, useHints],
  );
  const hidden = useMemo(() => new Set(hide ?? []), [hide]);
  const parts = picture.parts ?? {};
  const tf = (part?: string) =>
    time !== undefined && part && parts[part] ? matToString(resolvePart(parts, part, time)) : undefined;

  const vb = viewBox ?? [0, 0, 1000, 1000];
  const cp = compilePicture(picture);
  const liveZ = liveOnly && liveRegion ? cp.byId[liveRegion]?.z ?? -1 : -1;
  const view = { x0: vb[0], y0: vb[1], x1: vb[0] + vb[2], y1: vb[1] + vb[3] };
  if (liveOnly && liveZ < 0) return null;
  return (
    <Svg width={width ?? size} height={height ?? size} viewBox={vb.join(' ')}>
      <PaintDefs spec={defs} prefix={prefix} />
      {picture.items.map((item, i) => {
        if (liveOnly && (i < liveZ || (i > liveZ && !boxesOverlap(cp.itemBoxes[i], view)))) return null;
        if (item.kind === 'region') {
          if (hidden.has(item.id)) return null;
          const fill = useHints
            ? item.hint ?? PAPER
            : fillRef(state.fills[item.id], prefix, item.id) ?? PAPER;
          const isLive = !!live && liveRegion === item.id;
          return (
            <RegionView
              key={item.id}
              item={item}
              fill={fill}
              strokes={useHints || (liveOnly && isLive) ? undefined : state.strokes[item.id]}
              prefix={prefix}
              transform={tf(item.part)}
              liveSource={isLive ? live : undefined}
              noBody={liveOnly && isLive}
            />
          );
        }
        // overlay mode: translucent decor (cheeks, gloss) is already visible underneath
        if (liveOnly && item.opacity !== undefined && item.opacity < 1) return null;
        return <DecorView key={i} item={item} transform={tf(item.part)} />;
      })}
      {showStickers &&
        !useHints &&
        state.stickers.map((st) => {
          if (st.uid === hiddenSticker) return null;
          if (liveOnly && !boxesOverlap({ x0: st.x - 110 * st.s, y0: st.y - 110 * st.s, x1: st.x + 110 * st.s, y1: st.y + 110 * st.s }, view))
            return null;
          return <PlacedStickerView key={st.uid} sticker={st} x={st.x} y={st.y} selected={false} shadow={!liveOnly} />;
        })}
    </Svg>
  );
}

export const ArtSvg = memo(ArtSvgImpl);
