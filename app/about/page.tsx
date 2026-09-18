import type { Metadata } from "next";
import ContentPage from "@/components/ContentPage";
import { profile } from "@/lib/portfolio-data";

export const metadata: Metadata = {
  title: "About",
  description: "About Jay Andrade and his approach to full-stack product development.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <ContentPage code="002" label="ABOUT" title="FULL-STACK DEVELOPER." intro="I build products end-to-end, from early ideas and interfaces to production-ready applications.">
      <section className="content-panel">
        <h2>PROFILE</h2>
        {profile.bio.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
      </section>
      <section className="content-panel">
        <h2>HOW I WORK</h2>
        <div className="content-grid">
          <article><h3>END TO END</h3><p>I move between product requirements, interface decisions, backend logic, data, testing, and deployment.</p></article>
          <article><h3>PRACTICAL DELIVERY</h3><p>I favour clear solutions that solve the real problem and can be maintained after launch.</p></article>
          <article><h3>CONTINUOUS LEARNING</h3><p>I explore new tools through working projects, then keep what genuinely improves the product.</p></article>
        </div>
      </section>
      <section className="content-panel">
        <h2>CAREER</h2>
        <p>Before Potential, I worked as a Full Stack Developer at Cruise Motors and as a freelance instructor at Zabeel International Institute. Earlier roles include a Technical Analyst Intern position at Healy Consultants Group, a Full Stack Engineer internship at Middlesex University Dubai, a Lab Assistant and R&amp;D Intern role at The Assembly, and a Software Engineer Intern position at IO21 — all in Dubai, stretching back to 2022.</p>
      </section>
      <section className="content-panel">
        <h2>STACK</h2>
        <p>Most of what I ship runs on the MERN stack and Next.js with TypeScript, backed by Python and FastAPI for AI-driven services, and PostgreSQL or MongoDB underneath. For AI features, I build with LangChain and retrieval-augmented generation pipelines against the OpenAI, Anthropic, and Gemini APIs, and round things out with Docker, WebSockets, and automated tests in Vitest, Playwright, and Pytest.</p>
      </section>
      <div className="content-chips"><span>2+ YEARS EXPERIENCE</span><span>6+ PROJECTS SHIPPED</span><span>DUBAI, UAE</span></div>
    </ContentPage>
  );
}
