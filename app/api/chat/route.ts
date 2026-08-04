/**
 * POST /api/chat — streaming, grounded portfolio chat.
 *
 * Contract: request body is a `ChatRequest`; the response is an SSE stream of
 * `ChatStreamEvent` frames (`delta`* then one `done`, or a single `error`).
 *
 * Everything the client sends is untrusted. The system prompt and the knowledge
 * block are assembled server-side, actions are derived deterministically from
 * the finished answer (never from model output), and raw provider errors are
 * logged but never forwarded.
 */

import { deriveActions } from "@/lib/chat/actions";
import { appendTurn, getHistory } from "@/lib/chat/conversations";
import { getChatEnv, isChatConfigured, type ChatEnv } from "@/lib/chat/env";
import { buildSystemPrompt } from "@/lib/chat/prompt";
import { checkRateLimit } from "@/lib/chat/ratelimit";
import {
  CHAT_LIMITS,
  isValidAnchor,
  type ChatStreamEvent,
} from "@/lib/chat/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

/** Conservative cap on the raw request body, before we even parse it. */
const MAX_BODY_BYTES = 32_768;

/** Enough for a ~120-word answer with headroom; keeps token spend predictable. */
const MAX_COMPLETION_TOKENS = 400;

const CONVERSATION_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

// User-facing copy. Deliberately vague about *why* — never leak configuration.
const MESSAGE_UNAVAILABLE =
  "The AI guide is offline right now. Browse the sections directly, or use the contact links to reach Jay.";
const MESSAGE_PROVIDER_ERROR =
  "The AI guide hit an error answering that. Try again in a moment.";
const MESSAGE_TIMEOUT = "That took too long to answer. Try a shorter question.";
const MESSAGE_RATE_LIMITED =
  "Too many questions too quickly. Wait a moment and try again.";

const SSE_HEADERS: Record<string, string> = {
  "Content-Type": "text/event-stream; charset=utf-8",
  "Cache-Control": "no-cache, no-transform",
  Connection: "keep-alive",
  // There's an nginx-shaped proxy in production; without this it buffers the
  // whole stream and the UI receives one lump at the end.
  "X-Accel-Buffering": "no",
};

// ---------------------------------------------------------------------------
// SSE helpers
// ---------------------------------------------------------------------------

