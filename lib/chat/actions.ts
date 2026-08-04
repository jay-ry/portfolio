/**
 * Deterministic action derivation.
 *
 * THE MODEL NEVER EMITS ACTIONS. It is instructed not to output URLs at all.
 * Instead we scan its *finished* answer text and attach actions drawn from an
 * allowlist built out of lib/portfolio-data.ts.
 *
 * That inversion is the whole security design: because every URL originates
 * from local data and never from model output, a prompt injection cannot make
 * the UI render an attacker-controlled link. The worst a successful injection
 * can do is cause a scroll to a section that already exists on the page.
 */

import { contactLinks, projects } from "@/lib/portfolio-data";
import { isValidAnchor, type ChatAction } from "./types";

const MAX_ACTIONS = 4;

/**
 * "stack" is excluded when hyphen-prefixed so the ubiquitous "full-stack
 * developer" in Jay's title and bio doesn't force a skills link onto every
 * answer. "MERN stack" and "tech stack" still match, which is the intent.
 */
const SKILL_PATTERNS: RegExp[] = [
  /\bskills?\b/,
  /(?<!-)\bstack\b/,
  /\btech(?:nologies|nology)\b/,
  /\bframeworks?\b/,
  /\blanguages?\b/,
  /\btooling\b/,
  /\bproficien(?:t|cy)\b/,
];

const EXPERIENCE_PATTERNS: RegExp[] = [
  /\bexperience\b/,
  /\bwork history\b/,
  /\broles?\b/,
  /\bjobs?\b/,
  /\bemploy(?:er|ers|ed|ment)\b/,
  /\bcareer\b/,
  /\bworked (?:at|for)\b/,
  /\binternships?\b/,
];

const CONTACT_PATTERNS: RegExp[] = [
  /\bhir(?:e|ing|ed)\b/,
  /\bcontact\b/,
  /\breach (?:out|him)\b/,
  /\bget in touch\b/,
  /\bavailab(?:le|ility)\b/,
  /\bfreelance\b/,
  /\bemail\b/,
  /\bopportunit(?:y|ies)\b/,
];

function matchesAny(haystack: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(haystack));
}

/** Stable identity for dedupe: kind plus whatever the action targets. */
function actionKey(action: ChatAction): string {
  switch (action.kind) {
    case "scroll":
      // projectId is part of the target: two cards in the same section are
      // different destinations, not duplicates.
      return `scroll:${action.anchor}:${action.projectId ?? ""}`;
    case "external":
      return `external:${action.url}`;
    case "email":
      return `email:${action.href}`;
  }
}

/**
 * Scan a completed answer and attach allowlisted follow-up actions.
 *
 * Capped at MAX_ACTIONS, deduped by kind+target, every scroll anchor validated
 * against SECTION_ANCHORS, and every external URL required to be https.
 */
export function deriveActions(answerText: string): ChatAction[] {
  if (typeof answerText !== "string" || answerText.trim().length === 0) {
    return [];
  }

  const text = answerText.toLowerCase();
  const actions: ChatAction[] = [];
  const seen = new Set<string>();

  const push = (action: ChatAction): void => {
    if (actions.length >= MAX_ACTIONS) return;

    // Anchors must exist in the page's allowlist.
    if (action.kind === "scroll" && !isValidAnchor(action.anchor)) return;
    // External links are https-only — no http, no javascript:, no data:.
    if (action.kind === "external" && !action.url.startsWith("https://")) return;
    // Email actions must be genuine mailto: hrefs.
    if (action.kind === "email" && !action.href.startsWith("mailto:")) return;

    const key = actionKey(action);
    if (seen.has(key)) return;
    seen.add(key);
    actions.push(action);
  };

  // --- projects ------------------------------------------------------------
  // Most specific signal, so it claims the action budget first. Plain substring
  // matching rather than regex: project names contain "." and "-"
  // ("JEOPARDY.APP", "BIZ-BOT") which would need escaping as patterns.
  const named = projects.filter((project) =>
    text.includes(project.name.toLowerCase()),
  );

  if (named.length > 0) {
    // Every project lives at the same anchor, so dedupe collapses these to one
    // scroll action. Naming a single project is only honest when exactly one
    // was mentioned — otherwise the button would advertise whichever happened
    // to be listed first in the data.
    // When exactly one project was named we can also point at its card inside
    // the horizontally scrolling track, so "VIEW BIZ-BOT" lands on Biz-Bot
    // instead of the start of the section.
    push({
      kind: "scroll",
      anchor: "projects",
      label: named.length === 1 ? `VIEW ${named[0].name}` : "VIEW PROJECTS",
      ...(named.length === 1 ? { projectId: named[0].id } : {}),
    });

    // External links stay per-project (deduped by URL). Both fields are
    // optional and absent for every project today, so these simply don't
    // render until the data is filled in.
    for (const project of named) {
      if (project.liveUrl) {
        push({ kind: "external", url: project.liveUrl, label: "OPEN LIVE" });
      }
      if (project.repoUrl) {
        push({ kind: "external", url: project.repoUrl, label: "VIEW REPO" });
      }
    }
  }

  // --- skills --------------------------------------------------------------
  if (matchesAny(text, SKILL_PATTERNS)) {
    push({ kind: "scroll", anchor: "skills", label: "VIEW SKILLS" });
  }

  // --- experience ----------------------------------------------------------
  if (matchesAny(text, EXPERIENCE_PATTERNS)) {
    push({ kind: "scroll", anchor: "experience", label: "VIEW EXPERIENCE" });
  }

  // --- contact -------------------------------------------------------------
  if (matchesAny(text, CONTACT_PATTERNS)) {
    push({ kind: "scroll", anchor: "contact", label: "GET IN TOUCH" });

    const email = contactLinks.find((link) => link.label === "EMAIL");
    if (email) {
      push({ kind: "email", href: email.href, label: "SEND EMAIL" });
    }
  }

  return actions;
}
