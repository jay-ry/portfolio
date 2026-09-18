import type { Metadata } from "next";
import ContentPage from "@/components/ContentPage";
import { projects } from "@/lib/portfolio-data";

export const metadata: Metadata = {
  title: "Projects",
  description: "Selected full-stack, AI, real-time, algorithmic, and hardware projects by Jay Andrade.",
  alternates: { canonical: "/projects" },
};

// Tradewise is deliberately shown as "IN PROGRESS" here rather than the internal "WIP" status value.
const STATUS_LABELS: Record<string, string> = { WIP: "IN PROGRESS" };

export default function ProjectsPage() {
  return (
    <ContentPage code="004" label="PROJECTS" title="DEPLOYED SYSTEMS." intro="Selected work across full-stack applications, real-time experiences, algorithms, AI-enabled products, and hardware.">
      <section className="content-panel">
        <p><strong>LIVE</strong> — deployed and in production. <strong>BUILT</strong> — complete and fully functional. <strong>IN PROGRESS</strong> — actively in development.</p>
      </section>
      <div className="project-page-grid">
        {projects.map(project => (
          <article className="content-panel project-page-card" key={project.id}>
            <div className="project-page-meta"><span>{project.id}</span><span>{STATUS_LABELS[project.status] ?? project.status}</span></div>
            <h2>{project.name}</h2>
            <p>{project.desc}</p>
            <p className="project-stack">{project.stack.join(" · ")}</p>
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
