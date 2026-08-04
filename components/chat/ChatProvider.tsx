"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  ChatMessage,
  ChatRequest,
  ChatRole,
  ChatStatusResponse,
  ChatStreamEvent,
} from "@/lib/chat/types";
import { CHAT_LIMITS, SECTION_ANCHORS } from "@/lib/chat/types";
import { executeCommand, parseCommand, type CommandOutcome } from "@/lib/chat/commands";

const STORAGE_KEY = "portfolio-chat-session";
const CHAT_ENDPOINT = "/api/chat";
const STATUS_ENDPOINT = "/api/chat/status";

/**
 * Single source of truth for the "is this a phone-sized viewport" test.
 * Lives here because the provider is the one module every chat surface
 * already imports — duplicate the string anywhere else and the two copies
 * drift.
 */
export const MOBILE_QUERY = "(max-width: 768.98px)";

/**
 * Broader than the wire-protocol error codes in ChatStreamEvent — "offline"
 * covers local failures (network down, fetch rejected, non-2xx) that never
 * produced a server-emitted error frame.
 */
type ChatErrorCode = "rate_limited" | "provider_error" | "invalid_request" | "timeout" | "offline";

function genId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function errorMessageForCode(code: ChatErrorCode): string {
  switch (code) {
    case "rate_limited":
      return "Rate limit reached — please wait a moment before trying again.";
    case "provider_error":
      return "The AI service hit a snag. Please try again in a moment.";
    case "invalid_request":
      return "That message couldn't be processed — try rephrasing it.";
    case "timeout":
      return "The AI took too long to respond. Please try again.";
    case "offline":
    default:
      return "Can't reach the AI assistant right now. Check your connection and try again.";
  }
}

/**
 * Which section is the visitor looking at right now? Every section is an
 * anchored 100vh block, so "nearest to the top of the viewport" is a good
 * enough proxy. Computed once per send (never on scroll) to keep it cheap,
 * and undefined rather than a guess when nothing is measurable.
 */
function detectCurrentSection(): string | undefined {
  if (typeof document === "undefined") return undefined;
  let nearest: string | undefined;
  let nearestDistance = Number.POSITIVE_INFINITY;
  for (const anchor of SECTION_ANCHORS) {
    const el = document.getElementById(anchor);
    if (!el) continue;
    const distance = Math.abs(el.getBoundingClientRect().top);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearest = anchor;
    }
  }
  return nearest;
}

/**
 * `pending` is in-flight UI state, not conversation content. Persisting it (or
 * restoring it) leaves a message stuck behind a blinking cursor forever, with
 * its text aria-hidden and its actions never rendered.
 */
function clearPending(list: ChatMessage[]): ChatMessage[] {
  if (!list.some((m) => m.pending)) return list;
  return list.map((m) => (m.pending ? { ...m, pending: false } : m));
}

function formatStatus(status: ChatStatusResponse): string {
  const rows: [string, string][] = [
    ["AVAILABLE", status.available ? "YES" : "NO"],
    ["MODE", status.mode.toUpperCase()],
  ];
  const labelWidth = Math.max(...rows.map(([label]) => label.length));
  const valueWidth = Math.max(...rows.map(([, value]) => value.length));
  const width = labelWidth + valueWidth + 5;
  const top = `┌${"─".repeat(width)}┐`;
  const bottom = `└${"─".repeat(width)}┘`;
  const lines = rows.map(
    ([label, value]) => `│ ${label.padEnd(labelWidth)} : ${value.padEnd(valueWidth)} │`,
  );
  return [top, ...lines, bottom].join("\n");
}

interface ChatContextValue {
  messages: ChatMessage[];
  isOpen: boolean;
  isStreaming: boolean;
  /**
   * Last failure, as a human-readable sentence. Intentionally reserved: the
   * failure is already rendered inline as an `kind: "error"` message, so no
   * surface consumes this today — it stays for a future toast/status line.
   */
  error: string | null;
  conversationId: string;
  openChat: (source?: string) => void;
  closeChat: () => void;
  /** Return focus to whatever element opened the chat. Safe to call twice. */
  restoreTriggerFocus: () => void;
  sendMessage: (text: string) => Promise<void>;
  clearMessages: () => void;
  cancelStream: () => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function useChatSession(): ChatContextValue {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error("useChatSession must be used within a ChatProvider");
  }
  return ctx;
}

interface ChatProviderProps {
  children: ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string>(() => genId());

