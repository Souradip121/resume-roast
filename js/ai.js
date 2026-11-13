// Route B: sends the resume text to the provider the user picked, with their own key,
// straight from the browser. The key and the resume go to that provider's API and
// nowhere else. Each provider is asked for the same strict JSON (see prompt.js).

import { SYSTEM, SCHEMA, geminiSchema, buildUserMessage } from './prompt.js';
import { parseRoast, RoastError } from './parse.js';

export const PROVIDERS = {
  openai: {
    label: 'OpenAI',
    model: 'gpt-6-luna',
    keyHint: 'sk-…',
    keyUrl: 'https://platform.openai.com/api-keys',
  },
  gemini: {
    label: 'Gemini',
    model: 'gemini-3.5-flash-lite',
    keyHint: 'AIza…',
    keyUrl: 'https://aistudio.google.com/apikey',
  },
  claude: {
    label: 'Claude',
    model: 'claude-haiku-5-5',
    keyHint: 'sk-ant-…',
    keyUrl: 'https://platform.claude.com/settings/keys',
  },
};

const TIMEOUT = 60000;
const MAX_OUT = 2000;

export class AiError extends Error {
  constructor(kind, provider, detail = '', status = 0) {
    super(friendly(kind, provider, detail, status));
    this.kind = kind;
    this.provider = provider;
    this.status = status;
    this.detail = detail;
  }
}

function friendly(kind, provider, detail, status) {
  const name = PROVIDERS[provider]?.label || 'The AI';
  switch (kind) {
    case 'key': return `${name} didn’t accept that key. Check you copied all of it, with no spaces.`;
    case 'quota': return `Your ${name} account is out of credit or free quota. Top it up, or pick another AI.`;
    case 'rate': return `${name} says too many requests right now. Wait a minute and try again.`;
    case 'model': return `${name} doesn’t offer the model “${detail}” to this key. Change it under Model.`;
    case 'region': return `${name} isn’t available in your region with this key.`;
    case 'network': return `Couldn’t reach ${name}. Check your internet, or switch off any ad blocker for this page.`;
    // OpenAI sends its "bad key" and some billing errors without CORS headers,
    // so the browser can't read them and they look like a network failure.
    case 'openai-refused': return 'OpenAI turned the request down. Usually the key is wrong or the account has no credit: check you copied all of it and that billing is set up, or try Gemini or Claude.';
    case 'timeout': return `${name} took too long to answer. Try again.`;
    case 'blocked': return `${name} wouldn’t roast this one. Try a lower heat, or another AI.`;
    case 'truncated': return `${name} ran out of room before finishing the roast. Try again.`;
    case 'empty': return `${name} sent back an empty answer. Try again.`;
    case 'server': return `${name} is having a moment (error ${status}). Try again shortly.`;
    case 'cancelled': return 'Cancelled.';
    default: return `${name} said: ${detail || `error ${status}`}`;
  }
}

export function classify(provider, status, body, model) {
  const err = body?.error || {};
  const msg = String(err.message || body?.message || '').slice(0, 200);
  const code = String(err.code || err.type || err.status || '');
  const reason = (err.details || []).map(d => d.reason).join(' ');
  if (provider === 'openai') {
    if (status === 401 || code === 'invalid_api_key') return ['key', msg];
    if (code === 'insufficient_quota' || /quota|billing/i.test(msg)) return ['quota', msg];
    if (status === 429) return ['rate', msg];
    if (status === 404 || code === 'model_not_found') return ['model', model];
    if (status === 403 && /country|region|territory/i.test(msg)) return ['region', msg];
    if (status === 403) return ['key', msg];
  }
  if (provider === 'gemini') {
    if (/API_KEY_INVALID|API_KEY/i.test(reason) || (status === 400 && /api key/i.test(msg))) return ['key', msg];
    if (status === 401 || status === 403) return ['key', msg];
    if (status === 429 || code === 'RESOURCE_EXHAUSTED') return [/quota|billing|limit: 0/i.test(msg) ? 'quota' : 'rate', msg];
    if (status === 404) return ['model', model];
    if (/location is not supported|region/i.test(msg)) return ['region', msg];
  }
  if (provider === 'claude') {
    if (status === 401 || code === 'authentication_error') return ['key', msg];
    if (status === 403 || code === 'permission_error') return ['key', msg];
    if (/credit balance|billing|quota/i.test(msg)) return ['quota', msg];
    if (status === 429 || code === 'rate_limit_error') return ['rate', msg];
    if (status === 404 || code === 'not_found_error') return ['model', model];
  }
  if (status === 529 || status >= 500) return ['server', msg];
  return ['other', msg];
}

