/**
 * Procedurally synthesises every sound effect + the music-box loop used by
 * the game, so all audio is 100% original and reproducible.
 *
 *   npx tsx scripts/generate-sounds.ts
 *
 * Output: assets/sounds/*.wav (22.05 kHz, mono, 16-bit)
 */
import fs from 'fs';
import path from 'path';

const SR = 22050;
const OUT = path.resolve('assets/sounds');
fs.mkdirSync(OUT, { recursive: true });

// deterministic random
let seed = 1234567;
function rand() {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
}
const noise = () => rand() * 2 - 1;

function buf(seconds: number) {
  return new Float32Array(Math.round(seconds * SR));
}

function writeWav(name: string, data: Float32Array, peak = 0.8) {
  let max = 0;
  for (const v of data) max = Math.max(max, Math.abs(v));
  const g = max > 0 ? peak / max : 1;
  const bytes = Buffer.alloc(44 + data.length * 2);
  bytes.write('RIFF', 0);
  bytes.writeUInt32LE(36 + data.length * 2, 4);
  bytes.write('WAVE', 8);
  bytes.write('fmt ', 12);
  bytes.writeUInt32LE(16, 16);
  bytes.writeUInt16LE(1, 20);
  bytes.writeUInt16LE(1, 22);
  bytes.writeUInt32LE(SR, 24);
  bytes.writeUInt32LE(SR * 2, 28);
  bytes.writeUInt16LE(2, 32);
  bytes.writeUInt16LE(16, 34);
  bytes.write('data', 36);
  bytes.writeUInt32LE(data.length * 2, 40);
  for (let i = 0; i < data.length; i++) {
    const v = Math.max(-1, Math.min(1, data[i] * g));
    bytes.writeInt16LE(Math.round(v * 32767), 44 + i * 2);
  }
  fs.writeFileSync(path.join(OUT, `${name}.wav`), bytes);
  console.log(`${name}.wav  ${(data.length / SR).toFixed(2)}s  ${(bytes.length / 1024).toFixed(0)}KB`);
}

/** fade the first / last ms to avoid clicks */
function declick(d: Float32Array, ms = 4) {
  const n = Math.round((ms / 1000) * SR);
  for (let i = 0; i < n && i < d.length; i++) {
    d[i] *= i / n;
    d[d.length - 1 - i] *= i / n;
  }
  return d;
}

const TAU = Math.PI * 2;
const note = (semisFromA4: number) => 440 * Math.pow(2, semisFromA4 / 12);
// C5 = +3, D5 = +5, E5 = +7, G5 = +10, A5 = +12, C6 = +15, D6 = +17, E6 = +19
const PENTA = [3, 5, 7, 10, 12, 15, 17, 19].map(note);

/** one-pole low pass */
function lowpass(d: Float32Array, cutoff: number) {
  const a = Math.exp((-TAU * cutoff) / SR);
  let y = 0;
  for (let i = 0; i < d.length; i++) {
    y = (1 - a) * d[i] + a * y;
    d[i] = y;
  }
  return d;
}

/** RBJ band-pass biquad with time-varying centre frequency */
function bandpass(input: Float32Array, freq: (t: number) => number, q: number) {
  const out = new Float32Array(input.length);
  let x1 = 0;
  let x2 = 0;
  let y1 = 0;
  let y2 = 0;
  let b0 = 0;
  let b2 = 0;
  let a1 = 0;
  let a2 = 0;
  let a0 = 1;
  for (let i = 0; i < input.length; i++) {
    if (i % 32 === 0) {
      const w = (TAU * freq(i / SR)) / SR;
      const alpha = Math.sin(w) / (2 * q);
      b0 = alpha;
      b2 = -alpha;
      a0 = 1 + alpha;
      a1 = -2 * Math.cos(w);
      a2 = 1 - alpha;
    }
    const x = input[i];
    const y = (b0 * x + b2 * x2 - a1 * y1 - a2 * y2) / a0;
    x2 = x1;
    x1 = x;
    y2 = y1;
    y1 = y;
    out[i] = y;
  }
  return out;
}