  const messagesRef = useRef<ChatMessage[]>([]);
  const abortRef = useRef<AbortController | null>(null);
  const cancelledRef = useRef(false);
  const hydratedRef = useRef(false);
  const lastTriggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Hydrate from sessionStorage after mount only — reading it during the
  // initial render would diverge from the server-rendered (empty) markup.
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { messages?: ChatMessage[]; conversationId?: string };
      // A reload mid-stream leaves `pending: true` in storage; restoring it
      // verbatim resurrects a permanently-streaming message.
      if (Array.isArray(parsed.messages)) setMessages(clearPending(parsed.messages));
      if (typeof parsed.conversationId === "string") setConversationId(parsed.conversationId);
    } catch {
      // Corrupt or inaccessible sessionStorage — start fresh.
    }
  }, []);

  // Mirror every change back to sessionStorage so a remount (not a fresh
  // visit) doesn't lose the conversation. Never localStorage.
  useEffect(() => {
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        // Persist the text streamed so far, never the in-flight flag.
        JSON.stringify({ messages: clearPending(messages), conversationId }),
      );
    } catch {
      // Storage unavailable (private mode, quota) — non-fatal.
    }
  }, [messages, conversationId]);

  const openChat = useCallback((source?: string) => {
    // Capture the trigger synchronously, at call time — a passive effect runs
    // after React has already swapped the launcher out and focus has fallen
    // back to <body>, which is too late to restore anything.
    lastTriggerRef.current = (document.activeElement as HTMLElement) ?? null;
    // `source` (e.g. "launcher", "ai-guide") is accepted for callers that
    // want to tag where a conversation started; nothing here currently
    // branches on it, so it's intentionally a no-op read.
    void source;
    setIsOpen(true);
  }, []);

  const restoreTriggerFocus = useCallback(() => {
    // preventScroll: the AI Guide CTA lives in a GSAP-pinned section, and a
    // scrolling refocus fights Lenis for control of the scroll position.
    lastTriggerRef.current?.focus?.({ preventScroll: true });
    lastTriggerRef.current = null;
  }, []);

  // Closing the panel is a view operation only — the stream keeps running in
  // the background so the finished answer is waiting on reopen. Cancelling is
  // [STOP]'s job (cancelStream), not this one's.
  const closeChat = useCallback(() => {
    setIsOpen(false);
  }, []);

  const cancelStream = useCallback(() => {
    if (abortRef.current) {
      cancelledRef.current = true;
      abortRef.current.abort();
    }
  }, []);

  const clearMessages = useCallback(() => {
    // Wiping the transcript without cutting the request would leave a stream
    // billing away with isStreaming stuck true.
    cancelStream();
    setMessages([]);
    setError(null);
    setConversationId(genId());
  }, [cancelStream]);

  const appendMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const buildHistory = useCallback((): { role: ChatRole; content: string }[] => {
    const eligible = messagesRef.current.filter(
      (m) => m.kind === "chat" && (m.role === "user" || m.role === "assistant"),
    );
    const recent = eligible.slice(-CHAT_LIMITS.MAX_HISTORY_MESSAGES);

    let charCount = 0;
    const result: { role: ChatRole; content: string }[] = [];
    for (let i = recent.length - 1; i >= 0; i--) {
      const m = recent[i];
      charCount += m.content.length;
      if (charCount > CHAT_LIMITS.MAX_HISTORY_CHARS && result.length > 0) break;
      result.unshift({ role: m.role, content: m.content });
    }
    return result;
  }, []);

  const runChatRequest = useCallback(
    async (text: string) => {
      const history = buildHistory();
      const controller = new AbortController();
      abortRef.current = controller;
      cancelledRef.current = false;
      setIsStreaming(true);
      setError(null);

      const assistantId = genId();
      appendMessage({ id: assistantId, role: "assistant", content: "", kind: "chat", pending: true });

      const body: ChatRequest = {
        message: text,
        conversationId,
        currentSection: detectCurrentSection(),
        history,
      };

      /**
       * Surface a failure without throwing away what already streamed: an
       * empty placeholder becomes the error itself, a partly-written answer
       * is kept and the error is appended as its own message.
       */
      const failAssistantMessage = (friendly: string) => {
        setError(friendly);
        setMessages((prev) => {
          const target = prev.find((m) => m.id === assistantId);
          if (!target || target.content.length === 0) {
            return prev.map((m) =>
              m.id === assistantId ? { ...m, pending: false, kind: "error", content: friendly } : m,
            );
          }
          return [
            ...prev.map((m) => (m.id === assistantId ? { ...m, pending: false } : m)),
            { id: genId(), role: "assistant", kind: "error", content: friendly },
          ];
        });
      };

      const handleStreamEvent = (event: ChatStreamEvent) => {
        if (event.type === "delta") {
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + event.text } : m)),
          );
          return;
        }
        if (event.type === "done") {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, pending: false, actions: event.actions, sources: event.sources }
                : m,
            ),
          );
          return;
        }
        // event.type === "error" — an error frame can arrive mid-stream (the
        // idle watchdog), so keep whatever already rendered.
        failAssistantMessage(errorMessageForCode(event.code));
      };

      // Did the response body yield at least one parseable frame? Decides
      // whether a non-2xx can report its real cause or has to fall back.
      let sawFrame = false;

      const processFrame = (frame: string) => {
        const dataLine = frame.split("\n").find((line) => line.startsWith("data:"));
        if (!dataLine) return;
        const jsonStr = dataLine.slice(5).trim();
        if (!jsonStr) return;
        try {
          const event = JSON.parse(jsonStr) as ChatStreamEvent;
          sawFrame = true;
          handleStreamEvent(event);
        } catch {
          // Malformed frame — skip rather than crash the stream.
        }
      };

      try {
        const response = await fetch(CHAT_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        // Deliberately not branching on `response.ok` here. The route returns
        // its error taxonomy (rate_limited / provider_error / timeout / ...) as
        // a normal SSE frame alongside a 4xx/5xx status, so throwing on !ok
        // would discard the real reason and report every failure as "offline".
        if (!response.body) {
          throw new Error(`chat request failed: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        // SSE frames are separated by a blank line and can split across
        // chunk boundaries at any point (mid-line or mid-frame) — buffer
        // everything and only consume text once a full "\n\n" is seen.
        let buffer = "";

        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const frames = buffer.split("\n\n");
          buffer = frames.pop() ?? "";
          for (const frame of frames) {
            if (frame.trim()) processFrame(frame);
          }
        }
        if (buffer.trim()) processFrame(buffer);

        // Nothing parseable came back on a failed response — an HTML error
        // page from a proxy, say. Only now is "offline" the honest answer.
        if (!response.ok && !sawFrame) {
          failAssistantMessage(errorMessageForCode("offline"));
        }
      } catch {
        if (cancelledRef.current) {
          setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, pending: false } : m)));
        } else {
          failAssistantMessage(errorMessageForCode("offline"));
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
        cancelledRef.current = false;
      }
    },
    [appendMessage, buildHistory, conversationId],
  );

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim().slice(0, CHAT_LIMITS.MAX_MESSAGE_LENGTH);
      if (!trimmed) return;

      const parsed = parseCommand(trimmed);

      if (parsed) {
        appendMessage({ id: genId(), role: "user", content: trimmed, kind: "chat" });

        let outcome: CommandOutcome;
        try {
          // executeCommand takes the raw input string (it re-parses
          // internally) and runs synchronously — no network, no await.
          outcome = executeCommand(trimmed);
        } catch {
          appendMessage({ id: genId(), role: "assistant", kind: "error", content: "That command couldn't be run." });
          return;
        }

        switch (outcome.type) {
          case "message":
            appendMessage({
              id: genId(),
              role: "assistant",
              kind: "command",
              content: outcome.content,
              actions: outcome.actions,
              view: outcome.view,
            });
            break;
          case "clear":
            clearMessages();
            break;
          case "close":
            closeChat();
            break;
          case "status":
            try {
              const res = await fetch(STATUS_ENDPOINT);
              const data = (await res.json()) as ChatStatusResponse;
              appendMessage({ id: genId(), role: "assistant", kind: "command", content: formatStatus(data) });
            } catch {
              appendMessage({
                id: genId(),
                role: "assistant",
                kind: "error",
                content: errorMessageForCode("offline"),
              });
            }
            break;
        }
        return;
      }

      appendMessage({ id: genId(), role: "user", content: trimmed, kind: "chat" });
      await runChatRequest(trimmed);
    },
    [appendMessage, clearMessages, closeChat, runChatRequest],
  );

  const value: ChatContextValue = {
    messages,
    isOpen,
    isStreaming,
    error,
    conversationId,
    openChat,
    closeChat,
    restoreTriggerFocus,
    sendMessage,
    clearMessages,
    cancelStream,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}
