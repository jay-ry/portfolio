# About + Experience Sections Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 002 // ABOUT and 005 // EXPERIENCE sections, renumber Projects (004) and Contact (006), and reorder all sections in `page.tsx`.

**Architecture:** Two new forwardRef components following the existing Hero/Projects/Contact pattern. About uses the `buildContactTL` glitch animation; Experience uses the `buildProjectsTL` horizontal-scroll pattern. Both are wired into the same ScrollTrigger orchestration in `page.tsx`. Renumbering is label-only (string changes in existing components).

**Tech Stack:** Next.js 16, React 19, TypeScript, GSAP 3 + ScrollTrigger, Lenis

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `components/About.tsx` | Create | About section: bio copy, stat chips, AboutHandle ref |
| `components/Experience.tsx` | Create | Experience section: job data, ExperienceCard, ExperienceHandle ref |
| `components/Projects.tsx` | Modify | Change label string `002 // PROJECTS` → `004 // PROJECTS` |
| `components/Contact.tsx` | Modify | Change label string `004 // CONTACT` → `006 // CONTACT` |
| `app/page.tsx` | Modify | Imports, refs, buildAboutTL, buildExperienceTL, ScrollTriggers, JSX order |

---

## Task 1: Create `components/About.tsx`

**Files:**
- Create: `components/About.tsx`

- [ ] **Step 1: Create the file**

Create `components/About.tsx` with the following content:

```tsx
"use client";
import { forwardRef, useImperativeHandle, useRef } from "react";

export type AboutHandle = {
  section:    HTMLElement;
  titleBlock: HTMLDivElement;
  bio:        HTMLDivElement;
  chips:      HTMLDivElement;
};

const About = forwardRef<AboutHandle>((_, ref) => {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef   = useRef<HTMLDivElement>(null);
  const bioRef     = useRef<HTMLDivElement>(null);
  const chipsRef   = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    get section()    { return sectionRef.current!; },
    get titleBlock() { return titleRef.current!; },
    get bio()        { return bioRef.current!; },
    get chips()      { return chipsRef.current!; },
  }), []);

  return (
    <section
      id="about"
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
      <div ref={titleRef} style={{ marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "1rem" }}>
          <span className="section-label">002 // ABOUT</span>
          <div className="sci-divider" style={{ flex: 1, maxWidth: "300px" }} />
        </div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 5vw, 4rem)", fontWeight: 700, color: "var(--text)", letterSpacing: "0.05em" }}>
          FULL-STACK<br /><span style={{ color: "var(--accent)", opacity: 0.5 }}>DEVELOPER.</span>
        </h2>
      </div>

      <div ref={bioRef} style={{ maxWidth: "600px", marginBottom: "2.5rem" }}>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "16px", color: "var(--text-muted)", lineHeight: 1.9, letterSpacing: "0.03em", marginBottom: "1.25rem" }}>
          I'm Jay — a Full-Stack Developer who builds things end-to-end. From MERN-stack web apps
          and hardware prototypes to AI chatbots with RAG pipelines and real-time multiplayer
          platforms, I gravitate toward projects that are technically interesting and actually ship.
        </p>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "16px", color: "var(--text-muted)", lineHeight: 1.9, letterSpacing: "0.03em", marginBottom: "1.25rem" }}>
          Currently a Junior Web Developer at Potential, building full-stack applications across
          the whole product lifecycle.
        </p>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "16px", color: "var(--text-muted)", lineHeight: 1.9, letterSpacing: "0.03em" }}>
          I care about clean architecture, fast iteration, and writing software that holds up
          in production.
        </p>
      </div>

      <div ref={chipsRef} style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        {["2+ YRS EXPERIENCE", "6+ PROJECTS SHIPPED", "DUBAI, UAE"].map(chip => (
          <span
            key={chip}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              letterSpacing: "0.15em",
              color: "var(--text-muted)",
              border: "1px solid var(--border)",
              padding: "6px 16px",
            }}
          >
            {chip}
          </span>
        ))}
      </div>
    </section>
  );
});

About.displayName = "About";
export default About;
```

- [ ] **Step 2: Type-check**

```bash
cd /home/jayry/projects/portfolio && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/About.tsx
git commit -m "feat: add About section component"
```

---

## Task 2: Create `components/Experience.tsx`

**Files:**
- Create: `components/Experience.tsx`

