"use client";

import type { CSSProperties } from "react";
import type { ChatAction } from "@/lib/chat/types";
import { isValidAnchor } from "@/lib/chat/types";
import type { Project } from "@/lib/portfolio-data";
import { AnswerActions } from "./AnswerActions";

/**
 * Rich renders for the `/projects` and `/project <name>` slash commands —
 * see CommandView in lib/chat/types.ts. Every colour here comes from a CSS
 * custom property (never a literal hex) so the cards survive the site's
 * light/dark theme swap the same way the rest of the design system does.
 */

function statusColor(status: string): string {
  if (status === "LIVE") return "var(--status-color)";
  if (status === "WIP") return "var(--accent3)";
  // BUILT and anything unrecognised.
  return "var(--accent)";
}

function isHttpsUrl(url: string): boolean {
  return url.startsWith("https://");
}

/**
 * Actions for a card in the LIST only.
 *
 * The detail card adds none: its message already carries them (see
 * `projectActions` in lib/chat/commands.ts) and ChatMessageView renders those
 * beneath the view, so anything here would show twice. The list is different —
 * its message has a single shared "Go to Projects", while each card here can
 * target its own position in the horizontal track and its own live/repo URLs.
 */
function buildListActions(project: Project): ChatAction[] {
  const actions: ChatAction[] = [];

  if (isValidAnchor(project.sectionAnchor)) {
    actions.push({
      kind: "scroll",
      anchor: project.sectionAnchor,
      label: `View ${project.name}`,
      projectId: project.id,
    });
  }
  if (project.liveUrl && isHttpsUrl(project.liveUrl)) {
    actions.push({ kind: "external", url: project.liveUrl, label: `Open ${project.name}` });
  }
  if (project.repoUrl && isHttpsUrl(project.repoUrl)) {
    actions.push({ kind: "external", url: project.repoUrl, label: "View source" });
  }

  return actions;
}

const cardStyle: CSSProperties = {
  position: "relative",
  background: "var(--panel-bg)",
  border: "1px solid var(--border)",
  borderLeftWidth: "3px",
  borderLeftStyle: "solid",
  padding: "0.9rem 1rem",
  display: "flex",
  flexDirection: "column",
  gap: "0.6rem",
  minWidth: 0,
  clipPath:
    "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
};

interface StatusPillProps {
  status: string;
}

function StatusPill({ status }: StatusPillProps) {
  const color = statusColor(status);
  return (
    <span
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "10px",
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color,
        border: `1px solid ${color}`,
        background: `color-mix(in srgb, ${color} 15%, transparent)`,
        padding: "2px 8px",
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      {status}
    </span>
  );
}

interface StackChipsProps {
  stack: string[];
}

function StackChips({ stack }: StackChipsProps) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
      {stack.map((item) => (
        <span
          key={item}
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            letterSpacing: "0.04em",
            color: "var(--text-muted)",
            border: "1px solid var(--border)",
            background: "var(--bg-secondary)",
            padding: "2px 8px",
          }}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

export interface ProjectCardProps {
  project: Project;
  /** "list" omits the description to keep six stacked cards scannable. */
  variant?: "detail" | "list";
}

export function ProjectCard({ project, variant = "detail" }: ProjectCardProps) {
  const actions = variant === "list" ? buildListActions(project) : [];

  return (
    <article style={{ ...cardStyle, borderLeftColor: project.color }}>
      <header
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "0.75rem",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: project.color }}>
            {project.id}
          </span>
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1rem",
              fontWeight: 700,
              color: "var(--text)",
              letterSpacing: "0.04em",
              margin: "0.2rem 0 0",
              wordBreak: "break-word",
            }}
          >
            {project.name}
          </h3>
        </div>
        <StatusPill status={project.status} />
      </header>

      {variant === "detail" && (
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "13px",
            lineHeight: 1.6,
            color: "var(--text-muted)",
            margin: 0,
          }}
        >
          {project.desc}
        </p>
      )}

      <StackChips stack={project.stack} />

      {actions.length > 0 && <AnswerActions actions={actions} />}
    </article>
  );
}

export interface ProjectListProps {
  projects: Project[];
}

export function ProjectList({ projects }: ProjectListProps) {
  // No list-level scroll button here: the /projects message already carries a
  // single "Go to Projects" action, rendered by ChatMessageView beneath this
  // view. Adding one would show the same control twice.
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", width: "100%" }}>
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} variant="list" />
      ))}
    </div>
  );
}
