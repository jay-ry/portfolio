/**
 * Shared portfolio data.
 *
 * Plain TypeScript — no React, no "use client". This module is the single
 * source of truth for portfolio content and must remain importable from BOTH
 * client components and server route handlers (e.g. the AI chat API).
 *
 * `profile.bio` and `projects[].desc`/`stack` are the full-detail copy,
 * rendered directly on the standalone /about and /projects pages. The
 * homepage sections (About.tsx, Projects.tsx) show their own short teaser
 * copy instead of this text, to avoid duplicating it in full on both pages.
 * Do not reword or embellish this data — it also grounds an AI chatbot.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Project {
  id: string;
  name: string;
  desc: string;
  stack: string[];
  status: string;
  color: string;
  liveUrl?: string;
  repoUrl?: string;
  sectionAnchor: string;
  // Only set where the project's source was available to write the detail from.
  caseStudy?: string[];
}

export interface ExternalProject {
  id: string;
  name: string;
  tagline: string;
  desc: string;
  stack: string[];
  status: string;
  liveUrl: string;
  caseStudy: string[];
}

export interface SkillDomain {
  id: string;
  skills: { name: string; level: number }[];
}

export interface Role {
  id: string;
  title: string;
  company: string;
  type: string;
  period: string;
  location: string;
  rgb: string;
}

export interface ContactLink {
  label: string;
  display: string;
  href: string;
  /** Exact text written to the clipboard — differs from `href` for mailto: links. */
  copy: string;
  external?: boolean;
  icon?: string;
}

export interface Section {
  id: string;
  num: string;
  label: string;
  anchor: string;
}

export interface Profile {
  name: string;
  title: string;
  location: string;
  summary: string;
  bio: string[];
}

// ---------------------------------------------------------------------------
// Profile — Hero.tsx + About.tsx prose
// ---------------------------------------------------------------------------

export const profile: Profile = {
  name: "JAY ANDRADE",
  title: "FULL-STACK DEVELOPER",
  location: "DUBAI, UAE",
  // Hero.tsx sub-paragraph
  summary:
    "Full-Stack Developer based in Dubai with 2+ years of industry experience — building production-grade software and mentoring the next generation of developers.",
  // About.tsx bio paragraphs, one entry per <p>
  bio: [
    "I'm Jay — a Full-Stack Developer who builds things end-to-end. From MERN-stack web apps and hardware prototypes to AI chatbots with RAG pipelines and real-time multiplayer platforms, I gravitate toward projects that are technically interesting and actually ship.",
    "Currently a Junior Web Developer at Potential, building full-stack applications across the whole product lifecycle.",
    "I care about clean architecture, fast iteration, and writing software that holds up in production.",
  ],
};

// ---------------------------------------------------------------------------
// Projects — components/Projects.tsx
// ---------------------------------------------------------------------------

