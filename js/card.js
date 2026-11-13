// Draws the 1080 × 1920 share card on a canvas, on the phone. Nothing is uploaded.
// Personal details (name, contacts, college) are drawn as black bars unless the user opts in.
import { HEAT } from './prompt.js';
import { redactParts } from './resume.js';
import { quoteLine } from './quotes.js';

const W = 1080;
const H = 1920;
const C = {
  red: '#D3221B', label: '#C81E19', deep: '#9E1410', ink: '#2A120B', inkSoft: '#5B3424',
  yellow: '#FFD54A', yellowDeep: '#F4B321', pale: '#FFEFB0', cream: '#FFF3CC', card: '#FFF9E4',
};
const DISPLAY = "'Ultra', serif";
const LABEL = "'Barlow Condensed', sans-serif";
const BODY = "'Zilla Slab', serif";

// shapes shared with the page's SVG (index.html)
const BANNER_RED = 'M16 60C70 22 330 22 384 60v86c-40 22-108 36-184 46C124 182 56 168 16 146Z';
const BANNER_YELLOW = 'M27 66C80 33 320 33 373 66v74c-38 19-102 32-173 41C129 172 65 159 27 140Z';
const BURST = burstPath(18, 49, 41);
const SEAL = burstPath(24, 49, 43.5);
const STAR = burstPath(5, 10, 4.2, 12, 12);
const FLAMES_BACK = 'M0 48 L0 44 C0.0 36.5 1.8 27.6 11.7 15.2 C13.5 28.3 21.1 35.5 24.8 44.0 C30.3 38.9 29.2 31.8 39.0 21.9 C40.9 32.4 51.8 38.1 55.5 44.0 C61.1 36.8 62.8 28.2 72.6 16.0 C74.5 28.8 82.6 35.8 86.3 44.0 C91.8 39.1 97.5 32.2 107.4 22.6 C109.2 32.8 113.4 38.3 117.1 44.0 C122.6 35.9 123.3 26.5 133.1 13.4 C135.0 27.2 144.2 34.8 147.8 44.0 C153.4 37.8 158.0 29.9 167.9 18.9 C169.7 30.5 174.9 36.9 178.6 44.0 C184.2 35.5 181.2 25.8 191.1 12.2 C192.9 26.5 205.7 34.4 209.4 44.0 C214.9 36.5 213.7 27.6 223.5 15.0 C225.4 28.2 236.5 35.5 240.2 44.0 C245.7 35.4 243.6 25.6 253.5 11.9 C255.3 26.3 267.2 34.3 270.9 44.0 C276.5 36.1 277.9 26.9 287.8 13.9 C289.6 27.5 298.0 35.0 301.7 44.0 C307.2 38.5 304.0 31.2 313.8 20.8 C315.7 31.7 328.8 37.7 332.5 44.0 C338.0 33.7 344.7 22.6 354.5 7.1 C356.4 23.5 359.5 32.5 363.2 44.0 C368.8 38.8 369.8 31.8 379.6 21.8 C381.5 32.3 390.3 38.1 394.0 44.0 C399.5 33.6 397.8 22.5 400.0 6.8 C400.0 23.3 400.0 32.3 400.0 44.0 L400 48 Z';
const FLAMES_FRONT = 'M0 48 L0 44 C0.0 42.2 0.0 37.7 0.0 31.4 C0.0 38.0 8.0 41.7 11.0 44.0 C15.5 39.2 15.8 32.5 23.8 22.9 C25.3 33.0 33.0 38.5 36.0 44.0 C40.5 40.6 39.7 34.8 47.7 26.8 C49.2 35.3 58.0 39.9 61.0 44.0 C65.5 39.1 66.2 32.2 74.2 22.5 C75.7 32.7 83.0 38.3 86.0 44.0 C90.5 42.0 91.7 37.3 99.7 30.7 C101.2 37.6 108.0 41.4 111.0 44.0 C115.5 39.1 118.7 32.3 126.7 22.7 C128.2 32.8 133.0 38.4 136.0 44.0 C140.5 42.0 143.0 37.4 151.0 30.9 C152.5 37.8 158.0 41.5 161.0 44.0 C165.5 40.4 162.6 34.5 170.6 26.2 C172.1 34.9 183.0 39.7 186.0 44.0 C190.5 39.4 193.8 32.8 201.8 23.4 C203.3 33.2 208.0 38.7 211.0 44.0 C215.5 39.6 213.9 33.1 221.9 23.9 C223.4 33.5 233.0 38.8 236.0 44.0 C240.5 42.6 240.2 38.5 248.2 32.7 C249.7 38.8 258.0 42.2 261.0 44.0 C265.5 39.7 267.9 33.3 275.9 24.2 C277.4 33.7 283.0 39.0 286.0 44.0 C290.5 39.9 290.5 33.6 298.5 24.8 C300.0 34.1 308.0 39.2 311.0 44.0 C315.5 42.2 318.8 37.8 326.8 31.6 C328.3 38.1 333.0 41.8 336.0 44.0 C340.5 43.3 343.8 39.7 351.8 34.6 C353.3 39.9 358.0 42.9 361.0 44.0 C365.5 41.3 367.0 36.2 375.0 28.9 C376.5 36.5 383.0 40.7 386.0 44.0 C390.5 42.4 392.4 38.1 400.0 32.1 C400.0 38.5 400.0 42.0 400.0 44.0 L400 48 Z';

