# About + Experience Sections Design

**Date:** 2026-04-15
**Status:** Approved

---

## Final Section Order

| # | Section | Status |
|---|---|---|
| 001 | INIT (Hero) | existing |
| 002 | ABOUT | new |
| 003 | SKILLS | planned (separate plan) |
| 004 | PROJECTS | existing — renumber label only |
| 005 | EXPERIENCE | new |
| 006 | CONTACT | existing — renumber label only |

---

## 002 // ABOUT

### Layout

Single-column, full-height pinned section. Centred vertically with `padding: 0 6vw`.

Header follows existing pattern: `002 // ABOUT` section-label + sci-divider + display heading.

```
002 // ABOUT
──────────────────────────────────────
FULL-STACK
DEVELOPER.

I'm Jay — a Full-Stack Developer who builds things end-to-end.
From MERN-stack web apps and hardware prototypes to AI chatbots
with RAG pipelines and real-time multiplayer platforms, I gravitate
toward projects that are technically interesting and actually ship.

Currently a Junior Web Developer at Potential, building full-stack
applications across the whole product lifecycle.

I care about clean architecture, fast iteration, and writing
software that holds up in production.

[ 2+ YRS EXPERIENCE ]  [ 6+ PROJECTS SHIPPED ]  [ DUBAI, UAE ]
```

### Stat chips
Three inline chips styled like the status badges in project cards: mono font, bordered, `var(--text-muted)` colour.

### Animation
Same `buildContactTL` glitch-in / hold / glitch-out pattern. Elements animated: `[titleBlock, bio, chips]`.

---

## 005 // EXPERIENCE

### Layout

Full-height pinned section with horizontal card scroll — same GSAP pattern as Projects (title glitches in, cards track left, title glitches out).

Header: `005 // EXPERIENCE` + sci-divider + display heading (`WORK` / `HISTORY`).

### Experience Data (most recent first)

1. **Junior Web Developer** — Potential · Full-time · May 2025 – Present · UAE
2. **Full Stack Developer** — Cruise Motors · Full-time · Dec 2024 – Mar 2025 · 4 mos · UAE
3. **Instructor** — Zabeel International Institute · Freelance · Oct 2023 – Jan 2025 · 1 yr 4 mos · Dubai, UAE
4. **Technical Analyst Intern** — Healy Consultants Group · Part-time · Apr 2023 – Jul 2023 · 4 mos · Dubai, UAE
5. **Full Stack Engineer** — Middlesex University Dubai · Internship · Nov 2022 – Jun 2023 · 8 mos · Dubai, UAE
6. **The Assembly** — Lab Assistant + R&D Intern · Apr 2022 – Dec 2022 · Dubai, UAE (two roles, one card)
7. **Software Engineer Intern** — IO21 · Internship · Jan 2022 – May 2022 · 5 mos · Dubai, UAE

### Card design

Each card matches the `neon-border` + `clipPath` style of project cards:

```
┌─────────────────────────────────┐
│ 001                    FULL-TIME │
│                                  │
│ JUNIOR WEB DEVELOPER             │
│ POTENTIAL                        │
│                                  │
│ MAY 2025 – PRESENT               │
│ DUBAI, UAE                       │
└─────────────────────────────────┘
```

- Top-left: index (`001`–`007`) in muted mono
- Top-right: employment type badge (FULL-TIME / FREELANCE / INTERNSHIP / PART-TIME)
- Title: display font, accent colour on hover
- Company: display font, muted
- Dates + location: mono, muted
- Corner accent triangle (matching project cards)

### Animation

`buildExperienceTL` — identical structure to `buildProjectsTL`:
- Title glitches in
- Cards track horizontally left (GSAP translateX)
- Title glitches out
- ScrollTrigger: pinned, `end: "+=300%"`, `scrub: 1`

---

## Renumbering

| File | Change |
|---|---|
| `components/Projects.tsx` | `002 // PROJECTS` → `004 // PROJECTS` |
| `components/Contact.tsx` | `004 // CONTACT` → `006 // CONTACT` |

---

## Files to Change

| File | Action |
|---|---|
| `components/About.tsx` | Create |
| `components/Experience.tsx` | Create |
| `components/Projects.tsx` | Modify — label only |
| `components/Contact.tsx` | Modify — label only |
| `app/page.tsx` | Modify — imports, refs, TL functions, ScrollTriggers, JSX order |