// TODO: populate liveUrl/repoUrl — chat link actions render only when present.
export const projects: Project[] = [
  {
    id: "001",
    name: "ASTROBARISTAS",
    desc: "Full-stack team website for a coffee brand — built end-to-end with the MERN stack. Features a dynamic menu, team profiles, and a custom CMS for content management.",
    stack: ["MongoDB", "Express", "React", "Node.js"],
    status: "LIVE",
    color: "var(--accent)",
    sectionAnchor: "projects",
  },
  {
    id: "002",
    name: "CARDUINO",
    desc: "Hardware-software smart car prototype built on Arduino Uno — autonomous obstacle avoidance, sensor fusion, and real-time motor control.",
    stack: ["Arduino", "C++", "Hardware", "IoT"],
    status: "BUILT",
    color: "var(--accent)",
    sectionAnchor: "projects",
  },
  {
    id: "003",
    name: "CHESS ENGINE",
    desc: "Fully playable chess game with a custom AI opponent — Minimax with Alpha-Beta Pruning, piece-square tables, move ordering, and iterative deepening. Pure algorithmic AI, no ML.",
    stack: ["Python", "Pygame", "python-chess"],
    status: "BUILT",
    color: "var(--accent3)",
    sectionAnchor: "projects",
  },
  {
    id: "004",
    name: "JEOPARDY.APP",
    desc: "Real-time multiplayer Jeopardy platform — hosts generate room codes, players join on mobile and buzz in live. Full game state machine, WebSocket events, and custom board generation.",
    stack: ["React", "Socket.io", "Express", "PostgreSQL", "Prisma"],
    status: "BUILT",
    color: "var(--accent2)",
    sectionAnchor: "projects",
  },
  {
    id: "005",
    name: "BIZ-BOT",
    desc: "Multi-tenant AI chatbot platform for local businesses — embeddable widget with RAG-powered responses, business data ingestion, analytics dashboard, and organisation management.",
    stack: ["Next.js", "Hono", "Drizzle", "PostgreSQL"],
    status: "BUILT",
    color: "var(--accent)",
    sectionAnchor: "projects",
  },
  {
    id: "006",
    name: "TRADEWISE",
    desc: "AI-powered stock and crypto trading platform — real-time portfolio tracking, an AI coach reviewing your trades, an AI analyst surfacing live insights, and algorithmic strategies that execute on trigger.",
    stack: ["Python", "FastAPI", "Next.js", "AI"],
    status: "WIP",
    color: "var(--accent3)",
    sectionAnchor: "projects",
    caseStudy: [
      "The build underway is a self-hosted algorithmic crypto trading system: a FastAPI and PostgreSQL backend with a Next.js dashboard in front of it, running two parallel trading runtimes from one codebase and one database — one wired to Binance's spot testnet, one to a fully internal simulator. Which environment a row belongs to is a column, not a separate deployment, so both halves of the system stay honest with each other.",
      "The simulator is the part worth describing. It is a virtual broker that holds no exchange credentials at all, so there is no path by which a real order could leave it. Fills are priced off live top-of-book data and then deliberately moved against the trader: a per-pair half-spread, plus slippage scaled by how much of the visible depth the order would eat, capped at 200 basis points. An order larger than a quarter of the book is rejected outright rather than filled at a price nobody could have got. Stale market data, lot-size and minimum-notional filters, and an unaffordable debit against the virtual wallet all produce recorded rejections. A strategy that only looks profitable because the simulator was generous has told you nothing, so the simulator is built not to be generous.",
      "Every order leaves through a single execution boundary, and in front of it sits a risk engine written as a pure evaluator — it reports breaches and never mutates state or places orders itself. It gates each entry on position sizing, risk-per-trade measured against stop distance, total open risk, per-symbol and per-strategy exposure, correlated-group exposure, open position count, and rolling weekly loss. Rejections are persisted as auditable events rather than silently dropped.",
      "A drawdown breach past the configured threshold latches a kill switch. It raises a critical alert, blocks every new entry while leaving exits open, and, when configured to, sweeps all open positions out through that same execution boundary — retrying and escalating if anything is left stranded. Resetting the switch only unlatches it; it never re-opens what it closed. A separate reconciliation pass audits the books against themselves, checking that the change in equity genuinely equals realised plus unrealised profit within a float-rounding tolerance and flagging the residual when it does not.",
      "The least glamorous problem was the most instructive: the tick and audit tables outgrew 32-bit primary keys. Widening them naively would have taken an exclusive lock and rewritten a live table, so the migration adds a shadow column, keeps it in step with a trigger, backfills in batches, builds the replacement index concurrently, and then swaps the columns under a short lock timeout.",
    ],
  },
];