/** bell / music-box partials */
function bell(d: Float32Array, start: number, f: number, amp: number, decay = 3) {
  const s0 = Math.round(start * SR);
  const partials = [
    [1, 1, 1],
    [2.0, 0.35, 1.6],
    [3.01, 0.18, 2.4],
    [4.2, 0.1, 3.5],
  ];
  for (let i = s0; i < d.length; i++) {
    const t = (i - s0) / SR;
    const att = Math.min(1, t / 0.004);
    let v = 0;
    for (const [m, a, dk] of partials) v += a * Math.sin(TAU * f * m * t) * Math.exp(-t * decay * dk);
    d[i] += amp * att * v;
    if (t > 4) break;
  }
}

// ---------------------------------------------------------------------------
// one-shots
// ---------------------------------------------------------------------------

function pop(f: number) {
  const d = buf(0.32);
  let ph = 0;
  for (let i = 0; i < d.length; i++) {
    const t = i / SR;
    const freq = f * (1 + 0.55 * Math.exp(-t * 45));
    ph += (TAU * freq) / SR;
    const env = Math.min(1, t / 0.003) * Math.exp(-t * 13);
    d[i] = env * (Math.sin(ph) + 0.18 * Math.sin(2 * ph) + 0.06 * Math.sin(3 * ph));
  }
  return declick(d);
}

function tap() {
  const d = buf(0.12);
  let ph = 0;
  for (let i = 0; i < d.length; i++) {
    const t = i / SR;
    ph += (TAU * (760 - 260 * Math.min(1, t * 20))) / SR;
    d[i] = Math.exp(-t * 45) * (Math.sin(ph) * 0.9 + noise() * 0.08 * Math.exp(-t * 200));
  }
  return declick(lowpass(d, 3500));
}

function sticker() {
  const d = buf(0.42);
  let ph = 0;
  for (let i = 0; i < d.length; i++) {
    const t = i / SR;
    const f = 320 + 700 * (1 - Math.exp(-t * 14)) + 30 * Math.sin(TAU * 18 * t) * Math.exp(-t * 6);
    ph += (TAU * f) / SR;
    d[i] = Math.min(1, t / 0.005) * Math.exp(-t * 7) * (Math.sin(ph) + 0.25 * Math.sin(2 * ph));
  }
  bell(d, 0.06, note(22), 0.25, 5);
  return declick(d);
}

function whoosh(up: boolean, len = 0.38, gain = 1) {
  const n = buf(len);
  for (let i = 0; i < n.length; i++) n[i] = noise();
  const d = bandpass(
    n,
    (t) => {
      const u = t / len;
      return up ? 400 + 2600 * u * u : 2600 - 2200 * u;
    },
    1.4,
  );
  for (let i = 0; i < d.length; i++) {
    const u = i / d.length;
    d[i] *= Math.sin(Math.PI * u) ** 1.5 * gain;
  }
  return declick(d);
}

function celebrate() {
  const d = buf(2.0);
  const seq = [3, 7, 10, 15, 19].map(note); // C5 E5 G5 C6 E6
  seq.forEach((f, i) => bell(d, i * 0.11, f, 0.7 - i * 0.05, 2.4));
  bell(d, 0.62, note(15), 0.45, 1.6);
  bell(d, 0.62, note(19), 0.4, 1.6);
  bell(d, 0.62, note(22), 0.35, 1.6);
  for (let k = 0; k < 14; k++) bell(d, 0.7 + rand() * 1.0, note(24 + Math.floor(rand() * 10)), 0.08, 6);
  return declick(d);
}

function chime() {
  const d = buf(1.3);
  bell(d, 0, note(15), 0.6, 2);
  bell(d, 0.09, note(19), 0.5, 2);
  bell(d, 0.18, note(22), 0.45, 2);
  return declick(d);
}

function twinkleSfx() {
  const d = buf(0.9);
  bell(d, 0, note(19), 0.6, 3);
  bell(d, 0.08, note(22), 0.5, 3);
  bell(d, 0.16, note(27), 0.35, 4);
  return declick(d);
}

function magic() {
  const d = buf(1.4);
  const run = [3, 5, 7, 10, 12, 15, 17, 19, 22, 24, 27, 29].map(note);
  run.forEach((f, i) => bell(d, i * 0.055, f, 0.35 + i * 0.02, 3.2));
  for (let k = 0; k < 10; k++) bell(d, 0.4 + rand() * 0.8, note(26 + Math.floor(rand() * 8)), 0.07, 6);
  return declick(d);
}

