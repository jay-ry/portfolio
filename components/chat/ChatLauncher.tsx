"use client";

import { useChatSession } from "./ChatProvider";

/**
 * Persistent bottom-right launcher. z-index 1500 — above section content
 * (500) and the glitch overlay (1000), below the chat overlay itself (2000)
 * and the custom cursor (9999).
 *
 * It stays MOUNTED while the overlay is open, merely hidden (opacity 0 +
 * `inert` + out of the tab order). Unmounting it would destroy the element
 * that had focus at open time, dropping focus to <body> so that closing the
 * chat restores nothing — a keyboard user pressing Escape would land at the
 * top of the document. Staying mounted is also what makes `aria-expanded` /
 * `aria-controls` meaningful: the control that owns the disclosure has to
 * exist for its state to be readable.
 */
export default function ChatLauncher() {
  const { isOpen, openChat } = useChatSession();

  return (
    <button
      type="button"
      aria-label="Ask AI about this portfolio"
      aria-expanded={isOpen}
      aria-controls="chat-overlay"
      inert={isOpen}
      tabIndex={isOpen ? -1 : undefined}
      onClick={() => openChat("launcher")}
      className="chat-launcher-pulse neon-border"
      style={{
        position: "fixed",
        right: "1.5rem",
        bottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))",
        zIndex: 1500,
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        background: "var(--panel-bg)",
        color: "var(--accent)",
        border: "1px solid var(--border)",
        padding: "0.7rem 1.1rem",
        cursor: "pointer",
        fontFamily: "var(--font-mono)",
        fontSize: "12px",
        letterSpacing: "0.1em",
        clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)",
        opacity: isOpen ? 0 : 1,
        pointerEvents: isOpen ? "none" : undefined,
        transition: "opacity 0.2s ease-out",
      }}
    >
      <span aria-hidden="true" style={{ fontSize: "14px" }}>
        &gt;_
      </span>
      <span className="chat-launcher-label">ASK AI</span>
    </button>
  );
}