function frame(event: ChatStreamEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

function errorResponse(
  code: Extract<ChatStreamEvent, { type: "error" }>["code"],
  message: string,
  status: number,
  extraHeaders?: Record<string, string>,
): Response {
  return new Response(frame({ type: "error", code, message }), {
    status,
    headers: { ...SSE_HEADERS, ...extraHeaders },
  });
}

// ---------------------------------------------------------------------------
// Request validation (hand-rolled — no schema library in this project)
// ---------------------------------------------------------------------------

interface ProviderMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ValidRequest {
  message: string;
  /** undefined when absent or malformed — the exchange then runs stateless. */
  conversationId?: string;
  currentSection?: string;
}

type Validation =
  | { ok: true; value: ValidRequest }
  | { ok: false; message: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validateRequest(body: unknown): Validation {
  if (!isRecord(body)) {
    return { ok: false, message: "Request body must be a JSON object." };
  }

  if (typeof body.message !== "string") {
    return { ok: false, message: "Field 'message' must be a string." };
  }
  const message = body.message.trim();
  if (message.length === 0) {
    return { ok: false, message: "Field 'message' must not be empty." };
  }
  if (message.length > CHAT_LIMITS.MAX_MESSAGE_LENGTH) {
    return {
      ok: false,
      message: `Field 'message' must be at most ${CHAT_LIMITS.MAX_MESSAGE_LENGTH} characters.`,
    };
  }
  // Slash commands are executed entirely in the browser by the command
  // registry. If one reaches here the client is misbehaving — refuse rather
  // than pay tokens to have a model guess at "/help".
  if (message.startsWith("/")) {
    return {
      ok: false,
      message: "Slash commands are handled by the interface, not the model.",
    };
  }

  // Advisory, like `currentSection`: it only selects a server-side history
  // bucket. A missing or malformed id costs the visitor conversational memory,
  // not their answer, so it degrades to a stateless single-turn exchange.
  //
  // The `history` field is still accepted on the wire for older clients, but
  // its contents are ignored entirely — turns come from the server-side store.
  // Trusting it let a visitor forge `assistant` turns and have the model carry
  // on inventing biography for a real person.
  let conversationId: string | undefined;
  if (typeof body.conversationId === "string") {
    const candidate = body.conversationId.trim();
    if (CONVERSATION_ID_PATTERN.test(candidate)) conversationId = candidate;
  }

  // Advisory only. An unrecognised section is ignored rather than rejected —
  // the page can add anchors without breaking older clients.
  let currentSection: string | undefined;
  if (typeof body.currentSection === "string") {
    const candidate = body.currentSection.trim();
    if (isValidAnchor(candidate)) currentSection = candidate;
  }

  return { ok: true, value: { message, conversationId, currentSection } };
}

// ---------------------------------------------------------------------------
// Client identity
// ---------------------------------------------------------------------------

/**
 * The rate-limit bucket key for a request.
 *
 * `X-Forwarded-For` is a list the CALLER can seed. nginx's standard
 * `$proxy_add_x_forwarded_for` *appends* the peer it saw, so a request sent with
 * `X-Forwarded-For: 1.2.3.4` arrives as `1.2.3.4, <real ip>`: reading the
 * leftmost entry keys the limiter on a value the attacker picks, which lands
 * every request in a fresh bucket and disables the limit entirely.
 *
 * So the list is read RIGHT to LEFT, where the entries were written by machines
 * we control, and only as far as TRUSTED_PROXY_HOPS says we control them. With
 * one proxy in front, the last entry is what that proxy saw — the real client —
 * and everything to its left is caller-supplied noise. At the default of 0 hops
 * there is nothing in front of us, so no forwarding header means anything and
 * both are ignored.
 */
function getClientKey(req: Request): string {
  const { trustedProxyHops } = getChatEnv();

  if (trustedProxyHops > 0) {
    const forwarded = req.headers.get("x-forwarded-for");
    if (forwarded) {
      const hops = forwarded
        .split(",")
        .map((hop) => hop.trim())
        .filter((hop) => hop.length > 0);
      // Our nearest proxy appended the last entry, the one before it was
      // appended by the proxy before that, and so on; step back over exactly
      // the hops we trust. A chain shorter than that is a misconfiguration —
      // fall through rather than key on whatever is left.
      const client = hops[hops.length - trustedProxyHops];
      if (client) return client;
    }

    // Same reasoning for X-Real-IP: duplicate headers arrive comma-joined, and
    // only the rightmost value was written by the proxy nearest us.
    const realIp = req.headers.get("x-real-ip");
    if (realIp) {
      const values = realIp
        .split(",")
        .map((value) => value.trim())
        .filter((value) => value.length > 0);
      const nearest = values[values.length - 1];
      if (nearest) return nearest;
    }
  }

  // Everyone shares one bucket rather than nobody being limited.
  return "unknown-client";
}

// ---------------------------------------------------------------------------
// Body reading
// ---------------------------------------------------------------------------

type BodyResult =
  | { ok: true; text: string }
  | { ok: false; reason: "too_large" | "unreadable" };

/**
 * Read the request body, counting bytes and stopping the moment the cap is
 * exceeded.
 *
 * `Content-Length` is not consulted at all: a `Transfer-Encoding: chunked`
 * request omits it, and a junk value like `abc` parses to NaN, so any guard
 * built on it is trivially skipped and `req.json()` then buffers an unbounded
 * upload into memory. Counting what actually arrives is the only cap that
 * holds, and it aborts the transfer instead of buffering it first.
 */
async function readBoundedBody(req: Request): Promise<BodyResult> {
  if (!req.body) return { ok: true, text: "" };

  const reader = req.body.getReader();
  const decoder = new TextDecoder();
  let text = "";
  let bytes = 0;

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;

      bytes += value.byteLength;
      if (bytes > MAX_BODY_BYTES) return { ok: false, reason: "too_large" };

      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
    return { ok: true, text };
  } catch {
    // Client hung up mid-upload, or the stream errored. Either way there is no
    // body to parse.
    return { ok: false, reason: "unreadable" };
  } finally {
    await reader.cancel().catch(() => {});
  }
}

// ---------------------------------------------------------------------------
// Defence in depth: suppress <think> blocks
// ---------------------------------------------------------------------------

/**
 * Groq's gpt-oss models return chain-of-thought in `delta.reasoning`, a field we
 * never read, so reasoning cannot reach `delta.content`. This filter exists
 * purely as insurance in case a model or fallback ever inlines `<think>` tags.
 *
 * It handles tags split across chunk boundaries by holding back any trailing
 * text that could still turn out to be the start of a tag.
 */
const THINK_OPEN = "<think>";
const THINK_CLOSE = "</think>";

function partialTailLength(text: string, tag: string): number {
  const max = Math.min(text.length, tag.length - 1);
  for (let k = max; k > 0; k -= 1) {
    if (text.endsWith(tag.slice(0, k))) return k;
  }
  return 0;
}

class ThinkFilter {
  private buffer = "";
  private inside = false;

  feed(chunk: string): string {
    this.buffer += chunk;
    let out = "";

    for (;;) {
      if (this.inside) {
        const close = this.buffer.indexOf(THINK_CLOSE);
        if (close === -1) {
          const keep = partialTailLength(this.buffer, THINK_CLOSE);
          this.buffer = this.buffer.slice(this.buffer.length - keep);
          break;
        }
        this.buffer = this.buffer.slice(close + THINK_CLOSE.length);
        this.inside = false;
        continue;
      }

      const open = this.buffer.indexOf(THINK_OPEN);
      if (open === -1) {
        const keep = partialTailLength(this.buffer, THINK_OPEN);
        out += this.buffer.slice(0, this.buffer.length - keep);
        this.buffer = this.buffer.slice(this.buffer.length - keep);
        break;
      }
      out += this.buffer.slice(0, open);
      this.buffer = this.buffer.slice(open + THINK_OPEN.length);
      this.inside = true;
    }

    return out;
  }

  flush(): string {
    const rest = this.inside ? "" : this.buffer;
    this.buffer = "";
    return rest;
  }
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

/** Shape of the fields we read from an OpenAI-compatible SSE chunk. */
interface ProviderChunk {
  choices?: { delta?: { content?: string | null } }[];
}

/**
 * The request body sent to Groq.
 *
 * Deliberately absent: `logprobs`, `top_logprobs`, `logit_bias`, `n`, and
 * `messages[].name` — Groq rejects all of them with a 400.
 *
 * `reasoning_format` is also absent, and NOT by oversight: Groq's docs state it
 * is unsupported for gpt-oss-20b/120b, which instead expose `include_reasoning`
 * (the two are documented as mutually exclusive). Setting `include_reasoning:
 * false` is what keeps chain-of-thought out of the response entirely; these
 * models never inline it into `delta.content` the way `reasoning_format: "raw"`
 * does on other families.
 *
 * `reasoning_effort: "low"` is valid for both gpt-oss sizes ("low" | "medium" |
 * "high", defaulting to "medium"). Grounded lookup over a fixed knowledge block
 * needs no deliberation, and reasoning tokens bill at the output rate.
 */
function buildProviderBody(model: string, messages: ProviderMessage[]) {
  return {
    model,
    messages,
    stream: true,
    temperature: 0.3,
    top_p: 1,
    max_completion_tokens: MAX_COMPLETION_TOKENS,
    reasoning_effort: "low",
    include_reasoning: false,
  };
}

type ConnectResult =
  | { ok: true; response: Response }
  | { ok: false; reason: "timeout" | "aborted" | "provider" };

/**
 * Open the upstream stream, retrying ONCE on the fallback model.
 *
 * Retried: 5xx, network failures, and 429. The 429 case is worth spelling out —
 * Groq meters tokens-per-minute *per model*, so a rate-limited primary says
 * nothing about the fallback's budget and switching models genuinely clears it.
 * Every other 4xx means our request is malformed and a second model won't help.
 * `fetch` resolves as soon as headers arrive,
 * so this returns before any tokens are generated, which lets us pick a real
 * HTTP status for the client instead of committing to 200 up front.
 */
async function connectToProvider(
  env: ChatEnv,
  messages: ProviderMessage[],
  controller: AbortController,
  isTimedOut: () => boolean,
): Promise<ConnectResult> {
  const models =
    env.fallbackModel && env.fallbackModel !== env.model
      ? [env.model, env.fallbackModel]
      : [env.model];

  for (let i = 0; i < models.length; i += 1) {
    const model = models[i];
    const isLastAttempt = i === models.length - 1;

    try {
      const response = await fetch(GROQ_ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.apiKey}`,
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify(buildProviderBody(model, messages)),
        signal: controller.signal,
        cache: "no-store",
      });

      if (response.ok && response.body) return { ok: true, response };

      const detail = await response.text().catch(() => "<unreadable>");
      console.error(
        `[chat] provider responded ${response.status} for model "${model}": ${detail.slice(0, 500)}`,
      );
      // Drain/close a bodied error response we're not going to read.
      if (response.body && !response.bodyUsed) {
        await response.body.cancel().catch(() => {});
      }

      const retryable = response.status >= 500 || response.status === 429;
      if (!retryable || isLastAttempt) {
        return { ok: false, reason: "provider" };
      }
    } catch (error) {
      if (isTimedOut()) return { ok: false, reason: "timeout" };
      if (controller.signal.aborted) return { ok: false, reason: "aborted" };

      console.error(`[chat] provider request failed for model "${model}"`, error);
      if (isLastAttempt) return { ok: false, reason: "provider" };
    }
  }

  return { ok: false, reason: "provider" };
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export async function POST(req: Request): Promise<Response> {
  // 1. Rate limit FIRST, before reading a byte. It is the cheapest check we
  //    have, and doing it after the parse would let an already-limited client
  //    make us buffer and parse a body on every request anyway.
  const limit = checkRateLimit(getClientKey(req));
  if (!limit.ok) {
    return errorResponse("rate_limited", MESSAGE_RATE_LIMITED, 429, {
      "Retry-After": String(Math.ceil(limit.retryAfterMs / 1000)),
    });
  }

  // 2. Read under a hard byte ceiling, then parse and validate.
  const body = await readBoundedBody(req);
  if (!body.ok) {
    if (body.reason === "too_large") {
      return errorResponse("invalid_request", "Request body is too large.", 413);
    }
    return errorResponse("invalid_request", "Request body is not valid JSON.", 400);
  }

  let raw: unknown;
  try {
    raw = JSON.parse(body.text);
  } catch {
    return errorResponse("invalid_request", "Request body is not valid JSON.", 400);
  }

  const validated = validateRequest(raw);
  if (!validated.ok) {
    return errorResponse("invalid_request", validated.message, 400);
  }
  const { message, conversationId, currentSection } = validated.value;

  // 3. Degrade cleanly when the provider isn't configured. The client is told
  //    the guide is offline — never that a key is missing.
  if (!isChatConfigured()) {
    return errorResponse("provider_error", MESSAGE_UNAVAILABLE, 503);
  }

  const env = getChatEnv();

  // 4. Replay history from the server-side store, never from the request. An
  //    unknown id simply yields nothing and the model answers on its own.
  const history = conversationId ? getHistory(conversationId) : [];

  const messages: ProviderMessage[] = [
    { role: "system", content: buildSystemPrompt(currentSection) },
    ...history,
    { role: "user", content: message },
  ];

  // Recorded before the provider call so a dropped or timed-out answer still
  // leaves the question in the transcript.
  if (conversationId) appendTurn(conversationId, "user", message);

  // 5. One AbortController drives three things: the request timeout, the
  //    stream-idle watchdog, and client disconnect.
  const abortController = new AbortController();
  let timedOut = false;
  const isTimedOut = () => timedOut;

  let timer: ReturnType<typeof setTimeout> | null = setTimeout(() => {
    timedOut = true;
    abortController.abort();
  }, env.requestTimeoutMs);

  const clearTimer = () => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  };

  /** Re-arm the watchdog after each chunk so a healthy slow stream survives. */
  const rearmTimer = () => {
    clearTimer();
    timer = setTimeout(() => {
      timedOut = true;
      abortController.abort();
    }, env.requestTimeoutMs);
  };

  const onClientAbort = () => abortController.abort();
  req.signal.addEventListener("abort", onClientAbort, { once: true });

  const cleanup = () => {
    clearTimer();
    req.signal.removeEventListener("abort", onClientAbort);
  };

  // 6. Connect (with a single fallback-model retry).
  const connection = await connectToProvider(
    env,
    messages,
    abortController,
    isTimedOut,
  );

  if (!connection.ok) {
    cleanup();
    if (connection.reason === "aborted") {
      // Client hung up mid-connect; nothing is listening.
      return new Response(null, { status: 499 });
    }
    if (connection.reason === "timeout") {
      return errorResponse("timeout", MESSAGE_TIMEOUT, 504);
    }
    return errorResponse("provider_error", MESSAGE_PROVIDER_ERROR, 502);
  }

  const upstreamBody = connection.response.body;
  if (!upstreamBody) {
    cleanup();
    return errorResponse("provider_error", MESSAGE_PROVIDER_ERROR, 502);
  }

  // 7. Pump upstream SSE -> our own ChatStreamEvent SSE.
  const encoder = new TextEncoder();
  const reader = upstreamBody.getReader();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const decoder = new TextDecoder();
      const think = new ThinkFilter();
      let buffer = "";
      let fullText = "";
      let closed = false;

      const send = (event: ChatStreamEvent) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(frame(event)));
        } catch {
          // Downstream is gone; stop trying to write to it.
          closed = true;
        }
      };

      /** Parse one `\n\n`-delimited SSE event block. Returns true on [DONE]. */
      const handleEventBlock = (block: string): boolean => {
        for (const line of block.split("\n")) {
          if (!line.startsWith("data:")) continue;
          const payload = line.slice(5).trim();
          if (payload.length === 0) continue;
          if (payload === "[DONE]") return true;

          let chunk: ProviderChunk;
          try {
            chunk = JSON.parse(payload) as ProviderChunk;
          } catch {
            // A malformed frame is not worth killing the answer over.
            continue;
          }

          const text = chunk.choices?.[0]?.delta?.content;
          if (typeof text !== "string" || text.length === 0) continue;

          const visible = think.feed(text);
          if (visible.length > 0) {
            fullText += visible;
            send({ type: "delta", text: visible });
          }
        }
        return false;
      };

      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;

          rearmTimer();
          // Normalise CRLF so a single split on "\n\n" is sufficient.
          buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, "\n");

          let boundary = buffer.indexOf("\n\n");
          let sawDone = false;
          while (boundary !== -1) {
            const block = buffer.slice(0, boundary);
            buffer = buffer.slice(boundary + 2);
            if (handleEventBlock(block)) {
              sawDone = true;
              break;
            }
            boundary = buffer.indexOf("\n\n");
          }
          if (sawDone) break;
        }

        // Anything the tag filter was holding back is real content after all.
        const tail = think.flush();
        if (tail.length > 0) {
          fullText += tail;
          send({ type: "delta", text: tail });
        }

        // The answer completed, so it becomes part of the transcript. Only
        // text we actually produced is stored; the client never gets to say
        // what the assistant said.
        if (conversationId) appendTurn(conversationId, "assistant", fullText);

        // Actions are derived here, from the completed answer — the model has
        // no say in which links appear.
        send({ type: "done", actions: deriveActions(fullText) });
      } catch (error) {
        if (req.signal.aborted) {
          // Client disconnected mid-stream. Expected, not an error.
        } else if (timedOut) {
          console.error("[chat] upstream stream timed out");
          send({ type: "error", code: "timeout", message: MESSAGE_TIMEOUT });
        } else {
          console.error("[chat] upstream stream failed", error);
          send({
            type: "error",
            code: "provider_error",
            message: MESSAGE_PROVIDER_ERROR,
          });
        }
      } finally {
        closed = true;
        cleanup();
        await reader.cancel().catch(() => {});
        try {
          controller.close();
        } catch {
          // Already closed.
        }
      }
    },

    cancel() {
      // Client went away: stop billing for tokens nobody will read.
      cleanup();
      abortController.abort();
      void reader.cancel().catch(() => {});
    },
  });

  return new Response(stream, { status: 200, headers: SSE_HEADERS });
}