- [ ] **Step 1: Create the file**

Create `components/Experience.tsx` with the following content:

```tsx
"use client";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";

const experiences = [
  {
    id: "001",
    title: "JUNIOR WEB DEVELOPER",
    company: "POTENTIAL",
    type: "FULL-TIME",
    period: "MAY 2025 – PRESENT",
    location: "DUBAI, UAE",
    color: "#00ffe0",
    rgb: "0,255,224",
  },
  {
    id: "002",
    title: "FULL STACK DEVELOPER",
    company: "CRUISE MOTORS",
    type: "FULL-TIME",
    period: "DEC 2024 – MAR 2025",
    location: "DUBAI, UAE",
    color: "#00ffe0",
    rgb: "0,255,224",
  },
  {
    id: "003",
    title: "INSTRUCTOR",
    company: "ZABEEL INTERNATIONAL INSTITUTE",
    type: "FREELANCE",
    period: "OCT 2023 – JAN 2025",
    location: "DUBAI, UAE",
    color: "#7b00ff",
    rgb: "123,0,255",
  },
  {
    id: "004",
    title: "TECHNICAL ANALYST INTERN",
    company: "HEALY CONSULTANTS GROUP",
    type: "PART-TIME",
    period: "APR 2023 – JUL 2023",
    location: "DUBAI, UAE",
    color: "#ff003c",
    rgb: "255,0,60",
  },
  {
    id: "005",
    title: "FULL STACK ENGINEER",
    company: "MIDDLESEX UNIVERSITY DUBAI",
    type: "INTERNSHIP",
    period: "NOV 2022 – JUN 2023",
    location: "DUBAI, UAE",
    color: "#00ffe0",
    rgb: "0,255,224",
  },
  {
    id: "006",
    title: "LAB ASSISTANT + R&D INTERN",
    company: "THE ASSEMBLY",
    type: "PART-TIME",
    period: "APR 2022 – DEC 2022",
    location: "DUBAI, UAE",
    color: "#7b00ff",
    rgb: "123,0,255",
  },
  {
    id: "007",
    title: "SOFTWARE ENGINEER INTERN",
    company: "IO21",
    type: "INTERNSHIP",
    period: "JAN 2022 – MAY 2022",
    location: "DUBAI, UAE",
    color: "#ff003c",
    rgb: "255,0,60",
  },
];

type ExpCardProps = { exp: typeof experiences[0] };

const ExperienceCard = forwardRef<HTMLDivElement, ExpCardProps>(({ exp }, ref) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      ref={ref}
      className="project-card neon-border"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? `rgba(${exp.rgb},0.04)` : "rgba(5,13,20,0.8)",
        padding: "2rem",
        position: "relative",
        overflow: "hidden",
        cursor: "default",
        transition: "background 0.3s",
        clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))",
        minWidth: "280px",
        maxWidth: "320px",
      }}
    >
      <div style={{ position: "absolute", top: 0, right: 0, width: "16px", height: "16px", background: exp.color, opacity: hovered ? 1 : 0.3, transition: "opacity 0.3s" }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-muted)" }}>{exp.id}</span>
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: "10px",
          letterSpacing: "0.15em",
          color: "var(--text-muted)",
          border: "1px solid var(--border)",
          padding: "2px 8px",
        }}>
          {exp.type}
        </span>
      </div>

      <h3 style={{
        fontFamily: "var(--font-display)",
        fontSize: "1.1rem",
        fontWeight: 700,
        color: hovered ? exp.color : "var(--text)",
        marginBottom: "0.4rem",
        transition: "color 0.3s",
        letterSpacing: "0.05em",
        lineHeight: 1.3,
      }}>
        {exp.title}
      </h3>

      <p style={{
        fontFamily: "var(--font-display)",
        fontSize: "0.85rem",
        fontWeight: 400,
        color: "var(--text-muted)",
        marginBottom: "1.5rem",
        letterSpacing: "0.08em",
      }}>
        {exp.company}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-muted)" }}>
          {exp.period}
        </span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-muted)", opacity: 0.6 }}>
          {exp.location}
        </span>
      </div>
    </div>
  );
});
ExperienceCard.displayName = "ExperienceCard";

export type ExperienceHandle = {
  section:     HTMLElement;
  titleBlock:  HTMLDivElement;
  cardsTrack:  HTMLDivElement;
};

const Experience = forwardRef<ExperienceHandle>((_, ref) => {
  const sectionRef    = useRef<HTMLElement>(null);
  const titleRef      = useRef<HTMLDivElement>(null);
  const cardsTrackRef = useRef<HTMLDivElement>(null);
  const cardRefs      = useRef<(HTMLDivElement | null)[]>([]);

  useImperativeHandle(ref, () => ({
    get section()    { return sectionRef.current!; },
    get titleBlock() { return titleRef.current!; },
    get cardsTrack() { return cardsTrackRef.current!; },
  }), []);

  return (
    <section
      id="experience"
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
          <span className="section-label">005 // EXPERIENCE</span>
          <div className="sci-divider" style={{ flex: 1, maxWidth: "300px" }} />
        </div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 5vw, 4rem)", fontWeight: 700, color: "var(--text)", letterSpacing: "0.05em" }}>
          WORK<br /><span style={{ color: "var(--accent)", opacity: 0.5 }}>HISTORY</span>
        </h2>
      </div>

      <div ref={cardsTrackRef} style={{ display: "flex", gap: "1.5rem", willChange: "transform" }}>
        {experiences.map((exp, i) => (
          <ExperienceCard
            key={exp.id}
            exp={exp}
            ref={el => { cardRefs.current[i] = el; }}
          />
        ))}
      </div>

      <div style={{ marginTop: "1.5rem", flexShrink: 0, fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-muted)" }}>
        <span style={{ color: "var(--accent)" }}>07</span> / 07 ROLES LOADED
        <span style={{ marginLeft: "2rem", opacity: 0.4 }}>← SCROLL →</span>
      </div>
    </section>
  );
});

Experience.displayName = "Experience";
export default Experience;
```

