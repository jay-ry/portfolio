"use client";

import type { ChatMessage, CommandView } from "@/lib/chat/types";
import { AnswerActions } from "./AnswerActions";
import { CommandsView, ContactView, ExperienceView, SkillsView } from "./CommandViews";
import { ProjectCard, ProjectList } from "./ProjectCard";

interface ChatMessageViewProps {
  message: ChatMessage;
}

/**
 * Some command outputs (see CommandView in lib/chat/types.ts) get a real
 * component instead of the ASCII `<pre>` block. `content` stays populated
 * for these regardless — it's the sessionStorage/fallback copy — but when a
 * view is present it renders in place of the text, not alongside it: the
 * card markup is itself readable by assistive tech.
 */
function renderCommandView(view: CommandView) {
  switch (view.kind) {
    case "projects":
      return <ProjectList projects={view.items} />;
    case "project":
      return <ProjectCard project={view.item} />;
    case "skills":
      return <SkillsView domains={view.domains} />;
    case "experience":
      return <ExperienceView roles={view.roles} />;
    case "contact":
      return <ContactView links={view.links} />;
    case "commands":
      return <CommandsView items={view.items} />;
    default:
      return null;
  }
}

/**
 * Renders one ChatMessage. Assistant/command text is always plain text —
 * no dangerouslySetInnerHTML, no markdown parsing — model output and command
 * output are both untrusted and rendered as inert strings only.
 */
export function ChatMessageView({ message }: ChatMessageViewProps) {
  const isUser = message.role === "user";
  const isError = message.kind === "error";
  const isCommand = message.kind === "command";
  const hasView = isCommand && message.view !== undefined;

  return (
    // aria-live="off" on the visitor's own turns overrides the transcript's
    // role="log" live region for this subtree only. Without it a screen
    // reader reads the message straight back to the person who just typed
    // it. The text stays in the accessibility tree, so the transcript is
    // still fully reviewable by browsing — it just isn't auto-announced.
    <div
      aria-live={isUser ? "off" : undefined}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: isUser ? "flex-end" : "flex-start",
        gap: "0.5rem",
        width: hasView ? "100%" : undefined,
      }}
    >
      {hasView ? (
        renderCommandView(message.view as CommandView)
      ) : (
        <div
          style={{
            maxWidth: "88%",
            fontFamily: "var(--font-mono)",
            fontSize: "13px",
            lineHeight: 1.6,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            color: isError ? "var(--accent2)" : "var(--text)",
            ...(isCommand
              ? {
                  background: "color-mix(in srgb, var(--accent) 6%, var(--panel-bg))",
                  border: "1px solid var(--border)",
                  padding: "0.75rem 1rem",
                }
              : {}),
            ...(isError
              ? {
                  background: "color-mix(in srgb, var(--accent2) 6%, var(--panel-bg))",
                  border: "1px solid var(--accent2)",
                  padding: "0.6rem 0.9rem",
                }
              : {}),
          }}
        >
          {isUser && (
            <span style={{ color: "var(--accent)", marginRight: "0.4rem" }} aria-hidden="true">
              &gt;
            </span>
          )}
          {/* Hidden from assistive tech while streaming so screen readers don't
              announce every incoming token — it becomes visible (and gets
              announced once, inside the transcript's aria-live region) the
              instant the message completes. */}
          <span aria-hidden={message.pending ? true : undefined}>{message.content}</span>
          {message.pending && (
            <span className="blink" aria-hidden="true" style={{ marginLeft: 2, color: "var(--accent)" }}>
              ▊
            </span>
          )}
        </div>
      )}

      {/* Rendered for rich views too. The view replaces the TEXT, not the
          actions — suppressing these dropped "Go to Skills", "Go to
          Experience", "Go to Contact" and "Go to Projects" entirely, so the
          card commands had no way back to their section. */}
      {message.actions && message.actions.length > 0 && !message.pending && (
        <AnswerActions actions={message.actions} />
      )}
    </div>
  );
}
