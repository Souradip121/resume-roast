// Takes the screenshots with headless Chrome over the DevTools protocol.
// Uses the made-up sample resume (samples/). The AI call is STUBBED: no key is used,
// and the roast in the shots is the app's example roast (js/demo.js), not a real model answer.
//
//   node tools/shoot.mjs [url] [outDir] [--dpr 3] [--review]
//   default url: http://127.0.0.1:8806/   default outDir: screenshots/
//   --dpr 3 gives 1170 x 2532 reel stills from a 390 x 844 phone.

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { launch, sleep } from './cdp.mjs';
import { DEMO } from '../js/demo.js';

const args = process.argv.slice(2);
const flag = (name, dflt) => { const i = args.indexOf(name); return i === -1 ? dflt : args[i + 1]; };
const positional = args.filter((a, i) => !a.startsWith('--') && !args[i - 1]?.startsWith('--dpr'));
const URL_ = positional[0] || 'http://127.0.0.1:8806/';
const OUT = positional[1] || 'screenshots';
const DPR = Number(flag('--dpr', 3));
const REVIEW = args.includes('--review');
const FAKE_KEY = 'sk-ant-api03-SCREENSHOT-ONLY-NOT-A-REAL-KEY-000000000000000';
const STUB = {
  id: 'msg_stub', type: 'message', role: 'assistant', model: 'claude-haiku-5-5', stop_reason: 'end_turn',
  content: [{ type: 'text', text: JSON.stringify({ is_resume: true, heat: DEMO.heat, roast: DEMO.roast, score: DEMO.score, verdict: DEMO.verdict, fixes: DEMO.fixes, redact: DEMO.redact }) }],
};

mkdirSync(OUT, { recursive: true });
const b = await launch();
const { send, run } = b;
const errors = [];
b.on((m) => {
  if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails?.exception?.description || m.params.exceptionDetails?.text);
  if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') errors.push(`${m.params.entry.text} ${m.params.entry.url || ''}`);
});

async function shot(file, { full = false } = {}) {
  const params = { format: 'png', captureBeyondViewport: full };
  if (full) {
    const { cssContentSize } = await send('Page.getLayoutMetrics');
    params.clip = { x: 0, y: 0, width: cssContentSize.width, height: cssContentSize.height, scale: 1 };
  }
  const { data } = await send('Page.captureScreenshot', params);
  writeFileSync(file, Buffer.from(data, 'base64'));
  console.log('saved', file);
}
const settle = (ms = 400) => sleep(ms);
const scrollTo = async (sel, offset = 0) => run(`(() => { const el = document.querySelector(${JSON.stringify(sel)}); window.scrollTo(0, Math.max(0, el.getBoundingClientRect().top + scrollY - ${offset})); return scrollY; })()`);

await send('Page.enable');
await send('Runtime.enable');
await send('Log.enable');
await send('Page.setBypassCSP', { enabled: true });
await send('Page.addScriptToEvaluateOnNewDocument', {
  source: `(() => {
    const real = window.fetch.bind(window);
    window.fetch = async (url, opts) => {
      if (/api\\.(anthropic|openai)\\.com|generativelanguage/.test(String(url))) {
        window.__lastRequest = { url: String(url), body: opts && opts.body };
        if (window.__fail) return new Response(JSON.stringify({ type: 'error', error: { type: 'authentication_error', message: 'invalid x-api-key' } }), { status: window.__fail, headers: { 'content-type': 'application/json' } });
        await new Promise(r => setTimeout(r, 1400));
        return new Response(${JSON.stringify(JSON.stringify(STUB))}, { status: 200, headers: { 'content-type': 'application/json' } });
      }
      return real(url, opts);
    };
  })();`,
});

async function phone() {
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: DPR, mobile: true });
  await send('Emulation.setTouchEmulationEnabled', { enabled: true });
}
async function load(url = URL_) {
  await send('Page.navigate', { url });
  await sleep(1200);
  await run('document.fonts.ready.then(() => true)');
  await settle(300);
}

