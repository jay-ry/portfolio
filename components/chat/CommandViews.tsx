"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { ChatAction } from "@/lib/chat/types";
import type { ContactLink, Role, SkillDomain } from "@/lib/portfolio-data";
import { AnswerActions } from "./AnswerActions";

/**
 * Rich renders for `/skills`, `/experience`, `/contact` and `/help` — see
 * CommandView in lib/chat/types.ts. Same rules as ProjectCard.tsx: CSS
 * custom properties only (no literal hex), inline styles, AnswerActions
 * reused for every scroll/external/email button.
 */

const panelStyle: CSSProperties = {
  position: "relative",
  background: "var(--panel-bg)",
  border: "1px solid var(--border)",
  padding: "0.9rem 1rem",
  clipPath:
    "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
};

function isHttpsUrl(url: string): boolean {
  return url.startsWith("https://");
}

// ---------------------------------------------------------------------------
// /skills
// ---------------------------------------------------------------------------

const SKILL_BAR_SEGMENTS = 10;

function SkillMeter({ level }: { level: number }) {
  const clamped = Math.max(0, Math.min(SKILL_BAR_SEGMENTS, level));
  return (
    <div
      style={{ display: "flex", gap: "1px", flexShrink: 0 }}
      role="img"
      aria-label={`${level} out of ${SKILL_BAR_SEGMENTS}, self-rated`}
    >
      {Array.from({ length: SKILL_BAR_SEGMENTS }, (_, i) => (
        <span
          key={i}
          aria-hidden="true"
          style={{
            width: "5px",
            height: "6px",
            background: i < clamped ? "var(--accent)" : "transparent",
            border: `1px solid ${i < clamped ? "var(--accent)" : "var(--border)"}`,
          }}
        />
      ))}
    </div>
  );
}

export interface SkillsViewProps {
  domains: SkillDomain[];
}

export function SkillsView({ domains }: SkillsViewProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem", width: "100%" }}>
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "10px",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--text-muted)",
          margin: 0,
        }}
      >
        Self-rated proficiency, 0–10 — not a benchmark or years of experience
      </p>

      {domains.map((domain) => (
        <section key={domain.id} style={panelStyle}>
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "0.85rem",
              fontWeight: 700,
              color: "var(--accent)",
              letterSpacing: "0.08em",
              margin: "0 0 0.55rem",
            }}
          >
            {domain.id}
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            {domain.skills.map((skill) => (
              <div
                key={skill.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "0.6rem",
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    color: "var(--text)",
                    minWidth: 0,
                  }}
                >
                  {skill.name}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexShrink: 0 }}>
                  <SkillMeter level={skill.level} />
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "10px",
                      color: "var(--text-muted)",
                      width: "2.2ch",
                      textAlign: "right",
                    }}
                  >
                    {skill.level}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// /experience
// ---------------------------------------------------------------------------

export interface ExperienceViewProps {
  roles: Role[];
}

export function ExperienceView({ roles }: ExperienceViewProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
      {roles.map((role, i) => {
        const isLast = i === roles.length - 1;
        return (
          <div key={role.id} style={{ display: "flex", gap: "0.7rem" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
              <span
                aria-hidden="true"
                style={{
                  width: "8px",
                  height: "8px",
                  marginTop: "4px",
                  flexShrink: 0,
                  border: "1.5px solid var(--accent)",
                  background: "var(--bg-secondary)",
                  transform: "rotate(45deg)",
                }}
              />
              {!isLast && (
                <span
                  aria-hidden="true"
                  style={{ flex: 1, width: "1px", minHeight: "1.4rem", background: "var(--border)", marginTop: "4px" }}
                />
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0, paddingBottom: isLast ? 0 : "0.9rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem", flexWrap: "wrap" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--accent)", letterSpacing: "0.1em" }}>
                  {role.id}
                </span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--text-muted)", letterSpacing: "0.08em" }}>
                  {role.type}
                </span>
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "0.88rem",
                  fontWeight: 700,
                  color: "var(--text)",
                  margin: "0.2rem 0 0.2rem",
                  letterSpacing: "0.03em",
                  lineHeight: 1.35,
                }}
              >
                {role.title}
              </h3>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-muted)", margin: 0, letterSpacing: "0.04em" }}>
                {role.company}
              </p>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-muted)", opacity: 0.75, margin: "0.2rem 0 0" }}>
                {role.period} · {role.location}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// /contact
// ---------------------------------------------------------------------------

function contactAction(link: ContactLink): ChatAction | null {
  if (link.href.startsWith("mailto:")) {
    return { kind: "email", href: link.href, label: "Email" };
  }
  if (isHttpsUrl(link.href)) {
    return { kind: "external", url: link.href, label: "Open" };
  }
  return null;
}

const copyButtonStyle: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "10px",
  letterSpacing: "0.06em",
  color: "var(--accent)",
  background: "transparent",
  border: "none",
  padding: 0,
  cursor: "pointer",
  alignSelf: "flex-start",
};

export interface ContactViewProps {
  links: ContactLink[];
}

export function ContactView({ links }: ContactViewProps) {
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleCopy = (link: ContactLink) => {
    // Copy `link.copy`, never `link.href` — for EMAIL these differ
    // (mailto: prefix vs the bare address).
    void navigator.clipboard.writeText(link.copy);
    setCopiedLabel(link.label);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopiedLabel(null), 2000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", width: "100%" }}>
      {links.map((link) => {
        const action = contactAction(link);
        const isCopied = copiedLabel === link.label;
        return (
          <article key={link.label} style={panelStyle}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "16px", color: "var(--accent)" }} aria-hidden="true">
                {link.icon ?? "·"}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "10px",
                  letterSpacing: "0.15em",
                  color: "var(--text-muted)",
                }}
              >
                {link.label}
              </span>
            </div>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "12.5px",
                color: "var(--text)",
                margin: "0.5rem 0 0.6rem",
                wordBreak: "break-word",
              }}
            >
              {link.display}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "0.9rem", flexWrap: "wrap" }}>
              {action && <AnswerActions actions={[action]} />}
              <button
                type="button"
                onClick={() => handleCopy(link)}
                aria-label={`Copy ${link.label.toLowerCase()}`}
                style={copyButtonStyle}
              >
                {isCopied ? "✓ COPIED" : "⧉ COPY"}
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// /help
// ---------------------------------------------------------------------------

export interface CommandsViewItem {
  name: string;
  args?: string;
  description: string;
  aliases: string[];
}

export interface CommandsViewProps {
  items: CommandsViewItem[];
}

export function CommandsView({ items }: CommandsViewProps) {
  return (
    <div style={panelStyle}>
      {items.map((c, i) => (
        <div
          key={c.name}
          style={{
            padding: i === 0 ? "0 0 0.6rem" : "0.6rem 0",
            borderTop: i === 0 ? undefined : "1px solid var(--border)",
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", flexWrap: "wrap" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--accent)" }}>
              /{c.name}
              {c.args ? ` ${c.args}` : ""}
            </span>
            {c.aliases.length > 0 && (
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-muted)", opacity: 0.65 }}>
                {c.aliases.map((a) => `/${a}`).join(" ")}
              </span>
            )}
          </div>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "12.5px",
              color: "var(--text-muted)",
              margin: "0.2rem 0 0",
            }}
          >
            {c.description}
          </p>
        </div>
      ))}
    </div>
  );
}
