/**
 * Renders the app icon, Android adaptive icon layers, splash image and
 * favicon from the vector mascot (so all branding stays original & crisp).
 *
 *   npx tsx scripts/generate-icons.ts
 */
import { createRequire } from 'module';
import path from 'path';
import { cloud, INK, ringSegment, star, twinkle } from '../src/art/dsl';
import { mascotMarkup } from '../src/art/mascot';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const BANDS = ['#FFADB9', '#FFD3A5', '#FFF0A0', '#BDEBC8', '#B9D8FF', '#D7C2FF'];

function rainbow(cx: number, cy: number, rOut: number, band: number) {
  return BANDS.map(
    (c, i) =>
      `<path d="${ringSegment(cx, cy, rOut - band * (i + 1), rOut - band * i, 180, 360)}" fill="${c}" stroke="${INK}" stroke-width="5"/>`,
  ).join('');
}

const bgGradient = `
  <defs>
    <radialGradient id="g" cx="50%" cy="38%" r="75%">
      <stop offset="0" stop-color="#FFF4FA"/>
      <stop offset="0.55" stop-color="#FFD3E6"/>
      <stop offset="1" stop-color="#D9C8FF"/>
    </radialGradient>
  </defs>
  <rect width="1024" height="1024" fill="url(#g)"/>`;

const decor = `
  <path d="${star(150, 190, 46)}" fill="#FFE27A" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>
  <path d="${star(880, 260, 36)}" fill="#FFC6E0" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>
  <path d="${twinkle(840, 120, 26)}" fill="#fff" stroke="${INK}" stroke-width="5"/>
  <path d="${twinkle(120, 420, 20)}" fill="#fff" stroke="${INK}" stroke-width="5"/>`;

function mascotAt(x: number, y: number, size: number, extra = {}) {
  const s = size / 210;
  return `<g transform="matrix(${s} 0 0 ${s} ${x} ${y})">${mascotMarkup(extra)}</g>`;
}

const icon = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  ${bgGradient}
  ${rainbow(512, 700, 430, 34)}
  <path d="${cloud(150, 700, 300, 150)}" fill="#fff" stroke="${INK}" stroke-width="7"/>
  <path d="${cloud(874, 700, 300, 150)}" fill="#fff" stroke="${INK}" stroke-width="7"/>
  ${decor}
  ${mascotAt(212, 250, 640, { sparkles: false })}
</svg>`;

const androidBg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  ${bgGradient}
  ${rainbow(512, 760, 420, 32)}
</svg>`;

// adaptive icon foreground: keep the mascot inside the central safe zone
const androidFg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  ${mascotAt(272, 262, 480, { sparkles: false })}
</svg>`;

const androidMono = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  ${mascotAt(272, 262, 480, { mono: '#FFFFFF' })}
</svg>`;

const splash = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  ${rainbow(512, 640, 470, 38)}
  ${mascotAt(232, 180, 560)}
</svg>`;

const favicon = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 1024 1024">
  <circle cx="512" cy="512" r="500" fill="#FFD3E6"/>
  ${mascotAt(130, 110, 780, { sparkles: false })}
</svg>`;

async function render(svg: string, file: string, size: number, transparent: boolean) {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
  await page.setContent(
    `<html><body style="margin:0;background:${transparent ? 'transparent' : '#fff'}">${svg.replace(
      /width="\d+" height="\d+"/,
      `width="${size}" height="${size}"`,
    )}</body></html>`,
  );
  await page.screenshot({ path: file, omitBackground: transparent, clip: { x: 0, y: 0, width: size, height: size } });
  await browser.close();
  console.log(`→ ${file}`);
}

(async () => {
  const A = (f: string) => path.resolve('assets', f);
  await render(icon, A('icon.png'), 1024, false);
  await render(androidBg, A('android-icon-background.png'), 1024, false);
  await render(androidFg, A('android-icon-foreground.png'), 1024, true);
  await render(androidMono, A('android-icon-monochrome.png'), 1024, true);
  await render(splash, A('splash-icon.png'), 1024, true);
  await render(favicon, A('favicon.png'), 64, true);
})();
