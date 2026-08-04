"use client";

import type { CSSProperties } from "react";
import type { ChatAction } from "@/lib/chat/types";
import { isValidAnchor } from "@/lib/chat/types";
import { scrollToSection } from "@/lib/chat/scroll";
import { MOBILE_QUERY, useChatSession } from "./ChatProvider";

const buttonStyle: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "11px",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--accent)",
  background: "transparent",
  border: "1px solid var(--border)",
  padding: "6px 14px",
  cursor: "pointer",
  textDecoration: "none",
  clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)",
  display: "inline-block",
};

interface AnswerActionsProps {
  actions: ChatAction[];
}

/**
 * Renders ChatAction[] as skewed terminal buttons. Every action is
 * re-validated here even though the API is expected to only ever emit
 * allowlisted actions — actions are untrusted the moment they leave the
 * server, and this is the last line of defense before an href hits the DOM.
 */
export function AnswerActions({ actions }: AnswerActionsProps) {
  const { closeChat } = useChatSession();

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
      {actions.map((action, i) => {
        if (action.kind === "scroll") {
          if (!isValidAnchor(action.anchor)) return null;
          return (
            <a
              key={i}
              href={`#${action.anchor}`}
              className="neon-border"
              style={buttonStyle}
              onClick={(e) => {
                // Mobile overlay covers the viewport — get out of the way so
                // the scroll is actually visible. Shared MOBILE_QUERY, not a
                // third hardcoded copy of the breakpoint.
                if (window.matchMedia(MOBILE_QUERY).matches) closeChat();

                // A plain anchor jump lands at the START of the section's
                // pinned range, where its scrub timeline is at progress 0 and
                // everything is still opacity:0 — a correctly-positioned blank
                // screen. scrollToSection lands far enough in for the content
                // to have appeared. The href stays for middle-click, right-
                // click and keyboard semantics; only the plain click is taken.
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                if (scrollToSection(action.anchor, action.projectId)) e.preventDefault();
              }}
            >
              {action.label}
            </a>
          );
        }

        if (action.kind === "external") {
          if (!action.url || !action.url.startsWith("https://")) return null;
          return (
            <a
              key={i}
              href={action.url}
              target="_blank"
              rel="noopener noreferrer"
              className="neon-border"
              style={buttonStyle}
            >
              {action.label} ↗
            </a>
          );
        }

        if (action.kind === "email") {
          if (!action.href || !action.href.startsWith("mailto:")) return null;
          return (
            <a key={i} href={action.href} className="neon-border" style={buttonStyle}>
              {action.label}
            </a>
          );
        }

        return null;
      })}
    </div>
  );
}
