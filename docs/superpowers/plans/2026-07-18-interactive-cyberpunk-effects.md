# Interactive Cyberpunk Effects Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a cohesive layer of interactive effects — mouse-reactive 3D background, a click glitch-shockwave, a targeting-reticle cursor, terminal text-scramble, and an animation-variety pass — to the existing terminal/cyberpunk portfolio, all on-theme and degradation-safe.

**Architecture:** A single pointer module (`lib/pointer.ts`) owns the only global pointer listeners and exposes a pull-model state getter + a click subscription. The cursor, click-FX, and 3D scene all read from it. A tiny `lib/motion.ts` exposes `prefersReducedMotion()`. Text scramble is a pure function + a small hook/component. The animation pass edits the existing GSAP timeline builders in `app/page.tsx` plus two section components. No new libraries.

**Tech Stack:** Next.js 16 (App Router, React 19, all client components), GSAP 3 + ScrollTrigger, React-Three-Fiber / three, next-themes, TypeScript, Tailwind v4 (CSS-first). Path alias `@/*` → project root.

## Global Constraints

- **No new dependencies.** Use only what is already in `package.json` (GSAP, three, R3F, next-themes). framer-motion stays unused.
- **No test runner exists** (scripts: `dev`/`build`/`start`/`lint`). Per YAGNI, do **not** add a test toolchain. Verification for every task = `npm run lint` + `npm run build` (typecheck) passing, plus the task's specific Chrome DevTools MCP visual check. Pure functions are written to be obviously correct and are structured so they *could* be unit-tested later.
- **Theme-aware:** read CSS vars (`--accent #00ffe0`, `--accent2 #ff003c`, `--accent3 #7b00ff`, `--glow`, `--grid`, `--border`) or `useTheme()`; mirror the `mounted`-guard pattern in `components/Scene.tsx`. Light-mode variants already exist under `[data-theme="light"]`.
- **Touch-safe:** every pointer-driven effect must no-op on `(pointer: coarse)`. The existing CSS already hides `.cursor` and restores the native cursor on coarse pointers (`app/globals.css:135-138`).
- **Reduced-motion:** every new effect checks `prefersReducedMotion()` and disables/simplifies; autonomous CSS animations get paused via a media query.
- **Perf:** no new per-event React renders (pull-model), one shared rAF-driven read per consumer, no second background render loop. Must not drop frames on the pinned `scrub` ScrollTriggers.
- **Commit** after each task with the exact message given. Work stays on branch `feat/interactive-cyberpunk-effects`.

---

## File Structure

**New files:**
- `lib/pointer.ts` — singleton pointer state + click pub/sub (Task 1)
- `lib/motion.ts` — `prefersReducedMotion()` helper (Task 1)
- `lib/useScramble.ts` — pure `scrambleFrame()` + `useScramble` hook (Task 6)
- `components/Scramble.tsx` — a11y-safe scramble-on-hover wrapper (Task 6)
- `components/ClickFX.tsx` — click glitch-shockwave layer (Task 3)

**Modified files:**
- `components/Cursor.tsx` — reworked into reticle + readout, event-delegation lock-on (Task 2)
- `components/Scene.tsx` — pointer-reactive tilt + reactive grid (Task 4)
- `app/globals.css` — cursor/reticle/click-fx/section-lock styles + reduced-motion query (Tasks 2,3,7,8)
- `app/page.tsx` — init pointer, mount ClickFX, animation-pass edits, section-lock (Tasks 1,3,5,7,8)
- `components/Skills.tsx` — SegBar segment classes for charge-up (Task 7)
- section components (`Nav.tsx`, `Contact.tsx`, section-labels) — apply `<Scramble>` (Task 6)

---

## Task 1: Pointer module + motion helper + wiring

**Files:**
- Create: `lib/pointer.ts`
- Create: `lib/motion.ts`
- Modify: `app/page.tsx` (init in the existing `useEffect`)

**Interfaces:**
- Produces: `getPointer(): Readonly<PointerState>`, `onClick(fn: (x:number,y:number)=>void): () => void`, `initPointer(): () => void`, `isCoarsePointer(): boolean` from `lib/pointer.ts`; `prefersReducedMotion(): boolean` from `lib/motion.ts`.
- `PointerState = { x, y, nx, ny, vx, vy, down, lastMove }` (all numbers except `down: boolean`). `nx/ny` are −1..1 from viewport center. `lastMove` is a `performance.now()` timestamp.

- [ ] **Step 1: Create `lib/motion.ts`**

```ts
export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}
```

- [ ] **Step 2: Create `lib/pointer.ts`**