- [ ] **Step 2: Type-check**

```bash
cd /home/jayry/projects/portfolio && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/Experience.tsx
git commit -m "feat: add Experience section component with horizontal card scroll"
```

---

## Task 3: Renumber Projects and Contact labels

**Files:**
- Modify: `components/Projects.tsx` line 143
- Modify: `components/Contact.tsx` line 42

- [ ] **Step 1: Update Projects label**

In `components/Projects.tsx`, find and replace:

```tsx
<span className="section-label">002 // PROJECTS</span>
```

with:

```tsx
<span className="section-label">004 // PROJECTS</span>
```

- [ ] **Step 2: Update Contact label**

In `components/Contact.tsx`, find and replace:

```tsx
<span className="section-label">004 // CONTACT</span>
```

with:

```tsx
<span className="section-label">006 // CONTACT</span>
```

- [ ] **Step 3: Commit**

```bash
git add components/Projects.tsx components/Contact.tsx
git commit -m "chore: renumber Projects to 004 and Contact to 006"
```

---

## Task 4: Wire About and Experience into `app/page.tsx`

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Add imports**

At the top of `app/page.tsx`, add to the existing import block:

```tsx
import About, { type AboutHandle } from "@/components/About";
import Experience, { type ExperienceHandle } from "@/components/Experience";
```

- [ ] **Step 2: Add refs**

Inside `Home()`, alongside the existing refs:

```tsx
const aboutRef      = useRef<AboutHandle>(null);
const experienceRef = useRef<ExperienceHandle>(null);
```

- [ ] **Step 3: Add `buildAboutTL`**

Add the following function after `buildContactTL` and before `export default function Home()`:

```tsx
/**
 * About: titleBlock, bio, chips glitch in top-to-bottom → hold → glitch out.
 */
function buildAboutTL(els: HTMLElement[]) {
  const tl        = gsap.timeline();
  const enterEnd  = (els.length - 1) * STAGGER + DUR;
  const holdDur   = 0.6;
  const exitStart = enterEnd + holdDur;

  els.forEach((el, i) => {
    const dir = i % 2 === 0 ? 1 : -1;
    tl.fromTo(
      el,
      { opacity: 0, x: dir * 14,  skewX: -dir * 5 },
      { opacity: 1, x: 0,          skewX: 0,         duration: DUR, ease: "power2.out" },
      i * STAGGER,
    );
  });

  tl.to({}, { duration: holdDur }, enterEnd);

  els.forEach((el, i) => {
    const dir = i % 2 === 0 ? -1 : 1;
    tl.fromTo(
      el,
      { opacity: 1, x: 0,        skewX: 0        },
      { opacity: 0, x: dir * 14, skewX: -dir * 5, duration: DUR, ease: "power2.in" },
      exitStart + i * STAGGER,
    );
  });

  return tl;
}
```

