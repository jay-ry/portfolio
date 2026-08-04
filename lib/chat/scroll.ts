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
 * Where inside the Projects timeline a given card is on screen.
 *
 * The section pins and tweens its track sideways: the title glitches in over
 * the first 15% of the timeline, the track scrolls from x:0 to x:-maxX between
 * 15% and 85%, then the title glitches out. Because the tween is linear
 * (`ease: "none"`) and scrub maps scroll position straight onto timeline time,
 * the card's horizontal offset converts directly into a timeline position.
 *
 * Returns null when the card or the track isn't measurable, so the caller can
 * fall back to the section default.
 */
const PROJECTS_TRACK_START = 0.15;
const PROJECTS_TRACK_SPAN = 0.7;
/** Stay clear of the title's exit so the card doesn't arrive as things fade. */
const PROJECTS_MAX_FRACTION = 0.8;

function projectCardFraction(projectId: string): number | null {
  const card = document.querySelector<HTMLElement>(`[data-project-id="${CSS.escape(projectId)}"]`);
  const track = card?.parentElement;
  const viewport = track?.parentElement;
  if (!card || !track || !viewport) return null;

  // Mirrors the distance the timeline actually tweens (see buildProjectsTL).
  const padding = parseFloat(getComputedStyle(viewport).paddingLeft) || 0;
  const maxX = track.scrollWidth - viewport.clientWidth + padding * 2;
  if (!Number.isFinite(maxX) || maxX <= 0) return PROJECTS_TRACK_START;

  // Difference of rects, not offsetLeft: both are under the same transform, so
  // the delta is the card's untransformed offset inside the track regardless of
  // how far the tween has already moved it.
  const cardLeft = card.getBoundingClientRect().left - track.getBoundingClientRect().left;
  const progress = Math.min(1, Math.max(0, cardLeft / maxX));

  return Math.min(PROJECTS_MAX_FRACTION, PROJECTS_TRACK_START + PROJECTS_TRACK_SPAN * progress);
}

/**
 * Scroll so `anchor`'s content is visible. Returns false when the section
 * isn't in the DOM, letting the caller fall back to normal anchor behaviour.
 *
 * `projectId` scrolls to one specific card within the Projects section.
 */
export function scrollToSection(anchor: string, projectId?: string): boolean {
  if (typeof document === "undefined") return false;
  const el = document.getElementById(anchor);
  if (!el) return false;

  let fraction = REVEAL_FRACTION[anchor] ?? DEFAULT_FRACTION;
  if (anchor === "projects" && projectId) {
    const cardFraction = projectCardFraction(projectId);
    if (cardFraction !== null) fraction = cardFraction;
  }

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
