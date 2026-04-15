"use client";
import { forwardRef, useImperativeHandle, useRef } from "react";

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
            width: "10px",
            height: "7px",
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
  const sectionRef  = useRef<HTMLElement>(null);
  const titleRef    = useRef<HTMLDivElement>(null);
  const columnRefs  = useRef<(HTMLDivElement | null)[]>([]);

  useImperativeHandle(ref, () => ({
    get section()    { return sectionRef.current!; },
    get titleBlock() { return titleRef.current!; },
    get columns()    { return columnRefs.current.filter(Boolean) as HTMLDivElement[]; },
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
      <div ref={titleRef} style={{ marginBottom: "2.5rem", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "1rem" }}>
          <span className="section-label">003 // SKILLS</span>
          <div className="sci-divider" style={{ flex: 1, maxWidth: "300px" }} />
        </div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 5vw, 4rem)", fontWeight: 700, color: "var(--text)", letterSpacing: "0.05em" }}>
          TECHNICAL<br /><span style={{ color: "var(--accent)", opacity: 0.5 }}>SYSTEMS</span>
        </h2>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "2rem", alignItems: "start" }}>
        {domains.map((domain, i) => (
          <div
            key={domain.id}
            ref={el => { columnRefs.current[i] = el; }}
          >
            <div style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              letterSpacing: "0.2em",
              color: "var(--accent)",
              marginBottom: "1rem",
              paddingBottom: "0.5rem",
              borderBottom: "1px solid var(--border)",
            }}>
              {domain.id}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {domain.skills.map(skill => (
                <div
                  key={skill.name}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                    paddingBottom: "0.5rem",
                    borderBottom: "1px solid rgba(0,255,224,0.05)",
                  }}
                >
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-muted)", letterSpacing: "0.05em" }}>
                    {skill.name}
                  </span>
                  <SegBar level={skill.level} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
});

Skills.displayName = "Skills";
export default Skills;
