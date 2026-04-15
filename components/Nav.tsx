"use client";
import { useEffect, useState } from "react";

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
        background: scrolled ? "rgba(2,4,8,0.95)" : "transparent",
        borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        transition: "all 0.4s",
        fontFamily: "var(--font-mono)",
      }}
    >
      <span style={{ color: "var(--accent)", fontSize: "13px", letterSpacing: "0.1em" }}>
        <span style={{ color: "var(--text-muted)" }}>// </span>JAY.OS
        <span className="blink" style={{ marginLeft: 4 }}>_</span>
      </span>

      <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>{time}</span>
    </nav>
  );
}