```ts
export type PointerState = {
  x: number;
  y: number;
  nx: number;
  ny: number;
  vx: number;
  vy: number;
  down: boolean;
  lastMove: number;
};

type ClickHandler = (x: number, y: number) => void;

const state: PointerState = {
  x: 0,
  y: 0,
  nx: 0,
  ny: 0,
  vx: 0,
  vy: 0,
  down: false,
  lastMove: 0,
};

let prevX = 0;
let prevY = 0;
let started = false;
const clickSubs = new Set<ClickHandler>();

export function isCoarsePointer(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(pointer: coarse)").matches
  );
}

function handleMove(e: PointerEvent) {
  const w = window.innerWidth || 1;
  const h = window.innerHeight || 1;
  state.vx = e.clientX - prevX;
  state.vy = e.clientY - prevY;
  prevX = e.clientX;
  prevY = e.clientY;
  state.x = e.clientX;
  state.y = e.clientY;
  state.nx = (e.clientX / w) * 2 - 1;
  state.ny = (e.clientY / h) * 2 - 1;
  state.lastMove = performance.now();
}

function handleDown(e: PointerEvent) {
  state.down = true;
  clickSubs.forEach((fn) => fn(e.clientX, e.clientY));
}

function handleUp() {
  state.down = false;
}

/** Attach the single global set of pointer listeners. Idempotent. No-op on touch/SSR. Returns a cleanup fn. */
export function initPointer(): () => void {
  if (started || typeof window === "undefined" || isCoarsePointer()) {
    return () => {};
  }
  started = true;
  window.addEventListener("pointermove", handleMove, { passive: true });
  window.addEventListener("pointerdown", handleDown, { passive: true });
  window.addEventListener("pointerup", handleUp, { passive: true });
  return () => {
    window.removeEventListener("pointermove", handleMove);
    window.removeEventListener("pointerdown", handleDown);
    window.removeEventListener("pointerup", handleUp);
    started = false;
  };
}

export function getPointer(): Readonly<PointerState> {
  return state;
}

/** Subscribe to click (pointerdown) events. Returns an unsubscribe fn. */
export function onClick(fn: ClickHandler): () => void {
  clickSubs.add(fn);
  return () => {
    clickSubs.delete(fn);
  };
}
```

- [ ] **Step 3: Init the pointer in `app/page.tsx`**

Add the import near the other imports (after line 14, `import Cursor ...`):

```tsx
import { initPointer } from "@/lib/pointer";
```

Inside the existing `useEffect` (starts line 258), add `initPointer()` as the **first** line of the effect body, and its cleanup in the returned cleanup function. Concretely, change the top of the effect from:

```tsx
  useEffect(() => {
    const lenis = new Lenis();
```

to:

```tsx
  useEffect(() => {
    const disposePointer = initPointer();
    const lenis = new Lenis();
```

and change the cleanup return (currently lines 363-368) from:

```tsx
    return () => {
      window.removeEventListener("load", refresh);
      lenis.destroy();
      gsap.ticker.remove(tickerFn);
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
```

to:

```tsx
    return () => {
      disposePointer();
      window.removeEventListener("load", refresh);
      lenis.destroy();
      gsap.ticker.remove(tickerFn);
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
```

- [ ] **Step 4: Verify build + lint**

Run: `npm run lint && npm run build`
Expected: both succeed, no type errors. (`getPointer`/`onClick` are unused so far — that is fine; they are exported module members, not local variables, so no unused-var error.)

- [ ] **Step 5: Commit**

```bash
git add lib/pointer.ts lib/motion.ts app/page.tsx
git commit -m "feat: add shared pointer module and reduced-motion helper"
```

---

## Task 2: Targeting-reticle cursor

**Files:**
- Modify: `components/Cursor.tsx` (full rewrite)
- Modify: `app/globals.css` (replace `.cursor-ring` rules, lines 54-56)

**Interfaces:**
- Consumes: `getPointer()`, `isCoarsePointer()` from `lib/pointer.ts`; `prefersReducedMotion()` from `lib/motion.ts`.
- Produces: nothing consumed by other tasks (self-contained visual component).

- [ ] **Step 1: Rewrite `components/Cursor.tsx`**

