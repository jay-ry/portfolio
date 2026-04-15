"use client";
import { forwardRef, useImperativeHandle, useRef } from "react";
import { TypeAnimation } from "react-type-animation";

export type HeroHandle = {
  section: HTMLElement;
  bootLines: HTMLDivElement;
  name: HTMLHeadingElement;
  subTitle: HTMLHeadingElement;
  sub: HTMLDivElement;
  cta: HTMLDivElement;
};

const Hero = forwardRef<HeroHandle>((_, ref) => {
  const sectionRef = useRef<HTMLElement>(null);
  const bootRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const subTitleRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    get section() { return sectionRef.current!; },
    get bootLines() { return bootRef.current!; },
    get name() { return nameRef.current!; },
    get subTitle() { return subTitleRef.current!; },
    get sub() { return subRef.current!; },
    get cta() { return ctaRef.current!; },
  }), []);

  return (
    <section
      id="hero"
      ref={sectionRef}
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "0 6vw",
        position: "relative",
        zIndex: 10,
        overflow: "hidden",
      }}
    >
      <div ref={bootRef} style={{ marginBottom: "2rem", fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-muted)" }}>
        <div>SYSTEM BOOT... <span style={{ color: "var(--accent)" }}>OK</span></div>
        <div>LOADING PROFILE: <span style={{ color: "var(--accent)" }}>JAY ANDRADE</span></div>
        <div>STATUS: <span style={{ color: "#00ff88" }}>■ ONLINE</span></div>
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: "1rem", marginBottom: "0.5rem" }}>
        <span className="section-label">001 // INIT</span>
        <div className="sci-divider" style={{ flex: 1, maxWidth: "200px" }} />
      </div>

      <h1
        ref={nameRef}
        className="glitch-text flicker"
        data-text="JAY"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(3rem, 10vw, 9rem)",
          fontWeight: 900,
          color: "var(--accent)",
          lineHeight: 0.9,
          letterSpacing: "-0.02em",
          textShadow: "0 0 40px rgba(0,255,224,0.3)",
        }}
      >
        JAY
      </h1>
      <h2
        ref={subTitleRef}
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(2rem, 7vw, 6rem)",
          fontWeight: 400,
          color: "var(--text)",
          lineHeight: 1,
          letterSpacing: "0.05em",
          opacity: 0.5,
        }}
      >
        ANDRADE
      </h2>

      <div ref={subRef} style={{ marginTop: "2.5rem", maxWidth: "500px" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "14px", color: "var(--accent)", marginBottom: "0.5rem" }}>
          <span style={{ color: "var(--text-muted)" }}>$ </span>
          <TypeAnimation
            sequence={[
              "building full-stack web apps...", 2000,
              "training developers in Python...", 2000,
              "shipping data-driven solutions...", 2000,
              "turning ideas into interfaces...", 2000,
            ]}
            repeat={Infinity}
            speed={60}
          />
        </div>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "16px", color: "var(--text-muted)", lineHeight: 1.7, letterSpacing: "0.04em" }}>
          Full-Stack Developer based in Dubai with 2+ years of industry experience — building
          production-grade software and mentoring the next generation of developers.
        </p>
      </div>

      <div ref={ctaRef} style={{ display: "flex", gap: "1.5rem", marginTop: "3rem", flexWrap: "wrap" }}>
        <a
          href="#projects"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            letterSpacing: "0.2em",
            color: "var(--bg)",
            background: "var(--accent)",
            padding: "14px 32px",
            textDecoration: "none",
            clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)",
            transition: "transform 0.2s, box-shadow 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "var(--glow)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
        >
          VIEW_PROJECTS
        </a>

      </div>

      <div style={{ position: "absolute", bottom: "2.5rem", left: "6vw", fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "1rem" }}>
        <div style={{ width: "40px", height: "1px", background: "var(--text-muted)" }} />
        SCROLL TO EXPLORE
      </div>

      <div className="hero-side-panel" style={{ position: "absolute", top: "30%", right: "6vw", fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-muted)", textAlign: "right", lineHeight: 2 }}>
        <div>STACK: REACT / PYTHON / AI</div>
        <div>LOCATION: <span style={{ color: "var(--accent)" }}>DUBAI, UAE</span></div>
        <div>STATUS: <span style={{ color: "#00ff88" }}>AVAILABLE</span></div>
      </div>
    </section>
  );
});

Hero.displayName = "Hero";
export default Hero;
