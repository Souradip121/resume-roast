// Reads a resume on the phone: text out of a PDF (pdf.js, loaded only when needed),
// a .txt, or pasted text. Also the small privacy helpers: contact details are swapped
// for [email] / [phone] before anything is sent, and the share card hides personal details.

export const MAX_BYTES = 10 * 1024 * 1024;
export const MAX_CHARS = 24000;
const MAX_PAGES = 8;

export class ResumeError extends Error {
  constructor(kind, message) {
    super(message);
    this.kind = kind;
  }
}

const MESSAGES = {
  'too-big': 'That file is over 10 MB. A resume PDF is usually under 1 MB: export it again, or paste the text.',
  word: 'That’s a Word file. Save it as PDF first (File → Save as → PDF), or paste the text.',
  image: 'That’s an image, and there’s no text to read in it. Add the PDF, or paste the text.',
  unknown: 'Can’t read that kind of file. Add a PDF or a .txt, or paste the text.',
  locked: 'That PDF is password-protected. Export it again without a password, or paste the text.',
  'bad-pdf': 'That PDF seems broken and can’t be opened. Export it again, or paste the text.',
  scanned: 'That PDF has no text in it (it’s probably a scan or a photo). Export it from Word, Canva or Overleaf, or paste the text.',
  empty: 'That file is empty.',
  'pdf-load': 'Couldn’t load the PDF reader. Check your connection and try again, or paste the text.',
};

const err = kind => new ResumeError(kind, MESSAGES[kind]);

function extOf(name = '') {
  const m = /\.([a-z0-9]+)$/i.exec(name);
  return m ? m[1].toLowerCase() : '';
}

let pdfjs = null;
async function loadPdfJs() {
  if (pdfjs) return pdfjs;
  try {
    pdfjs = await import('../vendor/pdfjs/pdf.min.mjs');
    pdfjs.GlobalWorkerOptions.workerSrc = new URL('../vendor/pdfjs/pdf.worker.min.mjs', import.meta.url).href;
  } catch {
    pdfjs = null;
    throw err('pdf-load');
  }
  return pdfjs;
}

/** Joins pdf.js text items into lines, using hasEOL and the gaps between items. */
export function joinTextItems(items) {
  let out = '';
  let lastY = null;
  for (const it of items) {
    if (!('str' in it)) continue;
    const y = it.transform ? Math.round(it.transform[5]) : null;
    if (lastY !== null && y !== null && Math.abs(y - lastY) > 2 && !out.endsWith('\n')) out += '\n';
    out += it.str;
    if (it.hasEOL) out += '\n';
    else if (it.str && !/\s$/.test(it.str)) out += ' ';
    if (y !== null) lastY = y;
  }
  return out;
}

async function readPdf(file) {
  const lib = await loadPdfJs();
  const data = new Uint8Array(await file.arrayBuffer());
  let doc;
  try {
    doc = await lib.getDocument({ data, disableFontFace: true, useSystemFonts: false, enableXfa: false, stopAtErrors: false }).promise;
  } catch (e) {
    if (e?.name === 'PasswordException') throw err('locked');
    throw err('bad-pdf');
  }
  const pages = doc.numPages;
  const parts = [];
  for (let p = 1; p <= Math.min(pages, MAX_PAGES); p++) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();
    parts.push(joinTextItems(content.items));
  }
  doc.destroy?.();
  const text = cleanText(parts.join('\n\n'));
  if (text.replace(/\s/g, '').length < 60) throw err('scanned');
  return { text, pages };
}

// invisible characters to drop, and odd spaces to turn into plain spaces (built from code points
// so the source stays plain ASCII)
const cls = ranges => new RegExp('[' + ranges.map(([a, b = a]) => String.fromCharCode(a) + (b > a ? '-' + String.fromCharCode(b) : '')).join('') + ']', 'g');
const INVISIBLE = cls([[0x00, 0x08], [0x0B, 0x0C], [0x0E, 0x1F], [0x7F], [0xAD], [0x200B, 0x200F], [0x2028, 0x2029], [0xFEFF]]);
const ODD_SPACE = cls([[0x09], [0xA0], [0x2000, 0x200A], [0x202F], [0x205F], [0x3000]]);

