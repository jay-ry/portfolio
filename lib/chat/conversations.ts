/**
 * Server-side conversation history.
 *
 * WHY THIS EXISTS: the client used to send its own `history` array, which meant
 * a visitor could POST fabricated `assistant` turns and the model would happily
 * continue that persona — inventing job titles and salaries for a real person.
 * History is therefore kept here, keyed by conversation id, and the client's
 * copy is ignored.
 *
 * SCOPE AND LIMITATIONS — same trade-off as `ratelimit.ts`:
 *   - State lives in this process's heap. It is PER-INSTANCE and RESETS ON
 *     REDEPLOY (and on any container restart or cold start).
 *   - Behind more than one replica, a follow-up question can land on an
 *     instance that has never seen the conversation.
 *
 * Neither case is a failure: a miss returns an empty history and the model
 * answers the current question on its own, which is a slightly less contextual
 * reply rather than a broken one. The upgrade path, if this ever runs behind a
 * load balancer or needs to survive deploys, is Redis (a LIST or JSON blob per
 * conversation with a TTL matching CONVERSATION_TTL_MS) keyed identically — the
 * two exported functions are deliberately narrow so the swap stays local.
 *
 * Memory is bounded two ways: expired entries are pruned on write, and the map
 * is hard-capped at MAX_CONVERSATIONS with oldest-first eviction.
 */

import { CHAT_LIMITS } from "./types";

export interface StoredTurn {
  role: "user" | "assistant";
  content: string;
}

interface Conversation {
  turns: StoredTurn[];
  /** epoch ms of the last append */
  lastSeen: number;
}

/** Hard ceiling on tracked conversations, so id spraying can't grow the heap. */
const MAX_CONVERSATIONS = 2_000;

/** Idle conversations are forgotten after this long. */
const CONVERSATION_TTL_MS = 30 * 60_000;

/** How many stale entries to sweep per write, to keep the write path O(1)-ish. */
const PRUNE_SCAN_LIMIT = 200;

// Map iteration order is insertion order, and every append re-inserts, so the
// front of the map is always the least recently used conversation.
const conversations = new Map<string, Conversation>();

function isExpired(entry: Conversation, now: number): boolean {
  return now - entry.lastSeen > CONVERSATION_TTL_MS;
}

/**
 * Drop idle conversations, then enforce the size cap.
 *
 * The expiry sweep is bounded so a large map never turns one request into a
 * full O(n) scan. The cap enforcement below is only reached in an abuse
 * scenario and evicts the least recently used keys.
 */
function prune(now: number): void {
  let scanned = 0;
  for (const [id, entry] of conversations) {
    if (scanned++ >= PRUNE_SCAN_LIMIT) break;
    if (isExpired(entry, now)) conversations.delete(id);
  }

  if (conversations.size <= MAX_CONVERSATIONS) return;

  const overflow = conversations.size - MAX_CONVERSATIONS;
  let evicted = 0;
  for (const id of conversations.keys()) {
    if (evicted++ >= overflow) break;
    conversations.delete(id);
  }
}

/**
 * Trim a turn list to the configured window: newest MAX_HISTORY_MESSAGES turns
 * first, then drop from the oldest end until the whole window fits the char
 * budget. A single turn longer than the budget survives on its own — the
 * message length cap already bounds it.
 */
function clamp(turns: StoredTurn[]): StoredTurn[] {
  const recent = turns.slice(-CHAT_LIMITS.MAX_HISTORY_MESSAGES);

  let total = recent.reduce((sum, turn) => sum + turn.content.length, 0);
  let start = 0;
  while (start < recent.length - 1 && total > CHAT_LIMITS.MAX_HISTORY_CHARS) {
    total -= recent[start].content.length;
    start += 1;
  }

  return recent.slice(start);
}

/**
 * The turns to replay for `id`, oldest first.
 *
 * Returns copies: callers get a plain array they can splice into a provider
 * payload without reaching back into the store.
 */
export function getHistory(id: string): StoredTurn[] {
  const entry = conversations.get(id);
  if (!entry) return [];

  if (isExpired(entry, Date.now())) {
    conversations.delete(id);
    return [];
  }

  return entry.turns.map((turn) => ({ ...turn }));
}

/** Record one completed turn. Empty content is ignored rather than stored. */
export function appendTurn(
  id: string,
  role: StoredTurn["role"],
  content: string,
): void {
  const trimmed = content.trim();
  if (trimmed.length === 0) return;

  const now = Date.now();
  prune(now);

  const existing = conversations.get(id);
  const turns =
    existing && !isExpired(existing, now) ? [...existing.turns] : [];
  turns.push({ role, content: trimmed });

  // Delete before set so the entry moves to the back of the iteration order,
  // which is what makes the eviction in `prune` least-recently-used.
  conversations.delete(id);
  conversations.set(id, { turns: clamp(turns), lastSeen: now });
}