function burstPath(n, R, r, cx = 50, cy = 50) {
  const p = [];
  for (let i = 0; i < n * 2; i++) {
    const a = (-90 + i * 180 / n) * Math.PI / 180;
    const rr = i % 2 ? r : R;
    p.push(`${(cx + rr * Math.cos(a)).toFixed(1)} ${(cy + rr * Math.sin(a)).toFixed(1)}`);
  }
  return `M${p.join(' L')} Z`;
}

let chiliImg = null;
function loadChili() {
  if (chiliImg) return chiliImg;
  chiliImg = new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = new URL('../assets/chili.svg', import.meta.url).href;
  });
  return chiliImg;
}

function shape(ctx, d, { x = 0, y = 0, s = 1, sy = s, fill, stroke, lw = 0 }) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, sy);
  const p = new Path2D(d);
  if (fill) { ctx.fillStyle = fill; ctx.fill(p); }
  if (stroke && lw) { ctx.lineWidth = lw / s; ctx.strokeStyle = stroke; ctx.lineJoin = 'round'; ctx.stroke(p); }
  ctx.restore();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function chili(ctx, img, cx, cy, size, rot = 0, flip = false) {
  if (!img) return;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rot);
  if (flip) ctx.scale(-1, 1);
  ctx.drawImage(img, -size / 2, -size / 2, size, size);
  ctx.restore();
}

/** Text along a quadratic curve, letter by letter (canvas has no textPath). */
function arcText(ctx, text, [x0, y0], [cx, cy], [x1, y1], { font, fill, stroke, lw, drop = 0, spacing = 0 }) {
  const pt = t => [
    (1 - t) ** 2 * x0 + 2 * (1 - t) * t * cx + t * t * x1,
    (1 - t) ** 2 * y0 + 2 * (1 - t) * t * cy + t * t * y1,
  ];
  const N = 400;
  const lens = [0];
  let prev = pt(0);
  for (let i = 1; i <= N; i++) {
    const p = pt(i / N);
    lens.push(lens[i - 1] + Math.hypot(p[0] - prev[0], p[1] - prev[1]));
    prev = p;
  }
  const total = lens[N];
  const at = (d) => {
    let i = lens.findIndex(l => l >= d);
    if (i < 1) i = 1;
    const t = (i - 1 + (d - lens[i - 1]) / Math.max(1e-6, lens[i] - lens[i - 1])) / N;
    const p = pt(t);
    const q = pt(Math.min(1, t + 0.002));
    return { x: p[0], y: p[1], a: Math.atan2(q[1] - p[1], q[0] - p[0]) };
  };
  ctx.save();
  ctx.font = font;
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'center';
  const widths = [...text].map(ch => ctx.measureText(ch).width + spacing);
  const tw = widths.reduce((a, b) => a + b, 0) - spacing;
  let d = (total - tw) / 2;
  const glyphs = [...text].map((ch, i) => {
    const g = { ch, ...at(d + widths[i] / 2) };
    d += widths[i];
    return g;
  });
  for (const pass of ['drop', 'main']) {
    for (const g of glyphs) {
      ctx.save();
      ctx.translate(g.x, g.y + (pass === 'drop' ? drop : 0));
      ctx.rotate(g.a);
      ctx.lineJoin = 'round';
      ctx.lineWidth = lw;
      ctx.strokeStyle = stroke;
      ctx.fillStyle = pass === 'drop' ? stroke : fill;
      ctx.strokeText(g.ch, 0, 0);
      ctx.fillText(g.ch, 0, 0);
      ctx.restore();
    }
    if (!drop) break;
  }
  ctx.restore();
}