try {
  await phone();
  await load();
  // 1 · Pick how to run it
  await shot(join(OUT, '1-pick-how-to-run-it.png'));
  console.log(await run(`(async () => {
    document.querySelector('.prov[data-provider=claude]').click();
    const k = document.querySelector('#key'); k.value = ${JSON.stringify(FAKE_KEY)}; k.dispatchEvent(new Event('input', { bubbles: true }));
    const blob = await (await fetch('samples/sample-resume.pdf')).blob();
    const dt = new DataTransfer();
    dt.items.add(new File([blob], 'resume_final_v7.pdf', { type: 'application/pdf' }));
    const input = document.querySelector('#file');
    input.files = dt.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
    for (let i = 0; i < 100 && !document.querySelector('#parse-note.ok'); i++) await new Promise(r => setTimeout(r, 100));
    return document.querySelector('#parse-note').textContent;
  })()`));
  await scrollTo('#route-key', 14);
  await settle();
  await shot(join(OUT, '1b-key-and-resume.png'));
  if (REVIEW) await shot(join(OUT, '1-full.png'), { full: true });

  // 2 · The roast: pick the heat, then roast
  await run(`document.querySelector('#to-roast').click()`);
  await settle(700);
  await run(`document.querySelector('#spice-row .chili-btn[data-n="4"]').click()`);
  await settle(700);
  await shot(join(OUT, '2a-pick-the-heat.png'));
  await run(`document.querySelector('#roast').click()`);
  await settle(500);
  await shot(join(OUT, '2b-cooking.png'));
  await run(`(async () => { for (let i = 0; i < 80 && document.querySelector('#to-fixes').hidden; i++) await new Promise(r => setTimeout(r, 100)); })()`);
  await settle(900);
  await run('window.scrollTo(0, 0)');
  await settle();
  await shot(join(OUT, '2-the-roast.png'));
  if (REVIEW) await shot(join(OUT, '2-full.png'), { full: true });
  const req = await run('JSON.stringify(window.__lastRequest || null)');
  writeFileSync(join(OUT, 'last-request.json'), req || 'null');

  // 3 · Fix these 3
  await run(`document.querySelector('#to-fixes').click()`);
  await settle(2200);
  await run('window.scrollTo(0, 0)');
  await settle();
  await shot(join(OUT, '3-fix-these-3.png'));
  if (REVIEW) await shot(join(OUT, '3-full.png'), { full: true });

  // the share card itself, exactly as the page drew it
  await run(`document.querySelector('#share').click()`);
  for (let i = 0; i < 50; i++) { if (await run(`document.querySelector('#sheet').open && !!document.querySelector('#sheet-img')`)) break; await sleep(200); }
  await settle(600);
  const dataUrl = await run(`(async () => { const b = await (await fetch(document.querySelector('#sheet-img').src)).blob(); return await new Promise(r => { const f = new FileReader(); f.onload = () => r(f.result); f.readAsDataURL(b); }); })()`);
  writeFileSync(join(OUT, '4-share-card.png'), Buffer.from(dataUrl.split(',')[1], 'base64'));
  console.log('saved', join(OUT, '4-share-card.png'));
  await shot(join(OUT, '5-share-sheet.png'));

  if (REVIEW) {
    // a bad key, to see the error state (stubbed 401)
    await run(`document.querySelector('#sheet').close(); window.__fail = 401; document.querySelector('#again').click()`);
    await settle(600);
    await run(`document.querySelector('#roast').click()`);
    await settle(2000);
    await run('window.scrollTo(0, 0)');
    await shot(join(OUT, '6-bad-key.png'));
  }

  if (REVIEW) {
    await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
    await send('Emulation.setTouchEmulationEnabled', { enabled: false });
    await load();
    await shot(join(OUT, 'desktop.png'));
  }
} finally {
  if (errors.length) console.log('PAGE ERRORS:\n' + errors.join('\n'));
  b.close();
}
