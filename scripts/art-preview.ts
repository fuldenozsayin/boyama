/**
 * Art preview + QA tool.
 *
 *   npx tsx scripts/art-preview.ts <category> [pictureId] [--anim] [--out dir]
 *   npx tsx scripts/art-preview.ts stickers
 *
 * For every picture it prints a QA report (untappable / tiny regions, missing
 * hints, unknown parts...) and writes a PNG with three panels:
 *   1. line art (what the child sees first)
 *   2. hint colours (the "intended" colouring)
 *   3. region map (each tappable region in a random colour + its id)
 * With --anim a second row shows celebration animation frames.
 */
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import type { Picture, CategoryCover } from '../src/art/types';
import { INK, LINE } from '../src/art/dsl';
import { qa } from '../src/art/qa';
import { resolvePart, matToString } from '../src/engine/anim';

const require = createRequire(import.meta.url);

type Mode = 'line' | 'hint' | 'map';

function hueColor(i: number): string {
  const h = (i * 137.508) % 360;
  return `hsl(${h.toFixed(0)} 70% 72%)`;
}

export function renderSvg(
  pic: Picture,
  mode: Mode,
  opts: { t?: number; viewBox?: [number, number, number, number]; hide?: string[]; size?: number; labels?: Record<string, [number, number]> } = {},
): string {
  const vb = opts.viewBox ?? [0, 0, 1000, 1000];
  const size = opts.size ?? 520;
  const hide = new Set(opts.hide ?? []);
  let regionIndex = 0;
  const parts = pic.parts ?? {};
  const tf = (part?: string) => {
    if (opts.t === undefined || !part || !parts[part]) return '';
    return ` transform="${matToString(resolvePart(parts, part, opts.t))}"`;
  };
  let body = '';
  for (const item of pic.items) {
    if (item.kind === 'region') {
      const idx = regionIndex++;
      if (hide.has(item.id)) continue;
      const fill = mode === 'line' ? '#ffffff' : mode === 'hint' ? item.hint ?? '#ffffff' : hueColor(idx);
      const rule = item.evenOdd ? ' fill-rule="evenodd"' : '';
      const stroke =
        item.outline === false
          ? ''
          : `<path d="${item.d}" fill="none" stroke="${INK}" stroke-width="${item.line ?? LINE.outer}" stroke-linejoin="round" stroke-linecap="round"/>`;
      body += `<g${tf(item.part)}><path d="${item.d}" fill="${fill}"${rule}/>${stroke}</g>`;
    } else {
      const fill = item.fill ?? 'none';
      const stroke = item.stroke ?? (item.fill ? 'none' : INK);
      const width = item.width ?? LINE.inner;
      const op = item.opacity !== undefined ? ` opacity="${item.opacity}"` : '';
      body += `<g${tf(item.part)}><path d="${item.d}" fill="${fill}" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"${op}/></g>`;
    }
  }
  if (mode === 'map' && opts.labels) {
    for (const [id, [x, y]] of Object.entries(opts.labels)) {
      body += `<text x="${x}" y="${y}" font-size="17" font-family="sans-serif" font-weight="700" text-anchor="middle" fill="#222" stroke="#fff" stroke-width="4" paint-order="stroke">${id}</text>`;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${vb.join(' ')}">${body}</svg>`;
}

async function screenshot(html: string, file: string, width: number, height: number) {
  const { chromium } = require('playwright');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  await page.setContent(html);
  await page.screenshot({ path: file });
  await browser.close();
}

async function main() {
  const args = process.argv.slice(2);
  const anim = args.includes('--anim');
  const outIdx = args.indexOf('--out');
  const outDir = path.resolve(outIdx >= 0 ? args[outIdx + 1] : 'art-preview');
  const positional = args.filter((a, i) => !a.startsWith('--') && (outIdx < 0 || i !== outIdx + 1));
  const [category, only] = positional;
  if (!category) {
    console.log('usage: npx tsx scripts/art-preview.ts <category> [pictureId] [--anim] [--out dir]');
    process.exit(1);
  }
  fs.mkdirSync(outDir, { recursive: true });

  if (category === 'stickers') {
    const mod = await import('../src/art/stickers');
    const stickers = mod.STICKERS as { id: string; title: string; items: Picture['items'] }[];
    let cells = '';
    for (const s of stickers) {
      const pic: Picture = { id: s.id, category: 'unicorn', title: s.title, items: s.items };
      cells += `<div style="display:inline-block;margin:6px;text-align:center;font:12px sans-serif">${renderSvg(pic, 'hint', { size: 150, viewBox: [0, 0, 200, 200] })}<br>${s.id}</div>`;
    }
    const file = path.join(outDir, 'stickers.png');
    await screenshot(`<body style="margin:0;background:#f4eefe;width:1000px">${cells}</body>`, file, 1000, Math.ceil(stickers.length / 6) * 190 + 20);
    console.log(`${stickers.length} stickers → ${file}`);
    return;
  }

  const mod = await import(`../src/art/pictures/${category}/index.ts`);
  const pictures: Picture[] = mod.pictures;
  const cover: CategoryCover | undefined = mod.cover;
  let hadError = false;
  for (const pic of pictures) {
    if (only && pic.id !== only) continue;
    const r = qa(pic);
    console.log(`\n=== ${pic.id} (${pic.title}) — ${r.stats}`);
    for (const e of r.errors) console.log(`  ERROR  ${e}`);
    for (const w of r.warnings) console.log(`  warn   ${w}`);
    if (r.errors.length) hadError = true;
    if (r.errors.some((e) => e.startsWith('path error'))) continue;
    const panels = [
      renderSvg(pic, 'line'),
      renderSvg(pic, 'hint'),
      renderSvg(pic, 'map', { labels: r.labels }),
    ];
    let html = `<body style="margin:0;background:#ddd;font:14px sans-serif"><div style="display:flex;gap:8px;padding:8px">${panels
      .map((p) => `<div style="background:#fff">${p}</div>`)
      .join('')}</div>`;
    let height = 520 + 16;
    if (anim) {
      const blinkPart = Object.values(pic.parts ?? {}).find((pp) => pp.anim === 'blink');
      let blinkT = 2.39;
      if (blinkPart) {
        const period = 1 / (blinkPart.speed ?? 0.4);
        blinkT = ((((0.955 - (blinkPart.phase ?? 0)) % 1) + 1) % 1) * period;
      }
      const times = [0.15, 0.4, 0.65, 0.9, Math.round(blinkT * 1000) / 1000];
      html += `<div style="display:flex;gap:8px;padding:0 8px 8px">${times
        .map((t) => `<div style="background:#fff">${renderSvg(pic, 'hint', { t, size: 310 })}<div>t=${t}s</div></div>`)
        .join('')}</div>`;
      height += 340;
    }
    html += '</body>';
    const file = path.join(outDir, `${pic.id}.png`);
    await screenshot(html, file, 1600, height);
    console.log(`  → ${file}`);
  }
  if (cover && !only) {
    const pic = pictures.find((p) => p.id === cover.pictureId);
    if (pic) {
      const file = path.join(outDir, `${category}-cover.png`);
      const svg = renderSvg(pic, 'hint', { viewBox: cover.viewBox, hide: cover.hide, size: 300 });
      await screenshot(`<body style="margin:0;padding:20px;background:${mod.color ?? '#ffe3f1'}">${svg}</body>`, file, 340, 340);
      console.log(`\ncover → ${file}`);
    } else {
      console.log(`\nERROR cover.pictureId "${cover.pictureId}" not found`);
      hadError = true;
    }
  }
  if (hadError) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
