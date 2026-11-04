import React, { memo } from 'react';
import Svg, { Circle, G, Path } from 'react-native-svg';
import { arc, circle, ellipse, heart, line, rect, roundPoly, star, twinkle, INK } from '../../art/dsl';
import { RAINBOW_STOPS } from '../../engine/paints';

export type IconName =
  | 'home'
  | 'back'
  | 'undo'
  | 'redo'
  | 'check'
  | 'bucket'
  | 'brush'
  | 'eraser'
  | 'sticker'
  | 'magic'
  | 'trash'
  | 'gallery'
  | 'play'
  | 'lock'
  | 'soundOn'
  | 'soundOff'
  | 'music'
  | 'book'
  | 'palette'
  | 'zoomOut'
  | 'close'
  | 'next'
  | 'plus'
  | 'star'
  | 'heart'
  | 'bulb'
  | 'pencil';

const W = 5; // outline width in the 100-unit icon box

/** thick white line with an ink outline (for arrows / ticks) */
function OutlinedLine({ d, w = 12, color = '#fff' }: { d: string; w?: number; color?: string }) {
  return (
    <>
      <Path d={d} fill="none" stroke={INK} strokeWidth={w + W * 2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
    </>
  );
}

function Shape({ d, fill = '#fff', rule }: { d: string; fill?: string; rule?: 'evenodd' }) {
  return <Path d={d} fill={fill} fillRule={rule} stroke={INK} strokeWidth={W} strokeLinejoin="round" strokeLinecap="round" />;
}

const ARROW_HEAD = roundPoly(
  [
    [18, 34],
    [44, 14],
    [44, 54],
  ],
  0.18,
);

function Undo({ color }: { color: string }) {
  return (
    <>
      <OutlinedLine d={arc(52, 58, 26, 200, 430)} color={color} w={13} />
      <Shape d={ARROW_HEAD} fill={color} />
    </>
  );
}

function body(name: IconName, color: string, accent: string) {
  switch (name) {
    case 'home':
      return (
        <>
          <Shape d={rect(24, 44, 52, 42, 9)} fill="#fff" />
          <Shape d={roundPoly([[50, 12], [90, 48], [10, 48]], 0.12)} fill={color} />
          <Shape d={rect(42, 60, 16, 26, 7)} fill={accent} />
        </>
      );
    case 'back':
      return <OutlinedLine d={line([[62, 20], [32, 50], [62, 80]])} w={15} color={color} />;
    case 'next':
      return <OutlinedLine d={line([[38, 20], [68, 50], [38, 80]])} w={15} color={color} />;
    case 'undo':
      return <Undo color={color} />;
    case 'redo':
      return (
        <G transform="matrix(-1 0 0 1 100 0)">
          <Undo color={color} />
        </G>
      );
    case 'check':
      return <OutlinedLine d={line([[22, 52], [42, 72], [78, 30]])} w={15} color={color} />;
    case 'close':
      return (
        <>
          <OutlinedLine d={line([[28, 28], [72, 72]])} w={14} color={color} />
          <OutlinedLine d={line([[72, 28], [28, 72]])} w={14} color={color} />
        </>
      );
    case 'bucket':
      return (
        <>
          <OutlinedLine d={arc(46, 40, 22, 190, 350)} w={5} color="#fff" />
          <Shape d={roundPoly([[18, 38], [74, 38], [66, 86], [26, 86]], 0.14)} fill="#fff" />
          <Shape d={ellipse(46, 38, 28, 9)} fill={color} />
          <Shape d={roundPoly([[70, 40], [86, 52], [86, 74], [78, 80], [74, 62]], 0.25)} fill={color} />
        </>
      );
    case 'brush':
      return (
        <>
          <Shape d={roundPoly([[60, 10], [72, 20], [46, 58], [36, 50]], 0.2)} fill={accent} />
          <Shape d={roundPoly([[34, 48], [48, 60], [42, 68], [28, 56]], 0.15)} fill="#d9d4e4" />
          <Shape d="M28 56 C14 62 18 78 10 90 C28 88 42 80 42 68 Z" fill={color} />
        </>
      );
    case 'pencil':
      return (
        <>
          <Shape d={roundPoly([[66, 12], [86, 32], [40, 78], [20, 58]], 0.08)} fill={accent} />
          <Shape d={roundPoly([[20, 58], [40, 78], [12, 88]], 0.12)} fill="#FFE0B8" />
          <Path d={roundPoly([[14, 80], [20, 86], [11, 89]], 0.1)} fill={INK} />
        </>
      );
    case 'eraser':
      return (
        <>
          <Shape d={roundPoly([[54, 14], [88, 46], [50, 84], [16, 52]], 0.14)} fill={color} />
          <Shape d={roundPoly([[35, 33], [69, 65], [50, 84], [16, 52]], 0.16)} fill="#fff" />
        </>
      );
    case 'sticker':
      return (
        <>
          <Shape d={star(50, 52, 40, 22, 5, -90, 0.3)} fill={color} />
          <Circle cx={42} cy={50} r={4} fill={INK} />
          <Circle cx={58} cy={50} r={4} fill={INK} />
          <Path d={arc(50, 58, 7, 20, 160)} stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
        </>
      );
    case 'magic':
      return (
        <>
          <OutlinedLine d={line([[22, 82], [56, 46]])} w={10} color={accent} />
          <Shape d={star(64, 36, 26, 14, 5, -90, 0.28)} fill={color} />
          <Path d={twinkle(24, 26, 10)} fill="#fff" stroke={INK} strokeWidth={3} />
          <Path d={twinkle(86, 70, 8)} fill="#fff" stroke={INK} strokeWidth={3} />
        </>
      );
    case 'trash':
      return (
        <>
          <Shape d={roundPoly([[24, 34], [76, 34], [70, 88], [30, 88]], 0.12)} fill="#fff" />
          <Shape d={rect(16, 24, 68, 14, 7)} fill={color} />
          <Shape d={rect(40, 14, 20, 12, 5)} fill={color} />
          <Path d={line([[42, 46], [43, 78]])} stroke={INK} strokeWidth={4} strokeLinecap="round" />
          <Path d={line([[58, 46], [57, 78]])} stroke={INK} strokeWidth={4} strokeLinecap="round" />
        </>
      );
    case 'gallery':
      return (
        <>
          <Shape d={rect(10, 16, 80, 68, 12)} fill={accent} />
          <Shape d={rect(20, 26, 60, 48, 6)} fill="#E6F4FF" />
          <Path d="M20 70 L40 46 L52 60 L62 50 L80 70 L80 68 Q80 74 74 74 L26 74 Q20 74 20 68 Z" fill={color} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
          <Shape d={circle(64, 38, 7)} fill="#FFE27A" />
        </>
      );
    case 'play':
      return <Shape d={roundPoly([[34, 20], [80, 50], [34, 80]], 0.2)} fill={color} />;
    case 'lock':
      return (
        <>
          <OutlinedLine d={arc(50, 44, 18, 180, 360)} w={8} color="#fff" />
          <Path d={line([[32, 44], [32, 50]])} stroke={INK} strokeWidth={18} strokeLinecap="round" />
          <Path d={line([[68, 44], [68, 50]])} stroke={INK} strokeWidth={18} strokeLinecap="round" />
          <Path d={line([[32, 44], [32, 50]])} stroke="#fff" strokeWidth={8} strokeLinecap="round" />
          <Path d={line([[68, 44], [68, 50]])} stroke="#fff" strokeWidth={8} strokeLinecap="round" />
          <Shape d={rect(20, 46, 60, 42, 10)} fill={color} />
          <Shape d={circle(50, 64, 6)} fill={INK} />
        </>
      );
    case 'soundOn':
    case 'soundOff':
      return (
        <>
          <Shape d={roundPoly([[14, 38], [32, 38], [54, 18], [54, 82], [32, 62], [14, 62]], 0.12)} fill={color} />
          {name === 'soundOn' ? (
            <>
              <Path d={arc(56, 50, 14, -50, 50)} fill="none" stroke={INK} strokeWidth={7} strokeLinecap="round" />
              <Path d={arc(56, 50, 28, -50, 50)} fill="none" stroke={INK} strokeWidth={7} strokeLinecap="round" />
            </>
          ) : (
            <>
              <Path d={line([[66, 36], [88, 64]])} stroke={INK} strokeWidth={8} strokeLinecap="round" />
              <Path d={line([[88, 36], [66, 64]])} stroke={INK} strokeWidth={8} strokeLinecap="round" />
            </>
          )}
        </>
      );
    case 'music':
      return (
        <>
          <Shape d={roundPoly([[38, 20], [82, 12], [82, 24], [38, 32]], 0.1)} fill={color} />
          <Path d={line([[40, 26], [40, 72]])} stroke={INK} strokeWidth={8} strokeLinecap="round" />
          <Path d={line([[80, 18], [80, 64]])} stroke={INK} strokeWidth={8} strokeLinecap="round" />
          <Shape d={ellipse(30, 74, 13, 10, -20)} fill={color} />
          <Shape d={ellipse(70, 66, 13, 10, -20)} fill={color} />
        </>
      );
    case 'book':
      return (
        <>
          <Shape d={rect(18, 12, 64, 78, 10)} fill={color} />
          <Shape d={rect(18, 12, 16, 78, 8)} fill={accent} />
          <Shape d={heart(58, 50, 30)} fill="#fff" />
        </>
      );
    case 'palette':
      return (
        <>
          <Shape
            d="M50 12 C76 12 92 30 90 50 C88 66 74 64 66 66 C58 68 62 78 58 84 C54 90 46 90 38 88 C20 84 10 68 10 50 C10 28 28 12 50 12 Z"
            fill="#FFF4E6"
          />
          <Circle cx={32} cy={38} r={8} fill={RAINBOW_STOPS[0]} stroke={INK} strokeWidth={3.5} />
          <Circle cx={52} cy={28} r={8} fill={RAINBOW_STOPS[2]} stroke={INK} strokeWidth={3.5} />
          <Circle cx={72} cy={38} r={8} fill={RAINBOW_STOPS[4]} stroke={INK} strokeWidth={3.5} />
          <Circle cx={30} cy={62} r={8} fill={RAINBOW_STOPS[5]} stroke={INK} strokeWidth={3.5} />
        </>
      );
    case 'zoomOut':
      return (
        <>
          <OutlinedLine d={line([[62, 62], [84, 84]])} w={12} color={accent} />
          <Shape d={circle(42, 42, 28)} fill="#E6F4FF" />
          <Path d={line([[30, 42], [54, 42]])} stroke={INK} strokeWidth={8} strokeLinecap="round" />
        </>
      );
    case 'plus':
      return (
        <>
          <OutlinedLine d={line([[50, 20], [50, 80]])} w={14} color={color} />
          <OutlinedLine d={line([[20, 50], [80, 50]])} w={14} color={color} />
        </>
      );
    case 'star':
      return <Shape d={star(50, 54, 42, 23, 5, -90, 0.28)} fill={color} />;
    case 'heart':
      return <Shape d={heart(50, 52, 78)} fill={color} />;
    case 'bulb':
      return (
        <>
          <Shape d="M50 10 C70 10 82 26 80 42 C78 56 66 60 64 72 L36 72 C34 60 22 56 20 42 C18 26 30 10 50 10 Z" fill={color} />
          <Shape d={rect(36, 72, 28, 16, 6)} fill="#d9d4e4" />
          <Path d={twinkle(38, 34, 8)} fill="#fff" />
        </>
      );
  }
}

export const Icon = memo(function Icon({
  name,
  size = 40,
  color = '#FFB3D1',
  accent = '#CDB8FF',
}: {
  name: IconName;
  size?: number;
  color?: string;
  accent?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="-4 -4 108 108">
      {body(name, color, accent)}
    </Svg>
  );
});
