// Turns samples/sample-resume.txt (a made-up resume) into samples/sample-resume.pdf,
// laid out like a typical Word resume, using headless Chrome's print-to-PDF.
//   node tools/make-sample-pdf.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { launch, sleep } from './cdp.mjs';

const txt = readFileSync(new URL('../samples/sample-resume.txt', import.meta.url), 'utf8').replace(/\r/g, '');
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const lines = txt.trim().split('\n');
const [name, contact1, contact2, ...rest] = lines;

let body = '';
for (const l of rest) {
  if (!l.trim()) continue;
  if (/^[A-Z][A-Z &'-]+$/.test(l.trim())) body += `<h2>${esc(l.trim())}</h2>`;
  else if (/^- /.test(l)) body += `<li>${esc(l.slice(2))}</li>`;
  else if (/^\d+\. /.test(l)) body += `<p class="proj">${esc(l)}</p>`;
  else body += `<p>${esc(l)}</p>`;
}
body = body.replace(/(<li>.*?<\/li>)+/g, m => `<ul>${m}</ul>`);

const html = `<!doctype html><meta charset="utf-8"><style>
@page { size: A4; margin: 16mm 18mm; }
body { font-family: "Times New Roman", Times, serif; font-size: 11.5pt; color: #111; line-height: 1.35; }
h1 { text-align: center; font-size: 20pt; margin: 0 0 2pt; letter-spacing: 1px; }
.c { text-align: center; margin: 0; font-size: 10.5pt; }
h2 { font-size: 12pt; margin: 12pt 0 4pt; border-bottom: 1.2px solid #111; padding-bottom: 1pt; }
p { margin: 2pt 0; }
.proj { font-weight: bold; margin-top: 5pt; }
ul { margin: 1pt 0 2pt; padding-left: 18pt; }
li { margin: 1pt 0; }
</style><h1>${esc(name)}</h1><p class="c">${esc(contact1)}</p><p class="c">${esc(contact2)}</p>${body}`;

const b = await launch();
try {
  await b.send('Page.enable');
  await b.send('Page.navigate', { url: 'data:text/html;base64,' + Buffer.from(html).toString('base64') });
  await sleep(800);
  const { data } = await b.send('Page.printToPDF', { printBackground: true, preferCSSPageSize: true });
  const out = new URL('../samples/sample-resume.pdf', import.meta.url);
  writeFileSync(out, Buffer.from(data, 'base64'));
  console.log('saved samples/sample-resume.pdf', Buffer.from(data, 'base64').length, 'bytes');
} finally {
  b.close();
}
