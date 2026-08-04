/**
 * Shared chat contract.
 *
 * The single source of truth for types passed between the /api/chat route
 * handler, the slash-command registry, and the chat UI. Types only — the only
 * runtime values exported here are the CHAT_LIMITS constants, the
 * SECTION_ANCHORS allowlist, and the isValidAnchor guard.
 */

import type { ContactLink, Project, Role, SkillDomain } from "@/lib/portfolio-data";

export type ChatRole = "user" | "assistant" | "system";

// Actions are strictly allowlisted — no arbitrary URLs.
export type ChatAction =
  // anchor must be one of the section anchors (see SECTION_ANCHORS)
  | { kind: "scroll"; anchor: string; label: string }
  // only http(s), only project liveUrl/repoUrl or contactLinks hrefs
  | { kind: "external"; url: string; label: string }
  | { kind: "email"; href: string; label: string };

/**
 * Structured payload for command outputs that get a dedicated component
 * instead of the ASCII `<pre>` block. Optional and additive — `content`
 * stays the source of truth (sessionStorage persistence, screen readers,
 * and the fallback when a view is absent), this is purely a richer render
 * for the same data. Only commands that opted in populate it; everything
 * else (`/home`, `/clear`, `/status`, `/exit`, the `/project` not-found and
 * usage branches) stays plain text.
 */
export type CommandView =
  | { kind: "projects"; items: Project[] }
  | { kind: "project"; item: Project }
  | { kind: "skills"; domains: SkillDomain[] }
  | { kind: "experience"; roles: Role[] }
  | { kind: "contact"; links: ContactLink[] }
  | {
      kind: "commands";
      items: { name: string; args?: string; description: string; aliases: string[] }[];
    };

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  actions?: ChatAction[];
  /** Rich render for the same content — see CommandView. */
  view?: CommandView;
  /** portfolio record ids, e.g. "project:005" */
  sources?: string[];
  /** 'command' = locally-executed slash command result */
  kind?: "chat" | "command" | "error";
  /** true while streaming */
  pending?: boolean;
}

// POST /api/chat request/response
export interface ChatRequest {
  message: string;
  conversationId: string;
  currentSection?: string;
  history?: { role: ChatRole; content: string }[];
}

export const CHAT_LIMITS = {
  MAX_MESSAGE_LENGTH: 500,
  MAX_HISTORY_MESSAGES: 8,
  MAX_HISTORY_CHARS: 4000,
} as const;

// Server-Sent-Event frame types streamed by POST /api/chat
export type ChatStreamEvent =
  | { type: "delta"; text: string }
  | { type: "done"; actions?: ChatAction[]; sources?: string[] }
  | {
      type: "error";
      code: "rate_limited" | "provider_error" | "invalid_request" | "timeout";
      message: string;
    };

export interface ChatStatusResponse {
  available: boolean;
  mode: "live" | "degraded" | "offline";
}

/**
 * Allowlist of scroll targets. Mirrors `sections` in lib/portfolio-data.ts —
 * kept here as a plain string array so the command registry and the API route
 * can validate actions without importing portfolio content.
 */
export const SECTION_ANCHORS = [
  "hero",
  "about",
  "skills",
  "projects",
  "ai-guide",
  "experience",
  "contact",
] as const;

export type SectionAnchor = (typeof SECTION_ANCHORS)[number];

export function isValidAnchor(a: string): a is SectionAnchor {
  return (SECTION_ANCHORS as readonly string[]).includes(a);
}