/** Word-wraps text with hidden spans (drawn as bars). Returns the lines; draws if draw=true. */
function rich(ctx, text, hide, { x, y, maxW, lineH, maxLines = 99, align = 'left', color = C.ink, draw = true, balance = false }) {
  if (balance) {
    // narrow the box until one more step would add a line, so the lines come out even
    const n = rich(ctx, text, hide, { x, y, maxW, lineH, maxLines, draw: false });
    let w = maxW;
    while (n > 1 && w > maxW * 0.5 && rich(ctx, text, hide, { x, y, maxW: w - 8, lineH, maxLines: 99, draw: false }) === n) w -= 8;
    if (draw) rich(ctx, text, hide, { x: x + (maxW - w) / 2, y, maxW: w, lineH, maxLines, align, color });
    return n;
  }
  const tokens = [];
  for (const part of redactParts(text, hide)) {
    if (part.hidden) tokens.push({ hidden: true, text: part.text });
    else for (const w of part.text.split(/(\s+)/)) if (w) tokens.push({ hidden: false, text: w, space: /^\s+$/.test(w) });
  }
  const width = t => (t.hidden ? Math.max(60, Math.min(ctx.measureText(t.text).width, 320)) + 8 : ctx.measureText(t.text).width);
  const lines = [[]];
  let lw = 0;
  for (const t of tokens) {
    const tw = width(t);
    const line = lines[lines.length - 1];
    if (t.space) { if (line.length) { line.push(t); lw += tw; } continue; }
    if (lw + tw > maxW && line.length) {
      while (line.length && line[line.length - 1].space) line.pop();
      lines.push([t]);
      lw = tw;
    } else { line.push(t); lw += tw; }
  }
  let out = lines.filter(l => l.length);
  if (out.length > maxLines) {
    out = out.slice(0, maxLines);
    const last = out[maxLines - 1];
    while (last.length && (last.reduce((a, t) => a + width(t), 0) + ctx.measureText('…').width > maxW)) last.pop();
    while (last.length && last[last.length - 1].space) last.pop();
    last.push({ hidden: false, text: '…' });
  }
  if (draw) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.textBaseline = 'alphabetic';
    out.forEach((line, i) => {
      const lineW = line.reduce((a, t) => a + width(t), 0);
      let cx = align === 'center' ? x + (maxW - lineW) / 2 : x;
      const by = y + i * lineH;
      for (const t of line) {
        const tw = width(t);
        if (t.hidden) {
          ctx.save();
          ctx.fillStyle = C.ink;
          roundRect(ctx, cx + 2, by - lineH * 0.62, tw - 4, lineH * 0.72, 6);
          ctx.fill();
          ctx.restore();
        } else {
          ctx.textAlign = 'left';
          ctx.fillText(t.text, cx, by);
        }
        cx += tw;
      }
    });
    ctx.restore();
  }
  return out.length;
}

/**
 * @param {{result: object, hide: string[], example?: boolean}} opts
 * @returns {Promise<Blob>}
 */
