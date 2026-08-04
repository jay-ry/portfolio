/**
 * Shared portfolio data.
 *
 * Plain TypeScript — no React, no "use client". This module is the single
 * source of truth for portfolio content and must remain importable from BOTH
 * client components and server route handlers (e.g. the AI chat API).
 *
 * All values are transcribed verbatim from the presentational components:
 *   components/Hero.tsx, About.tsx, Skills.tsx, Projects.tsx,
 *   components/Experience.tsx, Contact.tsx
 * Do not reword or embellish — this data grounds an AI chatbot.
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
  },
];

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
