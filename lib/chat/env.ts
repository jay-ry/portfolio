/**
 * Chat environment configuration.
 *
 * SERVER ONLY. Nothing here may be imported from a client component — it reads
 * `process.env` and returns the provider API key. There is no `server-only`
 * import guard because this project deliberately ships zero extra npm
 * dependencies; keep the import graph honest by hand.
 *
 * Design rule: this module NEVER throws at import time. A portfolio site with a
 * missing GROQ_API_KEY must still build, boot, and serve its other six sections
 * — the chat simply reports itself unavailable. Validation is therefore lenient
 * (bad values fall back to defaults) and the key is only *required* at call
 * time, which the route handler checks via `isChatConfigured()`.
 */

export interface ChatEnv {
  /** null when unset/blank — callers must treat this as "chat unavailable". */
  apiKey: string | null;
  model: string;
  fallbackModel: string;
  requestTimeoutMs: number;
  rateLimitWindowMs: number;
  rateLimitMax: number;
  /**
   * How many reverse proxies sit between the public internet and this process.
   *
   * 0 (the default) means "nothing in front of us that we control", so every
   * forwarding header is attacker-typed text and is ignored outright. See
   * `getClientKey` in the chat route for how this is applied.
   */
  trustedProxyHops: number;
}

const DEFAULT_MODEL = "openai/gpt-oss-120b";
const DEFAULT_MODEL_FALLBACK = "openai/gpt-oss-20b";
const DEFAULT_REQUEST_TIMEOUT_MS = 20_000;
const DEFAULT_RATE_LIMIT_WINDOW_MS = 60_000;
/**
 * Sized against real provider capacity, not plucked from the air. Groq's free
 * tier allows 8000 tokens/minute per model, and one grounded request costs
 * ~2200 (the whole portfolio knowledge block ships in every prompt) — about 3
 * requests/minute per model, roughly 7 across the primary and its fallback.
 * Sitting just under that means a rapid-fire visitor gets our friendly
 * "wait a moment" instead of an opaque provider error, and the quota is spent
 * on real questions. Raise it if you upgrade the Groq tier.
 */
const DEFAULT_RATE_LIMIT_MAX = 6;
/** Fail closed: assume no trusted proxy until an operator says otherwise. */
const DEFAULT_TRUSTED_PROXY_HOPS = 0;

/** Trimmed non-empty string, or `fallback`. */
function readString(name: string, fallback: string): string {
  const raw = process.env[name];
  if (typeof raw !== "string") return fallback;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

/**
 * Positive integer, or `fallback`. Non-numeric, negative, zero, fractional and
 * absurd values all degrade to the default rather than throwing — a typo in a
 * compose file should not take the site down.
 */
function readInt(
  name: string,
  fallback: number,
  min: number,
  max: number,
): number {
  const raw = process.env[name];
  if (typeof raw !== "string") return fallback;
  const trimmed = raw.trim();
  if (trimmed.length === 0) return fallback;

  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || !Number.isInteger(parsed)) return fallback;
  if (parsed < min || parsed > max) return fallback;
  return parsed;
}

export function getChatEnv(): ChatEnv {
  const rawKey = process.env.GROQ_API_KEY;
  const apiKey =
    typeof rawKey === "string" && rawKey.trim().length > 0
      ? rawKey.trim()
      : null;

  return {
    apiKey,
    model: readString("CHAT_MODEL", DEFAULT_MODEL),
    fallbackModel: readString("CHAT_MODEL_FALLBACK", DEFAULT_MODEL_FALLBACK),
    // 1s..120s. Anything outside that is a misconfiguration, not an intent.
    requestTimeoutMs: readInt(
      "CHAT_REQUEST_TIMEOUT_MS",
      DEFAULT_REQUEST_TIMEOUT_MS,
      1_000,
      120_000,
    ),
    // 1s..1h.
    rateLimitWindowMs: readInt(
      "CHAT_RATE_LIMIT_WINDOW_MS",
      DEFAULT_RATE_LIMIT_WINDOW_MS,
      1_000,
      3_600_000,
    ),
    // 1..1000 requests per window.
    rateLimitMax: readInt(
      "CHAT_RATE_LIMIT_MAX",
      DEFAULT_RATE_LIMIT_MAX,
      1,
      1_000,
    ),
    // 0..8. Nobody legitimately chains more proxies than that in front of a
    // personal site, and every extra hop hands one more list entry back to the
    // caller, so a typo like `100` degrades to 0 rather than to "trust anything".
    trustedProxyHops: readInt(
      "TRUSTED_PROXY_HOPS",
      DEFAULT_TRUSTED_PROXY_HOPS,
      0,
      8,
    ),
  };
}

/**
 * True when the chat can actually reach a provider. The route handler uses this
 * to degrade gracefully; the status endpoint uses it to tell the UI to hide or
 * disable the chat affordance.
 */
export function isChatConfigured(): boolean {
  return getChatEnv().apiKey !== null;
}
