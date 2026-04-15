"use client";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";

const projects = [
  {
    id: "001",
    name: "ASTROBARISTAS",
    desc: "Full-stack team website for a coffee brand — built end-to-end with the MERN stack. Features a dynamic menu, team profiles, and a custom CMS for content management.",
    stack: ["MongoDB", "Express", "React", "Node.js"],
    status: "LIVE",
    color: "#00ffe0",
    rgb: "0,255,224",
  },
  {
    id: "002",
    name: "CARDUINO",
    desc: "Hardware-software smart car prototype built on Arduino Uno — autonomous obstacle avoidance, sensor fusion, and real-time motor control.",
    stack: ["Arduino", "C++", "Hardware", "IoT"],
    status: "BUILT",
    color: "#00ffe0",
    rgb: "0,255,224",
  },
  {
    id: "003",
    name: "CHESS ENGINE",
    desc: "Fully playable chess game with a custom AI opponent — Minimax with Alpha-Beta Pruning, piece-square tables, move ordering, and iterative deepening. Pure algorithmic AI, no ML.",
    stack: ["Python", "Pygame", "python-chess"],
    status: "BUILT",
    color: "#7b00ff",
    rgb: "123,0,255",
  },
  {
    id: "004",
    name: "JEOPARDY.APP",
    desc: "Real-time multiplayer Jeopardy platform — hosts generate room codes, players join on mobile and buzz in live. Full game state machine, WebSocket events, and custom board generation.",
    stack: ["React", "Socket.io", "Express", "PostgreSQL", "Prisma"],
    status: "BUILT",
    color: "#ff003c",
    rgb: "255,0,60",
  },
  {
    id: "005",
    name: "BIZ-BOT",
    desc: "Multi-tenant AI chatbot platform for local businesses — embeddable widget with RAG-powered responses, business data ingestion, analytics dashboard, and organisation management.",
    stack: ["Next.js", "Hono", "Drizzle", "PostgreSQL"],
    status: "BUILT",
    color: "#00ffe0",
    rgb: "0,255,224",
  },
  {
    id: "006",
    name: "TRADEWISE",
    desc: "AI-powered stock and crypto trading platform — real-time portfolio tracking, an AI coach reviewing your trades, an AI analyst surfacing live insights, and algorithmic strategies that execute on trigger.",
    stack: ["Python", "FastAPI", "Next.js", "AI"],
    status: "WIP",
    color: "#7b00ff",
    rgb: "123,0,255",
  },
];

type ProjectCardProps = { project: typeof projects[0] };

const ProjectCard = forwardRef<HTMLDivElement, ProjectCardProps>(({ project }, ref) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      ref={ref}
      className="project-card neon-border"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? `rgba(${project.rgb},0.04)` : "rgba(5,13,20,0.8)",
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
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.15em", color: project.status === "LIVE" ? "#00ff88" : project.status === "WIP" ? "#ffaa00" : "var(--text-muted)", border: `1px solid ${project.status === "LIVE" ? "#00ff88" : project.status === "WIP" ? "#ffaa00" : "var(--border)"}`, padding: "2px 8px" }}>
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

      <div style={{ marginTop: "1.5rem", flexShrink: 0, fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-muted)" }}>
        <span style={{ color: "var(--accent)" }}>06</span> / 06 PROJECTS LOADED
        <span style={{ marginLeft: "2rem", opacity: 0.4 }}>← SCROLL →</span>
      </div>
    </section>
  );
});

Projects.displayName = "Projects";
export default Projects;
