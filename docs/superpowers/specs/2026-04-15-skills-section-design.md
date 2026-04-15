# Skills Section Design — 003 // SKILLS

**Date:** 2026-04-15
**Status:** Approved

---

## Overview

Add a new full-height pinned section (003 // SKILLS) between the existing Projects (002) and Contact (004) sections. The section displays categorised technical skills in a terminal/system-diagnostics aesthetic consistent with the rest of the site.

---

## Structure

A full-height pinned section matching the layout of Projects and Contact:

- **Header**: `003 // SKILLS` section-label + sci-divider + display heading (`TECHNICAL` / `SYSTEMS`)
- **Body**: 5 domain columns in a CSS grid, each styled as a terminal readout
- **Animation**: ScrollTrigger-pinned, `+=120%` scroll distance, glitch-in stagger (matching `buildContactTL` pattern)

---

## Skill Domains

### FRONTEND
React, Next.js, TypeScript, TailwindCSS, GSAP

### BACKEND
Node.js, Express, Hono, Python, FastAPI, Django, PostgreSQL, MongoDB, Drizzle, Redis, Passport.js, BullMQ, Zod, JWT

### AI / ML
LangChain, RAG, OpenAI API, Anthropic SDK, Gemini API, Pandas, Scikit-learn

### TOOLS
Git, Docker, Bun, Arduino, Prisma, WebSockets, AWS SES, Handlebars, Multer

### TESTING
Vitest, Playwright, Pytest

---

## Visual Design

Each column follows this layout:

```
FRONTEND
─────────────────────────
React           ████████░░
Next.js         ████████░░
TypeScript      ███████░░░
TailwindCSS     ████████░░
GSAP            ██████░░░░
```

- **Column header**: domain name in `section-label` style (mono, muted, letter-spaced)
- **Skill row**: skill name left-aligned (`var(--text)`), segmented bar right-aligned
- **Segmented bar**: 10 segments — filled use `var(--accent)`, empty use `var(--border)`; no numeric percentages shown
- **Row separator**: faint horizontal rule (`var(--border)`)
- **Bar values**: set per skill to reflect relative proficiency (not shown as numbers)

---

## Animation

Matches the `buildContactTL` glitch pattern used by the Contact section:

1. `titleBlock` glitches in first
2. Each of the 5 columns staggers in with `x + skewX` glitch (`opacity: 0 → 1`, `x: ±14 → 0`, `skewX: ∓5 → 0`)
3. Section is pinned; ScrollTrigger `end: "+=120%"`, `scrub: 1`

---

## Component Architecture

- **New file**: `components/Skills.tsx`
- **Exports**: `SkillsHandle` type (`section`, `titleBlock`, `columns: HTMLDivElement[]`)
- **Integration**: imported in `app/page.tsx`, added between `<Projects>` and `<Contact>`; `buildSkillsTL` added to the `useEffect` scroll setup

---

## Data

Skill bars are defined as static data in `Skills.tsx` — an array of domains, each containing an array of `{ name: string, level: number }` where `level` is 1–10.

---

## Files to Change

| File | Change |
|---|---|
| `components/Skills.tsx` | Create — new section component |
| `app/page.tsx` | Import Skills, add ref, wire ScrollTrigger, add `buildSkillsTL` |