```tsx
"use client";
import { useEffect, useRef } from "react";
import { getPointer, isCoarsePointer } from "@/lib/pointer";
import { prefersReducedMotion } from "@/lib/motion";

const HOVER_SELECTOR = "a, button, [data-hover]";

export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const reticleRef = useRef<HTMLDivElement>(null);
  const readoutRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isCoarsePointer()) return;
    const reduce = prefersReducedMotion();
    const ease = reduce ? 1 : 0.2;

    let rx = 0;
    let ry = 0;
    let raf = 0;
    let lockEl: HTMLElement | null = null;

    // Event delegation: works for elements mounted at any time.
    const onOver = (e: Event) => {
      const t = (e.target as HTMLElement | null)?.closest?.(HOVER_SELECTOR);
      if (t) lockEl = t as HTMLElement;
    };
    const onOut = (e: Event) => {
      const t = (e.target as HTMLElement | null)?.closest?.(HOVER_SELECTOR);
      if (t && t === lockEl) lockEl = null;
    };

    const frame = () => {
      const p = getPointer();

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${p.x}px, ${p.y}px) translate(-50%,-50%)`;
      }
      if (readoutRef.current) {
        readoutRef.current.style.transform = `translate(${p.x + 16}px, ${p.y + 18}px)`;
        readoutRef.current.textContent = `[x:${Math.round(p.x)} y:${Math.round(p.y)}]`;
      }

      const r = reticleRef.current;
      if (r) {
        if (lockEl && lockEl.isConnected) {
          const b = lockEl.getBoundingClientRect();
          r.dataset.lock = "1";
          r.style.width = `${b.width + 10}px`;
          r.style.height = `${b.height + 10}px`;
          const cx = b.left + b.width / 2;
          const cy = b.top + b.height / 2;
          rx += (cx - rx) * (reduce ? 1 : 0.28);
          ry += (cy - ry) * (reduce ? 1 : 0.28);
        } else {
          lockEl = null;
          r.dataset.lock = "0";
          r.style.width = "34px";
          r.style.height = "34px";
          rx += (p.x - rx) * ease;
          ry += (p.y - ry) * ease;
        }
        r.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
      }

      raf = requestAnimationFrame(frame);
    };

    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
    };
  }, []);

  return (
    <div className="cursor">
      <div ref={dotRef} className="cursor-dot" style={{ position: "fixed", left: 0, top: 0 }} />
      <div ref={reticleRef} className="cursor-reticle" data-lock="0" style={{ position: "fixed", left: 0, top: 0 }}>
        <span className="reticle-corner tl" />
        <span className="reticle-corner tr" />
        <span className="reticle-corner bl" />
        <span className="reticle-corner br" />
      </div>
      <div ref={readoutRef} className="cursor-readout" style={{ position: "fixed", left: 0, top: 0 }} />
    </div>
  );
}
```

- [ ] **Step 2: Replace cursor CSS in `app/globals.css`**

Replace the three lines currently at `app/globals.css:54-56`:

```css
.cursor { position: fixed; pointer-events: none; z-index: 9999; mix-blend-mode: difference; }
.cursor-dot { width: 6px; height: 6px; background: var(--accent); border-radius: 50%; transform: translate(-50%, -50%); transition: transform 0.1s; }
.cursor-ring { width: 32px; height: 32px; border: 1px solid var(--accent); border-radius: 50%; transform: translate(-50%, -50%); transition: all 0.12s ease; opacity: 0.6; }
```

with:

```css
.cursor { position: fixed; inset: 0; pointer-events: none; z-index: 9999; }
.cursor-dot { width: 6px; height: 6px; background: var(--accent); border-radius: 50%; mix-blend-mode: difference; will-change: transform; }
.cursor-reticle { width: 34px; height: 34px; will-change: transform, width, height; transition: width 0.18s ease, height 0.18s ease; }
.cursor-reticle .reticle-corner { position: absolute; width: 7px; height: 7px; border: 1.5px solid var(--accent); box-shadow: var(--glow); transition: border-color 0.18s ease; }
.reticle-corner.tl { left: 0; top: 0; border-right: none; border-bottom: none; }
.reticle-corner.tr { right: 0; top: 0; border-left: none; border-bottom: none; }
.reticle-corner.bl { left: 0; bottom: 0; border-right: none; border-top: none; }
.reticle-corner.br { right: 0; bottom: 0; border-left: none; border-top: none; }
.cursor-reticle[data-lock="1"] .reticle-corner { border-color: var(--accent2); box-shadow: var(--glow-red); }
.cursor-readout { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.08em; color: var(--accent); opacity: 0.7; white-space: nowrap; will-change: transform; }
```

- [ ] **Step 3: Verify build + lint**

Run: `npm run lint && npm run build`
Expected: both succeed.

- [ ] **Step 4: Visual check (Chrome DevTools MCP)**

Start dev server (`npm run dev`), navigate to `http://localhost:3000`, then via Chrome DevTools MCP:
- Move the pointer → expect a 6px dot at the exact pointer, a lagging corner-bracket reticle, and a trailing `[x:… y:…]` mono readout in accent color.
- Hover a nav link / project card / contact card → expect the reticle to snap to the element's bounds and the corners to turn red (`--accent2`).
- Emulate coarse pointer → expect no custom cursor (native cursor restored).

Expected observation: reticle locks onto interactive elements including any not present at initial mount (delegation), readout tracks the pointer.

- [ ] **Step 5: Commit**

```bash
git add components/Cursor.tsx app/globals.css
git commit -m "feat: rework cursor into targeting reticle with coordinate readout and lock-on"
```

---

## Task 3: Glitch shockwave on click

**Files:**
- Create: `components/ClickFX.tsx`
- Modify: `app/globals.css` (append click-fx styles)
- Modify: `app/page.tsx` (import + mount `<ClickFX />`)

**Interfaces:**
- Consumes: `onClick()`, `isCoarsePointer()` from `lib/pointer.ts`; `prefersReducedMotion()` from `lib/motion.ts`; `gsap` (already a dependency).
- Produces: `<ClickFX />` default export, mounted once in `page.tsx`.

- [ ] **Step 1: Create `components/ClickFX.tsx`**

