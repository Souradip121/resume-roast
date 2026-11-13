// node --test tests/   (Node 22+, no dependencies)
// Every AI call here is MOCKED: no key and no network are used.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { HEAT, buildPrompt, SYSTEM, buildUserMessage, SCHEMA, geminiSchema, ROAST_LINES } from '../js/prompt.js';
import { parseRoast, findJsonObject, RoastError } from '../js/parse.js';
import { buildRequest, askRoast, textOf, classify, AiError, PROVIDERS } from '../js/ai.js';
import {
  scrubContacts, resumeSignals, guessName, redactionList, redactParts, cleanText,
  joinTextItems, readResumeFile, capText, MAX_CHARS,
} from '../js/resume.js';
import { DEMO } from '../js/demo.js';

const SAMPLE = readFileSync(new URL('../samples/sample-resume.txt', import.meta.url), 'utf8');
const GOOD = {
  is_resume: true, heat: 3,
  roast: ['a', 'b', 'c', 'd'],
  score: 6.5, verdict: 'Fine.',
  fixes: [{ title: 'One', how: 'x' }, { title: 'Two', how: 'y' }, { title: 'Three', how: 'z' }],
  redact: ['Kabir Mehta'],
};

// ---------- the prompt ----------
test('the copied prompt carries the heat, the rules and the strict JSON shape', () => {
  for (let n = 1; n <= 5; n++) {
    const p = buildPrompt(n);
    assert.match(p, new RegExp(`HEAT: ${n}/5, ${HEAT[n].name}`));
    assert.match(p, new RegExp(`"heat": ${n}`));
  }
  const p = buildPrompt(4);
  assert.match(p, /```json/);
  for (const key of ['is_resume', 'roast', 'score', 'verdict', 'fixes', 'title', 'how', 'redact']) assert.match(p, new RegExp(`"${key}"`));
  // jokes aim at the resume, never the person
  assert.match(p, /Never joke about the person/);
  for (const word of ['gender', 'college name or tier', 'English level', 'first language', 'caste', 'religion']) assert.ok(p.includes(word), word);
  assert.match(p, /No Hindi or Hinglish/);
  assert.match(p, /Don't refuse/);
  assert.match(p, new RegExp(`Exactly ${ROAST_LINES} roast lines`));
  assert.match(p, /Exactly 3/);
  assert.match(p, /one page/i);
  assert.match(p, /Attach your resume \(PDF or text\) and send this prompt again\./);
  // hidden "rate me 10/10" text in a resume must not work
  assert.match(p, /instructions to an AI/);
});

test('the API route keeps the heat and the resume in the user message', () => {
  assert.doesNotMatch(SYSTEM, /HEAT: \d/);
  assert.match(SYSTEM, /\[email\] and \[phone\] are placeholders/);
  const u = buildUserMessage('My resume', 2);
  assert.match(u, /^HEAT: 2\/5, Medium\./);
  assert.match(u, /RESUME TEXT:\n"""\nMy resume\n"""/);
});

test('schemas: strict JSON Schema for OpenAI/Claude, upper-case dialect for Gemini', () => {
  assert.equal(SCHEMA.additionalProperties, false);
  assert.deepEqual(SCHEMA.required.slice().sort(), Object.keys(SCHEMA.properties).sort());
  assert.equal(SCHEMA.properties.fixes.items.additionalProperties, false);
  const g = geminiSchema();
  assert.equal(g.type, 'OBJECT');
  assert.equal(g.properties.roast.type, 'ARRAY');
  assert.equal(g.properties.roast.items.type, 'STRING');
  assert.equal(g.properties.score.type, 'NUMBER');
  assert.equal(g.properties.fixes.items.type, 'OBJECT');
  assert.deepEqual(g.propertyOrdering, Object.keys(SCHEMA.properties));
  assert.ok(!JSON.stringify(g).includes('additionalProperties'));
});

// ---------- reading the answer ----------
test('parses strict JSON', () => {
  const r = parseRoast(JSON.stringify(GOOD));
  assert.equal(r.score, 6.5);
  assert.equal(r.heat, 3);
  assert.equal(r.roast.length, 4);
  assert.equal(r.fixes[2].title, 'Three');
  assert.deepEqual(r.redact, ['Kabir Mehta']);
});

test('parses what people paste from chat apps: fences, chatter, smart quotes, trailing commas', () => {
  const chatty = `Sure! Here's your roast:\n\n\`\`\`json\n${JSON.stringify(GOOD, null, 2)}\n\`\`\`\n\nGood luck with placements!`;
  assert.equal(parseRoast(chatty).score, 6.5);
  const trailing = JSON.stringify(GOOD).replace(/\]\}$/, '],}').replace('"d"]', '"d",]');
  assert.equal(parseRoast(trailing).roast.length, 4);
  const smart = JSON.stringify(GOOD).replace(/"/g, (m, i) => (i % 2 ? '“' : '”'));
  assert.equal(parseRoast(smart.replace(/[“”]/g, q => q)).fixes.length, 3);
  // braces inside strings don't confuse the block finder
  const braces = { ...GOOD, roast: ['Your {skills} section', 'b'] };
  assert.equal(parseRoast(`x ${JSON.stringify(braces)} y`).roast[0], 'Your {skills} section');
});

