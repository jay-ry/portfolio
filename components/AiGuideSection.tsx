"use client";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useChatSession } from "@/components/chat/ChatProvider";
import type { ChatStatusResponse } from "@/lib/chat/types";

export type AiGuideHandle = {
  section:    HTMLElement;
  titleBlock: HTMLDivElement;
  intro:      HTMLDivElement;
  panel:      HTMLDivElement;
};

const TOPICS = [
  "PROJECTS & ARCHITECTURE",
  "TECHNICAL STACK",
  "WORK HISTORY",
  "AVAILABILITY",
];

const SAMPLE_COMMANDS = [
  { cmd: "/projects",     desc: "list all deployed systems" },
  { cmd: "/project <id>", desc: "inspect a single build" },
  { cmd: "/skills",       desc: "stack by domain" },
  { cmd: "/help",         desc: "all commands" },
];

const AiGuideSection = forwardRef<AiGuideHandle>((_, ref) => {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef   = useRef<HTMLDivElement>(null);
  const introRef   = useRef<HTMLDivElement>(null);
  const panelRef   = useRef<HTMLDivElement>(null);

  const { openChat } = useChatSession();
  const [status, setStatus] = useState<ChatStatusResponse | null>(null);

  useImperativeHandle(ref, () => ({
    get section()    { return sectionRef.current!; },
    get titleBlock() { return titleRef.current!; },
    get intro()      { return introRef.current!; },
    get panel()      { return panelRef.current!; },
  }), []);

  // Honest status readout — /api/chat/status is cheap and makes no upstream call.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/chat/status")
      .then(r => (r.ok ? r.json() : null))
      .then(d => { if (!cancelled && d) setStatus(d as ChatStatusResponse); })
      .catch(() => { if (!cancelled) setStatus({ available: false, mode: "offline" }); });
    return () => { cancelled = true; };
  }, []);

  const online    = status?.available ?? false;
  const statusDot = online ? "var(--status-color)" : "var(--accent2)";
  const statusTxt = status === null ? "PROBING..." : online ? "ONLINE" : "OFFLINE";

  return (
    <section
      id="ai-guide"
      ref={sectionRef}
      style={{
        height: "100vh",
        padding: "0 6vw",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        position: "relative",
        zIndex: 10,
        overflow: "hidden",
      }}
    >
      <div ref={titleRef} style={{ marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "1rem" }}>
          <span className="section-label">005 // AI GUIDE</span>
          <div className="sci-divider" style={{ flex: 1, maxWidth: "300px" }} />
        </div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 5vw, 4rem)", fontWeight: 700, color: "var(--text)", letterSpacing: "0.05em" }}>
          ASK ABOUT<br /><span style={{ color: "var(--accent)", opacity: 0.5 }}>MY WORK.</span>
        </h2>
      </div>

      <div className="ai-guide-grid">
        {/* Left — introduction, status, topics */}
        <div ref={introRef} style={{ maxWidth: "560px" }}>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "16px", color: "var(--text-muted)", lineHeight: 1.9, letterSpacing: "0.03em", marginBottom: "1.5rem" }}>
            Jay AI — same projects, same opinions, none of the sleep. Ask about the systems
            I&apos;ve shipped, the decisions behind them, my stack, or my experience. It answers
            from the same records this site is built from, and admits it when something
            isn&apos;t in there.
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.75rem" }}>
            <span
              className={online ? "blink" : undefined}
              style={{ width: "7px", height: "7px", borderRadius: "50%", background: statusDot, boxShadow: `0 0 8px ${statusDot}` }}
            />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.2em", color: "var(--text-muted)" }}>
              AI GUIDE // {statusTxt}
            </span>
          </div>

          <div style={{ marginBottom: "2rem" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.25em", color: "var(--accent)", opacity: 0.7, marginBottom: "0.75rem" }}>
              SUPPORTED TOPICS
            </div>
            <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
              {TOPICS.map(t => (
                <span
                  key={t}
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    letterSpacing: "0.15em",
                    color: "var(--text-muted)",
                    border: "1px solid var(--border)",
                    padding: "6px 14px",
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => openChat("ai-guide-section")}
            className="neon-border ai-guide-cta"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "13px",
              letterSpacing: "0.2em",
              color: "var(--accent)",
              background: "transparent",
              padding: "14px 32px",
              cursor: "pointer",
              clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)",
            }}
          >
            &gt; OPEN AI GUIDE
          </button>
        </div>

        {/* Right — terminal preview of the command surface */}
        <div
          ref={panelRef}
          className="neon-border ai-guide-panel"
          style={{
            background: "var(--panel-bg)",
            padding: "1.25rem",
            clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", paddingBottom: "0.75rem", borderBottom: "1px solid var(--border)" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.2em", color: "var(--text-muted)" }}>
              JAY.OS // GUIDE
            </span>
          </div>

          <div style={{ fontFamily: "var(--font-mono)", fontSize: "12px", lineHeight: 2, color: "var(--text-muted)" }}>
            <div style={{ color: "var(--accent)" }}>&gt; which project shows backend depth?</div>
            <div style={{ marginBottom: "1rem" }}>
              BIZ-BOT — multi-tenant RAG platform on Next.js, Hono, Drizzle and PostgreSQL.
            </div>
            <div style={{ color: "var(--accent)", opacity: 0.5 }}>
              &gt; <span className="blink">_</span>
            </div>
          </div>

          <div style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid var(--border)" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.25em", color: "var(--accent)", opacity: 0.7, marginBottom: "0.6rem" }}>
              COMMANDS
            </div>
            {SAMPLE_COMMANDS.map(c => (
              <div key={c.cmd} style={{ display: "flex", gap: "0.75rem", fontFamily: "var(--font-mono)", fontSize: "11px", lineHeight: 1.9 }}>
                <span style={{ color: "var(--accent)", minWidth: "108px" }}>{c.cmd}</span>
                <span style={{ color: "var(--text-muted)" }}>{c.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
});

AiGuideSection.displayName = "AiGuideSection";
export default AiGuideSection;