```tsx
"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { onClick, isCoarsePointer } from "@/lib/pointer";
import { prefersReducedMotion } from "@/lib/motion";

export default function ClickFX() {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isCoarsePointer() || prefersReducedMotion()) return;
    const layer = layerRef.current;
    if (!layer) return;

    const spawnRing = (x: number, y: number, alt: boolean) => {
      const ring = document.createElement("div");
      ring.className = alt ? "click-fx-ring alt" : "click-fx-ring";
      ring.style.left = `${x}px`;
      ring.style.top = `${y}px`;
      layer.appendChild(ring);
      gsap.fromTo(
        ring,
        { scale: 0.2, opacity: alt ? 0.8 : 1 },
        {
          scale: alt ? 1.9 : 1.5,
          opacity: 0,
          duration: alt ? 0.45 : 0.4,
          ease: "power2.out",
          onComplete: () => ring.remove(),
        },
      );
    };

    const spawnTear = (y: number) => {
      const tear = document.createElement("div");
      tear.className = "click-fx-tear";
      tear.style.top = `${y}px`;
      layer.appendChild(tear);
      gsap.fromTo(
        tear,
        { opacity: 0.9, scaleY: 1 },
        { opacity: 0, scaleY: 0.2, duration: 0.25, ease: "power2.in", onComplete: () => tear.remove() },
      );
    };

    const unsub = onClick((x, y) => {
      spawnRing(x, y, false); // cyan
      spawnRing(x, y, true); // red, offset timing → RGB split feel
      spawnTear(y);
    });

    return unsub;
  }, []);

  return <div ref={layerRef} className="click-fx-layer" />;
}
```

- [ ] **Step 2: Append click-fx CSS to `app/globals.css`**

Add at the end of the file:

```css
/* Click shockwave */
.click-fx-layer { position: fixed; inset: 0; pointer-events: none; z-index: 1000; }
.click-fx-ring {
  position: absolute;
  width: 44px;
  height: 44px;
  margin: -22px 0 0 -22px;
  border: 1.5px solid var(--accent);
  border-radius: 50%;
  mix-blend-mode: screen;
  box-shadow: var(--glow);
}
.click-fx-ring.alt { border-color: var(--accent2); box-shadow: var(--glow-red); }
.click-fx-tear {
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--accent);
  mix-blend-mode: screen;
  transform-origin: center;
}
```

- [ ] **Step 3: Mount `<ClickFX />` in `app/page.tsx`**

Add the import after `import Cursor from "@/components/Cursor";` (line 14):

```tsx
import ClickFX from "@/components/ClickFX";
```

In the returned JSX (currently lines 371-385), add `<ClickFX />` right after `<Cursor />`:

```tsx
    <>
      <Cursor />
      <ClickFX />
      <Scene />
      <Nav />
```

- [ ] **Step 4: Verify build + lint**

Run: `npm run lint && npm run build`
Expected: both succeed.

- [ ] **Step 5: Visual check (Chrome DevTools MCP)**

On `localhost:3000`, click empty space and interactive elements. Expect a cyan ring + a slightly larger/slower red ring expanding and fading from the click point (~400ms), plus a brief horizontal scanline tear at the click's Y. Rings self-remove (inspect DOM: `.click-fx-layer` empty again after ~0.5s). Emulate reduced-motion → no shockwave.

- [ ] **Step 6: Commit**

```bash
git add components/ClickFX.tsx app/globals.css app/page.tsx
git commit -m "feat: add glitch shockwave click effect"
```

---

## Task 4: Mouse-reactive background

**Files:**
- Modify: `components/Scene.tsx` (add pointer-reactive tilt to `Particles`, reactive scroll/opacity to `GridPlane`)

**Interfaces:**
- Consumes: `getPointer()`, `isCoarsePointer()` from `lib/pointer.ts`; `prefersReducedMotion()` from `lib/motion.ts`.
- Produces: nothing consumed elsewhere.

> **Design note:** The scene reacts at the group level — a parallax tilt toward the pointer plus a reactive grid — rather than projecting the cursor into 3D and repelling 2000 individual points. This delivers the "alive" feel the spec calls for while guaranteeing stable per-frame cost and no frame drops on the pinned sections. Per-particle 3D repel is intentionally out of scope (YAGNI / perf).

- [ ] **Step 1: Add imports to `components/Scene.tsx`**

After the existing imports (line 5, `import * as THREE ...`), add:

```tsx
import { getPointer, isCoarsePointer } from "@/lib/pointer";
import { prefersReducedMotion } from "@/lib/motion";
```

- [ ] **Step 2: Make `Particles` pointer-reactive**

Replace the `Particles` component's `useFrame` block (currently lines 25-30):

```tsx
  useFrame((_, delta) => {
    elapsed.current += delta;
    if (!mesh.current) return;
    mesh.current.rotation.y = elapsed.current * 0.02;
    mesh.current.rotation.x = Math.sin(elapsed.current * 0.01) * 0.1;
  });
```

with:

```tsx
  const tilt = useRef({ x: 0, y: 0 });
  const reactive = useRef(true);
  useEffect(() => {
    reactive.current = !prefersReducedMotion() && !isCoarsePointer();
  }, []);

  useFrame((_, delta) => {
    elapsed.current += delta;
    if (!mesh.current) return;
    const p = getPointer();
    const active = reactive.current && performance.now() - p.lastMove < 1500;
    const targetY = active ? p.nx * 0.35 : 0;
    const targetX = active ? p.ny * 0.25 : 0;
    tilt.current.y += (targetY - tilt.current.y) * 0.04;
    tilt.current.x += (targetX - tilt.current.x) * 0.04;
    mesh.current.rotation.y = elapsed.current * 0.02 + tilt.current.y;
    mesh.current.rotation.x = Math.sin(elapsed.current * 0.01) * 0.1 + tilt.current.x;
  });
```

