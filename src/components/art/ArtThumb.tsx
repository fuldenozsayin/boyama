import React, { memo, useEffect, useState } from 'react';
import type { Picture } from '../../art/types';
import { EMPTY_STATE, type PaintState } from '../../engine/paint';
import { loadArt, onArtChanged, peekArt } from '../../store/artStorage';
import { ArtSvg } from './ArtSvg';

/** Small, static render of a saved artwork (loads its paint data lazily). */
export const ArtThumb = memo(function ArtThumb({
  artworkId,
  picture,
  size,
}: {
  artworkId: string;
  picture: Picture;
  size: number;
}) {
  const [state, setState] = useState<PaintState>(() => peekArt(artworkId) ?? EMPTY_STATE);
  useEffect(() => {
    let alive = true;
    const load = () =>
      loadArt(artworkId).then((s) => {
        if (alive) setState(s ?? EMPTY_STATE);
      });
    load();
    const off = onArtChanged((id) => {
      if (id === artworkId || id === '*') load();
    });
    return () => {
      alive = false;
      off();
    };
  }, [artworkId]);
  return <ArtSvg picture={picture} state={state} size={size} prefix={`th-${artworkId}-`} />;
});
