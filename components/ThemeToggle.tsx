"use client";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch — theme is only known on the client.
  useEffect(() => setMounted(true), []);

  return (
    <span style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
      <select
        aria-label="Color theme"
        value={mounted ? theme ?? "system" : "system"}
        onChange={(e) => setTheme(e.target.value)}
        style={{
          appearance: "none",
          WebkitAppearance: "none",
          MozAppearance: "none",
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "var(--accent)",
          background: "transparent",
          border: "1px solid var(--border)",
          borderRadius: 0,
          padding: "3px 24px 3px 8px",
          cursor: "pointer",
          outline: "none",
        }}
      >
        <option value="system" style={{ color: "#000" }}>SYS</option>
        <option value="light" style={{ color: "#000" }}>LIGHT</option>
        <option value="dark" style={{ color: "#000" }}>DARK</option>
      </select>
      {/* Theme-aware caret — mirrors the Skills column chevron */}
      <span
        style={{
          position: "absolute",
          right: "9px",
          width: 0,
          height: 0,
          borderLeft: "4px solid transparent",
          borderRight: "4px solid transparent",
          borderTop: "4px solid var(--accent)",
          opacity: 0.7,
          pointerEvents: "none",
        }}
      />
    </span>
  );
}
