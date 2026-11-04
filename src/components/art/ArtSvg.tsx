import React, { memo, useMemo, useSyncExternalStore } from 'react';
import Svg, { ClipPath, Defs, G, Path } from 'react-native-svg';
import { INK, LINE } from '../../art/dsl';
import { STICKERS } from '../../art/stickers';
import type { DecorItem, Picture, RegionItem, StickerDef } from '../../art/types';
import { matToString, resolvePart } from '../../engine/anim';
import { compilePicture } from '../../engine/compile';
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
}

const RegionView = memo(function RegionView({ item, fill, strokes, prefix, transform, liveSource }: RegionProps) {
  const rule = item.evenOdd ? 'evenodd' : 'nonzero';
  const clipped = (strokes && strokes.length > 0) || !!liveSource;
  const clipId = `${prefix}c-${item.id}`;
  return (
    <G transform={transform}>
      <Path d={item.d} fill={fill} fillRule={rule} />
      {clipped && (
        <>
          <Defs>
            <ClipPath id={clipId}>
              <Path d={item.d} clipRule={rule} />
            </ClipPath>
          </Defs>
          <G clipPath={`url(#${clipId})`}>
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

export const StickerArt = memo(function StickerArt({ def, border = true }: { def: StickerDef; border?: boolean }) {
  const shadow = 'rgba(78,61,99,0.16)';
  return (
    <>
      {border && (
        <>
          {/* soft shadow + white die-cut border traced around every piece, lines included */}
          <G transform="translate(3 6)">
            {def.items.map((it, i) => (
              <Path key={`sh-${i}`} d={it.d} fill={borderFill(it, shadow)} stroke={shadow} strokeWidth={borderWidth(it)} strokeLinejoin="round" strokeLinecap="round" />
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
}: {
  sticker: PlacedSticker;
  x: number;
  y: number;
  selected: boolean;
}) {
  const def = getSticker(sticker.id);
  if (!def) return null;
  const s = sticker.s * (selected ? 1.08 : 1);
  return (
    <G transform={`matrix(${s} 0 0 ${s} ${x - 100 * s} ${y - 100 * s})`}>
      <StickerArt def={def} />
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
  drag?: { uid: string; x: number; y: number } | null;
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
  drag,
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
  return (
    <Svg width={size} height={size} viewBox={vb.join(' ')}>
      <PaintDefs spec={defs} prefix={prefix} />
      {picture.items.map((item, i) => {
        if (item.kind === 'region') {
          if (hidden.has(item.id)) return null;
          const fill = useHints
            ? item.hint ?? PAPER
            : fillRef(state.fills[item.id], prefix, item.id) ?? PAPER;
          return (
            <RegionView
              key={item.id}
              item={item}
              fill={fill}
              strokes={useHints ? undefined : state.strokes[item.id]}
              prefix={prefix}
              transform={tf(item.part)}
              liveSource={live && liveRegion === item.id ? live : undefined}
            />
          );
        }
        return <DecorView key={i} item={item} transform={tf(item.part)} />;
      })}
      {showStickers &&
        !useHints &&
        state.stickers.map((st) => {
          const dragging = drag?.uid === st.uid;
          return (
            <PlacedStickerView
              key={st.uid}
              sticker={st}
              x={dragging ? drag!.x : st.x}
              y={dragging ? drag!.y : st.y}
              selected={dragging}
            />
          );
        })}
    </Svg>
  );
}

export const ArtSvg = memo(ArtSvgImpl);