export const hotStreak: ExternalProject = {
  id: "007",
  name: "HOT STREAK",
  tagline: "DAILY PUZZLE PLATFORM",
  desc: "A daily puzzle platform with six original word and logic games, each publishing a new puzzle every day.",
  stack: ["Next.js", "Express", "TypeScript", "PostgreSQL", "Drizzle", "Turbo", "Playwright"],
  status: "LIVE",
  liveUrl: "https://games.jayandrade.com",
  caseStudy: [
    "Hot Streak is a daily puzzle platform running six original games — Intersect, Sequence, Link, Origins, Compass and Lockstep — each of which publishes a new puzzle every day. It is a pnpm monorepo: a Next.js App Router front end, an Express and TypeScript API, PostgreSQL through Drizzle, Turbo orchestrating the build, Vitest and Playwright covering it, deployed with Dokploy behind Traefik.",
    "All six games share a single engine contract. Each one implements the same small interface — resolve the public puzzle, create initial state, apply an action, decide whether the state is complete, build a result — and registers itself in one registry, so the API drives every game through the same generic dispatch pattern — one gameKey-parameterised route per action — with no per-game branching in any handler. The abstraction is harder than it sounds, because underneath it the games agree on almost nothing. Lockstep moves two pieces simultaneously and keeps a capped move history so a player can undo or restart. Origins is an ordered run of binary questions that rejects an answer arriving out of sequence. Compass, Sequence and Link are guess-based with attempt limits, and each has its own definition of a solve worth counting. The contract survives because the shared spine is mandatory and the awkward parts — extra state fields, terminal payloads, whether an attempt qualifies for a streak — are optional hooks rather than one forced common shape.",
    "The genuinely hard problem is content. Puzzles are either authored as files in the repo or generated, and both have to survive a redeploy without breaking games already in progress. Every puzzle carries a fingerprint: its source is canonicalised, with object keys sorted recursively, then hashed together with the game key, date and source version. On each deploy the seeder compares that fingerprint against what is already published and rebuilds anything that has drifted. Generated puzzles get a stricter pass — the reconciler rebuilds each published puzzle from current source data, diffs the result, and classifies it as keep, refresh or replace, so a puzzle whose underlying dataset was corrected, or whose stored payload no longer validates against the current schema, is caught before a player ever loads it.",
    "Nothing is edited in place. Publishing is transactional and versioned: a replaced puzzle is retired at its old version with every attempt, result and streak still attached to it, and the new one is inserted alongside. A separate job runs on boot and every twenty-four hours after it, keeping thirty days of puzzles published ahead of the current date and using per-generator cooldowns so recent answers do not come round again too soon.",
    "Players never create an account. Identity is a signed cookie — a UUID plus an HMAC signature verified in constant time against a server-side secret — issued on the first request and good for four hundred days, with the web app proxying API calls over the internal Docker network so that cookie stays first-party. Streaks are computed on UTC calendar days by a strict parser that rejects impossible dates outright instead of letting them silently roll over, and completions are written under a row-level lock so two games finishing at the same moment cannot corrupt a count. A backdated completion — a stale puzzle finished late — is recorded, but deliberately does not advance the live streak.",
  ],
};

// ---------------------------------------------------------------------------
// Skills — components/Skills.tsx (level is 0-10)
// ---------------------------------------------------------------------------

export const skillDomains: SkillDomain[] = [
  {
    id: "FRONTEND",
    skills: [
      { name: "React", level: 9 },
      { name: "Next.js", level: 9 },
      { name: "TypeScript", level: 8 },
      { name: "TailwindCSS", level: 8 },
      { name: "GSAP", level: 7 },
    ],
  },
  {
    id: "BACKEND",
    skills: [
      { name: "Node.js", level: 9 },
      { name: "Express", level: 9 },
      { name: "Hono", level: 7 },
      { name: "Python", level: 8 },
      { name: "FastAPI", level: 7 },
      { name: "Django", level: 6 },
      { name: "PostgreSQL", level: 8 },
      { name: "MongoDB", level: 7 },
      { name: "Drizzle", level: 8 },
      { name: "Redis", level: 7 },
      { name: "Passport.js", level: 7 },
      { name: "BullMQ", level: 6 },
      { name: "Zod", level: 8 },
      { name: "JWT", level: 8 },
    ],
  },
  {
    id: "AI / ML",
    skills: [
      { name: "LangChain", level: 7 },
      { name: "RAG", level: 7 },
      { name: "OpenAI API", level: 8 },
      { name: "Anthropic SDK", level: 7 },
      { name: "Gemini API", level: 6 },
      { name: "Pandas", level: 7 },
      { name: "Scikit-learn", level: 6 },
    ],
  },
  {
    id: "TOOLS",
    skills: [
      { name: "Git", level: 9 },
      { name: "Docker", level: 7 },
      { name: "Bun", level: 8 },
      { name: "Arduino", level: 7 },
      { name: "Prisma", level: 7 },
      { name: "WebSockets", level: 8 },
      { name: "AWS SES", level: 7 },
      { name: "Handlebars", level: 6 },
      { name: "Multer", level: 6 },
    ],
  },
  {
    id: "TESTING",
    skills: [
      { name: "Vitest", level: 7 },
      { name: "Playwright", level: 7 },
      { name: "Pytest", level: 7 },
    ],
  },
];

