// Typesetting for roast lines: curly quotes, and the outer quote marks only when the
// line doesn't already open with one (so no “‘ pile-up at the start).

/** Straight quotes to curly ones. */
export function curly(s) {
  return String(s)
    .replace(/"([^"]*)"/g, '“$1”')
    .replace(/(^|[\s([{“—–-])'/g, '$1‘')
    .replace(/'/g, '’');
}

/**
 * Splits a fix's "how" into its advice and an optional Before / After rewrite,
 * so a long answer doesn't print as one wall of text.
 * @returns {{text: string, before: string, after: string}}
 */
export function splitFix(how) {
  const s = curly(String(how || '').trim());
  const m = /^(.*?)\s*Before:\s*(.+?)\s*After:\s*(.+)$/is.exec(s);
  if (!m) return { text: s, before: '', after: '' };
  // drop the quote marks around a quoted rewrite; leave anything else as written
  const clean = (t) => { const q = /^[‘“](.*)[’”]\.?$/s.exec(t.trim()); return q ? q[1].trim() : t.trim(); };
  return { text: m[1].trim(), before: clean(m[2]), after: clean(m[3]) };
}

/** A roast line ready to print inside a quote card. */
export function quoteLine(line) {
  const s = curly(String(line).trim());
  return /^[“‘]/.test(s) ? s : `“${s}”`;
}
