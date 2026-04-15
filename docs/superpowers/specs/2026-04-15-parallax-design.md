# Parallax Portfolio — Design Spec
Date: 2026-04-15

## Overview

Convert the existing portfolio into a full cinematic scroll experience. All four sections (Hero, Projects, AI_LINK, Contact) pin in place while the user scrolls, with content animating in and out. Sections transition via a glitch/scanline wipe effect. Scroll depth is ~2 viewport heights per section (~8vh total).

## Architecture

The page is a single long scroll container. Three visual layers:

- **Background (z-index 0):** Three.js canvas — fixed, unchanged, provides depth for free.
- **Mid (z-index 10):** Section content — pinned via GSAP ScrollTrigger, animated in/out by scroll progress.
- **Foreground (z-index 1000):** `GlitchOverlay` — a fixed full-viewport div driven by GSAP at section boundaries.

A single scroll orchestrator in `page.tsx` owns all four ScrollTrigger pin instances and fires glitch transition callbacks at each section boundary. Individual section components expose DOM refs but do not manage their own scroll logic.

Lenis remains for smooth scrolling. ScrollTrigger is configured to integrate with Lenis via the standard `ScrollTrigger.scrollerProxy` pattern to prevent them fighting during pinned sections.

## Per-Section Animations

Each section has three phases within its ~2vh pin window: **enter**, **hold**, **exit**.

### Hero
- **Enter:** Name and subtitle scrub up from below tied to scroll progress. Boot lines fade in sequentially.
- **Hold:** TypeAnimation runs, cursor blinks, all interactive.
- **Exit:** Glitch wipe fires, content clips out.

### Projects
- **Enter:** Section label slides in from left. Four project cards stagger up one by one as scroll progresses.
- **Hold:** All cards visible, hover states functional.
- **Exit:** Glitch wipe.

### AI_LINK
- **Enter:** Terminal window drops in from above, header text slides up.
- **Hold:** Chat fully interactive (input, send, scroll).
- **Exit:** Glitch wipe.

### Contact
- **Enter:** Contact cards fan in from center.
- **Hold:** Footer visible, copy-to-clipboard functional.
- **Exit:** None — last section. Page floor is visible below.

## Glitch Transition

A full-viewport fixed div (`GlitchOverlay`) executes the transition between sections:

1. `clip-path` scanline sweeps top-to-bottom across the screen (~0.3s).
2. During the sweep: brief RGB-split/desaturation flash on outgoing content via CSS filter.
3. Two or three horizontal noise bars flash via `@keyframes`.
4. Incoming section snaps into position as clip-path resets.

Total transition duration: ~0.5s.

## Files Changed

| File | Change |
|------|--------|
| `app/page.tsx` | Add scroll orchestrator `useEffect` with four ScrollTrigger pins + glitch callbacks. Wrap sections in scroll container. |
| `components/Hero.tsx` | Remove own `gsap.from()` timeline. Expose ref. Animation driven by orchestrator. |
| `components/Projects.tsx` | Remove own ScrollTrigger calls. Expose ref. |
| `components/AISection.tsx` | Remove own ScrollTrigger calls. Expose ref. |
| `components/Contact.tsx` | Remove own ScrollTrigger calls. Expose ref. |
| `components/GlitchOverlay.tsx` | New. Fixed full-viewport div with scanline markup. Exports ref for orchestrator. |
| `app/globals.css` | Add `@keyframes` for noise bars and RGB-split flash. |

## Dependencies

No new dependencies. Uses GSAP ScrollTrigger (already installed) and CSS already in the project.