/** Tidies whitespace and invisible characters; keeps line breaks. */
export function cleanText(s) {
  return String(s)
    .replace(/\r\n?/g, '\n')
    .replace(INVISIBLE, '')
    .replace(ODD_SPACE, ' ')
    .replace(/ {2,}/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Reads a dropped or picked file.
 * @returns {Promise<{text:string, pages:number, kind:'pdf'|'text'}>}
 */
export async function readResumeFile(file) {
  if (!file) throw err('unknown');
  if (file.size > MAX_BYTES) throw err('too-big');
  if (file.size === 0) throw err('empty');
  const ext = extOf(file.name);
  const type = file.type || '';
  if (type === 'application/pdf' || ext === 'pdf') {
    const { text, pages } = await readPdf(file);
    return { text, pages, kind: 'pdf' };
  }
  if (['doc', 'docx', 'odt', 'rtf', 'pages'].includes(ext) || /word|opendocument|rtf/.test(type)) throw err('word');
  if (/^image\//.test(type) || ['png', 'jpg', 'jpeg', 'webp', 'heic', 'heif', 'gif'].includes(ext)) throw err('image');
  if (/^text\//.test(type) || ['txt', 'md', 'markdown', 'tex'].includes(ext)) {
    const text = cleanText(await file.text());
    if (!text) throw err('empty');
    return { text, pages: 0, kind: 'text' };
  }
  throw err('unknown');
}

// ---------- does it look like a resume? ----------
const SIGNALS = [
  /\beducation\b|\bacademic/i,
  /\bexperience\b|\binternship|\bintern\b|\bwork history/i,
  /\bprojects?\b/i,
  /\bskills?\b|\btech(nical)? stack|\btools\b/i,
  /\bc?gpa\b|\bsgpa\b|\bpercentage\b|\b\d{1,2}(\.\d{1,2})?\s*\/\s*10\b|\bcpi\b/i,
  /\bb\.?\s?tech\b|\bb\.?\s?e\b\.?|\bbca\b|\bmca\b|\bb\.?\s?sc\b|\bm\.?\s?tech\b|\bbachelor|\bdegree\b|\bclass (x|xii|10|12)\b|\bhsc\b|\bssc\b/i,
  /\bcertifications?\b|\bcourses?\b|\bachievements?\b|\bhackathon/i,
  /\bobjective\b|\bsummary\b|\bprofile\b|\babout me\b/i,
  /linkedin|github|leetcode|portfolio/i,
  /[\w.+-]+@[\w-]+\.[\w.]+|\[email\]/i,
];

/** 0..10: how many resume-ish signals the text has. Under 3 is probably not a resume. */
export function resumeSignals(text) {
  return SIGNALS.reduce((n, re) => n + (re.test(text) ? 1 : 0), 0);
}

// ---------- privacy ----------
const EMAIL = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g;
const PHONE = /(?:\+\s?\d{1,3}[\s.-]?)?(?:\(?\d{2,5}\)?[\s.-]?){1,4}\d{2,5}/g;

function isPhone(m) {
  const digits = m.replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 13) return false;
  // year ranges like "2021 - 2025 2019" aren't phone numbers
  if (/^(19|20)\d{2}\D+(19|20)\d{2}/.test(m.trim())) return false;
  return true;
}

/** Swaps emails and phone numbers for [email] and [phone]. Used before sending the text anywhere. */
export function scrubContacts(text) {
  return String(text)
    .replace(EMAIL, '[email]')
    .replace(PHONE, m => (isPhone(m) ? '[phone]' : m));
}

/** Caps very long text (multi-page CVs) so a request stays small. */
export function capText(text) {
  if (text.length <= MAX_CHARS) return { text, cut: false };
  return { text: text.slice(0, MAX_CHARS) + '\n[…the rest was cut to keep the request small]', cut: true };
}

/** A best guess at the name: the first short line of capitalised words at the top of the resume. */
export function guessName(text) {
  const lines = String(text).split('\n').map(l => l.trim()).filter(Boolean).slice(0, 4);
  for (const l of lines) {
    if (l.length > 40 || /[@\d|:]/.test(l)) continue;
    if (/^(resume|curriculum vitae|cv)$/i.test(l)) continue;
    const words = l.split(/\s+/);
    if (words.length >= 2 && words.length <= 4 && words.every(w => /^[A-Z][A-Za-z.'-]*$/.test(w) || /^[A-Z.'-]+$/.test(w))) return l;
  }
  return '';
}

/** Everything the share card should hide: the AI's list, plus contacts and the name we can find ourselves. */
export function redactionList(aiList = [], resumeText = '') {
  const set = new Set();
  for (const s of aiList) if (s && s.length >= 2) set.add(s.trim());
  for (const m of String(resumeText).match(EMAIL) || []) set.add(m);
  for (const m of String(resumeText).match(PHONE) || []) if (isPhone(m)) set.add(m.trim());
  const name = guessName(resumeText);
  if (name) {
    set.add(name);
    for (const part of name.split(/\s+/)) if (part.length >= 3) set.add(part);
  }
  return [...set].sort((a, b) => b.length - a.length);
}

function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

/**
 * Splits a string into plain and hidden parts.
 * @returns {{text:string, hidden:boolean}[]}
 */
export function redactParts(str, list) {
  const s = String(str);
  const terms = list.filter(t => t && t.length >= 2);
  if (!terms.length) return [{ text: s, hidden: false }];
  const re = new RegExp(terms.map(t => escapeRe(t).replace(/\s+/g, '\\s+')).join('|'), 'gi');
  const parts = [];
  let last = 0;
  for (const m of s.matchAll(re)) {
    // whole words only for short single words (so "Ram" doesn't hide "program")
    const before = s[m.index - 1] || ' ';
    const after = s[m.index + m[0].length] || ' ';
    if (/^\w+$/.test(m[0]) && (/\w/.test(before) || /\w/.test(after))) continue;
    if (m.index > last) parts.push({ text: s.slice(last, m.index), hidden: false });
    parts.push({ text: m[0], hidden: true });
    last = m.index + m[0].length;
  }
  if (last < s.length) parts.push({ text: s.slice(last), hidden: false });
  return parts.length ? parts : [{ text: s, hidden: false }];
}
