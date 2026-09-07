"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

const navLinks = [
  { label: "ABOUT", href: "/about" },
  { label: "PROJECTS", href: "/projects" },
  { label: "CONTACT", href: "/contact" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [time, setTime] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    const tick = () => setTime(new Date().toLocaleTimeString("en-US", { hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => { window.removeEventListener("scroll", onScroll); clearInterval(id); };
  }, []);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 500,
        padding: "0 2rem",
        height: "60px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: scrolled ? "var(--panel-bg)" : "transparent",
        borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        transition: "all 0.4s",
        fontFamily: "var(--font-mono)",
      }}
    >
      <Link href="/" aria-label="Jay Andrade home" style={{ color: "var(--accent)", fontSize: "13px", letterSpacing: "0.1em", textDecoration: "none" }}>
        <span style={{ color: "var(--text-muted)" }}>{"// "}</span>JAY.OS
        <span className="blink" style={{ marginLeft: 4 }}>_</span>
      </Link>

      <span className="site-nav-links" style={{ alignItems: "center", gap: "1.25rem" }}>
        {navLinks.map(link => (
          <Link key={link.href} href={link.href} className="site-nav-link">{link.label}</Link>
        ))}
        <a href="https://games.jayandrade.com" target="_blank" rel="noopener noreferrer" className="site-nav-link site-nav-games">GAMES ↗</a>
      </span>

      <span style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>{time}</span>
        <ThemeToggle />
      </span>
    </nav>
  );
}