export async function renderCard({ result, hide = [], example = false }) {
  const r = result;
  await Promise.all([
    `400 140px ${DISPLAY}`, `800 52px ${LABEL}`, `700 44px ${BODY}`, `500 34px ${BODY}`,
  ].map(f => document.fonts.load(f).catch(() => null)));
  const img = await loadChili();

  const cv = document.createElement('canvas');
  cv.width = W;
  cv.height = H;
  const ctx = cv.getContext('2d');

  // the red label, with faint vertical paper grain
  ctx.fillStyle = C.label;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(255,255,255,.03)';
  for (let x = 0; x < W; x += 14) ctx.fillRect(x, 0, 4, H);

  // the cream panel
  const S = 2.1;
  const BX = (W - 400 * S) / 2;
  const BY = 14;
  const panelTop = BY + 196 * S;
  const panelBottom = H - 190;
  ctx.save();
  roundRect(ctx, 30, panelTop, W - 60, panelBottom - panelTop, 46);
  ctx.fillStyle = C.cream;
  ctx.fill();
  ctx.lineWidth = 7;
  ctx.strokeStyle = C.ink;
  ctx.stroke();
  roundRect(ctx, 44, panelTop + 14, W - 88, panelBottom - panelTop - 28, 36);
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(211,34,27,.5)';
  ctx.stroke();
  ctx.restore();

  // banner
  shape(ctx, BANNER_RED, { x: BX, y: BY, s: S, fill: C.red, stroke: C.ink, lw: 7 });
  const grad = ctx.createRadialGradient(BX + 200 * S, BY + 95 * S, 10, BX + 200 * S, BY + 95 * S, 230 * S);
  grad.addColorStop(0, '#FFF0A6');
  grad.addColorStop(0.6, '#FFD54A');
  grad.addColorStop(1, '#F4B321');
  shape(ctx, BANNER_YELLOW, { x: BX, y: BY, s: S, fill: grad, stroke: C.ink, lw: 5.5 });
  // halftone dots, clipped to the band
  ctx.save();
  ctx.translate(BX, BY);
  ctx.scale(S, S);
  ctx.clip(new Path2D(BANNER_YELLOW));
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = 'rgba(232,162,26,.5)';
  for (let y = BY; y < BY + 200 * S; y += 15) for (let x = BX; x < BX + 400 * S; x += 15) { ctx.beginPath(); ctx.arc(x + 7, y + 7, 2.5, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();

  const P = (x, y) => [BX + x * S, BY + y * S];
  arcText(ctx, 'RESUME', P(84, 110), P(200, 72), P(316, 110), { font: `400 ${42 * S}px ${DISPLAY}`, fill: C.red, stroke: C.ink, lw: 6 * S, drop: 3 * S, spacing: 0 });
  arcText(ctx, 'ROAST', P(98, 160), P(200, 132), P(302, 160), { font: `400 ${46 * S}px ${DISPLAY}`, fill: C.red, stroke: C.ink, lw: 6 * S, drop: 3 * S, spacing: 0 });
  shape(ctx, STAR, { x: BX + 82 * S, y: BY + 134 * S, s: S * 15 / 24, fill: C.red });
  shape(ctx, STAR, { x: BX + 303 * S, y: BY + 134 * S, s: S * 15 / 24, fill: C.red });
  chili(ctx, img, BX + 49 * S, BY + 103 * S, 94 * S);
  chili(ctx, img, BX + 351 * S, BY + 103 * S, 94 * S, 0, true);

  // heat seal
  const h = HEAT[r.heat] || HEAT[4];
  shape(ctx, SEAL, { x: BX + 153 * S, y: BY + 148 * S, s: 0.94 * S, fill: C.yellow, stroke: C.ink, lw: 7 });
  shape(ctx, SEAL, { x: BX + 159 * S, y: BY + 154 * S, s: 0.82 * S, fill: C.red, stroke: C.ink, lw: 4.5 });
  ctx.save();
  ctx.fillStyle = C.pale;
  ctx.textAlign = 'center';
  const two = h.badge.length > 1;
  const bsize = (two || h.badge[0].length > 4 ? 13.5 : 16) * S;
  ctx.font = `400 ${bsize}px ${DISPLAY}`;
  if (two) {
    ctx.fillText(h.badge[0], W / 2, BY + 190 * S);
    ctx.fillText(h.badge[1], W / 2, BY + 207 * S);
  } else ctx.fillText(h.badge[0], W / 2, BY + 199 * S);
  ctx.restore();

  // ---------- panel content ----------
  const left = 92;
  const inner = W - left * 2;
  let y = BY + 246 * S + 34;

  // heading with stars
  ctx.save();
  ctx.font = `800 54px ${LABEL}`;
  ctx.fillStyle = C.ink;
  ctx.textAlign = 'center';
  const head = 'My resume scored';
  ctx.fillText(head, W / 2, y + 40);
  const hw = ctx.measureText(head).width;
  shape(ctx, STAR, { x: W / 2 - hw / 2 - 52, y: y + 2, s: 1.4, fill: C.red });
  shape(ctx, STAR, { x: W / 2 + hw / 2 + 18, y: y + 2, s: 1.4, fill: C.red });
  ctx.restore();
  y += 56;
  if (example) {
    ctx.save();
    ctx.font = `800 30px ${LABEL}`;
    const label = 'EXAMPLE · MADE-UP RESUME';
    const lw = ctx.measureText(label).width + 40;
    roundRect(ctx, (W - lw) / 2, y + 8, lw, 46, 8);
    ctx.fillStyle = C.ink;
    ctx.fill();
    ctx.fillStyle = C.yellow;
    ctx.textAlign = 'center';
    ctx.fillText(label, W / 2, y + 41);
    ctx.restore();
    y += 58;
  }

  // score burst with rays and chillies
  const R = 136;
  const cy = y + R + 16;
  ctx.save();
  ctx.strokeStyle = C.red;
  ctx.lineWidth = 9;
  ctx.lineCap = 'round';
  for (const [a, b] of [[[-222, -70], [-182, -44]], [[-246, 0], [-198, 0]], [[-222, 70], [-182, 44]]]) {
    for (const sgn of [1, -1]) {
      ctx.beginPath();
      ctx.moveTo(W / 2 - sgn * a[0], cy + a[1]);
      ctx.lineTo(W / 2 - sgn * b[0], cy + b[1]);
      ctx.stroke();
    }
  }
  ctx.restore();
  chili(ctx, img, W / 2 - 320, cy + 6, 170, -1.08);
  chili(ctx, img, W / 2 + 320, cy + 6, 170, 1.08, true);
  shape(ctx, BURST, { x: W / 2 - R, y: cy - R, s: (2 * R) / 100, fill: C.red, stroke: C.ink, lw: 6 });
  const fillGrad = ctx.createRadialGradient(W / 2, cy - 20, 10, W / 2, cy, R);
  fillGrad.addColorStop(0, '#FFF1A0');
  fillGrad.addColorStop(0.7, '#FFD23F');
  fillGrad.addColorStop(1, '#F6B623');
  const r2 = R - 18;
  shape(ctx, BURST, { x: W / 2 - r2, y: cy - r2, s: (2 * r2) / 100, fill: fillGrad, stroke: C.ink, lw: 5 });
  ctx.save();
  const num = Number.isInteger(r.score) ? String(r.score) : r.score.toFixed(1);
  // fit "4.5/10" inside the inner burst, whatever the number
  let big = 80;
  let nw;
  let ow;
  for (;;) {
    ctx.font = `400 ${big}px ${DISPLAY}`;
    nw = ctx.measureText(num).width;
    ctx.font = `400 ${Math.round(big * 0.41)}px ${DISPLAY}`;
    ow = ctx.measureText('/10').width;
    if (nw + ow + 4 <= 0.74 * 2 * r2 || big <= 48) break;
    big -= 2;
  }
  const small = Math.round(big * 0.41);
  const sx = W / 2 - (nw + ow + 4) / 2;
  ctx.lineJoin = 'round';
  ctx.strokeStyle = C.ink;
  ctx.fillStyle = C.red;
  ctx.textAlign = 'left';
  ctx.font = `400 ${big}px ${DISPLAY}`;
  ctx.lineWidth = 7;
  ctx.strokeText(num, sx, cy + big * 0.37);
  ctx.fillText(num, sx, cy + big * 0.37);
  ctx.font = `400 ${small}px ${DISPLAY}`;
  ctx.lineWidth = 4.5;
  ctx.strokeText('/10', sx + nw + 4, cy + big * 0.37);
  ctx.fillText('/10', sx + nw + 4, cy + big * 0.37);
  ctx.restore();
  y = cy + R + 22;

  // what fits: verdict, two quotes, the three fixes
  const quoteFont = `700 37px ${BODY}`;
  const quoteLH = 46;
  const qTextW = inner - 120;
  ctx.font = quoteFont;
  const quotes = r.roast.slice(0, 2).map(quoteLine);
  const qLines = quotes.map(q => Math.min(3, rich(ctx, q, hide, { x: 0, y: 0, maxW: qTextW, lineH: quoteLH, maxLines: 3, draw: false })));
  ctx.font = `700 40px ${BODY}`;
  const vLines = r.verdict ? rich(ctx, r.verdict, hide, { x: 0, y: 0, maxW: inner - 40, lineH: 50, maxLines: 2, draw: false }) : 0;
  const fixesH = 74 + r.fixes.length * 62;
  const quoteH = n => n * quoteLH + 50;
  const avail = panelBottom - 88 - y;
  let useQuotes = quotes.length;
  let useVerdict = vLines > 0;
  const need = () => (useVerdict ? vLines * 50 + 22 : 0) + qLines.slice(0, useQuotes).reduce((a, n) => a + quoteH(n) + 16, 0) + fixesH;
  if (need() > avail && useQuotes > 1) useQuotes = 1;
  if (need() > avail) useVerdict = false;

  if (useVerdict) {
    ctx.font = `700 40px ${BODY}`;
    rich(ctx, r.verdict, hide, { x: left + 20, y: y + 36, maxW: inner - 40, lineH: 50, maxLines: 2, align: 'center', balance: true });
    y += vLines * 50 + 22;
  }

  for (let i = 0; i < useQuotes; i++) {
    const hgt = quoteH(qLines[i]);
    ctx.save();
    roundRect(ctx, left, y, inner, hgt, 30);
    ctx.fillStyle = C.card;
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = C.ink;
    ctx.stroke();
    ctx.restore();
    const sc = y + hgt / 2;
    shape(ctx, BURST, { x: left + 18, y: sc - 44, s: 0.88, fill: C.red, stroke: C.ink, lw: 5 });
    shape(ctx, BURST, { x: left + 28, y: sc - 34, s: 0.68, fill: C.yellow, stroke: C.ink, lw: 4 });
    chili(ctx, img, left + 62, sc, 50, 0.15);
    ctx.font = quoteFont;
    rich(ctx, quotes[i], hide, { x: left + 118, y: y + 25 + quoteLH * 0.78, maxW: qTextW, lineH: quoteLH, maxLines: 3 });
    y += hgt + 16;
  }

  // fixes
  y += 8;
  ctx.save();
  ctx.font = `800 44px ${LABEL}`;
  ctx.fillStyle = C.red;
  ctx.textAlign = 'center';
  ctx.letterSpacing = '6px';
  ctx.fillText('FIX THESE 3', W / 2, y + 36);
  ctx.restore();
  ctx.save();
  ctx.strokeStyle = C.red;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(left + 10, y + 22); ctx.lineTo(W / 2 - 170, y + 22);
  ctx.moveTo(W / 2 + 170, y + 22); ctx.lineTo(W - left - 10, y + 22);
  ctx.stroke();
  ctx.restore();
  y += 66;
  r.fixes.forEach((f, i) => {
    const ny = y + 30;
    ctx.save();
    ctx.beginPath();
    ctx.arc(left + 32, ny, 30, 0, Math.PI * 2);
    ctx.fillStyle = C.red;
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = C.ink;
    ctx.stroke();
    ctx.font = `400 34px ${DISPLAY}`;
    ctx.fillStyle = C.yellow;
    ctx.textAlign = 'center';
    ctx.fillText(String(i + 1), left + 32, ny + 12);
    ctx.restore();
    ctx.font = `700 40px ${BODY}`;
    rich(ctx, f.title, hide, { x: left + 84, y: ny + 14, maxW: inner - 92, lineH: 48, maxLines: 1 });
    y += 62;
  });

  // flames along the panel's bottom edge
  const fs = (W - 60) / 400;
  ctx.save();
  roundRect(ctx, 33, panelTop, W - 66, panelBottom - panelTop - 3, 43);
  ctx.clip();
  shape(ctx, FLAMES_BACK, { x: 30, y: panelBottom - 96, s: fs, sy: 2, fill: C.yellowDeep, stroke: C.ink, lw: 6 });
  shape(ctx, FLAMES_FRONT, { x: 30, y: panelBottom - 96, s: fs, sy: 2, fill: C.red, stroke: C.ink, lw: 6 });
  ctx.restore();
  ctx.save();
  ctx.restore();
  // redraw the panel's bottom outline over the flames
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, panelBottom - 160, W, 200);
  ctx.clip();
  roundRect(ctx, 30, panelTop, W - 60, panelBottom - panelTop, 46);
  ctx.lineWidth = 7;
  ctx.strokeStyle = C.ink;
  ctx.stroke();
  ctx.restore();

  // footer
  shape(ctx, STAR, { x: W / 2 - 18, y: panelBottom + 20, s: 1.5, fill: C.yellow });
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = C.cream;
  ctx.font = `800 46px ${LABEL}`;
  ctx.fillText('Roast yours: souradip121.github.io/resume-roast', W / 2, panelBottom + 110);
  ctx.font = `500 32px ${BODY}`;
  ctx.fillStyle = C.yellow;
  ctx.fillText('made by @souradip.sh', W / 2, panelBottom + 160);
  ctx.restore();

  return await new Promise((resolve, reject) => cv.toBlob(b => (b ? resolve(b) : reject(new Error('Could not draw the card'))), 'image/png'));
}