/** cartoon meow: buzzy source through moving formants */
function meow() {
  const len = 0.78;
  const src = buf(len);
  let ph = 0;
  for (let i = 0; i < src.length; i++) {
    const t = i / SR;
    const u = t / len;
    const f0 = u < 0.35 ? 520 + 300 * (u / 0.35) : 820 - 420 * ((u - 0.35) / 0.65);
    ph += (TAU * f0 * (1 + 0.012 * Math.sin(TAU * 6 * t))) / SR;
    // band-limited "glottal" pulse train
    let v = 0;
    for (let h = 1; h <= 10; h++) v += Math.sin(h * ph) / h;
    src[i] = v;
  }
  const f1 = (t: number) => {
    const u = t / len;
    return u < 0.2 ? 350 + 1400 * u : u < 0.6 ? 630 + 300 * Math.sin(Math.PI * (u - 0.2) * 1.25) : 900 - 500 * ((u - 0.6) / 0.4);
  };
  const f2 = (t: number) => {
    const u = t / len;
    return u < 0.25 ? 2100 - 1200 * u : 1800 - 900 * u;
  };
  const a = bandpass(src, f1, 4);
  const b = bandpass(src, f2, 6);
  const d = buf(len);
  for (let i = 0; i < d.length; i++) {
    const t = i / SR;
    const u = t / len;
    const env = Math.min(1, t / 0.06) * (u > 0.7 ? Math.max(0, 1 - (u - 0.7) / 0.3) : 1);
    d[i] = env * (a[i] + 0.6 * b[i]);
  }
  return declick(lowpass(d, 5000));
}

/** soft puppy "arf arf" */
function woof() {
  const total = buf(0.62);
  const bark = (start: number, f0: number) => {
    const len = 0.2;
    const src = buf(len);
    let ph = 0;
    for (let i = 0; i < src.length; i++) {
      const t = i / SR;
      ph += (TAU * f0 * (1 - 0.35 * (t / len))) / SR;
      let v = 0;
      for (let h = 1; h <= 12; h++) v += Math.sin(h * ph) / h;
      src[i] = v + noise() * 0.35;
    }
    const a = bandpass(src, (t) => 700 - 200 * (t / len), 3);
    const b = bandpass(src, () => 1500, 5);
    const s0 = Math.round(start * SR);
    for (let i = 0; i < src.length && s0 + i < total.length; i++) {
      const t = i / SR;
      const env = Math.min(1, t / 0.012) * Math.exp(-t * 14);
      total[s0 + i] += env * (a[i] + 0.5 * b[i]);
    }
  };
  bark(0, 380);
  bark(0.3, 420);
  return declick(lowpass(total, 4200));
}

function boing() {
  const d = buf(0.7);
  let ph = 0;
  for (let i = 0; i < d.length; i++) {
    const t = i / SR;
    const f = 180 + 260 * (1 - Math.exp(-t * 9)) + 70 * Math.sin(TAU * 11 * t) * Math.exp(-t * 4);
    ph += (TAU * f) / SR;
    d[i] = Math.min(1, t / 0.004) * Math.exp(-t * 4.5) * (Math.sin(ph) + 0.3 * Math.sin(2 * ph));
  }
  return declick(d);
}

function bubbles() {
  const d = buf(1.1);
  for (let k = 0; k < 9; k++) {
    const s0 = Math.round((k * 0.1 + rand() * 0.05) * SR);
    const f0 = 380 + rand() * 500;
    const len = 0.09 + rand() * 0.05;
    let ph = 0;
    for (let i = 0; i < len * SR && s0 + i < d.length; i++) {
      const t = i / SR;
      ph += (TAU * f0 * (1 + 2.2 * (t / len))) / SR;
      d[s0 + i] += Math.sin(Math.PI * (t / len)) * Math.sin(ph) * (0.5 + rand() * 0.02);
    }
  }
  return declick(d);
}

function flutter() {
  const len = 0.8;
  const n = buf(len);
  for (let i = 0; i < n.length; i++) n[i] = noise();
  const d = bandpass(n, () => 900, 0.9);
  for (let i = 0; i < d.length; i++) {
    const t = i / SR;
    const flap = Math.max(0, Math.sin(TAU * 13 * t)) ** 3;
    d[i] *= flap * Math.sin(Math.PI * (t / len));
  }
  return declick(d);
}