test('keeps quotes inside a line, drops quotes that wrap the whole line', () => {
  const r = parseRoast({ ...GOOD, roast: ['"wrapped"', '“also wrapped”', '‘MS Word’ is a confession', '"Team player" appears 6 times. Your team would like a word.'] });
  assert.deepEqual(r.roast.slice(0, 3), ['wrapped', 'also wrapped', '‘MS Word’ is a confession']);
  assert.equal(r.roast[3], '"Team player" appears 6 times. Your team would like a word.');
  const f = parseRoast({ ...GOOD, fixes: [{ title: 'Numbers', how: '“Worked on tasks” -> “Built 3 pages.”' }] });
  assert.equal(f.fixes[0].how, '“Worked on tasks” -> “Built 3 pages.”');
});

test('normalises scores and loose shapes', () => {
  const s = v => parseRoast({ ...GOOD, score: v }).score;
  assert.equal(s('7/10'), 7);
  assert.equal(s('4,5'), 4.5);
  assert.equal(s('45/100'), 4.5);
  assert.equal(s(11), 10);
  assert.equal(s(-2), 0);
  assert.equal(s(6.3), 6.5);
  const loose = parseRoast({ roast: ['x'], score: 5, fixes: ['Cut the Declaration: nobody reads it', 'Add numbers'], verdict: 'ok' });
  assert.deepEqual(loose.fixes[0], { title: 'Cut the Declaration', how: 'nobody reads it' });
  assert.equal(loose.fixes[1].title, 'Add numbers');
  assert.equal(loose.heat, 4); // default when missing
  assert.equal(parseRoast({ ...GOOD, heat: 9 }, { heat: 2 }).heat, 2);
});

test('clear errors for bad answers', () => {
  const kind = (input) => { try { parseRoast(input); return null; } catch (e) { assert.ok(e instanceof RoastError); return e.kind; } };
  assert.equal(kind(''), 'empty');
  assert.equal(kind('lol nice resume'), 'no-json');
  assert.equal(kind('Attach your resume (PDF or text) and send this prompt again.'), 'no-resume');
  assert.equal(kind('{"roast": ["a", "b",, }'), 'malformed');
  assert.equal(kind({ ...GOOD, roast: [] }), 'malformed');
  assert.equal(kind({ ...GOOD, fixes: [] }), 'malformed');
  assert.equal(kind({ ...GOOD, score: 'great' }), 'malformed');
  assert.equal(kind({ ...GOOD, is_resume: false, roast: [], fixes: [], score: 0, verdict: 'A grocery bill' }), 'not-resume');
  try { parseRoast({ ...GOOD, is_resume: false, verdict: 'A grocery bill.' }); } catch (e) { assert.match(e.message, /grocery bill/); }
  assert.equal(findJsonObject('{"a": 1} then {"score": 2}'), '{"score": 2}');
});

