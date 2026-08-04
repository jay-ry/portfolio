/**
 * Fixed-window, in-memory rate limiter.
 *
 * SCOPE AND LIMITATIONS — read before relying on this:
 *   - State lives in this process's heap. It is PER-INSTANCE and RESETS ON
 *     REDEPLOY (and on any container restart or cold start).
 *   - If the site is ever scaled horizontally, each replica keeps its own
 *     counters, so the effective limit becomes `max * replicas`.
 *
 * That is an acceptable trade-off for a single-container personal portfolio:
 * the goal is to blunt casual abuse and runaway token spend, not to enforce a
 * billing-grade quota. The upgrade path, if this ever runs behind a load
 * balancer with more than one instance, is a Redis-backed limiter (INCR + a
 * PEXPIRE on first hit, or a sliding-window sorted set) keyed identically —
 * `checkRateLimit`'s signature is deliberately narrow so the swap is local.
 *
 * Memory is bounded two ways: expired entries are pruned on write, and the map
 * is hard-capped at MAX_TRACKED_KEYS with oldest-first eviction.
 */

import { getChatEnv } from "./env";

interface Window {
  count: number;
  /** epoch ms at which this window expires */
  resetAt: number;
}

/** Hard ceiling on tracked keys, so a spray of spoofed IPs can't grow the heap. */
const MAX_TRACKED_KEYS = 5_000;

/** How many expired entries to sweep per write, to keep the write path O(1)-ish. */
const PRUNE_SCAN_LIMIT = 200;

// Map iteration order is insertion order, which makes oldest-first eviction free.
const windows = new Map<string, Window>();

/**
 * Drop expired entries, then enforce the size cap.
 *
 * The expiry sweep is bounded so a large map never turns one request into a
 * full O(n) scan. The cap enforcement below is only reached in an abuse
 * scenario and evicts the least-recently-created keys.
 */
function prune(now: number): void {
  let scanned = 0;
  for (const [key, window] of windows) {
    if (scanned++ >= PRUNE_SCAN_LIMIT) break;
    if (window.resetAt <= now) windows.delete(key);
  }

  if (windows.size <= MAX_TRACKED_KEYS) return;

  const overflow = windows.size - MAX_TRACKED_KEYS;
  let evicted = 0;
  for (const key of windows.keys()) {
    if (evicted++ >= overflow) break;
    windows.delete(key);
  }
}

/**
 * Consume one unit of quota for `key` (normally a client IP).
 *
 * @returns `ok: false` with the milliseconds until the window resets, suitable
 *          for a `Retry-After` header. `retryAfterMs` is 0 when `ok` is true.
 */
export function checkRateLimit(key: string): {
  ok: boolean;
  retryAfterMs: number;
} {
  const { rateLimitWindowMs, rateLimitMax } = getChatEnv();
  const now = Date.now();

  prune(now);

  const existing = windows.get(key);

  // No window, or the previous one lapsed: start a fresh one.
  if (!existing || existing.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + rateLimitWindowMs });
    return { ok: true, retryAfterMs: 0 };
  }

  if (existing.count >= rateLimitMax) {
    return { ok: false, retryAfterMs: Math.max(0, existing.resetAt - now) };
  }

  existing.count += 1;
  return { ok: true, retryAfterMs: 0 };
}
