import type { Metadata } from "next";
import ContentPage from "@/components/ContentPage";

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
        <p>I&apos;m Jay, a full-stack developer who works across web applications, hardware prototypes, AI chatbots with retrieval pipelines, and real-time multiplayer platforms. I gravitate toward projects that are technically interesting, useful, and built to ship.</p>
        <p>I currently work as a Junior Web Developer at Potential, contributing across the product lifecycle. My work balances clean architecture, fast iteration, and software that holds up in production.</p>
      </section>
      <section className="content-panel">
        <h2>HOW I WORK</h2>
        <div className="content-grid">
          <article><h3>END TO END</h3><p>I move between product requirements, interface decisions, backend logic, data, testing, and deployment.</p></article>
          <article><h3>PRACTICAL DELIVERY</h3><p>I favour clear solutions that solve the real problem and can be maintained after launch.</p></article>
          <article><h3>CONTINUOUS LEARNING</h3><p>I explore new tools through working projects, then keep what genuinely improves the product.</p></article>
        </div>
      </section>
      <div className="content-chips"><span>2+ YEARS EXPERIENCE</span><span>6+ PROJECTS SHIPPED</span><span>DUBAI, UAE</span></div>
    </ContentPage>
  );
}