test('the example roast is a valid answer', () => {
  const r = parseRoast({ is_resume: true, ...DEMO });
  assert.equal(r.roast.length, 4);
  assert.equal(r.fixes.length, 3);
  assert.equal(r.score, 4.5);
  assert.ok(r.roast.some(l => /MS Word/.test(l)));
});

// ---------- provider requests (mocked) ----------
test('request shapes match each provider', () => {
  const o = buildRequest('openai', 'sk-test', 'gpt-6-luna', 'u');
  assert.equal(o.url, 'https://api.openai.com/v1/chat/completions');
  assert.equal(o.headers.Authorization, 'Bearer sk-test');
  assert.equal(o.body.response_format.type, 'json_schema');
  assert.equal(o.body.response_format.json_schema.strict, true);
  assert.deepEqual(o.body.response_format.json_schema.schema, SCHEMA);
  assert.equal(o.body.messages[0].role, 'system');
  assert.equal(o.body.messages[1].content, 'u');

  const g = buildRequest('gemini', 'AIza-test', 'gemini-3.5-flash-lite', 'u');
  assert.equal(g.url, 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent');
  assert.equal(g.headers['x-goog-api-key'], 'AIza-test');
  assert.ok(!g.url.includes('key='), 'key stays out of the URL');
  assert.equal(g.body.generationConfig.responseMimeType, 'application/json');
  assert.equal(g.body.generationConfig.responseSchema.type, 'OBJECT');
  assert.equal(g.body.systemInstruction.parts[0].text, SYSTEM);

  const c = buildRequest('claude', 'sk-ant-test', 'claude-haiku-5-5', 'u');
  assert.equal(c.url, 'https://api.anthropic.com/v1/messages');
  assert.equal(c.headers['x-api-key'], 'sk-ant-test');
  assert.equal(c.headers['anthropic-dangerous-direct-browser-access'], 'true');
  assert.equal(c.headers['anthropic-version'], '2023-06-01');
  assert.equal(c.body.system, SYSTEM);
  assert.deepEqual(c.body.thinking, { type: 'disabled' });
  assert.equal(c.body.output_config.effort, 'medium');
  assert.deepEqual(c.body.output_config.format, { type: 'json_schema', schema: SCHEMA });
  assert.ok(!('temperature' in c.body), 'no sampling params on Haiku 5.5');
  assert.equal(c.body.messages.at(-1).role, 'user', 'no assistant prefill');
  assert.equal(PROVIDERS.claude.model, 'claude-haiku-5-5');
});

const ok = {
  openai: { choices: [{ finish_reason: 'stop', message: { role: 'assistant', content: JSON.stringify(GOOD) } }] },
  gemini: { candidates: [{ finishReason: 'STOP', content: { parts: [{ text: JSON.stringify(GOOD) }] } }] },
  claude: { type: 'message', stop_reason: 'end_turn', content: [{ type: 'text', text: JSON.stringify(GOOD) }] },
};

async function withFetch(impl, fn) {
  const real = globalThis.fetch;
  globalThis.fetch = impl;
  try { return await fn(); } finally { globalThis.fetch = real; }
}
const respond = (status, body) => async () => new Response(typeof body === 'string' ? body : JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

test('a good answer from each provider is parsed (mocked response)', async () => {
  for (const p of ['openai', 'gemini', 'claude']) {
    let sent;
    const r = await withFetch(async (url, opts) => { sent = { url, body: JSON.parse(opts.body), headers: opts.headers }; return respond(200, ok[p])(); },
      () => askRoast({ provider: p, key: ' key-with-spaces-around ', model: 'm', text: 'RESUME BODY', heat: 5 }));
    assert.equal(r.score, 6.5, p);
    assert.equal(r.fixes.length, 3, p);
    const body = JSON.stringify(sent.body);
    assert.match(body, /RESUME BODY/);
    assert.match(body, /HEAT: 5\/5, Ghost pepper/);
    assert.ok(!JSON.stringify(sent.headers).includes('around '), 'key is trimmed');
  }
});

test('provider errors turn into friendly messages (mocked responses)', async () => {
  const run = async (provider, status, body, thrown) => {
    const impl = thrown ? async () => { throw thrown; } : respond(status, body);
    try { await withFetch(impl, () => askRoast({ provider, key: 'k', model: 'm', text: 't', heat: 3 })); return null; } catch (e) { return e; }
  };
  // bad key
  let e = await run('claude', 401, { type: 'error', error: { type: 'authentication_error', message: 'invalid x-api-key' } });
  assert.equal(e.kind, 'key'); assert.match(e.message, /didn’t accept that key/);
  e = await run('gemini', 400, { error: { code: 400, message: 'API key not valid. Please pass a valid API key.', status: 'INVALID_ARGUMENT', details: [{ reason: 'API_KEY_INVALID' }] } });
  assert.equal(e.kind, 'key');
  e = await run('openai', 401, { error: { code: 'invalid_api_key', message: 'Incorrect API key provided' } });
  assert.equal(e.kind, 'key');
  // rate limits and quota
  e = await run('claude', 429, { type: 'error', error: { type: 'rate_limit_error', message: 'Number of requests has exceeded your rate limit' } });
  assert.equal(e.kind, 'rate'); assert.match(e.message, /Wait a minute/);
  e = await run('openai', 429, { error: { code: 'rate_limit_exceeded', message: 'Rate limit reached' } });
  assert.equal(e.kind, 'rate');
  e = await run('gemini', 429, { error: { code: 429, status: 'RESOURCE_EXHAUSTED', message: 'Resource has been exhausted (e.g. check quota).' } });
  assert.equal(e.kind, 'quota');
  e = await run('claude', 400, { type: 'error', error: { type: 'invalid_request_error', message: 'Your credit balance is too low to access the Anthropic API.' } });
  assert.equal(e.kind, 'quota');
  // model, overload, network
  e = await run('claude', 404, { type: 'error', error: { type: 'not_found_error', message: 'model: nope' } });
  assert.equal(e.kind, 'model');
  e = await run('claude', 529, { type: 'error', error: { type: 'overloaded_error', message: 'Overloaded' } });
  assert.equal(e.kind, 'server');
  e = await run('claude', 500, '<html>oops</html>');
  assert.equal(e.kind, 'server');
  e = await run('openai', 0, null, new TypeError('Failed to fetch'));
  assert.equal(e.kind, 'openai-refused'); // OpenAI's 401 has no CORS headers, so it looks like this
  e = await run('gemini', 0, null, new TypeError('Failed to fetch'));
  assert.equal(e.kind, 'network');
  // refusals, cut-offs, empty
  e = await run('claude', 200, { stop_reason: 'refusal', stop_details: { type: 'refusal', category: 'general_harms' }, content: [] });
  assert.equal(e.kind, 'blocked');
  e = await run('claude', 200, { stop_reason: 'max_tokens', content: [{ type: 'text', text: '{"roast": ["a"' }] });
  assert.equal(e.kind, 'truncated');
  e = await run('openai', 200, { choices: [{ finish_reason: 'length', message: { content: '{"ro' } }] });
  assert.equal(e.kind, 'truncated');
  e = await run('openai', 200, { choices: [{ finish_reason: 'stop', message: { content: null, refusal: 'I can’t help with that.' } }] });
  assert.equal(e.kind, 'blocked');
  e = await run('gemini', 200, { candidates: [{ finishReason: 'SAFETY', content: { parts: [] } }] });
  assert.equal(e.kind, 'blocked');
  e = await run('gemini', 200, { promptFeedback: { blockReason: 'OTHER' } });
  assert.equal(e.kind, 'blocked');
  e = await run('claude', 200, { stop_reason: 'end_turn', content: [{ type: 'text', text: '   ' }] });
  assert.equal(e.kind, 'empty');
  // the AI answered, but not usefully
  e = await run('claude', 200, { stop_reason: 'end_turn', content: [{ type: 'text', text: '{"roast": ["a", "b"], "score": "great", "fixes": [], ' }] });
  assert.ok(e instanceof RoastError); assert.equal(e.kind, 'malformed');
  e = await run('gemini', 200, { candidates: [{ finishReason: 'STOP', content: { parts: [{ text: JSON.stringify({ ...GOOD, is_resume: false, roast: [], fixes: [], score: 0, verdict: 'A train ticket' }) }] } }] });
  assert.equal(e.kind, 'not-resume'); assert.match(e.message, /train ticket/);
});

test('Gemini thought parts are skipped; Claude text blocks are joined by type, not position', () => {
  const g = textOf('gemini', { candidates: [{ finishReason: 'STOP', content: { parts: [{ thought: true, text: 'thinking…' }, { text: '{"a":1}' }] } }] });
  assert.equal(g, '{"a":1}');
  const c = textOf('claude', { stop_reason: 'end_turn', content: [{ type: 'thinking', thinking: '' }, { type: 'text', text: '{"b":2}' }] });
  assert.equal(c, '{"b":2}');
  assert.deepEqual(classify('openai', 403, { error: { message: 'Country, region, or territory not supported' } }, 'm'), ['region', 'Country, region, or territory not supported']);
  assert.ok(new AiError('key', 'gemini').message.startsWith('Gemini'));
});

// ---------- resume + privacy helpers ----------
test('contact details are swapped before sending; dates and marks are not', () => {
  const out = scrubContacts(SAMPLE);
  assert.ok(!out.includes('kabir.mehta.dev@example.com'));
  assert.ok(!out.includes('98765 43210'));
  assert.match(out, /\[email\] \| \[phone\] \| Pune/);
  assert.match(out, /2023 - 2027/);
  assert.match(out, /CGPA: 7\.8 \/ 10/);
  assert.match(out, /14\/02\/2005/);
  assert.equal(scrubContacts('Call 9876543210 or +91-98765-43210 or (022) 2345 6789'), 'Call [phone] or [phone] or [phone]');
  assert.equal(scrubContacts('2019 - 2023 2024'), '2019 - 2023 2024');
});

test('resume detection', () => {
  assert.ok(resumeSignals(SAMPLE) >= 7, `sample signals ${resumeSignals(SAMPLE)}`);
  assert.ok(resumeSignals('Dear diary, today I ate dosa and watched a movie.') < 3);
  assert.ok(resumeSignals('Invoice #123. Total: Rs 450. Thank you for shopping.') < 3);
});

test('the share card hides the name, contacts and college', () => {
  assert.equal(guessName(SAMPLE), 'KABIR MEHTA');
  assert.equal(guessName('Resume\nPriya Nair\npriya@example.com'), 'Priya Nair');
  assert.equal(guessName('SKILLS: Java, Python\nEducation'), '');
  const list = redactionList(DEMO.redact, SAMPLE);
  for (const s of ['Kabir Mehta', 'kabir.mehta.dev@example.com', '+91 98765 43210', 'Sunrise Institute of Technology', 'KABIR', 'MEHTA']) assert.ok(list.includes(s), s);
  const parts = redactParts('Kabir Mehta from SUNRISE INSTITUTE OF TECHNOLOGY wrote a program', list);
  assert.deepEqual(parts.filter(p => p.hidden).map(p => p.text), ['Kabir Mehta', 'SUNRISE INSTITUTE OF TECHNOLOGY']);
  assert.ok(parts.some(p => !p.hidden && p.text.includes('program')));
  // short names only match whole words
  const ram = redactParts('Ram wrote a program', ['Ram']);
  assert.deepEqual(ram.filter(p => p.hidden).map(p => p.text), ['Ram']);
  assert.deepEqual(redactParts('nothing to hide', []), [{ text: 'nothing to hide', hidden: false }]);
});

test('text clean-up and pdf.js line joining', () => {
  assert.equal(cleanText('a  b​c\r\n\r\n\r\n\r\nd\t e'), 'a bc\n\nd e');
  const items = [
    { str: 'KABIR', transform: [1, 0, 0, 1, 0, 700], hasEOL: false },
    { str: 'MEHTA', transform: [1, 0, 0, 1, 50, 700], hasEOL: true },
    { str: 'EDUCATION', transform: [1, 0, 0, 1, 0, 680], hasEOL: false },
    { str: 'B.Tech', transform: [1, 0, 0, 1, 0, 660], hasEOL: false },
  ];
  assert.equal(cleanText(joinTextItems(items)), 'KABIR MEHTA\nEDUCATION\nB.Tech');
  const long = 'x'.repeat(MAX_CHARS + 50);
  const c = capText(long);
  assert.ok(c.cut);
  assert.ok(c.text.length < long.length + 80);
});

test('reading files: text works, Word / images / empty / huge files get clear messages', async () => {
  const r = await readResumeFile(new File([SAMPLE], 'resume.txt', { type: 'text/plain' }));
  assert.equal(r.kind, 'text');
  assert.match(r.text, /^KABIR MEHTA/);
  const kind = async (f) => { try { await readResumeFile(f); return null; } catch (e) { return e.kind; } };
  assert.equal(await kind(new File(['x'], 'cv.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })), 'word');
  assert.equal(await kind(new File(['x'], 'cv.jpg', { type: 'image/jpeg' })), 'image');
  assert.equal(await kind(new File([''], 'cv.txt', { type: 'text/plain' })), 'empty');
  assert.equal(await kind(new File([new Uint8Array(10 * 1024 * 1024 + 1)], 'cv.pdf', { type: 'application/pdf' })), 'too-big');
  assert.equal(await kind(new File(['x'], 'cv.zip', { type: 'application/zip' })), 'unknown');
});

test('a real answer pasted from Gemini (logged out, 13 Nov 2026) reads back', () => {
  const pasted = readFileSync(new URL('../samples/gemini-answer.txt', import.meta.url), 'utf8');
  const r = parseRoast(pasted);
  assert.equal(r.score, 4);
  assert.equal(r.heat, 4);
  assert.equal(r.roast.length, 4);
  assert.equal(r.fixes.length, 3);
  assert.ok(r.redact.includes('Sunrise Institute of Technology'));
  for (const line of r.roast) assert.ok(!/kabir|mehta|sunrise/i.test(line), 'no personal details in roast lines');
});

test('roast lines are typeset with curly quotes and no doubled opening marks', async () => {
  const { quoteLine, curly } = await import('../js/quotes.js');
  assert.equal(quoteLine("'Proficient in MS Word' is not a skill. It is a confession."), '‘Proficient in MS Word’ is not a skill. It is a confession.');
  assert.equal(quoteLine('5 projects. 4 of them are to-do apps.'), '“5 projects. 4 of them are to-do apps.”');
  assert.equal(quoteLine('Listing "MS Word" is brave.'), '“Listing “MS Word” is brave.”');
  assert.equal(curly("don't"), 'don’t');
});

test('fix advice splits into text plus a Before / After rewrite', async () => {
  const { splitFix } = await import('../js/quotes.js');
  const g = splitFix("Delete the Declaration. Recruiters skip it. Before: 'Father's Name: Rajesh Mehta'. After: [Removed entirely].");
  assert.equal(g.text, 'Delete the Declaration. Recruiters skip it.');
  assert.equal(g.before, 'Father’s Name: Rajesh Mehta');
  assert.equal(g.after, '[Removed entirely].');
  const d = splitFix('Before: ‘Worked on various tasks.’ After: ‘Built 3 pages.’');
  assert.deepEqual(d, { text: '', before: 'Worked on various tasks.', after: 'Built 3 pages.' });
  assert.deepEqual(splitFix('Cut it to one page.'), { text: 'Cut it to one page.', before: '', after: '' });
});
