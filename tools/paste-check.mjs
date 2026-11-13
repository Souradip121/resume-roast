// Checks the copy-prompt route's second half: paste a real chat-app answer
// (samples/gemini-answer.txt) into "Got the answer? Paste it here" and render it.
//   node tools/paste-check.mjs [url] [outDir]
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { launch, sleep } from './cdp.mjs';

const URL_ = process.argv[2] || 'http://127.0.0.1:8806/';
const OUT = process.argv[3] || '.impeccable/review';
mkdirSync(OUT, { recursive: true });
const answer = readFileSync(new URL('../samples/gemini-answer.txt', import.meta.url), 'utf8');
const b = await launch();
const shot = async (f) => { const { data } = await b.send('Page.captureScreenshot', { format: 'png' }); writeFileSync(join(OUT, f), Buffer.from(data, 'base64')); console.log('saved', f); };
try {
  await b.send('Page.enable');
  await b.send('Runtime.enable');
  await b.send('Page.setBypassCSP', { enabled: true }); // only so this script can read the card's blob: URL
  await b.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await b.send('Page.navigate', { url: URL_ });
  await sleep(1200);
  // a bad paste first
  console.log('bad paste ->', await b.run(`(async () => {
    document.querySelector('#paste-toggle').click();
    const a = document.querySelector('#answer'); a.value = 'Sure! Here is your roast: your resume is great.'; a.dispatchEvent(new Event('input'));
    document.querySelector('#show-answer').click();
    return document.querySelector('#answer-note').textContent;
  })()`));
  console.log('good paste ->', await b.run(`(async () => {
    const a = document.querySelector('#answer'); a.value = ${JSON.stringify(answer)}; a.dispatchEvent(new Event('input'));
    document.querySelector('#show-answer').click();
    for (let i = 0; i < 60 && document.querySelector('#to-fixes').hidden; i++) await new Promise(r => setTimeout(r, 100));
    return [...document.querySelectorAll('.q-text')].length + ' quotes, heat ' + document.querySelector('#spice-n').textContent + ', by: ' + document.querySelector('#by').textContent;
  })()`));
  await sleep(600);
  await b.run('window.scrollTo(0, 0)');
  await shot('7-pasted-roast.png');
  await b.run(`document.querySelector('#to-fixes').click()`);
  await sleep(2200);
  await b.run('window.scrollTo(0, 0)');
  await shot('7-pasted-fixes.png');
  const dataUrl = await b.run(`(async () => {
    document.querySelector('#share').click();
    for (let i = 0; i < 50 && !document.querySelector('#sheet-img'); i++) await new Promise(r => setTimeout(r, 100));
    await new Promise(r => setTimeout(r, 400));
    const blob = await (await fetch(document.querySelector('#sheet-img').src)).blob();
    return await new Promise(r => { const f = new FileReader(); f.onload = () => r(f.result); f.readAsDataURL(blob); });
  })()`);
  writeFileSync(join(OUT, '7-pasted-card.png'), Buffer.from(dataUrl.split(',')[1], 'base64'));
  console.log('saved 7-pasted-card.png');
  // the opt-in ticked: details shown on the card
  await b.run(`(async () => { const o = document.querySelector('#optin'); o.click(); await new Promise(r => setTimeout(r, 900)); })()`);
  await shot('7-pasted-sheet-optin.png');
} finally {
  b.close();
}
