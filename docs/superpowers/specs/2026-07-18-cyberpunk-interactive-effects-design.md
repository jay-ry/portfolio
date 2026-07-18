# Cyberpunk Interactive Effects — Design Spec

**Date:** 2026-07-18
**Project:** Jay Andrade portfolio (Next.js 16 App Router, React 19, GSAP, R3F, Tailwind v4)
**Status:** Approved for planning

## Goal

Make the portfolio feel *alive* and interactive while staying inside its existing
terminal/cyberpunk visual language. The background should react to the mouse, clicks
should produce on-theme feedback, the cursor should read as a targeting HUD, text should
decode like a terminal, and the existing GSAP animation set should get a variety +
robustness pass. No new visual language is introduced — everything reuses the current
palette, fonts, and motion vocabulary.

## Design principles (cross-cutting, apply to every piece)

- **Theme-aware:** read CSS custom properties (`--accent`, `--accent2`, `--accent3`,
  `--glow`, `--grid`, `--border`) and/or `useTheme()` from `next-themes`, mirroring the
  pattern already in `components/Scene.tsx`. Guard client-only reads with a `mounted` flag
  and fall back to the dark palette for SSR.
- **Touch-safe:** pointer-driven effects (reticle cursor, click shockwave, background
  repel) disable on `@media (pointer: coarse)` / touch, matching the current `Cursor.tsx`
  behavior. Touch users keep today's lightweight experience.
- **Reduced-motion:** every animation (new *and* existing) checks
  `prefers-reduced-motion: reduce` and degrades to a static or minimal state.
- **Performance:** no effect may drop frames on the pinned ScrollTrigger sections.
  Pointer work is throttled to animation frames; the background stays on its existing
  single R3F render loop rather than adding a second `requestAnimationFrame`.
- **Bespoke, not imported:** implemented directly against the existing GSAP/R3F/CSS code.
  No 21st.dev / external component dependencies added.

## Architecture overview

```
app/page.tsx ──mounts──▶ <Scene/>        (bg, z0) ── subscribes to pointer
                         <Cursor/>       (reticle, z9999) ── subscribes to pointer
                         <ClickFX/>       (shockwave, z1000) ── subscribes to pointer
                         GSAP timelines   (section reveals + section-lock readout)

lib/pointer.ts ──────── single source of truth for pointer state + click events
components/Scramble / useScramble ── text decode-on-hover, used by titles & links
```

### Shared foundation: pointer module (`lib/pointer.ts`)

A single lightweight module that owns the only global `pointermove` / `pointerdown`
listeners and publishes state to subscribers. Prevents four separate effects from each
attaching their own listeners.

- **Exposes:** current `x`/`y` (px), normalized `nx`/`ny` (−1..1), velocity, `isTouch`,
  `isDown`, and a `subscribe(fn)` API plus a `onClick(fn)` event channel.
- **Behavior:** updates a mutable ref on every `pointermove`; subscribers read from it on
  their own frame loop (pull model) so we never fan out per-event React renders.
- **Touch:** if the environment is coarse-pointer, it no-ops (never attaches move
  listeners), so all downstream effects naturally disable.
- **Interface contract:** consumers only read pointer state + subscribe to clicks; they
  never write. This keeps each effect independently testable against a mock pointer.

**Why:** one listener, one truth, trivially disabled on touch, no render storms.

---

## Piece 1 — Mouse-reactive background (`components/Scene.tsx`, extend)

Turn the passive particle field + grid into something that responds to the cursor.

- **Particles:** each frame, apply a soft radial force relative to the projected cursor
  position — a gentle repel (or attract; final direction chosen during implementation to
  look best) that eases back to rest when the pointer is idle. Field also parallax-tilts a
  few degrees toward the pointer (`nx`/`ny` drive small `rotation.x/y` offsets).
- **Grid:** brightens slightly and scrolls marginally faster when the pointer is active;
  returns to the current baseline when idle.
- **Idle fallback:** when no pointer input for ~2s (or on touch), revert to today's slow
  auto-rotation so the scene never looks frozen.
- **Keeps:** existing theme-aware `fogColor` / `gridColor` swap, the single R3F render
  loop, particle counts/colors.
- **Reduced-motion:** skip the reactive forces; keep a static or minimal drift.

**Files:** `components/Scene.tsx` (modify), subscribes to `lib/pointer.ts`.

## Piece 2 — Glitch shockwave on click (`components/ClickFX.tsx`, new + revive orphan)

An RGB-split ring that bursts from each click point.

- On `onClick` from the pointer module, spawn a short-lived element at the click
  coordinates: a ring that scales up and fades over ~400ms, rendered with cyan/red
  channel offset (reuse the existing `.glitch` / `.glitch-overlay` keyframes and the
  currently-orphaned `components/GlitchOverlay.tsx` styling in `globals.css`).
- Optional brief scanline tear on the same trigger for extra "signal disruption."
- **Pure DOM/CSS**, driven off the pointer context — no canvas cost, self-cleans after the
  animation ends. Fires on all clicks but stays subtle enough not to fight buttons.
- **Touch / reduced-motion:** disabled.