Also add `useEffect` to the React import at the top of `Particles`' file scope — it is already imported on line 2 (`import { useRef, useMemo, useEffect, useState } from "react";`), so no import change is needed.

- [ ] **Step 3: Make `GridPlane` pointer-reactive**

Replace the entire `GridPlane` component (currently lines 43-56):

```tsx
function GridPlane({ color }: { color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  const elapsed = useRef(0);
  useFrame((_, delta) => {
    elapsed.current += delta;
    if (ref.current) ref.current.position.z = (elapsed.current * 0.5) % 2;
  });
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, -4, 0]}>
      <planeGeometry args={[40, 40, 30, 30]} />
      <meshBasicMaterial color={color} wireframe opacity={0.06} transparent />
    </mesh>
  );
}
```

with:

```tsx
function GridPlane({ color }: { color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);
  const elapsed = useRef(0);
  const opacity = useRef(0.06);
  const reactive = useRef(true);
  useEffect(() => {
    reactive.current = !prefersReducedMotion() && !isCoarsePointer();
  }, []);

  useFrame((_, delta) => {
    elapsed.current += delta;
    const p = getPointer();
    const active = reactive.current && performance.now() - p.lastMove < 1500;
    const speed = active ? 0.5 + Math.min(Math.abs(p.vx), 40) * 0.01 : 0.5;
    if (ref.current) ref.current.position.z = (elapsed.current * speed) % 2;
    const targetOpacity = active ? 0.11 : 0.06;
    opacity.current += (targetOpacity - opacity.current) * 0.05;
    if (matRef.current) matRef.current.opacity = opacity.current;
  });

  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, -4, 0]}>
      <planeGeometry args={[40, 40, 30, 30]} />
      <meshBasicMaterial ref={matRef} color={color} wireframe opacity={0.06} transparent />
    </mesh>
  );
}
```

- [ ] **Step 4: Verify build + lint**

