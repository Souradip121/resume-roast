// Reads the AI's answer back: the strict JSON from the API route, or whatever
// the user pasted from ChatGPT / Gemini / Claude (code fences, chatter around it,
// smart quotes, trailing commas). Returns a clean roast or throws a RoastError.

import { DEFAULT_HEAT } from './prompt.js';

export class RoastError extends Error {
  constructor(kind, message, detail = '') {
    super(message);
    this.kind = kind;
    this.detail = detail;
  }
}

const NO_RESUME_LINE = /attach your resume/i;

/** Finds the first balanced {...} block in a string, ignoring braces inside strings. */
export function findJsonObject(text) {
  const s = String(text);
  for (let start = s.indexOf('{'); start !== -1; start = s.indexOf('{', start + 1)) {
    let depth = 0;
    let inStr = false;
    let quote = '';
    for (let i = start; i < s.length; i++) {
      const c = s[i];
      if (inStr) {
        if (c === '\\') { i++; continue; }
        if (c === quote) inStr = false;
        continue;
      }
      if (c === '"') { inStr = true; quote = c; continue; }
      if (c === '{') depth++;
      else if (c === '}') {
        depth--;
        if (depth === 0) {
          const block = s.slice(start, i + 1);
          if (/"(roast|score|fixes|is_resume)"/.test(block) || /[“”](roast|score|fixes)[“”]/.test(block)) return block;
          break;
        }
      }
    }
  }
  return null;
}

function tryParse(block) {
  const attempts = [
    b => b,
    b => b.replace(/,\s*([}\]])/g, '$1'),
    // smart double quotes used as JSON quotes (some chat apps "prettify" pasted text)
    b => b.replace(/[“”]/g, '"').replace(/,\s*([}\]])/g, '$1'),
  ];
  for (const fix of attempts) {
    try { return JSON.parse(fix(block)); } catch { /* next */ }
  }
  return null;
}

function tidy(v) {
  const s = String(v ?? '').replace(/\s+/g, ' ').trim();
  // drop quotes that wrap the whole line, but keep quotes inside it
  const m = /^["“](.*)["”]$/.exec(s);
  return m && !/["“”]/.test(m[1]) ? m[1].trim() : s;
}

function toScore(v) {
  let n = typeof v === 'number' ? v : parseFloat(String(v ?? '').replace(',', '.'));
  if (!Number.isFinite(n)) return NaN;
  // "45/100" or "4.5/10" style answers
  if (n > 10 && n <= 100 && /\/\s*100/.test(String(v))) n = n / 10;
  n = Math.min(10, Math.max(0, n));
  return Math.round(n * 2) / 2;
}

function toFix(f) {
  if (f && typeof f === 'object') {
    const title = tidy(f.title ?? f.fix ?? f.name ?? '');
    const how = tidy(f.how ?? f.detail ?? f.details ?? f.why ?? f.description ?? '');
    return title || how ? { title: title || how, how: title ? how : '' } : null;
  }
  const s = tidy(f);
  if (!s) return null;
  const m = /^(.{3,60}?)[:.–—-]\s+(.+)$/.exec(s);
  return m ? { title: m[1].trim(), how: m[2].trim() } : { title: s, how: '' };
}

/**
 * @param {string|object} input  the model's text, or an already-parsed object
 * @returns {{isResume:boolean, heat:number, roast:string[], score:number, verdict:string, fixes:{title:string,how:string}[], redact:string[]}}
 */
export function parseRoast(input, { heat: fallbackHeat = DEFAULT_HEAT } = {}) {
  let obj = input && typeof input === 'object' ? input : null;
  if (!obj) {
    const text = String(input ?? '').trim();
    if (!text) throw new RoastError('empty', 'There’s nothing here yet. Paste the AI’s whole answer.');
    const block = findJsonObject(text);
    if (!block) {
      if (NO_RESUME_LINE.test(text)) throw new RoastError('no-resume', 'The AI didn’t get your resume. Attach the PDF (or paste its text) in the chat, then send the prompt again.');
      throw new RoastError('no-json', 'That doesn’t contain the roast. Copy the AI’s whole answer, including the { and } at the start and end.');
    }
    obj = tryParse(block);
    if (!obj) throw new RoastError('malformed', 'The answer came back garbled, so it can’t be read. Try again: it usually works the second time.', block.slice(0, 200));
  }

  const roast = (Array.isArray(obj.roast) ? obj.roast : Array.isArray(obj.roast_lines) ? obj.roast_lines : [])
    .map(r => tidy(r && typeof r === 'object' ? r.line ?? r.text ?? '' : r))
    .filter(Boolean)
    .slice(0, 6);
  const fixes = (Array.isArray(obj.fixes) ? obj.fixes : [])
    .map(toFix)
    .filter(Boolean)
    .slice(0, 3);
  const score = toScore(obj.score);
  const verdict = tidy(obj.verdict ?? obj.summary ?? '');
  const redact = (Array.isArray(obj.redact) ? obj.redact : [])
    .map(tidy)
    .filter(s => s.length >= 2);
  const h = parseInt(obj.heat, 10);
  const heat = h >= 1 && h <= 5 ? h : fallbackHeat;
  const isResume = obj.is_resume === false || obj.is_resume === 'false' ? false : true;

  if (!isResume) {
    throw new RoastError('not-resume', `That doesn’t look like a resume${verdict ? ` (the AI says: ${verdict.replace(/\.$/, '')})` : ''}. Add your resume as a PDF or paste its text.`, verdict);
  }
  if (!roast.length || !fixes.length || Number.isNaN(score)) {
    throw new RoastError('malformed', 'The answer was missing parts of the roast. Try again: it usually works the second time.');
  }
  return { isResume, heat, roast, score, verdict, fixes, redact };
}
