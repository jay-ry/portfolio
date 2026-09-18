"use client";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import Link from "next/link";

const projects = [
  {
    id: "001",
    name: "ASTROBARISTAS",
    desc: "Full-stack coffee-brand site with a dynamic menu and a custom CMS.",
    stack: ["MongoDB", "Express", "React", "Node.js"],
    status: "LIVE",
    color: "var(--accent)",
  },
  {
    id: "002",
    name: "CARDUINO",
    desc: "Arduino-based smart car with autonomous obstacle avoidance and sensor fusion.",
    stack: ["Arduino", "C++", "Hardware", "IoT"],
    status: "BUILT",
    color: "var(--accent)",
  },
  {
    id: "003",
    name: "CHESS ENGINE",
    desc: "A from-scratch chess AI using Minimax and alpha-beta pruning — no ML.",
    stack: ["Python", "Pygame", "python-chess"],
    status: "BUILT",
    color: "var(--accent3)",
  },
  {
    id: "004",
    name: "JEOPARDY.APP",
    desc: "Real-time multiplayer Jeopardy with live buzz-ins and custom boards.",
    stack: ["React", "Socket.io", "Express", "PostgreSQL", "Prisma"],
    status: "BUILT",
    color: "var(--accent2)",
  },
  {
    id: "005",
    name: "BIZ-BOT",
    desc: "Multi-tenant AI chatbot platform with RAG-powered business support.",
    stack: ["Next.js", "Hono", "Drizzle", "PostgreSQL"],
    status: "BUILT",
    color: "var(--accent)",
  },
  {
    id: "006",
    name: "TRADEWISE",
    desc: "AI-powered trading platform with portfolio tracking and algo strategies.",
    stack: ["Python", "FastAPI", "Next.js", "AI"],
    status: "WIP",
    color: "var(--accent3)",
  },
];

type ProjectCardProps = { project: typeof projects[0] };

const ProjectCard = forwardRef<HTMLDivElement, ProjectCardProps>(({ project }, ref) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      ref={ref}
      // Lets chat navigation scroll to this exact card, not just the section.
      data-project-id={project.id}
      className="project-card neon-border"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? `color-mix(in srgb, ${project.color} 5%, var(--panel-bg))` : "var(--panel-bg)",
        padding: "2rem",
        position: "relative",
        overflow: "hidden",
        cursor: "default",
        transition: "background 0.3s",
        clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))",
      }}
    >
      <div style={{ position: "absolute", top: 0, right: 0, width: "16px", height: "16px", background: project.color, opacity: hovered ? 1 : 0.3, transition: "opacity 0.3s" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-muted)" }}>{project.id}</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.15em", color: project.status === "LIVE" ? "var(--status-color)" : project.status === "WIP" ? "#ffaa00" : "var(--text-muted)", border: `1px solid ${project.status === "LIVE" ? "var(--status-color)" : project.status === "WIP" ? "#ffaa00" : "var(--border)"}`, padding: "2px 8px" }}>
          {project.status}
        </span>
      </div>
      <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", fontWeight: 700, color: hovered ? project.color : "var(--text)", marginBottom: "0.75rem", transition: "color 0.3s", letterSpacing: "0.05em" }}>
        {project.name}
      </h3>
      <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "var(--text-muted)", lineHeight: 1.7, marginBottom: "1.5rem" }}>
        {project.desc}
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
        {project.stack.map(s => (
          <span key={s} style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.1em", color: "var(--text-muted)", border: "1px solid var(--border)", padding: "3px 10px" }}>
            {s}
          </span>
        ))}
      </div>
    </div>
  );
});
ProjectCard.displayName = "ProjectCard";

export type ProjectsHandle = {
  section: HTMLElement;
  titleBlock: HTMLDivElement;
  cards: HTMLDivElement[];
  cardsTrack: HTMLDivElement;
};

const Projects = forwardRef<ProjectsHandle>((_, ref) => {
  const sectionRef    = useRef<HTMLElement>(null);
  const titleRef      = useRef<HTMLDivElement>(null);
  const cardsTrackRef = useRef<HTMLDivElement>(null);
  const cardRefs      = useRef<(HTMLDivElement | null)[]>([]);

  useImperativeHandle(ref, () => ({
    get section()    { return sectionRef.current!; },
    get titleBlock() { return titleRef.current!; },
    get cards()      { return cardRefs.current.filter(Boolean) as HTMLDivElement[]; },
    get cardsTrack() { return cardsTrackRef.current!; },
  }), []);

  return (
    <section
      id="projects"
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
          <span className="section-label">004 // PROJECTS</span>
          <div className="sci-divider" style={{ flex: 1, maxWidth: "300px" }} />
        </div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 5vw, 4rem)", fontWeight: 700, color: "var(--text)", letterSpacing: "0.05em" }}>
          DEPLOYED<br /><span style={{ color: "var(--accent)", opacity: 0.5 }}>SYSTEMS</span>
        </h2>
      </div>

      {/* Horizontal scroll track — driven by GSAP translateX in page.tsx */}
      <div ref={cardsTrackRef} style={{ display: "flex", gap: "1.5rem", willChange: "transform" }}>
        {projects.map((p, i) => (
          <ProjectCard
            key={p.id}
            project={p}
            ref={el => { cardRefs.current[i] = el; }}
          />
        ))}
      </div>

      <div style={{ marginTop: "1.5rem", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-muted)" }}>
        <span>
          <span style={{ color: "var(--accent)" }}>06</span> / 06 PROJECTS LOADED
          <span style={{ marginLeft: "2rem", opacity: 0.4 }}>← SCROLL →</span>
        </span>
        <Link href="/projects" style={{ color: "var(--accent)", letterSpacing: "0.12em", textDecoration: "none" }}>
          FULL CASE STUDIES →
        </Link>
      </div>
    </section>
  );
});

Projects.displayName = "Projects";
export default Projects;
