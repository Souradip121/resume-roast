// Resume Roast: wiring for the three screens.
import { HEAT, DEFAULT_HEAT, buildPrompt } from './prompt.js';
import { parseRoast } from './parse.js';
import { PROVIDERS, askRoast } from './ai.js';
import { readResumeFile, cleanText, resumeSignals, scrubContacts, capText, redactionList } from './resume.js';
import { renderCard } from './card.js';
import { DEMO } from './demo.js';
import { quoteLine, splitFix } from './quotes.js';

const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const wait = ms => new Promise(r => setTimeout(r, reduceMotion.matches ? 0 : ms));

// ---------- state ----------
// The key lives in this object and in sessionStorage (cleared when the tab closes).
// It is never written anywhere else and only ever sent to the provider's own API.
const store = {
  get(k) { try { return sessionStorage.getItem(`roast.${k}`); } catch { return null; } },
  set(k, v) { try { v ? sessionStorage.setItem(`roast.${k}`, v) : sessionStorage.removeItem(`roast.${k}`); } catch { /* private mode */ } },
};
const savedHeat = parseInt(store.get('heat'), 10);
const state = {
  provider: PROVIDERS[store.get('provider')] ? store.get('provider') : 'claude',
  keys: { openai: store.get('key.openai') || '', gemini: store.get('key.gemini') || '', claude: store.get('key.claude') || '' },
  models: {
    openai: store.get('model.openai') || PROVIDERS.openai.model,
    gemini: store.get('model.gemini') || PROVIDERS.gemini.model,
    claude: store.get('model.claude') || PROVIDERS.claude.model,
  },
  heat: savedHeat >= 1 && savedHeat <= 5 ? savedHeat : DEFAULT_HEAT,
  resume: null, // { text, name, pages, kind, sample }
  anyway: false, // the user chose to roast something that doesn't look like a resume
  result: null,
  source: null, // 'api' | 'paste' | 'demo'
  by: '',
  controller: null,
  cardUrl: null,
};

// ---------- screens + history ----------
const screens = { start: $('#screen-start'), roast: $('#screen-roast'), fixes: $('#screen-fixes') };
let current = 'start';

function show(name, { push = true, focus = true } = {}) {
  if (name === 'fixes' && !state.result) name = state.resume ? 'roast' : 'start';
  if (name === 'roast' && !state.result && !readyToRoast()) name = 'start';
  current = name;
  for (const [k, el] of Object.entries(screens)) el.hidden = k !== name;
  const el = screens[name];
  el.classList.remove('enter');
  void el.offsetWidth;
  el.classList.add('enter');
  $('#back').hidden = name === 'start';
  if (push) history.pushState({ screen: name }, '', name === 'start' ? location.pathname + location.search : `#${name}`);
  window.scrollTo(0, 0);
  if (focus) $('.screen-title', el).focus({ preventScroll: true });
}

history.replaceState({ screen: 'start' }, '', location.pathname + location.search);
addEventListener('popstate', (e) => show(e.state?.screen || 'start', { push: false }));
$('#back').addEventListener('click', () => {
  if (history.state?.screen && history.state.screen !== 'start') history.back();
  else show('start');
});

// ---------- heat: the chillies ----------
function chiliButton(n, size) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'chili-btn';
  b.dataset.n = String(n);
  b.setAttribute('role', 'radio');
  b.setAttribute('aria-label', `${n} of 5: ${HEAT[n].name}`);
  if (size) b.style.setProperty('--s', `${size}px`);
  b.innerHTML = '<svg aria-hidden="true"><use href="#chili"/></svg>';
  return b;
}

function buildHeatRow(root, { mini = false } = {}) {
  for (let n = 1; n <= 5; n++) root.append(chiliButton(n));
  if (mini) {
    const name = document.createElement('span');
    name.className = 'hm-name';
    name.setAttribute('aria-hidden', 'true');
    root.append(name);
  }
  root.addEventListener('click', (e) => {
    const b = e.target.closest('.chili-btn');
    if (b) setHeat(+b.dataset.n, { animate: true });
  });
  root.addEventListener('keydown', (e) => {
    let j = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') j = Math.min(5, state.heat + 1);
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') j = Math.max(1, state.heat - 1);
    if (e.key === 'Home') j = 1;
    if (e.key === 'End') j = 5;
    if (j !== null) {
      e.preventDefault();
      setHeat(j, { animate: true });
      $(`.chili-btn[data-n="${j}"]`, root).focus();
    }
  });
}
buildHeatRow($('#heat-mini'), { mini: true });
buildHeatRow($('#spice-row'));