Run: `npm run lint && npm run build`
Expected: both succeed. (`GridPlane`'s `elapsed.current * speed` uses a varying speed, so scroll offset drifts continuously — acceptable; it is a wraparound modulo.)

- [ ] **Step 5: Visual check (Chrome DevTools MCP)**

On `localhost:3000`: move the pointer left/right/up/down over the hero → the particle field should tilt a few degrees toward the pointer and ease back; the floor grid should brighten slightly and scroll a touch faster while moving. Stop moving for ~1.5s → field returns to the baseline gentle auto-rotation. Toggle theme → colors still swap correctly. Emulate reduced-motion → no reactive tilt (baseline auto-motion only).

- [ ] **Step 6: Commit**

```bash
git add components/Scene.tsx
git commit -m "feat: make 3D background react to the pointer"
```

---

## Task 5: Animation pass — reduced-motion for autonomous CSS animations

**Files:**
- Modify: `app/globals.css` (append reduced-motion media query)

**Interfaces:** none.

> The scrub-linked glitch reveals are user-scroll-driven (acceptable under reduced-motion guidance). This task disables the **autonomous, infinitely-looping** CSS animations, which are the ones reduced-motion users need quieted. The new JS effects already self-guard via `prefersReducedMotion()`.

- [ ] **Step 1: Append reduced-motion query to `app/globals.css`**

Add at the end of the file:

```css
/* Reduced motion: silence autonomous looping animations */
@media (prefers-reduced-motion: reduce) {
  .flicker,
  .blink,
  .glitch-text::before,
  .glitch-text::after {
    animation: none !important;
  }
  .glitch-text::before,
  .glitch-text::after {
    opacity: 0 !important;
  }
}
```

- [ ] **Step 2: Verify build + lint**

Run: `npm run lint && npm run build`
Expected: both succeed.

- [ ] **Step 3: Visual check (Chrome DevTools MCP)**

Emulate `prefers-reduced-motion: reduce`, load the hero → the "JAY" title's RGB-split glitch layers and neon flicker are static; the blinking `_` cursor stops blinking. Disable emulation → animations return.

- [ ] **Step 4: Commit**

```bash
git add app/globals.css
git commit -m "feat: pause autonomous animations under reduced motion"
```

---

## Task 6: Text scramble on hover

**Files:**
- Create: `lib/useScramble.ts`
- Create: `components/Scramble.tsx`
- Modify: section-label spans across section components + link labels (see Step 4 target list)

**Interfaces:**
- Produces: `scrambleFrame(target: string, progress: number, rng: () => number): string` and `useScramble(text: string, opts?: { duration?: number }): { ref: RefObject<HTMLElement | null>, run: () => void }` from `lib/useScramble.ts`; `<Scramble text as className style>` default export from `components/Scramble.tsx`.
- Consumes: `prefersReducedMotion()` from `lib/motion.ts`.

- [ ] **Step 1: Create `lib/useScramble.ts`**

```ts
import { useCallback, useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!<>-_\\/[]{}=+*^?#";

/** Pure: given target text and progress 0..1, return a frame where the first
 *  progress*len chars are settled and the rest are random glyphs. Spaces and
 *  the settled prefix are always preserved; output length always equals target. */
export function scrambleFrame(target: string, progress: number, rng: () => number): string {
  const revealed = Math.floor(Math.max(0, Math.min(1, progress)) * target.length);
  let out = "";
  for (let i = 0; i < target.length; i++) {
    const c = target[i];
    if (i < revealed || c === " ") out += c;
    else out += CHARS[Math.floor(rng() * CHARS.length)];
  }
  return out;
}

export function useScramble(text: string, opts: { duration?: number } = {}) {
  const duration = opts.duration ?? 500;
  const ref = useRef<HTMLElement | null>(null);
  const rafRef = useRef(0);

  const run = useCallback(() => {
    if (prefersReducedMotion()) {
      if (ref.current) ref.current.textContent = text;
      return;
    }
    cancelAnimationFrame(rafRef.current);
    const start = performance.now();
    const tick = () => {
      const p = Math.min(1, (performance.now() - start) / duration);
      if (ref.current) ref.current.textContent = scrambleFrame(text, p, Math.random);
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [text, duration]);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  return { ref, run };
}
```

- [ ] **Step 2: Create `components/Scramble.tsx`**

```tsx
"use client";
import type { CSSProperties, ElementType } from "react";
import { useScramble } from "@/lib/useScramble";

type ScrambleProps = {
  text: string;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
};

/** Renders `text` and scrambles the *visual* copy on hover/focus. The accessible
 *  name stays `text` via aria-label; the animated span is aria-hidden, so screen
 *  readers and the DOM's accessible name are unaffected. */
export default function Scramble({ text, as: Tag = "span", className, style }: ScrambleProps) {
  const { ref, run } = useScramble(text);
  return (
    <Tag className={className} style={style} onMouseEnter={run} onFocus={run} aria-label={text}>
      <span aria-hidden="true" ref={ref}>
        {text}
      </span>
    </Tag>
  );
}
```

- [ ] **Step 3: Verify build + lint (component compiles before wiring)**

Run: `npm run lint && npm run build`
Expected: both succeed. (`scrambleFrame` is exported for reuse/testability; unused-in-app is fine.)

- [ ] **Step 4: Apply `<Scramble>` to labels and links**

Import `Scramble` and wrap the target strings. The transformation pattern in every case:

Before:
```tsx
<span className="section-label">003 // SKILLS</span>
```
After:
```tsx
<Scramble as="span" className="section-label" text="003 // SKILLS" />
```

Apply to these exact targets (add `import Scramble from "@/components/Scramble";` to each file):

| File | Target string(s) |
|---|---|
| `components/Skills.tsx` | `003 // SKILLS` (the `.section-label` at line 162) |
| `components/Projects.tsx` | `004 // PROJECTS` (the `.section-label` at line 137) |
| `components/Hero.tsx` | its `.section-label` (`001 // INIT`) |
| `components/About.tsx` | its `.section-label` (`002 // ABOUT`) |
| `components/Experience.tsx` | its `.section-label` (`005 // EXPERIENCE`) |
| `components/Contact.tsx` | its `.section-label` (`006 // CONTACT`) + each contact card's link label (email / LinkedIn / GitHub visible text) |
| `components/Nav.tsx` | each nav link's visible text label |

For Hero/About/Experience/Contact/Nav, first read the file to locate the exact `.section-label` span and link text, then apply the identical wrap. For link labels that are inside an `<a>`, wrap only the visible text node (e.g. `<a ...><Scramble text="GITHUB" /></a>`), leaving `href` and other markup intact. Do **not** wrap the large two-line Orbitron `<h2>` titles (they contain `<br/>` and nested spans) — labels and links are the scramble surface.

- [ ] **Step 5: Verify build + lint**

Run: `npm run lint && npm run build`
Expected: both succeed.

- [ ] **Step 6: Visual check (Chrome DevTools MCP)**

Hover each section label and each nav/contact link → text decodes from random glyphs to the real string over ~0.5s. Inspect the element's accessible name (it stays the real text via `aria-label`). Emulate reduced-motion → text shows final immediately, no scramble.

- [ ] **Step 7: Commit**

```bash
git add lib/useScramble.ts components/Scramble.tsx components/Skills.tsx components/Projects.tsx components/Hero.tsx components/About.tsx components/Experience.tsx components/Contact.tsx components/Nav.tsx
git commit -m "feat: add terminal text-scramble on labels and links"
```

---

## Task 7: Animation pass — Skills segment charge-up

**Files:**
- Modify: `components/Skills.tsx` (`SegBar` — add classes to segments)
- Modify: `app/page.tsx` (`buildSkillsTL` — charge-up tween; and the Skills `gsap.set`)

**Interfaces:**
- Consumes: `columns: HTMLDivElement[]` already provided by `SkillsHandle`.
- Produces: nothing new consumed elsewhere; relies on `.seg.on` class being present in the DOM under the columns.

- [ ] **Step 1: Add segment classes in `components/Skills.tsx`**

In `SegBar` (lines 72-89), replace the mapped segment `<div>` so filled segments carry `seg on` and empty ones carry `seg`:

```tsx
function SegBar({ level }: { level: number }) {
  const clamped = Math.max(0, Math.min(10, level));
  return (
    <div style={{ display: "flex", gap: "2px", flexShrink: 0 }}>
      {Array.from({ length: 10 }, (_, i) => {
        const on = i < clamped;
        return (
          <div
            key={i}
            className={on ? "seg on" : "seg"}
            style={{
              width: "8px",
              height: "5px",
              background: on ? "var(--accent)" : "transparent",
              border: `1px solid ${on ? "var(--accent)" : "var(--border)"}`,
            }}
          />
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Add the charge-up to `buildSkillsTL` in `app/page.tsx`**

`buildSkillsTL` (lines 138-181) currently glitches the title + columns in, holds, glitches out. Add a segment charge-up right after the columns finish entering. Change the signature is not needed — segments are queried from `columns`. Insert, immediately before the `tl.to({}, { duration: holdDur }, colsEnd);` line (line 161):

```tsx
  // Charge-up: filled segments light from dim → full, left-to-right, after columns arrive.
  const segs = columns.flatMap(col => Array.from(col.querySelectorAll<HTMLElement>(".seg.on")));
  if (segs.length) {
    tl.fromTo(
      segs,
      { opacity: 0.2 },
      { opacity: 1, duration: 0.25, ease: "power1.out", stagger: 0.01 },
      colsEnd - DUR,
    );
  }
```

- [ ] **Step 3: Set initial segment state in the `useEffect` of `app/page.tsx`**

After the existing `gsap.set([...skills.columns], { opacity: 0, x: 0, skewX: 0 });` line (line 289), add:

```tsx
    gsap.set(
      skills.columns.flatMap(col => Array.from(col.querySelectorAll<HTMLElement>(".seg.on"))),
      { opacity: 0.2 },
    );
```

- [ ] **Step 4: Verify build + lint**

Run: `npm run lint && npm run build`
Expected: both succeed.

- [ ] **Step 5: Visual check (Chrome DevTools MCP)**

Scroll into the Skills section → after the columns glitch in, the filled level-bar segments should "charge" from dim to full brightness in a left-to-right ripple, then hold, then glitch out with the columns. Confirm empty segments are unaffected.

- [ ] **Step 6: Commit**

```bash
git add components/Skills.tsx app/page.tsx
git commit -m "feat: add segment charge-up to skills reveal"
```

---

## Task 8: Animation pass — Projects data-load stutter + section-lock readout

**Files:**
- Modify: `app/page.tsx` (`buildProjectsTL` gets card stutter; add `playSectionLock` helper + `onEnter` hooks)
- Modify: `app/globals.css` (append `.section-lock` style)

**Interfaces:**
- Consumes: `projects.cards: HTMLDivElement[]` (already on `ProjectsHandle`), `prefersReducedMotion()`, `gsap`.
- Produces: `playSectionLock(section: HTMLElement)` local helper in `page.tsx`.

- [ ] **Step 1: Add the card stutter to `buildProjectsTL`**

Change the `buildProjectsTL` signature and body in `app/page.tsx` (lines 102-133). Replace the signature line:

```tsx
function buildProjectsTL(titleBlock: HTMLElement, track: HTMLElement) {
```

with:

```tsx
function buildProjectsTL(titleBlock: HTMLElement, track: HTMLElement, cards: HTMLElement[]) {
```

Then, immediately after the title glitch-IN tween (after the `tl.fromTo(titleBlock, ... 0);` block that ends at line 111), insert a per-card data-load stutter:

```tsx
  // Data-load stutter: each card blips opacity/skew as the track begins to move.
  cards.forEach((card, i) => {
    tl.fromTo(
      card,
      { opacity: 0.35, skewX: 4 },
      { opacity: 1, skewX: 0, duration: 0.12, ease: "power1.out" },
      0.15 + i * 0.03,
    );
  });
```

- [ ] **Step 2: Pass `projects.cards` at the call site**

In the `useEffect`, update the Projects `ScrollTrigger.create` `animation` (line 332) from:

```tsx
      animation:     buildProjectsTL(projects.titleBlock, projects.cardsTrack),
```

to:

```tsx
      animation:     buildProjectsTL(projects.titleBlock, projects.cardsTrack, projects.cards),
```

The cards start fully visible today (no opacity set on them), so the stutter starting at `opacity: 0.35` and returning to `1` is a brief blip, not a disappearance — no `gsap.set` change needed.

- [ ] **Step 3: Add the `playSectionLock` helper**

Add this function in `app/page.tsx` just above `export default function Home()` (before line 250), and add the import for `prefersReducedMotion` near the top (after line 14):

```tsx
import { prefersReducedMotion } from "@/lib/motion";
```

```tsx
/** Brief `LOADING ███ 100%` tick appended next to a section's label when it pins. */
function playSectionLock(section: HTMLElement) {
  if (prefersReducedMotion()) return;
  const label = section.querySelector(".section-label");
  if (!label || !label.parentElement) return;
  if (label.parentElement.querySelector(".section-lock")) return; // already playing

  const el = document.createElement("span");
  el.className = "section-lock";
  label.insertAdjacentElement("afterend", el);

  const total = 12;
  const state = { n: 0 };
  gsap.to(state, {
    n: total,
    duration: 0.7,
    ease: "power1.out",
    onUpdate: () => {
      const filled = Math.round(state.n);
      const pct = Math.round((filled / total) * 100);
      el.textContent = `LOADING ${"█".repeat(filled)}${"░".repeat(total - filled)} ${pct}%`;
    },
    onComplete: () => {
      gsap.to(el, { opacity: 0, duration: 0.4, delay: 0.35, onComplete: () => el.remove() });
    },
  });
}
```

> Note: if Task 6 wrapped the section-label in `<Scramble>`, the `.section-label` class lives on the wrapper element and `.section-label` still selects it — `insertAdjacentElement("afterend", …)` places the lock as its sibling. This works whether or not Task 6 has been applied.

- [ ] **Step 4: Add `onEnter` to each section ScrollTrigger**

For each of the six `ScrollTrigger.create({...})` calls in the `useEffect` (Hero, About, Skills, Projects, Experience, Contact), add an `onEnter` callback that fires the readout for that trigger's section. Add this property to each config object (using the matching section element already in scope — `hero.section`, `about.section`, `skills.section`, `projects.section`, `experience.section`, `contact.section`). Example for Hero (add the `onEnter` line inside the existing object):

```tsx
    ScrollTrigger.create({
      trigger:       hero.section,
      start:         "top top",
      end:           "+=120%",
      pin:           true,
      anticipatePin: 1,
      scrub:         SCRUB,
      animation:     buildHeroTL(heroEls),
      onEnter:       () => playSectionLock(hero.section),
    });
```

Repeat the identical `onEnter: () => playSectionLock(<X>.section),` addition for `about`, `skills`, `projects`, `experience`, and `contact`.

- [ ] **Step 5: Append `.section-lock` CSS to `app/globals.css`**

Add at the end of the file:

```css
/* Section-lock readout */
.section-lock {
  margin-left: 1rem;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.12em;
  color: var(--accent);
  opacity: 0.8;
  white-space: nowrap;
}
```

- [ ] **Step 6: Verify build + lint**

Run: `npm run lint && npm run build`
Expected: both succeed.

- [ ] **Step 7: Visual check (Chrome DevTools MCP)**

- Scroll into Projects → cards should blip (opacity/skew stutter) left-to-right as the track starts moving, like data loading in.
- Entering each pinned section → a brief `LOADING ███░ 100%` tick appears next to that section's label, fills, then fades and removes itself (inspect DOM: only one `.section-lock` per label at a time, gone after ~1.5s).
- Reduced-motion → no section-lock readout.

- [ ] **Step 8: Commit**

```bash
git add app/page.tsx app/globals.css
git commit -m "feat: add projects data-load stutter and section-lock readout"
```

---

## Task 9: Full-page integration verification

**Files:** none (verification only).

- [ ] **Step 1: Production build**

Run: `npm run build`
Expected: clean build, no type errors, no ESLint failures.

- [ ] **Step 2: Full manual pass (Chrome DevTools MCP), dark theme**

On `localhost:3000`, scroll top→bottom and confirm together, without jank:
- Reactive background tilts with the pointer; grid responds; idle reverts.
- Reticle cursor tracks + coordinate readout + red lock-on over interactive elements (including project/contact cards).
- Click anywhere → glitch shockwave.
- Section labels + links scramble on hover.
- Skills segments charge up; Projects cards stutter-load; section-lock readout on each pin.

- [ ] **Step 3: Theme + accessibility + touch matrix**

- Toggle to **light** theme → all effects use light-palette CSS vars; nothing invisible or mis-colored.
- Emulate **prefers-reduced-motion** → no click shockwave, no reactive tilt, no scramble, no section-lock, autonomous flicker/glitch/blink stilled; scroll reveals still function.
- Emulate **coarse pointer** → no custom cursor, no click shockwave, no reactive tilt; native cursor restored; page fully usable.

- [ ] **Step 4: Performance spot-check**

Run a Chrome DevTools MCP performance trace while scrolling through the pinned sections with the reactive background active. Expected: no sustained long-frame cluster attributable to the new pointer/scene work.

- [ ] **Step 5: Final confirmation**

Report results to the user. Do not merge — leave the branch for review per project convention.

---

## Self-Review

- **Spec coverage:** Piece 1 (reactive bg) → Task 4. Piece 2 (click shockwave) → Task 3. Piece 3 (reticle cursor + delegation bug fix) → Task 2. Piece 4 (scramble) → Task 6. Piece 5 (animation pass: variety = Tasks 7+8, section-lock = Task 8, reduced-motion = Task 5 + each effect's self-guard). Shared pointer foundation → Task 1. All success criteria map to Task 9's checks. ✅
- **Placeholder scan:** every code step contains complete code; no TBD/TODO. Task 6 Step 4 and the Nav/Contact/Hero/About/Experience label wraps require reading those files first (their exact `.section-label`/link markup wasn't captured in the plan) — this is an explicit read-then-apply instruction with the exact transformation shown, not a vague placeholder. ✅
- **Type consistency:** `getPointer`/`onClick`/`initPointer`/`isCoarsePointer` (pointer.ts) and `prefersReducedMotion` (motion.ts) are used with the same signatures in Tasks 2/3/4/6/8. `scrambleFrame(target, progress, rng)` and `useScramble(text, opts)` match between definition (Task 6 Step 1) and use (Step 2). `buildProjectsTL` gains a third `cards` param, updated at its only call site (Task 8 Steps 1-2). `buildSkillsTL` signature unchanged; segments queried from existing `columns`. ✅
```
