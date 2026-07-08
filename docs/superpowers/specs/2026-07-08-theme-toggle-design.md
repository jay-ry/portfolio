# Theme Toggle (Dark / Light / System)

## Goal

Add a dropdown in the nav bar to switch between dark mode, light mode, and
"system" (follows OS/browser preference). System is the default for
first-time visitors. The site currently has only a dark cyberpunk/hacker
theme — light mode is a new visual design, not just a variable flip.

## Architecture

- Add the `next-themes` dependency.
- `app/layout.tsx`: wrap `children` in
  `<ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>`.
  Add `suppressHydrationWarning` to `<html>` — next-themes injects a blocking
  script that sets `data-theme` on `<html>` before first paint (from saved
  choice or `prefers-color-scheme`), which avoids a flash of the wrong theme
  but doesn't match SSR output, hence the warning suppression.
- `app/globals.css`: the existing `:root` block (today's dark values) stays
  as the fallback/dark theme. Add a new `[data-theme="light"]` block that
  overrides the same variable names for light mode. Everything driven by CSS
  variables re-themes automatically with no JS branching.
- The one exception: `components/Scene.tsx` sets three.js fog/wireframe
  colors as JS string props, which CSS variables can't reach. That component
  reads `useTheme()` (with the standard mounted-guard to avoid SSR/hydration
  mismatch) and picks between a dark and light color pair directly.
- `components/ThemeToggle.tsx` (new): a `<select>` with options
  System / Light / Dark, styled to match the existing terminal/HUD aesthetic
  (mono font, small caps, `var(--text-muted)` / `var(--accent)`), driven by
  `useTheme()` from next-themes. Rendered in `components/Nav.tsx`, next to
  the existing clock readout.

## Color palette

Light mode keeps the same "cyberpunk" identity (mono/display fonts, neon-style
accents, scanlines, glitch effects) inverted for a light background, not a
generic minimal light theme. Accent hues are darkened from their neon dark-mode
values for contrast against a light background; glow effects are toned down
(heavy neon glow reads as messy on white).

| Variable | Dark (current) | Light (new) |
|---|---|---|
| `--bg` | `#020408` | `#f2f6f7` |
| `--bg-secondary` | `#050d14` | `#e4edef` |
| `--accent` (cyan) | `#00ffe0` | `#007a70` |
| `--accent2` (magenta) | `#ff003c` | `#c2003a` |
| `--accent3` (purple) | `#7b00ff` | `#5b00c2` |
| `--grid` | `rgba(0,255,224,0.04)` | `rgba(0,90,80,0.05)` |
| `--border` | `rgba(0,255,224,0.15)` | `rgba(0,90,80,0.18)` |
| `--text` | `#c8f0ea` | `#0d1f1d` |
| `--text-muted` | `#7abfb8` | `#42605c` |
| `--glow` | `0 0 20px rgba(0,255,224,0.4)` | `0 0 16px rgba(0,122,112,0.25)` |
| `--glow-red` | `0 0 20px rgba(255,0,60,0.4)` | `0 0 16px rgba(194,0,58,0.25)` |

Two new shared tokens (used by both themes), introduced because several
components currently hardcode literal colors instead of referencing a
variable:

| Variable | Dark | Light | Replaces |
|---|---|---|---|
| `--panel-bg` | `rgba(5,13,20,0.8)` | `rgba(255,255,255,0.75)` | Nav's scrolled background, Projects card background, Contact button background |
| `--status-color` | `#00ff88` | `#0a9b4a` | The green "ONLINE"/"NOMINAL" status dot in Hero and Contact |

## Component changes

- **`components/ThemeToggle.tsx`** (new) — dropdown described above.
- **`components/Nav.tsx`** — render `<ThemeToggle />` next to the clock;
  replace hardcoded scrolled-background `rgba(2,4,8,0.95)` with
  `var(--panel-bg)`.
- **`components/Projects.tsx`** — replace literal per-project hex
  (`#00ffe0` / `#7b00ff` / `#ff003c`) with `var(--accent)` / `var(--accent3)`
  / `var(--accent2)`; replace card background `rgba(5,13,20,0.8)` with
  `var(--panel-bg)`.
- **`components/Skills.tsx`** — replace the gradient's literal
  `rgba(0,255,224,0.05)` / `rgba(0,10,8,0.6)` with var-based equivalents.
- **`components/Contact.tsx`** — replace button background with
  `var(--panel-bg)`; replace `#00ff88` status dot with `var(--status-color)`.
- **`components/Hero.tsx`** — replace `#00ff88` status color with
  `var(--status-color)`.
- **`components/Scene.tsx`** — theme-aware fog color (`#020408` dark /
  `#e8eef0` light) and wireframe mesh color (`#00ffe0` dark / `#007a70`
  light), via `useTheme()` + mounted-guard.
- **`app/layout.tsx`** — `ThemeProvider` wrapper, `suppressHydrationWarning`.
- **`app/globals.css`** — `[data-theme="light"]` block, two new shared
  tokens.

## Out of scope

- Re-tuning small decorative accent-color swatches beyond what's listed
  above (none remain — this spec covers a full retheme of every hardcoded
  color found in `components/*.tsx`).
- Any new visual effects beyond adapting existing scanline/glitch/glow
  treatments to the light palette.

## Testing

- Run the dev server; exercise the dropdown through all 3 states.
- Verify system default matches OS/browser preference on first load.
- Verify no flash of incorrect theme on reload after an explicit choice.
- Verify the 3D scene's fog/wireframe swap when toggling.
- Spot-check every section (Hero, About, Experience, Projects, Skills,
  Contact) in both themes for legibility and contrast.