function setHeat(n, { animate = false } = {}) {
  const prev = state.heat;
  state.heat = n;
  store.set('heat', String(n));
  const h = HEAT[n];
  for (const row of [$('#heat-mini'), $('#spice-row')]) {
    for (const b of $$('.chili-btn', row)) {
      const k = +b.dataset.n;
      const lit = k <= n;
      const was = b.dataset.lit === 'true';
      b.dataset.lit = String(lit);
      b.setAttribute('aria-checked', String(k === n));
      b.tabIndex = k === n ? 0 : -1;
      if (animate && lit && (!was || k === n) && !reduceMotion.matches) {
        b.classList.remove('pop');
        void b.offsetWidth;
        b.style.animationDelay = '';
        $('svg', b).style.animationDelay = `${Math.max(0, k - Math.min(prev, n)) * 45}ms`;
        b.classList.add('pop');
      }
    }
  }
  $('#heat-mini .hm-name').innerHTML = `<small>Heat</small>${h.name}`;
  $('#spice').dataset.heat = String(n);
  $('#spice-n').textContent = String(n);
  $('#spice-name').textContent = h.name;
  $('#spice-tone').textContent = h.tone;
  // the badge on the label
  const [a, b] = h.badge;
  const t1 = $('#hb-1');
  const t2 = $('#hb-2');
  t1.textContent = a;
  t2.textContent = b || '';
  t1.setAttribute('y', b ? '190' : '199');
  t2.setAttribute('dy', b ? '17' : '0');
  $('.hb-text').style.fontSize = b || a.length > 4 ? '13.5px' : '16px';
  if (animate && prev !== n && !reduceMotion.matches) {
    const badge = $('#heat-badge');
    badge.classList.remove('stamp');
    void badge.getBoundingClientRect();
    badge.classList.add('stamp');
  }
  if (!$('#prompt-box').hidden) $('#prompt-text').textContent = buildPrompt(n);
}

// ---------- route A: copy the prompt ----------
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch { /* in-app browsers often block this; fall back */ }
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.position = 'fixed';
  ta.style.top = '0';
  ta.style.opacity = '0';
  document.body.append(ta);
  ta.select();
  ta.setSelectionRange(0, text.length);
  let ok = false;
  try { ok = document.execCommand('copy'); } catch { ok = false; }
  ta.remove();
  return ok;
}

function openPrompt(open) {
  const box = $('#prompt-box');
  box.hidden = !open;
  if (open) $('#prompt-text').textContent = buildPrompt(state.heat);
  const t = $('#prompt-toggle');
  t.setAttribute('aria-expanded', String(open));
  t.textContent = open ? 'Hide the prompt' : 'Read the prompt';
}
$('#prompt-toggle').addEventListener('click', () => openPrompt($('#prompt-box').hidden));

let copyTimer;
$('#copy').addEventListener('click', async (e) => {
  const btn = e.currentTarget;
  const status = $('#copy-status');
  const ok = await copyText(buildPrompt(state.heat));
  status.classList.remove('bad');
  if (ok) {
    btn.classList.add('done');
    $('.label', btn).textContent = 'Copied!';
    $('use', btn).setAttribute('href', '#i-check');
    status.textContent = `Copied, at ${HEAT[state.heat].name.toLowerCase()} heat. Open ChatGPT, Gemini or Claude, attach your resume, paste, send.`;
    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => {
      btn.classList.remove('done');
      $('.label', btn).textContent = 'Copy prompt';
      $('use', btn).setAttribute('href', '#i-copy');
    }, 2400);
  } else {
    openPrompt(true);
    const range = document.createRange();
    range.selectNodeContents($('#prompt-text'));
    const sel = getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    status.textContent = 'Your browser blocked copying. The prompt is selected below: tap Copy in the menu.';
    status.classList.add('bad');
  }
});

