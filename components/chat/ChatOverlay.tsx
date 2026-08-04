"use client";

import { useEffect, useRef, useState } from "react";
import { MOBILE_QUERY, useChatSession } from "./ChatProvider";
import { ChatMessageView } from "./ChatMessageView";
import { PromptSuggestions } from "./PromptSuggestions";
import { ChatInput, type ChatInputHandle } from "./ChatInput";

/**
 * Behavioral/ARIA mobile-vs-desktop split (focus trap, aria-modal, backdrop
 * click-to-close, body scroll lock) has to be decided in JS — those are
 * React branching decisions, not CSS properties, and matchMedia is the only
 * reliable way to read the breakpoint at the moment it matters. The visual
 * layout split (panel vs. bottom sheet, slide direction) is pure CSS via
 * @media in globals.css instead, so resizing across the breakpoint reflows
 * smoothly without waiting on a React re-render.
 *
 * The query string itself comes from ChatProvider so JS and CSS can never
 * disagree: at a fractional width like 768.5px a `max-width: 768px` /
 * `min-width: 769px` pair is false on BOTH sides, which used to render the
 * mobile bottom sheet while JS reported desktop — a full-viewport sheet with
 * no backdrop, no focus trap and no scroll lock.
 */
function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window === "undefined" ? false : window.matchMedia(MOBILE_QUERY).matches,
  );

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}

function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((el) => el.offsetParent !== null);
}

export default function ChatOverlay() {
  const { isOpen, closeChat, messages, restoreTriggerFocus } = useChatSession();
  const isMobile = useIsMobile();
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<ChatInputHandle>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const wasOpenRef = useRef(false);

  // Focus in on open, hand focus back to the opener on close. The trigger is
  // captured by the provider synchronously inside openChat() — reading
  // document.activeElement from here runs a commit too late, after React has
  // already re-rendered and focus may have fallen back to <body>.
  useEffect(() => {
    if (isOpen) {
      wasOpenRef.current = true;
      const t = window.setTimeout(() => inputRef.current?.focus(), 50);
      return () => window.clearTimeout(t);
    }
    // Guarded so the closed-on-mount render doesn't steal focus on page load.
    if (wasOpenRef.current) {
      wasOpenRef.current = false;
      restoreTriggerFocus();
    }
  }, [isOpen, restoreTriggerFocus]);

  // Body scroll lock — mobile only. The desktop panel is non-modal and the
  // page must stay scrollable behind it.
  useEffect(() => {
    if (!isMobile || !isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, isMobile]);

  // Focus trap — mobile only (true modal there; desktop stays non-modal).
  useEffect(() => {
    if (!isOpen || !isMobile) return;
    const panel = panelRef.current;
    if (!panel) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const focusable = getFocusable(panel);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus({ preventScroll: true });
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus({ preventScroll: true });
      }
    };
    panel.addEventListener("keydown", onKeyDown);
    return () => panel.removeEventListener("keydown", onKeyDown);
  }, [isOpen, isMobile]);

  // Auto-scroll the transcript as new content streams in. `isOpen` is a
  // dependency because a hidden (display:none) element has no scrollHeight —
  // without it, reopening a conversation would land at the top.
  useEffect(() => {
    if (!isOpen) return;
    const el = transcriptRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, isOpen]);

  return (
    <>
      {isMobile && isOpen && (
        <div
          className="chat-overlay-backdrop"
          style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(0,0,0,0.5)" }}
          onClick={closeChat}
          aria-hidden="true"
        />
      )}
      {/* Mounted at all times, hidden rather than unmounted when closed. The
          transcript below is a live region: screen readers ignore insertions
          into a region that was itself added to the DOM in the same commit as
          its first content, which silently swallowed the first answer of a
          session. Keeping the region in the tree ahead of any content is the
          only reliable fix. `hidden` (CSS restores display:none, see the
          .chat-overlay-panel[hidden] rule) plus `inert` keeps the closed panel
          out of the tab order, off the pointer and out of the a11y tree.

          Labelled by aria-label only: aria-labelledby pointed at the styled
          "005 // AI GUIDE" header, and since labelledby outranks label the
          dialog announced as "zero zero five slash slash A I GUIDE". */}
      <div
        id="chat-overlay"
        ref={panelRef}
        role="dialog"
        aria-modal={isOpen && isMobile ? true : undefined}
        aria-label="AI portfolio guide"
        className="chat-overlay-panel neon-border"
        hidden={!isOpen}
        inert={!isOpen}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.stopPropagation();
            closeChat();
          }
        }}
      >
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "1rem 1.25rem",
            borderBottom: "1px solid var(--border)",
            flexShrink: 0,
          }}
        >
          <span className="section-label" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ color: "var(--status-color)" }} aria-hidden="true">
              ■
            </span>
            005 // AI GUIDE
          </span>
          <button
            type="button"
            aria-label="Close chat"
            onClick={closeChat}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              color: "var(--text-muted)",
              background: "transparent",
              border: "1px solid var(--border)",
              padding: "4px 10px",
              cursor: "pointer",
              clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)",
            }}
          >
            [X]
          </button>
        </header>

        {/* data-lenis-prevent stops the global smooth-scroll library from
            hijacking wheel/touch input meant for this list.

            role="log" is the right container role for an append-only
            transcript: it carries an implicit polite live region scoped to
            additions, so new assistant content is announced once (see
            ChatMessageView's aria-hidden toggle on pending text) rather than
            per token. ChatMessageView marks user turns aria-live="off" so the
            visitor isn't read their own message back. */}
        <div
          ref={transcriptRef}
          data-lenis-prevent
          role="log"
          aria-live="polite"
          aria-atomic="false"
          style={{ flex: 1, overflowY: "auto", padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          {messages.length === 0 ? (
            <PromptSuggestions />
          ) : (
            messages.map((m) => <ChatMessageView key={m.id} message={m} />)
          )}
        </div>

        <ChatInput ref={inputRef} />
      </div>
    </>
  );
}
