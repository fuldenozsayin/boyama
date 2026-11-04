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
import { compilePicture, hitTest, visibleSamples } from '../src/engine/compile';
import { partMatrix, matToString } from '../src/engine/anim';

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
    return ` transform="${matToString(partMatrix(parts[part], opts.t))}"`;
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

interface QAResult {
  errors: string[];
  warnings: string[];
  labels: Record<string, [number, number]>;
  stats: string;
}

const MIN_AREA = 1100; // ~33 x 33 canvas units: comfortable for small fingers

export function qa(pic: Picture): QAResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const labels: Record<string, [number, number]> = {};
  const ids = new Set<string>();
  for (const it of pic.items) {
    if (it.kind !== 'region') continue;
    if (ids.has(it.id)) errors.push(`duplicate region id "${it.id}"`);
    ids.add(it.id);
    if (!it.hint) warnings.push(`region "${it.id}" has no hint colour`);
    if (it.part && !pic.parts?.[it.part]) errors.push(`region "${it.id}" uses unknown part "${it.part}"`);
  }
  for (const it of pic.items) {
    if (it.kind === 'decor' && it.part && !pic.parts?.[it.part]) errors.push(`decor uses unknown part "${it.part}"`);
  }
  let cp;
  try {
    cp = compilePicture(pic);
  } catch (e) {
    errors.push(`path error: ${(e as Error).message}`);
    return { errors, warnings, labels, stats: '' };
  }
  const step = 5;
  const samples = visibleSamples(cp, step);
  let tiny = 0;
  for (const r of cp.regions) {
    const pts = samples[r.id];
    const area = pts.length * step * step;
    if (area === 0) {
      errors.push(`region "${r.id}" is completely hidden (cannot be tapped)`);
      continue;
    }
    if (area < MIN_AREA) {
      tiny++;
      warnings.push(`region "${r.id}" visible area ${area}u² is very small (min ~${MIN_AREA}); make it bigger or turn it into decor`);
    }
    // label position: visible sample closest to the centroid of visible samples
    let sx = 0;
    let sy = 0;
    for (const [x, y] of pts) {
      sx += x;
      sy += y;
    }
    sx /= pts.length;
    sy /= pts.length;
    let best = pts[0];
    let bd = Infinity;
    for (const p of pts) {
      const dd = (p[0] - sx) ** 2 + (p[1] - sy) ** 2;
      if (dd < bd) {
        bd = dd;
        best = p;
      }
    }
    labels[r.id] = [best[0], best[1] + 6];
  }
  // uncovered canvas (no region underneath) – taps there would do nothing
  let empty = 0;
  for (let y = 2.5; y < 1000; y += 10) for (let x = 2.5; x < 1000; x += 10) if (!hitTest(cp, x, y)) empty++;
  if (empty > 0) warnings.push(`${empty} sample points hit no region at all (add a full-canvas background region)`);
  const n = cp.regions.length;
  if (n < 12) warnings.push(`only ${n} regions – aim for 15–40 for a fun page`);
  if (n > 50) warnings.push(`${n} regions – that is a lot for 3–7 year olds (aim for 15–40)`);
  const decorCount = pic.items.length - n;
  return { errors, warnings, labels, stats: `${n} regions, ${decorCount} decor, ${tiny} tiny` };
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
