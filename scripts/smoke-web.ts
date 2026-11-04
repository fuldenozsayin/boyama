/**
 * End-to-end smoke test of the web build with real pointer input.
 *
 *   npx expo export --platform web && npx tsx scripts/smoke-web.ts [--out dir] [--landscape]
 *
 * Serves ./dist, walks Home → Categories → Category → Colouring, taps to
 * fill, draws a brush stroke, undoes, places a sticker, and saves
 * screenshots. Exits non-zero on page errors or failed checks.
 */
import { createRequire } from 'module';
import fs from 'fs';
import http from 'http';
import path from 'path';
import { getPicture } from '../src/art';
import { qa } from '../src/art/qa';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const OUT = path.resolve(outIdx >= 0 ? args[outIdx + 1] : 'art-preview/smoke');
const LANDSCAPE = args.includes('--landscape');
fs.mkdirSync(OUT, { recursive: true });
const DIST = path.resolve('dist');

const MIME: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.ttf': 'font/ttf',
  '.wav': 'audio/wav',
  '.css': 'text/css',
};

function serve(): Promise<http.Server> {
  const server = http.createServer((req, res) => {
    const url = decodeURIComponent((req.url ?? '/').split('?')[0]);
    let file = path.join(DIST, url);
    if (!file.startsWith(DIST) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(DIST, 'index.html');
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] ?? 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((r) => server.listen(8765, () => r(server)));
}

const failures: string[] = [];
function check(cond: unknown, msg: string) {
  if (!cond) {
    failures.push(msg);
    console.log(`  ✗ ${msg}`);
  } else console.log(`  ✓ ${msg}`);
}

async function main() {
  const server = await serve();
  const browser = await chromium.launch();
  const viewport = LANDSCAPE ? { width: 1180, height: 820 } : { width: 390, height: 844 };
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1, hasTouch: false });
  const errors: string[] = [];
  page.on('pageerror', (e: Error) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m: { type: () => string; text: () => string }) => {
    if (m.type() === 'error') errors.push(`console: ${m.text()}`);
  });
  const shot = (name: string) => page.screenshot({ path: path.join(OUT, `${LANDSCAPE ? 'L-' : ''}${name}.png`) });
  const tid = (id: string) => {
    const l = page.locator(`[data-testid="${id}"]`).first();
    return { waitFor: (o?: object) => l.waitFor(o), click: () => l.click({ force: true }), boundingBox: () => l.boundingBox(), innerText: () => l.innerText() };
  };

  await page.goto('http://localhost:8765/');
  await tid('home-play').waitFor({ timeout: 20000 });
  await page.waitForTimeout(1200);
  await shot('01-home');

  await tid('home-play').click();
  await tid('category-unicorn').waitFor();
  await page.waitForTimeout(900);
  await shot('02-categories');

  await tid('category-unicorn').click();
  const firstPic = page.locator('[data-testid^="picture-"]').first();
  await firstPic.waitFor();
  await page.waitForTimeout(800);
  await shot('03-category');

  await page.goto('http://localhost:8765/color/unicorn-rainbow-hill');
  const canvas = tid('coloring-canvas');
  await canvas.waitFor({ timeout: 15000 });
  await page.waitForTimeout(700);
  await shot('04-color-empty');

  const box = await canvas.boundingBox();
  check(box && box.width > 200, `canvas visible (${Math.round(box?.width ?? 0)}px)`);
  const k = (box?.width ?? 0) / 1000;
  const at = (x: number, y: number) => ({ x: (box?.x ?? 0) + x * k, y: (box?.y ?? 0) + y * k });
  const pixel = async (x: number, y: number) => {
    const p = at(x, y);
    const buf: Buffer = await page.screenshot({ clip: { x: Math.round(p.x), y: Math.round(p.y), width: 1, height: 1 } });
    // decode a 1x1 PNG cheaply via the browser
    return page.evaluate(async (b64: string) => {
      const img = new Image();
      img.src = `data:image/png;base64,${b64}`;
      await img.decode();
      const c = document.createElement('canvas');
      c.width = c.height = 1;
      const ctx = c.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      return Array.from(ctx.getImageData(0, 0, 1, 1).data).slice(0, 3);
    }, buf.toString('base64'));
  };

  // tap-to-fill the sky and the unicorn body with the default pink
  const sky = [60, 60];
  const before = await pixel(sky[0], sky[1]);
  let p = at(sky[0], sky[1]);
  await page.mouse.click(p.x, p.y);
  await page.waitForTimeout(300);
  const after = await pixel(sky[0], sky[1]);
  check(before.join() !== after.join(), `tap fills the sky (${before} → ${after})`);

  // choose a blue swatch and fill another region
  await tid('swatch-#7CC8FF').click();
  p = at(452, 700);
  await page.mouse.click(p.x, p.y);
  await page.waitForTimeout(300);
  const body = await pixel(452, 700);
  check(body[2] > body[0], `body filled blue (${body})`);
  // a neighbouring region must stay white: lines keep colour inside
  const hoof = await pixel(332, 846);
  check(hoof.every((v: number) => v > 240), `neighbour region untouched (${hoof})`);

  // glitter effect + fill
  await tid('effect-glitter').click();
  p = at(845, 150);
  await page.mouse.click(p.x, p.y);
  await page.waitForTimeout(300);
  await shot('05-color-filled');

  // brush stroke across the body: must stay clipped to the body region
  await tid('effect-rainbow').click();
  await tid('tool-brush').click();
  const s0 = at(330, 700);
  await page.mouse.move(s0.x, s0.y);
  await page.mouse.down();
  for (let i = 1; i <= 25; i++) {
    const q = at(330 + i * 18, 690 + Math.sin(i / 3) * 40);
    await page.mouse.move(q.x, q.y);
  }
  await page.mouse.up();
  await page.waitForTimeout(300);
  await shot('06-brush');
  const outside = await pixel(300, 560); // sky above the body – stroke must not leak there
  check(outside.join() === after.join(), `brush stroke stays inside the region (${outside})`);

  // undo the stroke, redo it
  await tid('undo').click();
  await page.waitForTimeout(200);
  await tid('redo').click();
  await page.waitForTimeout(200);

  // sticker
  await tid('tool-sticker').click();
  await page.waitForTimeout(200);
  p = at(160, 520);
  await page.mouse.click(p.x, p.y);
  await page.waitForTimeout(400);
  await shot('07-sticker');

  // eraser tap clears the sky
  await tid('tool-eraser').click();
  p = at(60, 60);
  await page.mouse.click(p.x, p.y);
  await page.waitForTimeout(300);
  const erased = await pixel(60, 60);
  check(erased.every((v: number) => v > 240), `eraser tap clears a region (${erased})`);
  await tid('undo').click();
  await page.waitForTimeout(300);
  const restored = await pixel(60, 60);
  check(restored.join() === after.join(), `undo restores the fill (${restored})`);

  // autosave: reload and verify the sky is still coloured
  await page.waitForTimeout(800);
  await page.reload();
  await tid('coloring-canvas').waitFor();
  await page.waitForTimeout(900);
  const reloaded = await pixel(60, 60);
  check(reloaded.join() === after.join(), `progress restored after reload (${reloaded})`);
  await shot('08-reloaded');

  // done button → celebration
  await tid('done').click();
  await page.waitForTimeout(400);
  const cel = await page.locator('[data-testid="celebration"]').count();
  check(cel === 0, 'done is gated until enough is coloured');

  // colour every region of a real page → automatic celebration + reward
  const pageId = 'princess-smiling-portrait';
  const pic = getPicture(pageId)!;
  const labels = qa(pic).labels;
  await page.goto(`http://localhost:8765/color/${pageId}`);
  await tid('coloring-canvas').waitFor();
  await page.waitForTimeout(600);
  const cb = await tid('coloring-canvas').boundingBox();
  const kk = (cb?.width ?? 0) / 1000;
  const colors = ['#FFC8E0', '#FFE14D', '#C7B3FF', '#A8EBCB', '#BFE3FF', '#FFC9A3'];
  let n = 0;
  for (const [, [x, y]] of Object.entries(labels)) {
    if (n % 4 === 0) await tid(`swatch-${colors[(n / 4) % colors.length]}`).click();
    await page.mouse.click((cb?.x ?? 0) + x * kk, (cb?.y ?? 0) + (y - 6) * kk);
    n++;
  }
  await page.locator('[data-testid="celebration"]').waitFor({ timeout: 5000 });
  check(true, `colouring all ${n} regions triggers the celebration`);
  await page.waitForTimeout(700);
  await shot('08b-celebration-a');
  await page.waitForTimeout(2400);
  await shot('08c-celebration-b');
  await tid('cel-continue').click();
  await page.waitForTimeout(500);

  // free drawing
  await page.goto('http://localhost:8765/color/free');
  await tid('coloring-canvas').waitFor();
  await tid('tool-brush').click();
  const fb = await tid('coloring-canvas').boundingBox();
  if (fb) {
    await page.mouse.move(fb.x + 60, fb.y + 60);
    await page.mouse.down();
    for (let i = 0; i < 30; i++) await page.mouse.move(fb.x + 60 + i * 9, fb.y + 60 + Math.sin(i / 4) * 60 + i * 5);
    await page.mouse.up();
  }
  await page.waitForTimeout(300);
  await tid('done').click();
  await page.locator('[data-testid="celebration"]').waitFor({ timeout: 5000 });
  await page.waitForTimeout(2600);
  await shot('09-celebration');
  await tid('cel-gallery').click();
  await page.waitForTimeout(1200);
  await shot('10-gallery');
  check((await page.locator('[data-testid^="art-free-"]').count()) > 0, 'free drawing saved to gallery');

  await page.goto('http://localhost:8765/stickers');
  await page.waitForTimeout(1200);
  await shot('11-stickers');

  await page.goto('http://localhost:8765/');
  await tid('home-parents').click();
  await tid('parent-gate').waitFor();
  const q = await tid('gate-question').innerText();
  await shot('12-gate');
  const words = ['sıfır', 'bir', 'iki', 'üç', 'dört', 'beş', 'altı', 'yedi', 'sekiz', 'dokuz'];
  const m = q.match(/^(\S+) çarpı (\S+)/);
  if (m) {
    const ans = String(words.indexOf(m[1]) * words.indexOf(m[2]));
    for (const ch of ans) await tid(`gate-key-${ch}`).click();
    await tid('gate-key-OK').click();
  }
  await page.waitForTimeout(800);
  check(page.url().endsWith('/parents'), 'parent gate opens parents area');
  await shot('13-parents');

  const relevant = errors.filter((e) => !/favicon|DevTools|Download the React/.test(e));
  for (const e of relevant) console.log(`  ! ${e}`);
  check(relevant.length === 0, 'no page errors');

  await browser.close();
  server.close();
  console.log(failures.length ? `\n${failures.length} check(s) failed` : '\nall checks passed');
  process.exit(failures.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
