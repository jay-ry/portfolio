import type { Metadata } from "next";
import ContentPage from "@/components/ContentPage";
import { profile } from "@/lib/portfolio-data";

export const metadata: Metadata = {
  title: "About",
  description: "About Jay Andrade — a full-stack developer in Dubai, his approach to building software, and the stack he works in.",
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
          <article>
            <h3>END TO END</h3>
            <p>I move between product requirements, interface decisions, backend logic, data, testing, and deployment.</p>
            <p>That range is the point rather than a boast — most of the defects I have had to chase lived in the seams between those layers, in what the API assumed the client would send, or in what a migration assumed about data that had already been written.</p>
          </article>
          <article>
            <h3>PRACTICAL DELIVERY</h3>
            <p>I favour clear solutions that solve the real problem and can be maintained after launch.</p>
            <p>In practice that means preferring the boring mechanism that survives a redeploy over the clever one that does not: versioned records instead of in-place edits, explicit rejections instead of silent fallbacks, and failures that are loud at the point they happen.</p>
          </article>
          <article>
            <h3>CONTINUOUS LEARNING</h3>
            <p>I explore new tools through working projects, then keep what genuinely improves the product.</p>
            <p>Most of what I now use confidently arrived that way — picked up on something real with actual users and actual data, kept because it earned its place, and dropped when it turned out to be overhead wearing a nice API.</p>
          </article>
        </div>
      </section>
      <section className="content-panel">
        <h2>WHAT I AM BUILDING</h2>
        <p>Outside of work I keep two systems running that exist mainly to give me problems I would not otherwise meet. Hot Streak is a daily puzzle platform with six original games behind one shared engine contract, where the interesting work turned out to be content rather than gameplay: publishing a new puzzle for every game every day, fingerprinting each one so a redeploy can tell what actually changed, and versioning rather than overwriting so that a corrected puzzle never destroys a game somebody is in the middle of.</p>
        <p>Tradewise is a self-hosted algorithmic crypto trading system, currently paper-trading only, built around a simulator that is deliberately pessimistic — it charges spread and slippage against every fill and refuses orders too large for the visible book, on the principle that a backtest which flatters you is worse than no backtest. In front of it sits a risk engine and a kill switch that can sweep every open position out through the same execution path normal trading uses.</p>
      </section>
      <section className="content-panel">
        <h2>CAREER</h2>
        <p>Before Potential, I worked as a Full Stack Developer at Cruise Motors and as a freelance instructor at Zabeel International Institute. Earlier roles include a Technical Analyst Intern position at Healy Consultants Group, a Full Stack Engineer internship at Middlesex University Dubai, a Lab Assistant and R&amp;D Intern role at The Assembly, and a Software Engineer Intern position at IO21 — all in Dubai, stretching back to 2022.</p>
        <p>That is seven roles since 2022, across full-time, freelance, part-time, and internship work, all of them in Dubai. Two threads run through it. The first is building and shipping product as a full-stack developer — at Potential now, at Cruise Motors before that, and as an engineer at Middlesex University Dubai and IO21 earlier on. The second is teaching: the instructing work at Zabeel ran for more than a year alongside the development roles, and mentoring other developers is still part of how I work rather than something I did once. Explaining a system to someone encountering it for the first time is a fast way to find out which parts of your own understanding were decoration, and it leaves you permanently suspicious of code that only makes sense to the person who wrote it.</p>
      </section>
      <section className="content-panel">
        <h2>STACK</h2>
        <p>Most of what I ship runs on the MERN stack and Next.js with TypeScript, backed by Python and FastAPI for AI-driven services, and PostgreSQL or MongoDB underneath.</p>
        <div className="content-grid">
          <article>
            <h3>FRONTEND</h3>
            <p>React and Next.js with TypeScript, styled with TailwindCSS, and GSAP when a page needs real motion rather than a transition.</p>
          </article>
          <article>
            <h3>BACKEND</h3>
            <p>Node with Express, Hono when I want something lighter, and Python with FastAPI or Django. Around that: Zod for validating anything crossing a boundary, Passport.js and JWTs for auth, Redis for caching and ephemeral state, and BullMQ for work that has no business happening inside a request.</p>
          </article>
          <article>
            <h3>DATA</h3>
            <p>PostgreSQL by default, MongoDB where the shape genuinely suits it, with Drizzle or Prisma as the typed layer in between rather than raw strings scattered through the codebase.</p>
          </article>
          <article>
            <h3>AI</h3>
            <p>The OpenAI, Anthropic, and Gemini APIs, with LangChain and retrieval-augmented generation pipelines for the cases where a model needs to be grounded in somebody&apos;s actual data instead of its own training. Pandas and scikit-learn for the analysis side.</p>
          </article>
          <article>
            <h3>TESTING</h3>
            <p>Vitest, Playwright, and Pytest. The tests I value most are the ones covering the inputs a user should never be able to send but eventually will.</p>
          </article>
          <article>
            <h3>TOOLING</h3>
            <p>Git, Docker, and Bun, with WebSockets for anything real-time, AWS SES and Handlebars for transactional email, and Multer for uploads.</p>
          </article>
        </div>
      </section>
      <div className="content-chips"><span>2+ YEARS EXPERIENCE</span><span>6+ PROJECTS SHIPPED</span><span>DUBAI, UAE</span></div>
    </ContentPage>
  );
}
