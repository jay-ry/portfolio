"use client";

import { useChatSession } from "./ChatProvider";

// Phrased second-person: the assistant answers as Jay, so a visitor talks
// to "you", not about "him".
const SUGGESTIONS = [
  "Which project best shows your backend architecture?",
  "What have you actually shipped to production?",
  "What's your main technology stack?",
  "Tell me about Biz-Bot.",
  "Which projects use real-time communication?",
  "Are you open to freelance or engineering work?",
];

/**
 * Empty-state content: shown only when there are no messages yet.
 */
export function PromptSuggestions() {
  const { sendMessage, isStreaming } = useChatSession();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div>
        <p className="section-label" style={{ marginBottom: "0.6rem" }}>
          005 // AI GUIDE
        </p>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "var(--text-muted)", lineHeight: 1.6 }}>
          I&apos;m Jay AI — ask about my projects, stack, or experience, or try a prompt below.
        </p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {SUGGESTIONS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            disabled={isStreaming}
            onClick={() => sendMessage(prompt)}
            className="neon-border"
            style={{
              textAlign: "left",
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              color: "var(--text)",
              background: "var(--panel-bg)",
              padding: "0.65rem 0.9rem",
              cursor: isStreaming ? "default" : "pointer",
              opacity: isStreaming ? 0.5 : 1,
            }}
          >
            <span style={{ color: "var(--accent)", marginRight: "0.4rem" }} aria-hidden="true">
              ›
            </span>
            {prompt}
          </button>
        ))}
      </div>
      <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-muted)", opacity: 0.7 }}>
        Tip: type <span style={{ color: "var(--accent)" }}>/</span> for commands.
      </p>
    </div>
  );
}
