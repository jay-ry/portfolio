"use client";
import { forwardRef, useImperativeHandle, useRef } from "react";

export type AboutHandle = {
  section:    HTMLElement;
  titleBlock: HTMLDivElement;
  bio:        HTMLDivElement;
  chips:      HTMLDivElement;
};

const About = forwardRef<AboutHandle>((_, ref) => {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef   = useRef<HTMLDivElement>(null);
  const bioRef     = useRef<HTMLDivElement>(null);
  const chipsRef   = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    get section()    { return sectionRef.current!; },
    get titleBlock() { return titleRef.current!; },
    get bio()        { return bioRef.current!; },
    get chips()      { return chipsRef.current!; },
  }), []);

  return (
    <section
      id="about"
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
          <span className="section-label">002 // ABOUT</span>
          <div className="sci-divider" style={{ flex: 1, maxWidth: "300px" }} />
        </div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 5vw, 4rem)", fontWeight: 700, color: "var(--text)", letterSpacing: "0.05em" }}>
          FULL-STACK<br /><span style={{ color: "var(--accent)", opacity: 0.5 }}>DEVELOPER.</span>
        </h2>
      </div>

      <div ref={bioRef} style={{ maxWidth: "600px", marginBottom: "2.5rem" }}>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "16px", color: "var(--text-muted)", lineHeight: 1.9, letterSpacing: "0.03em", marginBottom: "1.25rem" }}>
          I'm Jay — a Full-Stack Developer who builds things end-to-end. From MERN-stack web apps
          and hardware prototypes to AI chatbots with RAG pipelines and real-time multiplayer
          platforms, I gravitate toward projects that are technically interesting and actually ship.
        </p>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "16px", color: "var(--text-muted)", lineHeight: 1.9, letterSpacing: "0.03em", marginBottom: "1.25rem" }}>
          Currently a Junior Web Developer at Potential, building full-stack applications across
          the whole product lifecycle.
        </p>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "16px", color: "var(--text-muted)", lineHeight: 1.9, letterSpacing: "0.03em" }}>
          I care about clean architecture, fast iteration, and writing software that holds up
          in production.
        </p>
      </div>

      <div ref={chipsRef} style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        {["2+ YRS EXPERIENCE", "6+ PROJECTS SHIPPED", "DUBAI, UAE"].map(chip => (
          <span
            key={chip}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              letterSpacing: "0.15em",
              color: "var(--text-muted)",
              border: "1px solid var(--border)",
              padding: "6px 16px",
            }}
          >
            {chip}
          </span>
        ))}
      </div>
    </section>
  );
});

About.displayName = "About";
export default About;
