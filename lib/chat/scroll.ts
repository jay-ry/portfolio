/**
 * Scrolling to a section that is GSAP-pinned.
 *
 * Every section is pinned with `scrub`, so its entrance animation is driven by
 * scroll position rather than by time: at the very start of a section's pinned
 * range the timeline sits at progress 0, which is where `gsap.set` parked the
 * content at `opacity: 0`. Navigating to `#skills` therefore lands on a
 * correctly-positioned but completely blank screen — the content only appears
 * once you scroll further into the range.
 *
 * So a plain anchor jump is not enough. We find the ScrollTrigger that owns the
 * section and scroll a fraction of the way into its range, landing where the
 * entrance has finished and the content is actually on screen.
 */

import { ScrollTrigger } from "gsap/ScrollTrigger";

type LenisLike = { scrollTo: (target: number, options?: Record<string, unknown>) => void };

let lenis: LenisLike | null = null;

/** Called once from the page so chat navigation can drive the same smooth scroll. */
export function registerLenis(instance: LenisLike | null): void {
  lenis = instance;
}

/**
 * How far into each section's pinned range to land, as a fraction of the range.
 *
 * These track the shape of each section's timeline in app/page.tsx:
 * - The glitch-in sections (about / skills / ai-guide / contact) enter, hold,
 *   then exit — so the middle of the range is the middle of the hold, where
 *   everything is at full opacity.
 * - The horizontal sections (projects / experience) glitch their title in over
 *   the first ~15% and then scroll cards sideways for the rest, so landing
 *   early shows the title plus the first cards rather than the middle of the
 *   track.
 * - Hero is already fully composed at scroll 0 — that is the landing view, and
 *   "go home" should mean the top of the page, not halfway into it.
 */
const REVEAL_FRACTION: Record<string, number> = {
  hero: 0,
  about: 0.45,
  skills: 0.45,
  "ai-guide": 0.45,
  projects: 0.2,
  experience: 0.25,
  contact: 0.45,
};

const DEFAULT_FRACTION = 0.45;

/**
 * Scroll so `anchor`'s content is visible. Returns false when the section
 * isn't in the DOM, letting the caller fall back to normal anchor behaviour.
 */
export function scrollToSection(anchor: string): boolean {
  if (typeof document === "undefined") return false;
  const el = document.getElementById(anchor);
  if (!el) return false;

  const fraction = REVEAL_FRACTION[anchor] ?? DEFAULT_FRACTION;

  // The pinned trigger knows the real scroll range; the element's own
  // rect does not, because pinning takes it out of normal flow.
  const trigger = ScrollTrigger.getAll().find((t) => t.trigger === el);

  let target: number;
  if (trigger) {
    target = trigger.start + (trigger.end - trigger.start) * fraction;
  } else {
    // No trigger (reduced motion, or triggers not yet built) — fall back to
    // the element's own offset, which is correct when nothing is pinned.
    target = window.scrollY + el.getBoundingClientRect().top;
  }

  target = Math.max(0, Math.round(target));

  if (lenis) {
    lenis.scrollTo(target, { duration: 1.1 });
  } else {
    window.scrollTo({ top: target, behavior: "smooth" });
  }
  return true;
}