/** Builds the provider-specific request. Exported for tests. */
export function buildRequest(provider, key, model, user) {
  if (provider === 'openai') {
    return {
      url: 'https://api.openai.com/v1/chat/completions',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: {
        model,
        messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: user }],
        max_completion_tokens: MAX_OUT,
        reasoning_effort: 'none',
        response_format: { type: 'json_schema', json_schema: { name: 'resume_roast', strict: true, schema: SCHEMA } },
      },
    };
  }
  if (provider === 'gemini') {
    return {
      url: `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: {
        systemInstruction: { parts: [{ text: SYSTEM }] },
        contents: [{ role: 'user', parts: [{ text: user }] }],
        // Flash-Lite already thinks at its lowest level by default, so no thinkingConfig.
        generationConfig: {
          maxOutputTokens: MAX_OUT,
          responseMimeType: 'application/json',
          responseSchema: geminiSchema(),
        },
      },
    };
  }
  return {
    url: 'https://api.anthropic.com/v1/messages',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: {
      model,
      max_tokens: MAX_OUT,
      system: SYSTEM,
      messages: [{ role: 'user', content: user }],
      // Haiku 5.5 thinks by default; a roast doesn't need it, and disabled is allowed at medium effort.
      thinking: { type: 'disabled' },
      output_config: { effort: 'medium', format: { type: 'json_schema', schema: SCHEMA } },
    },
  };
}

/** Pulls the answer text out of each provider's response; throws on refusals and cut-offs. */
export function textOf(provider, data) {
  if (provider === 'openai') {
    const c = data?.choices?.[0];
    if (c?.message?.refusal) throw new AiError('blocked', provider, c.message.refusal);
    if (c?.finish_reason === 'length') throw new AiError('truncated', provider);
    if (c?.finish_reason === 'content_filter') throw new AiError('blocked', provider);
    return c?.message?.content || '';
  }
  if (provider === 'gemini') {
    if (data?.promptFeedback?.blockReason) throw new AiError('blocked', provider);
    const c = data?.candidates?.[0];
    if (['SAFETY', 'PROHIBITED_CONTENT', 'BLOCKLIST', 'SPII', 'RECITATION'].includes(c?.finishReason)) throw new AiError('blocked', provider);
    if (c?.finishReason === 'MAX_TOKENS') throw new AiError('truncated', provider);
    return (c?.content?.parts || []).filter(p => !p.thought && p.text).map(p => p.text).join('');
  }
  if (data?.stop_reason === 'refusal') throw new AiError('blocked', provider, data?.stop_details?.category || '');
  if (data?.stop_reason === 'max_tokens') throw new AiError('truncated', provider);
  return (data?.content || []).filter(b => b.type === 'text').map(b => b.text).join('');
}

/**
 * Asks the provider for the roast.
 * @returns {Promise<ReturnType<typeof parseRoast>>}
 * @throws {AiError|RoastError}
 */
export async function askRoast({ provider, key, model, text, heat, signal }) {
  const req = buildRequest(provider, key.trim(), model, buildUserMessage(text, heat));
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort('timeout'), TIMEOUT);
  const onAbort = () => ctl.abort('cancel');
  signal?.addEventListener('abort', onAbort);
  let res;
  try {
    res = await fetch(req.url, {
      method: 'POST',
      headers: req.headers,
      body: JSON.stringify(req.body),
      signal: ctl.signal,
      referrerPolicy: 'no-referrer',
      credentials: 'omit',
    });
  } catch {
    clearTimeout(timer);
    signal?.removeEventListener('abort', onAbort);
    if (ctl.signal.aborted) throw new AiError(ctl.signal.reason === 'cancel' ? 'cancelled' : 'timeout', provider);
    const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
    throw new AiError(provider === 'openai' && !offline ? 'openai-refused' : 'network', provider);
  }
  let data = null;
  try { data = await res.json(); } catch { /* non-JSON error page */ }
  clearTimeout(timer);
  signal?.removeEventListener('abort', onAbort);
  if (!res.ok) {
    const [kind, detail] = classify(provider, res.status, data, model);
    throw new AiError(kind, provider, detail, res.status);
  }
  const out = textOf(provider, data);
  if (!out.trim()) throw new AiError('empty', provider);
  try {
    return parseRoast(out, { heat });
  } catch (e) {
    // the paste-route wording ("copy the whole answer") makes no sense here
    if (e instanceof RoastError && (e.kind === 'no-json' || e.kind === 'no-resume')) {
      throw new RoastError('malformed', 'The answer came back garbled, so it can’t be read. Try again: it usually works the second time.');
    }
    throw e;
  }
}

export { RoastError };
