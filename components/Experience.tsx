"use client";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";

const experiences = [
  {
    id: "001",
    title: "JUNIOR WEB DEVELOPER",
    company: "POTENTIAL",
    type: "FULL-TIME",
    period: "MAY 2025 – PRESENT",
    location: "DUBAI, UAE",
    color: "#00ffe0",
    rgb: "0,255,224",
  },
  {
    id: "002",
    title: "FULL STACK DEVELOPER",
    company: "CRUISE MOTORS",
    type: "FULL-TIME",
    period: "DEC 2024 – MAR 2025",
    location: "DUBAI, UAE",
    color: "#00ffe0",
    rgb: "0,255,224",
  },
  {
    id: "003",
    title: "INSTRUCTOR",
    company: "ZABEEL INTERNATIONAL INSTITUTE",
    type: "FREELANCE",
    period: "OCT 2023 – JAN 2025",
    location: "DUBAI, UAE",
    color: "#7b00ff",
    rgb: "123,0,255",
  },
  {
    id: "004",
    title: "TECHNICAL ANALYST INTERN",
    company: "HEALY CONSULTANTS GROUP",
    type: "PART-TIME",
    period: "APR 2023 – JUL 2023",
    location: "DUBAI, UAE",
    color: "#ff003c",
    rgb: "255,0,60",
  },
  {
    id: "005",
    title: "FULL STACK ENGINEER",
    company: "MIDDLESEX UNIVERSITY DUBAI",
    type: "INTERNSHIP",
    period: "NOV 2022 – JUN 2023",
    location: "DUBAI, UAE",
    color: "#00ffe0",
    rgb: "0,255,224",
  },
  {
    id: "006",
    title: "LAB ASSISTANT + R&D INTERN",
    company: "THE ASSEMBLY",
    type: "PART-TIME",
    period: "APR 2022 – DEC 2022",
    location: "DUBAI, UAE",
    color: "#7b00ff",
    rgb: "123,0,255",
  },
  {
    id: "007",
    title: "SOFTWARE ENGINEER INTERN",
    company: "IO21",
    type: "INTERNSHIP",
    period: "JAN 2022 – MAY 2022",
    location: "DUBAI, UAE",
    color: "#ff003c",
    rgb: "255,0,60",
  },
];

type ExpCardProps = { exp: typeof experiences[0] };

function ExperienceCard({ exp }: ExpCardProps) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="project-card neon-border"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? `rgba(${exp.rgb},0.04)` : "rgba(5,13,20,0.8)",
        padding: "2rem",
        position: "relative",
        overflow: "hidden",
        cursor: "default",
        transition: "background 0.3s",
        clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))",
        minWidth: "280px",
        maxWidth: "320px",
      }}
    >
      <div style={{ position: "absolute", top: 0, right: 0, width: "16px", height: "16px", background: exp.color, opacity: hovered ? 1 : 0.3, transition: "opacity 0.3s" }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-muted)" }}>{exp.id}</span>
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: "10px",
          letterSpacing: "0.15em",
          color: "var(--text-muted)",
          border: "1px solid var(--border)",
          padding: "2px 8px",
        }}>
          {exp.type}
        </span>
      </div>

      <h3 style={{
        fontFamily: "var(--font-display)",
        fontSize: "1.1rem",
        fontWeight: 700,
        color: hovered ? exp.color : "var(--text)",
        marginBottom: "0.4rem",
        transition: "color 0.3s",
        letterSpacing: "0.05em",
        lineHeight: 1.3,
      }}>
        {exp.title}
      </h3>

      <p style={{
        fontFamily: "var(--font-display)",
        fontSize: "0.85rem",
        fontWeight: 400,
        color: "var(--text-muted)",
        marginBottom: "1.5rem",
        letterSpacing: "0.08em",
      }}>
        {exp.company}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-muted)" }}>
          {exp.period}
        </span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-muted)", opacity: 0.6 }}>
          {exp.location}
        </span>
      </div>
    </div>
  );
}

export type ExperienceHandle = {
  section:     HTMLElement;
  titleBlock:  HTMLDivElement;
  cardsTrack:  HTMLDivElement;
};

const Experience = forwardRef<ExperienceHandle>((_, ref) => {
  const sectionRef    = useRef<HTMLElement>(null);
  const titleRef      = useRef<HTMLDivElement>(null);
  const cardsTrackRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    get section()    { return sectionRef.current!; },
    get titleBlock() { return titleRef.current!; },
    get cardsTrack() { return cardsTrackRef.current!; },
  }), []);

  return (
    <section
      id="experience"
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
      <div ref={titleRef} style={{ marginBottom: "2.5rem", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "1rem" }}>
          <span className="section-label">005 // EXPERIENCE</span>
          <div className="sci-divider" style={{ flex: 1, maxWidth: "300px" }} />
        </div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 5vw, 4rem)", fontWeight: 700, color: "var(--text)", letterSpacing: "0.05em" }}>
          WORK<br /><span style={{ color: "var(--accent)", opacity: 0.5 }}>HISTORY</span>
        </h2>
      </div>

      <div ref={cardsTrackRef} style={{ display: "flex", gap: "1.5rem", willChange: "transform" }}>
        {experiences.map((exp) => (
          <ExperienceCard
            key={exp.id}
            exp={exp}
          />
        ))}
      </div>

      <div style={{ marginTop: "1.5rem", flexShrink: 0, fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-muted)" }}>
        <span style={{ color: "var(--accent)" }}>07</span> / 07 ROLES LOADED
        <span style={{ marginLeft: "2rem", opacity: 0.4 }}>← SCROLL →</span>
      </div>
    </section>
  );
});

Experience.displayName = "Experience";
export default Experience;