- [ ] **Step 4: Add `buildExperienceTL`**

Add immediately after `buildAboutTL`:

```tsx
/**
 * Experience: title glitches in, cards scroll horizontally, title glitches out.
 */
function buildExperienceTL(titleBlock: HTMLElement, track: HTMLElement) {
  const tl = gsap.timeline();

  tl.fromTo(
    titleBlock,
    { opacity: 0, x: 14,  skewX: -5 },
    { opacity: 1, x: 0,   skewX: 0,  duration: 0.15, ease: "power2.out" },
    0,
  );

  tl.to(
    track,
    {
      x: () => -(track.scrollWidth - track.parentElement!.clientWidth + (parseFloat(getComputedStyle(track.parentElement!).paddingLeft) * 2)),
      ease: "none",
      duration: 0.7,
    },
    0.15,
  );

  tl.fromTo(
    titleBlock,
    { opacity: 1, x: 0,   skewX: 0  },
    { opacity: 0, x: -14, skewX: 5, duration: 0.15, ease: "power2.in" },
    0.85,
  );

  return tl;
}
```

- [ ] **Step 5: Update the useEffect — get refs and gsap.set**

Inside `useEffect`, after the existing ref destructuring (`const hero = heroRef.current!` etc.), add:

```tsx
const about      = aboutRef.current!;
const experience = experienceRef.current!;
```

After the existing `gsap.set` calls, add:

```tsx
gsap.set([about.titleBlock, about.bio, about.chips], { opacity: 0, x: 0, skewX: 0 });
gsap.set(experience.titleBlock, { opacity: 0 });
gsap.set(experience.cardsTrack, { x: 0 });
```

- [ ] **Step 6: Add ScrollTrigger calls**

After the Hero ScrollTrigger block, add the About ScrollTrigger:

```tsx
// --- About: glitch in, hold, glitch out ---
ScrollTrigger.create({
  trigger:       about.section,
  start:         "top top",
  end:           "+=120%",
  pin:           true,
  anticipatePin: 1,
  scrub:         SCRUB,
  animation:     buildAboutTL([about.titleBlock, about.bio, about.chips]),
});
```

After the Projects ScrollTrigger block, add the Experience ScrollTrigger:

```tsx
// --- Experience: title glitch + horizontal card scroll ---
ScrollTrigger.create({
  trigger:       experience.section,
  start:         "top top",
  end:           "+=300%",
  pin:           true,
  anticipatePin: 1,
  scrub:         SCRUB,
  animation:     buildExperienceTL(experience.titleBlock, experience.cardsTrack),
});
```

- [ ] **Step 7: Update JSX order**

Replace the `<main>` block in the return statement with:

```tsx
<main className="grid-bg" style={{ position: "relative", zIndex: 10 }}>
  <Hero ref={heroRef} />
  <About ref={aboutRef} />
  <Projects ref={projectsRef} />
  <Experience ref={experienceRef} />
  <Contact ref={contactRef} />
</main>
```

Note: `<Skills>` will be inserted between `<About>` and `<Projects>` when the Skills plan is executed.

- [ ] **Step 8: Type-check**

```bash
cd /home/jayry/projects/portfolio && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 9: Commit**

```bash
git add app/page.tsx
git commit -m "feat: wire About and Experience into scroll orchestration"
```

---

## Task 5: Visual Verification

- [ ] **Step 1: Start dev server**

```bash
cd /home/jayry/projects/portfolio && npm run dev
```

Open `http://localhost:3000`.

- [ ] **Step 2: Verify full scroll sequence**

Scroll through and confirm each section in order:

1. **001 // INIT** — Hero glitches in/out as before
2. **002 // ABOUT** — pins, bio + chips glitch in, hold, glitch out
3. **004 // PROJECTS** — horizontal card scroll, label reads `004 // PROJECTS`
4. **005 // EXPERIENCE** — pins, 7 cards scroll horizontally left
5. **006 // CONTACT** — glitches in/out, label reads `006 // CONTACT`

- [ ] **Step 3: Production build**

```bash
cd /home/jayry/projects/portfolio && npm run build
```

Expected: no errors.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: verify about and experience build"
```
