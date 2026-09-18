import type { Metadata } from "next";
import ContentPage from "@/components/ContentPage";
import { hotStreak, projects } from "@/lib/portfolio-data";

export const metadata: Metadata = {
  title: "Projects",
  description: "Selected full-stack, AI, real-time, algorithmic, and hardware projects by Jay Andrade, with technical write-ups.",
  alternates: { canonical: "/projects" },
};

// Tradewise is deliberately shown as "IN PROGRESS" here rather than the internal "WIP" status value.
const STATUS_LABELS: Record<string, string> = { WIP: "IN PROGRESS" };

export default function ProjectsPage() {
  return (
    <ContentPage code="004" label="PROJECTS" title="DEPLOYED SYSTEMS." intro="Selected work across full-stack applications, real-time experiences, algorithms, AI-enabled products, and hardware.">
      <section className="content-panel">
        <p><strong>LIVE</strong> — deployed and in production. <strong>BUILT</strong> — complete and fully functional. <strong>IN PROGRESS</strong> — actively in development.</p>
        <p>Some of these carry a full write-up rather than a summary. Where they do, it covers what the system actually is, the one problem in it that was genuinely hard, and how that problem got solved — because the architecture diagram is rarely the interesting part, and the edge case that forced a rewrite usually is.</p>
      </section>
      <div className="project-page-grid">
        {projects.map(project => (
          <article className={`content-panel project-page-card${project.caseStudy ? " project-page-card-full" : ""}`} key={project.id}>
            <div className="project-page-meta"><span>{project.id}</span><span>{STATUS_LABELS[project.status] ?? project.status}</span></div>
            <h2>{project.name}</h2>
            <p>{project.desc}</p>
            {project.caseStudy?.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
            <p className="project-stack">{project.stack.join(" · ")}</p>
          </article>
        ))}
      </div>
      <article className="content-panel">
        <div className="project-page-meta"><span>{hotStreak.id}</span><span>{hotStreak.status}</span></div>
        <h2>{hotStreak.name}</h2>
        <p>{hotStreak.desc}</p>
        {hotStreak.caseStudy.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
        <p className="project-stack">{hotStreak.stack.join(" · ")}</p>
      </article>
      <section className="games-callout neon-border">
        <div><span className="section-label">DAILY PUZZLES</span><h2>PLAY HOT STREAK</h2><p>Six original word and logic games, a new puzzle in each of them every day. No account needed — your streak is tied to your browser, not a login.</p></div>
        <a href={hotStreak.liveUrl} target="_blank" rel="noopener noreferrer">PLAY THE GAMES ↗</a>
      </section>
    </ContentPage>
  );
}