// ---------------------------------------------------------------------------
// Experience — components/Experience.tsx
// ---------------------------------------------------------------------------

export const roles: Role[] = [
  {
    id: "001",
    title: "JUNIOR WEB DEVELOPER",
    company: "POTENTIAL",
    type: "FULL-TIME",
    period: "MAY 2025 – PRESENT",
    location: "DUBAI, UAE",
    rgb: "0,255,224",
  },
  {
    id: "002",
    title: "FULL STACK DEVELOPER",
    company: "CRUISE MOTORS",
    type: "FULL-TIME",
    period: "DEC 2024 – MAR 2025",
    location: "DUBAI, UAE",
    rgb: "0,255,224",
  },
  {
    id: "003",
    title: "INSTRUCTOR",
    company: "ZABEEL INTERNATIONAL INSTITUTE",
    type: "FREELANCE",
    period: "OCT 2023 – JAN 2025",
    location: "DUBAI, UAE",
    rgb: "0,255,224",
  },
  {
    id: "004",
    title: "TECHNICAL ANALYST INTERN",
    company: "HEALY CONSULTANTS GROUP",
    type: "PART-TIME",
    period: "APR 2023 – JUL 2023",
    location: "DUBAI, UAE",
    rgb: "0,255,224",
  },
  {
    id: "005",
    title: "FULL STACK ENGINEER",
    company: "MIDDLESEX UNIVERSITY DUBAI",
    type: "INTERNSHIP",
    period: "NOV 2022 – JUN 2023",
    location: "DUBAI, UAE",
    rgb: "0,255,224",
  },
  {
    id: "006",
    title: "LAB ASSISTANT + R&D INTERN",
    company: "THE ASSEMBLY",
    type: "PART-TIME",
    period: "APR 2022 – DEC 2022",
    location: "DUBAI, UAE",
    rgb: "0,255,224",
  },
  {
    id: "007",
    title: "SOFTWARE ENGINEER INTERN",
    company: "IO21",
    type: "INTERNSHIP",
    period: "JAN 2022 – MAY 2022",
    location: "DUBAI, UAE",
    rgb: "0,255,224",
  },
];

// ---------------------------------------------------------------------------
// Contact — components/Contact.tsx
// ---------------------------------------------------------------------------

export const contactLinks: ContactLink[] = [
  {
    label: "EMAIL",
    display: "imjayandrade@gmail.com",
    href: "mailto:imjayandrade@gmail.com",
    copy: "imjayandrade@gmail.com",
    external: false,
    icon: "◆",
  },
  {
    label: "LINKEDIN",
    display: "linkedin.com/in/jay-ryan-andrade",
    href: "https://www.linkedin.com/in/jay-ryan-andrade/",
    copy: "https://www.linkedin.com/in/jay-ryan-andrade/",
    external: true,
    icon: "◉",
  },
  {
    label: "GITHUB",
    display: "github.com/jay-ry",
    href: "https://github.com/jay-ry",
    copy: "https://github.com/jay-ry",
    external: true,
    icon: "◈",
  },
];

// ---------------------------------------------------------------------------
// Sections — NEW numbering, with AI GUIDE inserted at 005
// ---------------------------------------------------------------------------

export const sections: Section[] = [
  { id: "hero", num: "001", label: "INIT", anchor: "hero" },
  { id: "about", num: "002", label: "ABOUT", anchor: "about" },
  { id: "skills", num: "003", label: "SKILLS", anchor: "skills" },
  { id: "projects", num: "004", label: "PROJECTS", anchor: "projects" },
  { id: "ai-guide", num: "005", label: "AI GUIDE", anchor: "ai-guide" },
  { id: "experience", num: "006", label: "EXPERIENCE", anchor: "experience" },
  { id: "contact", num: "007", label: "CONTACT", anchor: "contact" },
];
