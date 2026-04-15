"use client";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

const MOBILE_BP = 560;

const domains = [
  {
    id: "FRONTEND",
    skills: [
      { name: "React",       level: 9 },
      { name: "Next.js",     level: 9 },
      { name: "TypeScript",  level: 8 },
      { name: "TailwindCSS", level: 8 },
      { name: "GSAP",        level: 7 },
    ],
  },
  {
    id: "BACKEND",
    skills: [
      { name: "Node.js",     level: 9 },
      { name: "Express",     level: 9 },
      { name: "Hono",        level: 7 },
      { name: "Python",      level: 8 },
      { name: "FastAPI",     level: 7 },
      { name: "Django",      level: 6 },
      { name: "PostgreSQL",  level: 8 },
      { name: "MongoDB",     level: 7 },
      { name: "Drizzle",     level: 8 },
      { name: "Redis",       level: 7 },
      { name: "Passport.js", level: 7 },
      { name: "BullMQ",      level: 6 },
      { name: "Zod",         level: 8 },
      { name: "JWT",         level: 8 },
    ],
  },
  {
    id: "AI / ML",
    skills: [
      { name: "LangChain",     level: 7 },
      { name: "RAG",           level: 7 },
      { name: "OpenAI API",    level: 8 },
      { name: "Anthropic SDK", level: 7 },
      { name: "Gemini API",    level: 6 },
      { name: "Pandas",        level: 7 },
      { name: "Scikit-learn",  level: 6 },
    ],
  },
  {
    id: "TOOLS",
    skills: [
      { name: "Git",        level: 9 },
      { name: "Docker",     level: 7 },
      { name: "Bun",        level: 8 },
      { name: "Arduino",    level: 7 },
      { name: "Prisma",     level: 7 },
      { name: "WebSockets", level: 8 },
      { name: "AWS SES",    level: 7 },
      { name: "Handlebars", level: 6 },
      { name: "Multer",     level: 6 },
    ],
  },
  {
    id: "TESTING",
    skills: [
      { name: "Vitest",     level: 7 },
      { name: "Playwright", level: 7 },
      { name: "Pytest",     level: 7 },
    ],
  },
];

function SegBar({ level }: { level: number }) {
  const clamped = Math.max(0, Math.min(10, level));
  return (
    <div style={{ display: "flex", gap: "2px", flexShrink: 0 }}>
      {Array.from({ length: 10 }, (_, i) => (
        <div
          key={i}
          style={{
            width: "8px",
            height: "5px",
            background: i < clamped ? "var(--accent)" : "transparent",
            border: `1px solid ${i < clamped ? "var(--accent)" : "var(--border)"}`,
          }}
        />
      ))}
    </div>
  );
}

export type SkillsHandle = {
  section:    HTMLElement;
  titleBlock: HTMLDivElement;
  columns:    HTMLDivElement[];
};

const Skills = forwardRef<SkillsHandle>((_, ref) => {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef   = useRef<HTMLDivElement>(null);
  const colRefs    = useRef<(HTMLDivElement | null)[]>([]);

  // Start all closed (SSR-safe); open all on desktop after mount
  const [openCols, setOpenCols] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (window.innerWidth > MOBILE_BP) {
      setOpenCols(new Set(domains.map(d => d.id)));
    }

    const onResize = () => {
      if (window.innerWidth > MOBILE_BP) {
        setOpenCols(new Set(domains.map(d => d.id)));
      } else {
        setOpenCols(new Set());
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const toggle = (id: string) => {
    const mobile = window.innerWidth <= MOBILE_BP;
    setOpenCols(prev => {
      const next = new Set(prev);
      if (mobile) {
        // Accordion: only one open at a time
        const wasOpen = next.has(id);
        next.clear();
        if (!wasOpen) next.add(id);
      } else {
        // Desktop: toggle independently
        if (next.has(id)) next.delete(id); else next.add(id);
      }
      return next;
    });
  };

  useImperativeHandle(ref, () => ({
    get section()    { return sectionRef.current!; },
    get titleBlock() { return titleRef.current!; },
    get columns()    { return colRefs.current.filter(Boolean) as HTMLDivElement[]; },
  }), []);

  return (
    <section
      id="skills"
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
      <div ref={titleRef} style={{ marginBottom: "1.75rem", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "1rem" }}>
          <span className="section-label">003 // SKILLS</span>
          <div className="sci-divider" style={{ flex: 1, maxWidth: "300px" }} />
        </div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 5vw, 4rem)", fontWeight: 700, color: "var(--text)", letterSpacing: "0.05em" }}>
          TECHNICAL<br /><span style={{ color: "var(--accent)", opacity: 0.5 }}>SYSTEMS</span>
        </h2>
      </div>

      {/* Columns */}
      <div className="skills-columns">
        {domains.map((domain, i) => (
          <div
            key={domain.id}
            ref={el => { colRefs.current[i] = el; }}
            style={{
              background: "linear-gradient(160deg, rgba(0,255,224,0.05) 0%, rgba(0,10,8,0.6) 100%)",
              border: "1px solid rgba(0,255,224,0.08)",
              borderTopColor: "rgba(0,255,224,0.35)",
            }}
          >
            {/* Clickable header */}
            <button
              onClick={() => toggle(domain.id)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.7rem 0.9rem",
                background: "none",
                border: "none",
                borderBottom: openCols.has(domain.id) ? "1px solid rgba(0,255,224,0.12)" : "none",
                cursor: "pointer",
                gap: "0.5rem",
              }}
            >
              <span style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                letterSpacing: "0.2em",
                color: "var(--accent)",
              }}>
                {domain.id}
              </span>
              <span style={{
                display: "inline-block",
                width: 0,
                height: 0,
                borderLeft: "4px solid transparent",
                borderRight: "4px solid transparent",
                borderTop: "4px solid var(--accent)",
                transition: "transform 0.25s",
                transform: openCols.has(domain.id) ? "rotate(0deg)" : "rotate(-90deg)",
                flexShrink: 0,
                opacity: 0.7,
              }} />
            </button>

            {/* Collapsible skill rows */}
            <div style={{
              display: "grid",
              gridTemplateRows: openCols.has(domain.id) ? "1fr" : "0fr",
              transition: "grid-template-rows 0.28s ease",
            }}>
              <div style={{ overflow: "hidden" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", padding: "0.6rem 0.9rem 0.8rem" }}>
                  {domain.skills.map(skill => (
                    <div
                      key={skill.name}
                      className="skill-row"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "0.5rem",
                      }}
                    >
                      <span style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "11px",
                        color: "var(--text-muted)",
                        letterSpacing: "0.04em",
                        whiteSpace: "nowrap",
                      }}>
                        {skill.name}
                      </span>
                      <SegBar level={skill.level} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
});

Skills.displayName = "Skills";
export default Skills;