// ---------------------------------------------------------------------------
// seamless loops (brush sounds)
// ---------------------------------------------------------------------------

function loopNoise(len: number, center: number, q: number, wobbleHz: number, depth: number, gain = 1) {
  const n = buf(len + 0.3);
  for (let i = 0; i < n.length; i++) n[i] = noise();
  const filtered = bandpass(n, (t) => center * (1 + 0.25 * Math.sin(TAU * wobbleHz * t)), q);
  const out = buf(len);
  const fade = Math.round(0.15 * SR);
  for (let i = 0; i < out.length; i++) out[i] = filtered[i];
  // cross-fade the extra tail into the head so the loop has no seam
  for (let i = 0; i < fade; i++) {
    const a = i / fade;
    out[i] = filtered[i] * a + filtered[out.length + i] * (1 - a);
  }
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    out[i] *= gain * (1 - depth + depth * (0.5 + 0.5 * Math.sin((TAU * t) / len * 2)));
  }
  return out;
}

function sparkleLoop() {
  const len = 1.2;
  const d = loopNoise(len, 2600, 2.5, 1 / len, 0.3, 0.25);
  const bells = buf(len * 2);
  for (let k = 0; k < 9; k++) bell(bells, rand() * len, note(26 + Math.floor(rand() * 9)), 0.18, 7);
  for (let i = 0; i < d.length; i++) d[i] += bells[i] + bells[i + d.length];
  return d;
}

// ---------------------------------------------------------------------------
// music box loop (original melody)
// ---------------------------------------------------------------------------

function musicBox() {
  const bpm = 92;
  const beat = 60 / bpm;
  const bars = 8;
  const len = bars * 4 * beat;
  const d = buf(len + 3);
  // melody: [beat, semitone from A4]
  const C = 3;
  const D = 5;
  const E = 7;
  const G = 10;
  const A = 12;
  const C2 = 15;
  const D2 = 17;
  const E2 = 19;
  const melody: [number, number][] = [
    [0, E], [1, G], [2, A], [3, G],
    [4, E], [5, D], [6, C], [7.5, D],
    [8, E], [9, G], [10, C2], [11, A],
    [12, G], [14, E],
    [16, A], [17, C2], [18, D2], [19, C2],
    [20, A], [21, G], [22, E], [23.5, G],
    [24, A], [25, G], [26, E], [27, D],
    [28, C], [30, G - 12 + 12],
  ];
  for (const [b, s] of melody) bell(d, b * beat, note(s), 0.5, 1.6);
  // soft harmony: root notes each bar
  const roots = [C - 12, A - 24, D - 12, G - 24, C - 12, A - 24, D - 12, G - 24];
  roots.forEach((s, bar) => {
    bell(d, bar * 4 * beat, note(s), 0.32, 1.1);
    bell(d, (bar * 4 + 2) * beat, note(s + 7), 0.18, 1.3);
  });
  // wrap the ringing tail back onto the start for a seamless loop
  const n = Math.round(len * SR);
  const out = new Float32Array(n);
  for (let i = 0; i < d.length; i++) out[i % n] += d[i];
  return lowpass(out, 6000);
}

// ---------------------------------------------------------------------------

PENTA.forEach((f, i) => writeWav(`pop${i}`, pop(f), 0.7));
writeWav('tap', tap(), 0.55);
writeWav('sticker', sticker(), 0.7);
writeWav('whoosh', whoosh(true), 0.45);
writeWav('undo', whoosh(false, 0.24), 0.4);
writeWav('celebrate', celebrate(), 0.8);
writeWav('chime', chime(), 0.7);
writeWav('twinkle', twinkleSfx(), 0.65);
writeWav('magic', magic(), 0.7);
writeWav('meow', meow(), 0.75);
writeWav('woof', woof(), 0.7);
writeWav('boing', boing(), 0.7);
writeWav('bubbles', bubbles(), 0.65);
writeWav('flutter', flutter(), 0.6);
writeWav('brush', loopNoise(1.0, 1100, 1.2, 1.0, 0.25), 0.22);
writeWav('erase', loopNoise(0.8, 650, 1.0, 1.25, 0.35), 0.2);
writeWav('sparkle', sparkleLoop(), 0.35);
writeWav('music', musicBox(), 0.45);
