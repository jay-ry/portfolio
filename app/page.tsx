"use client";
import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import Nav from "@/components/Nav";
import Hero, { type HeroHandle } from "@/components/Hero";
import Projects, { type ProjectsHandle } from "@/components/Projects";
import Contact, { type ContactHandle } from "@/components/Contact";
import About, { type AboutHandle } from "@/components/About";
import Experience, { type ExperienceHandle } from "@/components/Experience";
import Cursor from "@/components/Cursor";

gsap.registerPlugin(ScrollTrigger);

const Scene = dynamic(() => import("@/components/Scene"), { ssr: false });

const SCRUB   = 1;
const STAGGER = 0.08;
const DUR     = 0.28;

/**
 * Hero starts with only the title (name + subTitle) visible.
 * Timeline: glitch in bootLines/sub/cta → hold → glitch out all elements.
 * els = [bootLines, name, subTitle, sub, cta]
 */
function buildHeroTL(els: HTMLElement[]) {
  const tl = gsap.timeline();

  // Phase 1 — glitch IN: bootLines (0), sub (3), cta (4)
  const enterEls = [els[0], els[3], els[4]];
  enterEls.forEach((el, i) => {
    const dir = i % 2 === 0 ? 1 : -1;
    tl.fromTo(
      el,
      { opacity: 0, x: dir * 14, skewX: -dir * 5 },
      { opacity: 1, x: 0,        skewX: 0,         duration: DUR, ease: "power2.out" },
      i * STAGGER,
    );
  });

  // Phase 2 — hold (everything visible)
  const enterEnd = (enterEls.length - 1) * STAGGER + DUR;
  tl.to({}, { duration: 0.5 }, enterEnd);

  // Phase 3 — glitch OUT: all elements
  const exitStart = enterEnd + 0.5;
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

/**
 * Shared helper: glitch in elements top-to-bottom, hold, glitch out.
 */
function buildGlitchInOutTL(els: HTMLElement[], holdDur = 0.6) {
  const tl        = gsap.timeline();
  const enterEnd  = (els.length - 1) * STAGGER + DUR;
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

function buildContactTL(els: HTMLElement[]) { return buildGlitchInOutTL(els); }

/**
 * Projects: title glitches in, then all 6 cards scroll horizontally left-to-right,
 * then title glitches out. Cards are always visible — no opacity animation on them.
 */
function buildProjectsTL(titleBlock: HTMLElement, track: HTMLElement) {
  const tl = gsap.timeline();

  // Title glitch IN
  tl.fromTo(
    titleBlock,
    { opacity: 0, x: 14,  skewX: -5 },
    { opacity: 1, x: 0,   skewX: 0,  duration: 0.15, ease: "power2.out" },
    0,
  );

  // Cards slide left — functional value computed at tween start
  tl.to(
    track,
    {
      x: () => -(track.scrollWidth - track.parentElement!.clientWidth + (parseFloat(getComputedStyle(track.parentElement!).paddingLeft) * 2)),
      ease: "none",
      duration: 0.7,
    },
    0.15,
  );

  // Title glitch OUT
  tl.fromTo(
    titleBlock,
    { opacity: 1, x: 0,   skewX: 0  },
    { opacity: 0, x: -14, skewX: 5, duration: 0.15, ease: "power2.in" },
    0.85,
  );

  return tl;
}

function buildAboutTL(els: HTMLElement[]) { return buildGlitchInOutTL(els); }

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

export default function Home() {
  const heroRef       = useRef<HeroHandle>(null);
  const aboutRef      = useRef<AboutHandle>(null);
  const projectsRef   = useRef<ProjectsHandle>(null);
  const experienceRef = useRef<ExperienceHandle>(null);
  const contactRef    = useRef<ContactHandle>(null);

  useEffect(() => {
    const lenis = new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    const tickerFn = (time: number) => { lenis.raf(time * 1000); };
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    const hero       = heroRef.current!;
    const about      = aboutRef.current!;
    const projects   = projectsRef.current!;
    const experience = experienceRef.current!;
    const contact    = contactRef.current!;

    const heroEls    = [hero.bootLines, hero.name, hero.subTitle, hero.sub, hero.cta];
    const contactEls = [contact.titleBlock, ...contact.cards];

    // Hero: only name + subTitle visible at load; bootLines, sub, cta glitch in on scroll.
    // Projects: titleBlock hidden, cards track at x:0.
    // Contact: all elements hidden, glitch in on scroll.
    gsap.set([hero.bootLines, hero.sub, hero.cta], { opacity: 0 });
    gsap.set(projects.titleBlock, { opacity: 0 });
    gsap.set(projects.cardsTrack, { x: 0 });
    gsap.set([...contactEls],     { opacity: 0, x: 0, skewX: 0 });
    gsap.set([about.titleBlock, about.bio, about.chips], { opacity: 0, x: 0, skewX: 0 });
    gsap.set(experience.titleBlock, { opacity: 0 });
    gsap.set(experience.cardsTrack, { x: 0 });

    // --- Hero: hold then glitch out ---
    ScrollTrigger.create({
      trigger:       hero.section,
      start:         "top top",
      end:           "+=120%",
      pin:           true,
      anticipatePin: 1,
      scrub:         SCRUB,
      animation:     buildHeroTL(heroEls),
    });

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

    // --- Projects: title glitch + horizontal card scroll ---
    ScrollTrigger.create({
      trigger:       projects.section,
      start:         "top top",
      end:           "+=300%",
      pin:           true,
      anticipatePin: 1,
      scrub:         SCRUB,
      animation:     buildProjectsTL(projects.titleBlock, projects.cardsTrack),
    });

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

    // --- Contact: glitch in, hold, glitch out ---
    ScrollTrigger.create({
      trigger:       contact.section,
      start:         "top top",
      end:           "+=120%",
      pin:           true,
      anticipatePin: 1,
      scrub:         SCRUB,
      animation:     buildContactTL(contactEls),
    });

    ScrollTrigger.refresh();

    return () => {
      lenis.destroy();
      gsap.ticker.remove(tickerFn);
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <>
      <Cursor />
      <Scene />
      <Nav />
      <main className="grid-bg" style={{ position: "relative", zIndex: 10 }}>
        <Hero ref={heroRef} />
        <About ref={aboutRef} />
        <Projects ref={projectsRef} />
        <Experience ref={experienceRef} />
        <Contact ref={contactRef} />
      </main>
    </>
  );
}
