"use client";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";

const links = [
  { label: "EMAIL", value: "jayryan267@gmail.com", icon: "◆" },
  { label: "LINKEDIN", value: "linkedin.com/in/jay-andrade-9211571bb", icon: "◉" },
  { label: "GITHUB", value: "github.com/jay-ry", icon: "◈" },
];

export type ContactHandle = {
  section: HTMLElement;
  titleBlock: HTMLDivElement;
  cards: HTMLButtonElement[];
};

const Contact = forwardRef<ContactHandle>((_, ref) => {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [copied, setCopied] = useState("");

  useImperativeHandle(ref, () => ({
    get section() { return sectionRef.current!; },
    get titleBlock() { return titleRef.current!; },
    get cards() { return cardRefs.current.filter(Boolean) as HTMLButtonElement[]; },
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
          <button
            key={l.label}
            ref={el => { cardRefs.current[i] = el; }}
            onClick={() => copy(l.value, l.label)}
            className="neon-border"
            style={{ background: "rgba(5,13,20,0.8)", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem", cursor: "pointer", textAlign: "left", border: "none", color: "inherit" }}
          >
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "20px", color: "var(--accent)" }}>{l.icon}</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.2em", color: "var(--text-muted)" }}>{l.label}</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "13px", color: "var(--text)" }}>{l.value}</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--accent)", marginTop: "0.5rem", opacity: copied === l.label ? 1 : 0.4 }}>
              {copied === l.label ? "✓ COPIED" : "CLICK TO COPY"}
            </span>
          </button>
        ))}
      </div>

      <div className="contact-footer" style={{ paddingTop: "2rem", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-muted)" }}>
          &gt; sudo shutdown -h now<span className="blink" style={{ marginLeft: 4 }}>_</span>
        </span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-muted)" }}>
          <span style={{ color: "#00ff88" }}>■</span> SYSTEM NOMINAL
        </span>
      </div>
    </section>
  );
});

Contact.displayName = "Contact";
export default Contact;
