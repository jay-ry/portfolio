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
    rgb: "0,255,224",
  },
  {
    id: "002",
    title: "FULL STACK DEVELOPER",
    company: "CRUISE MOTORS",
    type: "FULL-TIME",
    period: "DEC 2024 – MAR 2025",
    location: "DUBAI, UAE",
    rgb: "0,255,224",
  },
  {
    id: "003",
    title: "INSTRUCTOR",
    company: "ZABEEL INTERNATIONAL INSTITUTE",
    type: "FREELANCE",
    period: "OCT 2023 – JAN 2025",
    location: "DUBAI, UAE",
    rgb: "0,255,224",
  },
  {
    id: "004",
    title: "TECHNICAL ANALYST INTERN",
    company: "HEALY CONSULTANTS GROUP",
    type: "PART-TIME",
    period: "APR 2023 – JUL 2023",
    location: "DUBAI, UAE",
    rgb: "0,255,224",
  },
  {
    id: "005",
    title: "FULL STACK ENGINEER",
    company: "MIDDLESEX UNIVERSITY DUBAI",
    type: "INTERNSHIP",
    period: "NOV 2022 – JUN 2023",
    location: "DUBAI, UAE",
    rgb: "0,255,224",
  },
  {
    id: "006",
    title: "LAB ASSISTANT + R&D INTERN",
    company: "THE ASSEMBLY",
    type: "PART-TIME",
    period: "APR 2022 – DEC 2022",
    location: "DUBAI, UAE",
    rgb: "0,255,224",
  },
  {
    id: "007",
    title: "SOFTWARE ENGINEER INTERN",
    company: "IO21",
    type: "INTERNSHIP",
    period: "JAN 2022 – MAY 2022",
    location: "DUBAI, UAE",
    rgb: "0,255,224",
  },
];

const HALF = 200; // height of each card half; total track = HALF * 2

type ExpCardProps = { exp: typeof experiences[0] };

const ExperienceCard = forwardRef<HTMLDivElement, ExpCardProps>(({ exp }, ref) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      ref={ref}
      className="exp-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "240px",
        flexShrink: 0,
        padding: "0.9rem 1rem 0.9rem 1.1rem",
        position: "relative",
        cursor: "default",
        borderLeft: `2px solid ${hovered ? "var(--accent)" : "rgba(0,255,224,0.2)"}`,
        borderTop: `1px solid ${hovered ? "rgba(0,255,224,0.25)" : "rgba(0,255,224,0.07)"}`,
        background: hovered ? "rgba(0,255,224,0.03)" : "transparent",
        transition: "border-color 0.25s, background 0.25s",
      }}
    >
      {/* ID + type row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.65rem" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--accent)", opacity: 0.75, letterSpacing: "0.15em" }}>
          {exp.id}
        </span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.12em", color: "var(--text-muted)" }}>
          {exp.type}
        </span>
      </div>

      {/* Title */}
      <h3 style={{
        fontFamily: "var(--font-display)",
        fontSize: "0.88rem",
        fontWeight: 700,
        color: hovered ? "var(--accent)" : "var(--text)",
        marginBottom: "0.35rem",
        transition: "color 0.25s",
        letterSpacing: "0.04em",
        lineHeight: 1.35,
      }}>
        {exp.title}
      </h3>

      {/* Company */}
      <p style={{
        fontFamily: "var(--font-mono)",
        fontSize: "11px",
        color: "var(--text-muted)",
        letterSpacing: "0.08em",
        marginBottom: "0.65rem",
      }}>
        {exp.company}
      </p>

      {/* Period */}
      <span style={{
        fontFamily: "var(--font-mono)",
        fontSize: "10px",
        color: "var(--text-muted)",
        opacity: 0.75,
        letterSpacing: "0.06em",
      }}>
        {exp.period}
      </span>
    </div>
  );
});
ExperienceCard.displayName = "ExperienceCard";

export type ExperienceHandle = {
  section:    HTMLElement;
  titleBlock: HTMLDivElement;
  cardsTrack: HTMLDivElement;
  cards:      HTMLDivElement[];
  spine:      HTMLDivElement;
  spineTip:   HTMLDivElement;
};

