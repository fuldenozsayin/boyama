import { Platform } from 'react-native';

/** Pastel UI palette (pink, lilac, mint, light yellow, baby blue + peach). */
export const C = {
  pink: '#FFD3E6',
  pinkMid: '#FFB3D1',
  pinkDeep: '#FF7EB0',
  lilac: '#E7DCFF',
  lilacMid: '#CDB8FF',
  lilacDeep: '#9C7BEA',
  mint: '#CDF5E3',
  mintMid: '#A3EACB',
  mintDeep: '#47C691',
  yellow: '#FFF3BF',
  yellowMid: '#FFE68A',
  yellowDeep: '#F7C531',
  blue: '#D3EAFF',
  blueMid: '#A9D4FF',
  blueDeep: '#5DA8F0',
  peach: '#FFE2D1',
  peachMid: '#FFC4A6',
  peachDeep: '#FF9468',
  ink: '#4E3D63',
  inkSoft: '#8C7AA6',
  paper: '#FFFFFF',
  cream: '#FFFBF5',
  bgTop: '#FFE9F4',
  bgBottom: '#E8F1FF',
  shadow: 'rgba(78, 61, 99, 0.18)',
} as const;

/** Colouring palette: bright + soft colours kids love, ordered as a rainbow. */
export const PALETTE: string[] = [
  '#FF5C7A',
  '#FF8FC7',
  '#FFC8E0',
  '#FF9F5A',
  '#FFC9A3',
  '#FFE14D',
  '#FFF3A6',
  '#B6E35B',
  '#5CCB85',
  '#A8EBCB',
  '#4CC9C0',
  '#7CC8FF',
  '#BFE3FF',
  '#5A8DEE',
  '#C7B3FF',
  '#9B6BDF',
  '#E4D7FF',
  '#B07A5A',
  '#E8C4A0',
  '#FFE0CC',
  '#D9A27E',
  '#B8B3C4',
  '#4E3D63',
  '#FFFFFF',
];

export const FONT = {
  regular: 'Baloo2_500Medium',
  bold: 'Baloo2_600SemiBold',
  black: 'Baloo2_800ExtraBold',
};

export const RADIUS = { s: 14, m: 22, l: 32, xl: 44 };

/** soft drop shadow that works on iOS, Android and web */
export function softShadow(elevation = 6, color: string = C.shadow) {
  return Platform.select({
    web: { boxShadow: `0px ${elevation * 0.6}px ${elevation * 1.6}px ${color}` } as object,
    android: { elevation },
    default: {
      shadowColor: '#4E3D63',
      shadowOpacity: 0.18,
      shadowRadius: elevation * 0.9,
      shadowOffset: { width: 0, height: elevation * 0.55 },
    },
  }) as object;
}

// ---------------------------------------------------------------------------
// colour maths
// ---------------------------------------------------------------------------

function parseHex(hex: string): [number, number, number] {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function toHex([r, g, b]: [number, number, number]): string {
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

/** linear mix of two hex colours, t = 0 → a, 1 → b */
export function mix(a: string, b: string, t: number): string {
  const A = parseHex(a);
  const B = parseHex(b);
  return toHex([A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t]);
}

export const lighten = (c: string, t: number) => mix(c, '#ffffff', t);
export const darken = (c: string, t: number) => mix(c, '#2a1f3d', t);

/** perceived brightness 0..1 */
export function luminance(hex: string): number {
  const [r, g, b] = parseHex(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}
