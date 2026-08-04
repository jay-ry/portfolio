"use client";

import { useEffect, useRef } from "react";
import type { CommandDef } from "@/lib/chat/commands";

interface CommandMenuProps {
  id: string;
  matches: CommandDef[];
  activeIndex: number;
  onHover: (index: number) => void;
  onSelect: (command: CommandDef) => void;
}

/**
 * Slash-command autocomplete list. Purely presentational — ChatInput owns
 * open/closed state, the active index, and keyboard handling; this just
 * renders the listbox and reports hover/select back up.
 */
export function CommandMenu({ id, matches, activeIndex, onHover, onSelect }: CommandMenuProps) {
  const listRef = useRef<HTMLUListElement>(null);

  // The list scrolls past ~5 matches. Without this, arrowing down moves an
  // active option that has already left the viewport — aria-activedescendant
  // never scrolls anything into view on its own the way real focus does.
  useEffect(() => {
    const option = listRef.current?.children[activeIndex];
    option?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, matches]);

  if (matches.length === 0) return null;

  return (
    <ul
      ref={listRef}
      id={id}
      role="listbox"
      aria-label="Slash command suggestions"
      className="neon-border"
      style={{
        position: "absolute",
        bottom: "100%",
        left: 0,
        right: 0,
        marginBottom: "0.5rem",
        maxHeight: "220px",
        overflowY: "auto",
        background: "var(--panel-bg)",
        backdropFilter: "blur(8px)",
        listStyle: "none",
        padding: "0.35rem",
      }}
    >
      {matches.map((cmd, i) => (
        <li
          key={cmd.name}
          id={`${id}-option-${i}`}
          role="option"
          aria-selected={i === activeIndex}
          onMouseEnter={() => onHover(i)}
          onMouseDown={(e) => {
            e.preventDefault();
            onSelect(cmd);
          }}
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "1rem",
            padding: "0.45rem 0.6rem",
            cursor: "pointer",
            background:
              i === activeIndex ? "color-mix(in srgb, var(--accent) 12%, var(--panel-bg))" : "transparent",
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
          }}
        >
          <span style={{ color: "var(--accent)", whiteSpace: "nowrap" }}>
            /{cmd.name}
            {cmd.args ? ` ${cmd.args}` : ""}
          </span>
          <span style={{ color: "var(--text-muted)", fontSize: "11px", textAlign: "right" }}>
            {cmd.description}
          </span>
        </li>
      ))}
    </ul>
  );
}