$('#paste-toggle').addEventListener('click', (e) => {
  const box = $('#paste-box');
  box.hidden = !box.hidden;
  e.currentTarget.setAttribute('aria-expanded', String(!box.hidden));
  if (!box.hidden) $('#answer').focus();
});

function answerNote(text, bad = false) {
  const n = $('#answer-note');
  n.textContent = text;
  n.classList.toggle('bad', bad);
}
$('#answer').addEventListener('input', () => answerNote(''));
$('#show-answer').addEventListener('click', () => {
  try {
    const r = parseRoast($('#answer').value, { heat: state.heat });
    answerNote('');
    setHeat(r.heat);
    showResult(r, { source: 'paste', by: 'From the answer you pasted' });
  } catch (err) {
    answerNote(err.message, true);
    $('#answer').focus();
  }
});

// ---------- route B: provider + key ----------
const keyInput = $('#key');
const keyError = $('#key-error');
const article = label => (/^[AEIOU]/.test(label) ? 'an' : 'a');

function selectProvider(id, { focus = false } = {}) {
  state.provider = id;
  store.set('provider', id);
  const p = PROVIDERS[id];
  for (const b of $$('.prov')) {
    const on = b.dataset.provider === id;
    b.setAttribute('aria-checked', String(on));
    b.tabIndex = on ? 0 : -1;
    if (on && focus) b.focus();
  }
  keyInput.value = state.keys[id];
  keyInput.placeholder = p.keyHint;
  keyInput.setAttribute('aria-label', `${p.label} API key`);
  const get = $('#get-key');
  get.href = p.keyUrl;
  get.firstChild.textContent = `Get ${article(p.label)} ${p.label} key`;
  $('#model-name').textContent = state.models[id];
  $('#model').value = state.models[id];
  $('#forget').hidden = !state.keys[id];
  clearKeyError();
  syncNext();
}

$('.providers').addEventListener('click', (e) => {
  const b = e.target.closest('.prov');
  if (b) selectProvider(b.dataset.provider);
});
$('.providers').addEventListener('keydown', (e) => {
  const ids = Object.keys(PROVIDERS);
  const i = ids.indexOf(state.provider);
  let j = null;
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') j = (i + 1) % ids.length;
  if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') j = (i + ids.length - 1) % ids.length;
  if (j !== null) { e.preventDefault(); selectProvider(ids[j], { focus: true }); }
});

export function detectProvider(key) {
  if (/^sk-ant-/.test(key)) return 'claude';
  if (/^AIza/.test(key)) return 'gemini';
  if (/^sk-/.test(key)) return 'openai';
  return null;
}

function clearKeyError() {
  keyError.hidden = true;
  keyError.textContent = '';
  $('.keyfield').classList.remove('invalid');
}
function showKeyError(msg) {
  keyError.textContent = msg;
  keyError.hidden = false;
  $('.keyfield').classList.add('invalid');
}

keyInput.addEventListener('input', () => {
  const key = keyInput.value.trim();
  const guess = detectProvider(key);
  if (guess && guess !== state.provider) {
    // the key says which AI it belongs to; follow it
    state.keys[state.provider] = '';
    store.set(`key.${state.provider}`, '');
    state.keys[guess] = key;
    selectProvider(guess);
    keyInput.value = key;
  }
  state.keys[state.provider] = key;
  store.set(`key.${state.provider}`, key);
  $('#forget').hidden = !key;
  clearKeyError();
  syncNext();
});

$('#eye').addEventListener('click', (e) => {
  const showing = keyInput.type === 'text';
  keyInput.type = showing ? 'password' : 'text';
  e.currentTarget.setAttribute('aria-pressed', String(!showing));
  e.currentTarget.setAttribute('aria-label', showing ? 'Show key' : 'Hide key');
  $('use', e.currentTarget).setAttribute('href', showing ? '#i-eye' : '#i-eye-off');
});

$('#forget').addEventListener('click', () => {
  state.keys[state.provider] = '';
  store.set(`key.${state.provider}`, '');
  keyInput.value = '';
  $('#forget').hidden = true;
  keyInput.focus();
  syncNext();
});