**Files:** `components/ClickFX.tsx` (new, mounted in `app/page.tsx`), reuses
`GlitchOverlay.tsx` + glitch CSS in `app/globals.css`.

## Piece 3 — Targeting-reticle cursor (`components/Cursor.tsx`, rework)

Evolve the lerp dot+ring into a HUD reticle.

- Ring → animated crosshair / corner-bracket reticle; a small mono `[x:… y:…]` coordinate
  readout trails it (uses `--font-mono`, `--accent`).
- Over interactive targets (`a`, `button`, `[data-hover]`) the brackets snap to and clamp
  onto the element's bounding box for a "target lock" feel, then release on leave.
- **Bug fix:** replace the current one-time `querySelectorAll` hover-listener attachment
  (which misses dynamically added elements) with **event delegation** on `document`, so
  lock-on works for any element regardless of mount timing.
- Keeps the instant-dot + lerp-follow structure and `mix-blend-mode: difference`.
- **Touch:** unchanged — hidden on coarse pointers. **Reduced-motion:** static reticle,
  no lerp smoothing.

**Files:** `components/Cursor.tsx` (modify), subscribes to `lib/pointer.ts`.

## Piece 4 — Text-scramble on hover (`useScramble` / `<Scramble>`, new)

Terminal-style decode: text resolves from random glyphs to its final characters.

- A reusable `useScramble` hook + thin `<Scramble>` wrapper component. On hover/pointer-
  enter (and optionally on first reveal), scramble each character through a mono charset
  before settling on the real text over a short window.
- Applied to: section titles (the Orbitron headings) and the contact/nav links. Scope of
  exact targets finalized in the plan, but titles + links are the baseline.
- **Reduced-motion:** render final text immediately, no scramble. **Accessibility:** the
  real text remains the DOM text content throughout (scramble is visual only), so screen
  readers and copy/paste are unaffected.

**Files:** `components/Scramble.tsx` + `lib/useScramble.ts` (new); applied in section
components (`Hero`, `About`, `Skills`, `Projects`, `Experience`, `Contact`, `Nav`).

## Piece 5 — Animation-improvement pass (full scope)

Targeted upgrades to the existing GSAP set in `app/page.tsx` — variety + robustness, not a
rewrite.

- **Entrance variety:** every section currently reuses the identical
  `buildGlitchInOutTL`. Give 2–3 sections a distinct signature entrance so it stops
  feeling copy-pasted. Baseline intent:
  - **Skills:** the `SegBar` level bars "charge up" (segments fill sequentially) instead of
    a plain glitch-in.
  - **Projects:** cards do a brief data-load stutter as they enter.
  - Others keep the existing glitch-in-out (it's good — variety, not chaos).
- **Section-lock readout:** when a pinned section settles into place, a brief
  `LOADING ███ 100%` mono tick plays near the section label, tying the sections together.
- **Reduced-motion + perf baseline:** wire `prefers-reduced-motion` across the *existing*
  timelines (not just the new effects), and verify the new pointer/background work holds
  frame rate on the pinned `scrub` ScrollTriggers.

**Files:** `app/page.tsx` (timeline builders), `components/Skills.tsx`,
`components/Projects.tsx`, `app/globals.css` (readout styling if needed).

---

## What is explicitly NOT in scope (YAGNI)

- Matrix / data-rain background (a competing second background system) — cut in favor of
  extending the existing scene.
- Reactive vector-grid warp as a separate effect — folded into Piece 1's grid behavior.
- Particle burst on click as a *separate* effect — the glitch shockwave (Piece 2) covers
  click feedback; no need for both.
- framer-motion — installed but unused; stays unused. All motion stays GSAP/R3F/CSS for
  codebase consistency.
- Any 21st.dev / external component imports.
- Content, copy, layout, or new sections — this is purely an effects/animation layer.

## Success criteria

1. Moving the mouse visibly perturbs the background particle field and tilts the scene;
   the grid responds; idle reverts to gentle auto-motion.
2. Clicking anywhere spawns an on-theme glitch shockwave at the click point that self-
   cleans.
3. The cursor reads as a targeting reticle with a live coordinate readout and locks onto
   interactive elements — including elements added after initial mount.
4. Section titles and links decode via scramble on hover; DOM text stays intact for a11y.
5. At least two sections have visibly distinct entrance animations; a section-lock readout
   plays on pin settle.
6. Everything works in both light and dark themes, disables cleanly on touch, and honors
   `prefers-reduced-motion`.
7. No frame drops on the pinned ScrollTrigger sections.

## Testing approach

- **Manual / visual (primary):** Chrome DevTools MCP — drive the page, move the pointer,
  click, toggle theme, emulate reduced-motion and coarse-pointer, and screenshot each
  effect. This is the meaningful verification for visual work.
- **Unit-testable seams:** `lib/pointer.ts` (state math against a mock event stream) and
  `useScramble` (given input text + seed, output settles to the final string) can have
  light logic tests since they're pure-ish.
- **Perf check:** DevTools performance trace over a scroll through the pinned sections with
  the reactive background on, confirming no sustained frame drops.
