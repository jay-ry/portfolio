import type { Metadata } from "next";
import ContentPage from "@/components/ContentPage";

export const metadata: Metadata = {
  title: "Projects",
  description: "Selected full-stack, AI, real-time, algorithmic, and hardware projects by Jay Andrade.",
  alternates: { canonical: "/projects" },
};

const projects = [
  { id: "001", name: "ASTROBARISTAS", status: "LIVE", desc: "A full-stack website for a coffee brand, with a dynamic menu, team profiles, and a custom content management experience.", stack: "MongoDB · Express · React · Node.js" },
  { id: "002", name: "CARDUINO", status: "BUILT", desc: "A smart-car prototype built on Arduino Uno, combining autonomous obstacle avoidance, sensor input, and real-time motor control.", stack: "Arduino · C++ · Hardware · IoT" },
  { id: "003", name: "CHESS ENGINE", status: "BUILT", desc: "A playable chess game with a custom algorithmic opponent using Minimax, alpha-beta pruning, piece-square tables, move ordering, and iterative deepening.", stack: "Python · Pygame · python-chess" },
  { id: "004", name: "JEOPARDY.APP", status: "BUILT", desc: "A real-time multiplayer Jeopardy platform where hosts create rooms and players join on mobile to buzz in live.", stack: "React · Socket.io · Express · PostgreSQL" },
  { id: "005", name: "BIZ-BOT", status: "BUILT", desc: "A multi-tenant chatbot platform for local businesses, with an embeddable assistant, retrieval-powered responses, business data ingestion, analytics, and organisation management.", stack: "Next.js · Hono · Drizzle · PostgreSQL" },
  { id: "006", name: "TRADEWISE", status: "IN PROGRESS", desc: "A stock and crypto trading platform for portfolio tracking, trade review, market insights, and algorithmic strategies that execute on defined triggers.", stack: "Python · FastAPI · Next.js" },
];

export default function ProjectsPage() {
  return (
    <ContentPage code="004" label="PROJECTS" title="DEPLOYED SYSTEMS." intro="Selected work across full-stack applications, real-time experiences, algorithms, AI-enabled products, and hardware.">
      <div className="project-page-grid">
        {projects.map(project => (
          <article className="content-panel project-page-card" key={project.id}>
            <div className="project-page-meta"><span>{project.id}</span><span>{project.status}</span></div>
            <h2>{project.name}</h2>
            <p>{project.desc}</p>
            <p className="project-stack">{project.stack}</p>
          </article>
        ))}
      </div>
      <section className="games-callout neon-border">
        <div><span className="section-label">DAILY PUZZLES</span><h2>HOT STREAK GAMES</h2><p>Play a growing collection of original daily word and logic games, built as a separate interactive project.</p></div>
        <a href="https://games.jayandrade.com" target="_blank" rel="noopener noreferrer">PLAY THE GAMES ↗</a>
      </section>
    </ContentPage>
  );
}