$('#model-toggle').addEventListener('click', (e) => {
  const box = $('#model-box');
  box.hidden = !box.hidden;
  e.currentTarget.setAttribute('aria-expanded', String(!box.hidden));
  if (!box.hidden) $('#model').focus();
});
$('#model').addEventListener('input', (e) => {
  const v = e.target.value.trim() || PROVIDERS[state.provider].model;
  state.models[state.provider] = v;
  store.set(`model.${state.provider}`, v === PROVIDERS[state.provider].model ? '' : v);
  $('#model-name').textContent = v;
});

function keyProblem() {
  const key = state.keys[state.provider];
  const label = PROVIDERS[state.provider].label;
  if (!key) return `Paste your ${label} API key first, or use “Copy the prompt” instead.`;
  if (/\s/.test(key)) return 'That key has a space in it. Copy it again without spaces.';
  const short = { openai: 40, gemini: 30, claude: 40 }[state.provider];
  if (key.length < short) return `That looks too short for ${article(label)} ${label} key. Copy the whole thing.`;
  return '';
}

// ---------- the resume ----------
const drop = $('#drop');
function setNote(text, kind = '') {
  const n = $('#parse-note');
  n.textContent = text;
  n.classList.toggle('bad', kind === 'bad');
  n.classList.toggle('ok', kind === 'ok');
}

function describeResume(r) {
  const words = r.text.split(/\s+/).filter(Boolean).length;
  const pages = r.pages ? `${r.pages} page${r.pages === 1 ? '' : 's'} · ` : '';
  return `${pages}${words.toLocaleString('en-IN')} words read`;
}

function setResume(r) {
  state.resume = r;
  state.anyway = false;
  if (!r) {
    $('#filechip').hidden = true;
    drop.classList.remove('has-file');
    setNote('');
  } else {
    const sig = resumeSignals(r.text);
    const what = r.sample ? ' · a made-up sample' : '';
    if (sig < 3) setNote(`${describeResume(r)}. This doesn’t look much like a resume. Check it’s the right file.`, 'bad');
    else setNote(`${describeResume(r)}${what}`, 'ok');
  }
  syncNext();
}

function clearFile() {
  $('#file').value = '';
  $('#filechip').hidden = true;
  drop.classList.remove('has-file');
  if (state.resume?.kind !== 'pasted') setResume(null);
}

async function handleFile(file, { sample = false } = {}) {
  if (!file) return;
  $('#filename').textContent = file.name || 'resume';
  $('#filechip').hidden = false;
  drop.classList.add('has-file');
  setNote('Reading your resume…');
  state.resume = null;
  syncNext();
  try {
    const r = await readResumeFile(file);
    setResume({ ...r, name: file.name || 'resume', sample });
    // a file wins over pasted text
    $('#resume-text').value = '';
  } catch (err) {
    state.resume = null;
    setNote(err.message || 'Couldn’t read that file. Add a PDF or a .txt, or paste the text.', 'bad');
    syncNext();
  }
}

$('#file').addEventListener('change', (e) => handleFile(e.target.files[0]));
for (const ev of ['dragenter', 'dragover']) drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('over'); });
for (const ev of ['dragleave', 'dragend']) drop.addEventListener(ev, () => drop.classList.remove('over'));
drop.addEventListener('drop', (e) => {
  e.preventDefault();
  drop.classList.remove('over');
  handleFile(e.dataTransfer?.files?.[0]);
});
$('#file-remove').addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); clearFile(); $('#file').focus(); });

$('#paste-text-toggle').addEventListener('click', (e) => {
  const box = $('#paste-text-box');
  box.hidden = !box.hidden;
  e.currentTarget.setAttribute('aria-expanded', String(!box.hidden));
  if (!box.hidden) $('#resume-text').focus();
});
let pasteTimer;
$('#resume-text').addEventListener('input', (e) => {
  clearTimeout(pasteTimer);
  pasteTimer = setTimeout(() => {
    const text = cleanText(e.target.value);
    if (!text) { if (state.resume?.kind === 'pasted') setResume(null); return; }
    $('#file').value = '';
    $('#filechip').hidden = true;
    drop.classList.remove('has-file');
    setResume({ text, pages: 0, kind: 'pasted', name: 'pasted text' });
  }, 250);
});