const Experience = forwardRef<ExperienceHandle>((_, ref) => {
  const sectionRef    = useRef<HTMLElement>(null);
  const titleRef      = useRef<HTMLDivElement>(null);
  const cardsTrackRef = useRef<HTMLDivElement>(null);
  const cardRefs      = useRef<(HTMLDivElement | null)[]>([]);
  const spineRef      = useRef<HTMLDivElement>(null);
  const spineTipRef   = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    get section()    { return sectionRef.current!; },
    get titleBlock() { return titleRef.current!; },
    get cardsTrack() { return cardsTrackRef.current!; },
    get cards()      { return cardRefs.current.filter(Boolean) as HTMLDivElement[]; },
    get spine()      { return spineRef.current!; },
    get spineTip()   { return spineTipRef.current!; },
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
      {/* Title */}
      <div ref={titleRef} style={{ marginBottom: "2.5rem", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "1rem" }}>
          <span className="section-label">005 // EXPERIENCE</span>
          <div className="sci-divider" style={{ flex: 1, maxWidth: "300px" }} />
        </div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 5vw, 4rem)", fontWeight: 700, color: "var(--text)", letterSpacing: "0.05em" }}>
          WORK<br /><span style={{ color: "var(--accent)", opacity: 0.5 }}>HISTORY</span>
        </h2>
      </div>

      {/* Track */}
      <div
        ref={cardsTrackRef}
        style={{
          position: "relative",
          display: "flex",
          gap: "2.5rem",
          willChange: "transform",
          height: `${HALF * 2}px`,
          alignSelf: "flex-start",
        }}
      >
        {/* Spine line — grows via GSAP scaleX */}
        <div
          ref={spineRef}
          style={{
            position: "absolute",
            top: "calc(50% - 1.5px)",
            left: 0,
            width: "100%",
            height: "3px",
            background: "linear-gradient(90deg, transparent 0%, var(--accent) 6%, var(--accent) 100%)",
            boxShadow: "0 0 8px rgba(0,255,224,0.5)",
            opacity: 0.75,
            transformOrigin: "left center",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        {/* Traveling tip */}
        <div
          ref={spineTipRef}
          style={{
            position: "absolute",
            top: "calc(50% - 6px)",
            left: 0,
            width: "12px",
            height: "12px",
            background: "var(--accent)",
            borderRadius: "50%",
            boxShadow: "0 0 12px var(--accent), 0 0 28px rgba(0,255,224,0.5)",
            pointerEvents: "none",
            zIndex: 4,
          }}
        />

        {/* Slots */}
        {experiences.map((exp, i) => {
          const isAbove = i % 2 === 0;
          return (
            <div
              key={exp.id}
              className="exp-slot"
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                flexShrink: 0,
                zIndex: 1,
              }}
            >
              {/* Diamond tick — absolutely centered on the spine */}
              <div
                className="timeline-marker"
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: "8px",
                  height: "8px",
                  border: "1.5px solid var(--accent)",
                  background: "var(--bg)",
                  transform: "translate(-50%, -50%) rotate(45deg)",
                  zIndex: 3,
                }}
              />

              {/* Above card area */}
              <div style={{
                height: `${HALF}px`,
                display: "flex",
                alignItems: "flex-end",
                paddingBottom: "16px",
              }}>
                {isAbove && (
                  <ExperienceCard exp={exp} ref={el => { cardRefs.current[i] = el; }} />
                )}
              </div>

              {/* Below card area */}
              <div style={{
                height: `${HALF}px`,
                display: "flex",
                alignItems: "flex-start",
                paddingTop: "16px",
              }}>
                {!isAbove && (
                  <ExperienceCard exp={exp} ref={el => { cardRefs.current[i] = el; }} />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{ marginTop: "1.5rem", flexShrink: 0, fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-muted)" }}>
        <span style={{ color: "var(--accent)" }}>07</span> / 07 ROLES LOADED
        <span style={{ marginLeft: "2rem", opacity: 0.4 }}>← SCROLL →</span>
      </div>
    </section>
  );
});

Experience.displayName = "Experience";
export default Experience;
