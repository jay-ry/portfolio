"use client";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";

const links = [
  { label: "EMAIL",    display: "imjayandrade@gmail.com",         href: "mailto:imjayandrade@gmail.com",                copy: "imjayandrade@gmail.com",                       external: false, icon: "◆" },
  { label: "LINKEDIN", display: "linkedin.com/in/jay-ryan-andrade", href: "https://www.linkedin.com/in/jay-ryan-andrade/", copy: "https://www.linkedin.com/in/jay-ryan-andrade/", external: true,  icon: "◉" },
  { label: "GITHUB",   display: "github.com/jay-ry",              href: "https://github.com/jay-ry",                    copy: "https://github.com/jay-ry",                    external: true,  icon: "◈" },
];

export type ContactHandle = {
  section: HTMLElement;
  titleBlock: HTMLDivElement;
  cards: HTMLAnchorElement[];
};

const Contact = forwardRef<ContactHandle>((_, ref) => {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [copied, setCopied] = useState("");

  useImperativeHandle(ref, () => ({
    get section() { return sectionRef.current!; },
    get titleBlock() { return titleRef.current!; },
    get cards() { return cardRefs.current.filter(Boolean) as HTMLAnchorElement[]; },
  }), []);

  const copy = (val: string, label: string) => {
    navigator.clipboard.writeText(val);
    setCopied(label);
    setTimeout(() => setCopied(""), 2000);
  };

  return (
    <section
      id="contact"
      ref={sectionRef}
      style={{ height: "100vh", padding: "0 6vw", display: "flex", flexDirection: "column", justifyContent: "center", position: "relative", zIndex: 10, overflow: "hidden" }}
    >
      <div ref={titleRef} className="contact-title-block">
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "1rem" }}>
          <span className="section-label">006 // CONTACT</span>
          <div className="sci-divider" style={{ flex: 1, maxWidth: "300px" }} />
        </div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 5vw, 4rem)", fontWeight: 700, letterSpacing: "0.05em" }}>
          ESTABLISH<br /><span style={{ color: "var(--accent)", opacity: 0.5 }}>CONTACT</span>
        </h2>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "15px", color: "var(--text-muted)", marginTop: "1rem", maxWidth: "400px" }}>
          Open to senior engineering roles, freelance projects, and interesting collaborations. Response time: usually fast.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1rem", maxWidth: "800px" }}>
        {links.map((l, i) => (
          <a
            key={l.label}
            ref={el => { cardRefs.current[i] = el; }}
            href={l.href}
            {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="neon-border"
            style={{ background: "var(--panel-bg)", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem", cursor: "pointer", textAlign: "left", textDecoration: "none", color: "inherit" }}
          >
            <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "20px", color: "var(--accent)" }}>{l.icon}</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.15em", color: "var(--text-muted)" }}>{l.external ? "OPEN ↗" : "SEND ↗"}</span>
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.2em", color: "var(--text-muted)" }}>{l.label}</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "13px", color: "var(--text)" }}>{l.display}</span>
            <span
              role="button"
              tabIndex={0}
              aria-label={`Copy ${l.label.toLowerCase()}`}
              onClick={e => { e.preventDefault(); e.stopPropagation(); copy(l.copy, l.label); }}
              onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); copy(l.copy, l.label); } }}
              style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--accent)", marginTop: "0.5rem", opacity: copied === l.label ? 1 : 0.4, cursor: "pointer", alignSelf: "flex-start" }}
            >
              {copied === l.label ? "✓ COPIED" : "⧉ COPY"}
            </span>
          </a>
        ))}
      </div>

      <div className="contact-footer" style={{ paddingTop: "2rem", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-muted)" }}>
          &gt; sudo shutdown -h now<span className="blink" style={{ marginLeft: 4 }}>_</span>
        </span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-muted)" }}>
          <span style={{ color: "var(--status-color)" }}>■</span> SYSTEM NOMINAL
        </span>
      </div>
    </section>
  );
});

Contact.displayName = "Contact";
export default Contact;