$('#sample').addEventListener('click', async () => {
  setNote('Loading the made-up resume…');
  try {
    const res = await fetch('samples/sample-resume.pdf');
    if (!res.ok) throw new Error(String(res.status));
    const blob = await res.blob();
    await handleFile(new File([blob], 'resume_final_v7.pdf', { type: 'application/pdf' }), { sample: true });
  } catch {
    setNote('Couldn’t load the sample. Check your connection and try again.', 'bad');
  }
});

function readyToRoast() {
  return Boolean(state.resume && !keyProblem());
}
function syncNext() {
  $('#to-roast').setAttribute('aria-disabled', String(!readyToRoast()));
}

$('#to-roast').addEventListener('click', () => {
  const kp = keyProblem();
  if (kp) {
    showKeyError(kp);
    keyInput.focus();
    keyInput.scrollIntoView({ block: 'center', behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    return;
  }
  if (!state.resume) {
    setNote('Add your resume first: tap the box above and pick the PDF, or paste the text.', 'bad');
    $('#file').focus();
    drop.scrollIntoView({ block: 'center', behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    return;
  }
  if (resumeSignals(state.resume.text) < 3 && !state.anyway) {
    state.anyway = true;
    setNote('This doesn’t look like a resume (no education, skills or projects found). Tap again to roast it anyway, or pick another file.', 'bad');
    $('#to-roast span').textContent = 'Roast it anyway';
    return;
  }
  resetRoast();
  show('roast');
});

// ---------- screen 2: the roast ----------
const COOK_LINES = ['Reading your resume…', 'Counting the buzzwords…', 'Finding the to-do apps…', 'Sharpening the jokes…', 'Plating the roast…'];

function resetRoast() {
  state.controller?.abort();
  state.result = null;
  state.source = null;
  $('#spice').classList.remove('locked');
  for (const b of $$('#spice-row .chili-btn')) b.disabled = false;
  $('#ready').hidden = false;
  $('#cooking').hidden = true;
  $('#oops').hidden = true;
  $('#ribbon').hidden = true;
  $('#quotes').replaceChildren();
  $('#by').textContent = '';
  $('#to-fixes').hidden = true;
  $('#to-roast span').textContent = 'Next: pick the heat';
  const r = state.resume;
  const via = PROVIDERS[state.provider].label;
  const ready = $('#ready-file');
  ready.replaceChildren();
  if (r) {
    const b = document.createElement('b');
    b.textContent = r.kind === 'pasted' ? 'Your pasted resume' : r.name;
    ready.append(b, ` · ${describeResume(r).replace(' read', '')} · goes to ${via}`);
  }
}

function lockSpice() {
  $('#spice').classList.add('locked');
  for (const b of $$('#spice-row .chili-btn')) b.disabled = true;
}

function seal() {
  const s = document.createElement('div');
  s.className = 'q-seal';
  s.setAttribute('aria-hidden', 'true');
  s.innerHTML = '<svg class="qs-ring"><use href="#burst"/></svg><svg class="qs-fill"><use href="#burst"/></svg><svg class="qs-chili"><use href="#chili"/></svg>';
  return s;
}

async function renderQuotes(lines, { animate = true } = {}) {
  const ol = $('#quotes');
  ol.replaceChildren();
  for (const [i, line] of lines.entries()) {
    const li = document.createElement('li');
    li.className = 'quote';
    const p = document.createElement('p');
    p.className = 'q-text';
    for (const part of quoteLine(line).split(/(\S*\w-\w\S*)/)) {
      if (!part) continue;
      if (/\w-\w/.test(part)) {
        const nw = document.createElement('span');
        nw.className = 'nw';
        nw.textContent = part;
        p.append(nw);
      } else p.append(part);
    }
    li.append(seal(), p);
    if (animate && !reduceMotion.matches) {
      li.classList.add('stamp');
      li.style.animationDelay = `${i * 260}ms`;
    }
    ol.append(li);
  }
  if (animate) await wait(lines.length * 260 + 300);
}

async function showResult(r, { source, by }) {
  state.result = r;
  state.source = source;
  state.by = by;
  resetRoastView();
  lockSpice();
  if (current !== 'roast') show('roast');
  $('#ribbon').hidden = source !== 'demo';
  $('#ribbon').textContent = 'Example: a made-up resume';
  await renderQuotes(r.roast);
  $('#by').textContent = by;
  $('#to-fixes').hidden = false;
}

function resetRoastView() {
  $('#ready').hidden = true;
  $('#cooking').hidden = true;
  $('#oops').hidden = true;
  $('#quotes').replaceChildren();
  $('#by').textContent = '';
  $('#to-fixes').hidden = true;
}

let cookTimer;
function startCooking() {
  $('#ready').hidden = true;
  $('#oops').hidden = true;
  $('#cooking').hidden = false;
  let i = 0;
  const line = $('#cook-line');
  line.textContent = COOK_LINES[0];
  clearInterval(cookTimer);
  cookTimer = setInterval(() => { i = Math.min(i + 1, COOK_LINES.length - 1); line.textContent = COOK_LINES[i]; }, 1500);
}
function stopCooking() {
  clearInterval(cookTimer);
  $('#cooking').hidden = true;
}

async function runRoast() {
  state.controller?.abort();
  const ctl = new AbortController();
  state.controller = ctl;
  lockSpice();
  startCooking();
  const provider = state.provider;
  const model = state.models[provider];
  try {
    const { text } = capText(scrubContacts(state.resume.text));
    const r = await askRoast({ provider, key: state.keys[provider], model, text, heat: state.heat, signal: ctl.signal });
    if (ctl.signal.aborted) return;
    stopCooking();
    await showResult(r, { source: 'api', by: `Roasted by ${PROVIDERS[provider].label} · ${model}` });
  } catch (err) {
    if (ctl.signal.aborted || err.kind === 'cancelled') return;
    stopCooking();
    showOops(err);
  }
}

function showOops(err) {
  $('#spice').classList.remove('locked');
  for (const b of $$('#spice-row .chili-btn')) b.disabled = false;
  $('#oops-msg').textContent = err.message || 'Something went wrong. Try again.';
  const toKey = ['key', 'quota', 'model', 'region', 'openai-refused'].includes(err.kind);
  const toFile = err.kind === 'not-resume';
  $('#oops-back-label').textContent = toKey ? 'Change key' : toFile ? 'Change resume' : 'Back';
  $('#oops').dataset.back = toKey ? 'key' : toFile ? 'file' : 'start';
  $('#retry').hidden = err.kind === 'not-resume';
  // when retrying can't help (bad key), the way out is the main button
  const backFirst = toKey || toFile;
  $('#oops-back').className = `btn ${backFirst ? 'btn-red' : 'btn-yellow'}`;
  $('#retry').className = `btn ${backFirst ? 'btn-yellow' : 'btn-red'}`;
  $('.oops-actions').prepend(backFirst ? $('#oops-back') : $('#retry'));
  $('#oops').hidden = false;
  $('#ready').hidden = true;
}

$('#roast').addEventListener('click', runRoast);
$('#retry').addEventListener('click', runRoast);
$('#cancel').addEventListener('click', () => {
  state.controller?.abort();
  stopCooking();
  resetRoast();
});
$('#oops-back').addEventListener('click', () => {
  const to = $('#oops').dataset.back;
  show('start');
  if (to === 'key') { keyInput.focus(); keyInput.select(); keyInput.scrollIntoView({ block: 'center' }); }
  if (to === 'file') { $('#file').focus(); drop.scrollIntoView({ block: 'center' }); }
});
$('#to-fixes').addEventListener('click', () => { show('fixes'); renderFixes(); });

$('#demo').addEventListener('click', () => {
  setHeat(DEMO.heat);
  showResult(DEMO, { source: 'demo', by: 'This example is written in the app’s voice. Your roast will be about your resume.' });
});

// ---------- screen 3: score + fixes ----------
function countUp(el, to) {
  const fmt = v => (Number.isInteger(to) ? String(Math.round(v)) : (Math.round(v * 2) / 2).toFixed(1));
  if (reduceMotion.matches) { el.textContent = fmt(to); return; }
  const t0 = performance.now();
  const dur = 1000;
  const step = (now) => {
    const k = Math.min(1, (now - t0) / dur);
    const e = 1 - Math.pow(1 - k, 4);
    el.textContent = k < 1 ? (to * e).toFixed(1).replace(/\.0$/, Number.isInteger(to) ? '' : '.0') : fmt(to);
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function renderFixes() {
  const r = state.result;
  if (!r) return;
  const burst = $('.score-burst');
  burst.classList.remove('in');
  void burst.offsetWidth;
  if (!reduceMotion.matches) burst.classList.add('in');
  countUp($('#score-n'), r.score);
  $('#verdict').textContent = r.verdict;
  $('#fixes').replaceChildren(...r.fixes.map((f, i) => {
    const li = document.createElement('li');
    li.className = 'fix';
    const n = document.createElement('span');
    n.className = 'fix-n';
    n.setAttribute('aria-hidden', 'true');
    n.textContent = String(i + 1);
    const body = document.createElement('div');
    const t = document.createElement('p');
    t.className = 'fix-title';
    t.textContent = f.title;
    body.append(t);
    const how = splitFix(f.how);
    if (how.text) {
      const h = document.createElement('p');
      h.className = 'fix-how';
      h.textContent = how.text;
      body.append(h);
    }
    if (how.before || how.after) {
      const dl = document.createElement('dl');
      dl.className = 'fix-ba';
      for (const [tag, text] of [['Before', how.before], ['After', how.after]]) {
        if (!text) continue;
        const dt = document.createElement('dt');
        dt.textContent = tag;
        dt.className = tag === 'After' ? 'after' : '';
        const dd = document.createElement('dd');
        dd.textContent = text;
        dl.append(dt, dd);
      }
      body.append(dl);
    }
    li.append(n, body);
    if (!reduceMotion.matches) {
      li.classList.add('stamp');
      li.style.animationDelay = `${450 + i * 220}ms`;
    }
    return li;
  }));
}

$('#again').addEventListener('click', () => {
  if (state.source === 'api' && readyToRoast()) {
    resetRoast();
    show('roast');
  } else {
    state.result = null;
    state.source = null;
    show('start');
  }
});

// ---------- share ----------
const sheet = $('#sheet');
async function drawCard() {
  const r = state.result;
  const hide = $('#optin').checked ? [] : redactionList(r.redact, state.source === 'api' ? state.resume?.text : '');
  const blob = await renderCard({ result: r, hide, example: state.source === 'demo' });
  if (state.cardUrl) URL.revokeObjectURL(state.cardUrl);
  state.cardUrl = URL.createObjectURL(blob);
  const img = new Image();
  img.className = 'sheet-img';
  img.id = 'sheet-img';
  img.alt = `Your roast card: ${r.score} out of 10, two roast lines and the three fixes.`;
  img.src = state.cardUrl;
  $('#sheet-frame').replaceChildren(img);
  $('#download').href = state.cardUrl;
  const file = new File([blob], 'resume-roast.png', { type: 'image/png' });
  const canShare = Boolean(navigator.canShare && navigator.canShare({ files: [file] }));
  const native = $('#native-share');
  native.hidden = !canShare;
  native.onclick = async () => {
    try { await navigator.share({ files: [file], title: 'Resume Roast' }); } catch { /* closed the sheet */ }
  };
}
$('#share').addEventListener('click', async (e) => {
  const btn = e.currentTarget;
  btn.setAttribute('aria-busy', 'true');
  try {
    await drawCard();
    if (typeof sheet.showModal === 'function') sheet.showModal();
    else $('#download').click();
  } finally {
    btn.removeAttribute('aria-busy');
  }
});
$('#optin').addEventListener('change', drawCard);
$('#sheet-close').addEventListener('click', () => sheet.close());
sheet.addEventListener('click', (e) => { if (e.target === sheet) sheet.close(); });

// ---------- boot ----------
selectProvider(state.provider);
setHeat(state.heat);
syncNext();
