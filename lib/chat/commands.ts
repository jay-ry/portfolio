/**
 * Slash-command registry for the portfolio terminal chatbot.
 *
 * Slash commands are DETERMINISTIC and execute entirely in the browser. They
 * never call the AI endpoint and never consume tokens. `/status` is the only
 * command that touches the network, and it does so indirectly: it returns
 * `{ type: "status" }` and the UI performs a cheap `GET /api/chat/status`.
 *
 * Every `run(args)` is pure and synchronous — no fetch, no DOM, no `window`,
 * no side effects — so this module is safely importable from a server
 * component or a route handler as well as from the client.
 *
 * Content strings are plain text rendered inside a `<pre>`-ish terminal block.
 * No Markdown, no HTML. Every fact comes from lib/portfolio-data.ts; anything
 * else here is pure UI chrome.
 */

import { isValidAnchor, type ChatAction, type CommandView } from "@/lib/chat/types";
import {
  contactLinks,
  profile,
  projects,
  roles,
  skillDomains,
  type Project,
} from "@/lib/portfolio-data";

// ---------------------------------------------------------------------------
// Public contract
// ---------------------------------------------------------------------------

export interface CommandDef {
  name: string; // "help", no leading slash
  aliases: string[];
  description: string; // shown in the autocomplete menu and /help
  args?: string; // display hint, e.g. "<name>"
  analyticsEvent: string; // e.g. "chat_cmd_help"
  run: (args: string) => CommandOutcome;
}

export type CommandOutcome =
  | { type: "message"; content: string; actions?: ChatAction[]; view?: CommandView }
  | { type: "clear" }
  | { type: "close" }
  | { type: "status" };

// ---------------------------------------------------------------------------
// Terminal layout helpers (pure UI chrome)
// ---------------------------------------------------------------------------

const WIDTH = 48;
const BOTTOM = `└${"─".repeat(WIDTH - 2)}┘`;

function topRule(title: string): string {
  const label = `── ${title} `;
  return `┌${label}${"─".repeat(Math.max(0, WIDTH - 2 - label.length))}┐`;
}

function pad(value: string, width: number): string {
  return value.length >= width ? value : value + " ".repeat(width - value.length);
}

/** Greedy word wrap. Returns indented lines; never splits a word. */
function wrap(text: string, width: number, indent = ""): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    if (!line) {
      line = word;
    } else if (line.length + 1 + word.length <= width) {
      line += ` ${word}`;
    } else {
      lines.push(indent + line);
      line = word;
    }
  }
  if (line) lines.push(indent + line);
  return lines;
}

/** `LABEL   value` with the value wrapped under a hanging indent. */
function field(label: string, value: string, labelWidth: number): string[] {
  const indent = "  " + " ".repeat(labelWidth);
  const lines = wrap(value, WIDTH - 2 - labelWidth, indent);
  if (lines.length === 0) return [];
  lines[0] = `  ${pad(label, labelWidth)}${lines[0].slice(indent.length)}`;
  return lines;
}

/** Wraps body lines in a titled terminal frame. */
function block(title: string, body: string[]): string {
  const trimmed = [...body];
  while (trimmed.length > 0 && trimmed[trimmed.length - 1] === "") trimmed.pop();
  return [topRule(title), "", ...trimmed, "", BOTTOM].join("\n");
}

// ---------------------------------------------------------------------------
// Action helpers — anchors are allowlisted, URLs never come from user input
// ---------------------------------------------------------------------------

/** Returns a scroll action only when the anchor passes isValidAnchor. */
function scrollTo(anchor: string, label: string): ChatAction[] {
  return isValidAnchor(anchor) ? [{ kind: "scroll", anchor, label }] : [];
}

function isHttpUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

// ---------------------------------------------------------------------------
// Project lookup
// ---------------------------------------------------------------------------

/** Lowercase, strip everything that is not a letter or digit. */
function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Fuzzy-matches a single project by name or id. Tolerates case, partials and
 * the `.app` / hyphen forms (`jeopardy`, `biz-bot`, `bizbot`).
 */
function findProject(query: string): Project | undefined {
  const q = normalize(query);
  if (!q) return undefined;

  const byId = projects.find((p) => p.id === q);
  if (byId) return byId;

  const exact = projects.find((p) => normalize(p.name) === q);
  if (exact) return exact;

  const starts = projects.find((p) => normalize(p.name).startsWith(q));
  if (starts) return starts;

  const contains = projects.find((p) => normalize(p.name).includes(q));
  if (contains) return contains;

  // "jeopardy.app" / "the chess engine" — query is longer than the record.
  return projects.find((p) => q.includes(normalize(p.name)));
}

const PROJECT_NAMES = projects.map((p) => p.name);

// ---------------------------------------------------------------------------
// Command bodies
// ---------------------------------------------------------------------------

function helpBody(): string {
  const usage = (c: CommandDef) => `/${c.name}${c.args ? ` ${c.args}` : ""}`;
  const usageWidth = Math.max(...commands.map((c) => usage(c).length)) + 2;

  const lines = commands.map((c) => `  ${pad(usage(c), usageWidth)}${c.description}`);

  const aliased = commands.filter((c) => c.aliases.length > 0);
  const aliasWidth = Math.max(...aliased.map((c) => c.name.length)) + 4;
  const aliasLines = aliased.map(
    (c) => `    ${pad(`/${c.name}`, aliasWidth)}${c.aliases.map((a) => `/${a}`).join("  ")}`,
  );

  return block("COMMAND REGISTRY", [
    ...lines,
    "",
    "  ALIASES",
    ...aliasLines,
    "",
    ...wrap(
      'Anything that does not start with "/" is sent to the AI guide, which answers in plain language.',
      WIDTH - 4,
      "  ",
    ),
  ]);
}

function projectsBody(): string {
  const nameWidth = Math.max(...projects.map((p) => p.name.length)) + 2;
  const lines: string[] = [];

  for (const p of projects) {
    lines.push(`  ${p.id}  ${pad(p.name, nameWidth)}[${p.status}]`);
    lines.push(...wrap(p.stack.join(" · "), WIDTH - 9, "       "));
    lines.push("");
  }

  lines.push(`  ${projects.length} projects · /project <name> for details`);

  return block("PROJECTS", lines);
}

function projectDetailBody(p: Project): string {
  const labelWidth = 9;
  const lines: string[] = [
    ...field("ID", p.id, labelWidth),
    ...field("STATUS", p.status, labelWidth),
    ...field("STACK", p.stack.join(" · "), labelWidth),
  ];

  // liveUrl / repoUrl are optional — render the row only when present so the
  // output never prints "undefined".
  if (p.liveUrl) lines.push(`  ${pad("LIVE", labelWidth)}${p.liveUrl}`);
  if (p.repoUrl) lines.push(`  ${pad("REPO", labelWidth)}${p.repoUrl}`);

  lines.push("");
  lines.push(...wrap(p.desc, WIDTH - 4, "  "));

  return block(p.name, lines);
}

function projectActions(p: Project): ChatAction[] {
  const actions: ChatAction[] = [...scrollTo(p.sectionAnchor, "View in Projects")];

  if (p.liveUrl && isHttpUrl(p.liveUrl)) {
    actions.push({ kind: "external", url: p.liveUrl, label: `Open ${p.name}` });
  }
  if (p.repoUrl && isHttpUrl(p.repoUrl)) {
    actions.push({ kind: "external", url: p.repoUrl, label: "View source" });
  }
  return actions;
}

function projectNotFoundBody(query: string): string {
  return block("NOT FOUND", [
    ...wrap(`No project matches "${query}".`, WIDTH - 4, "  "),
    "",
    "  Known projects:",
    ...wrap(PROJECT_NAMES.join(", "), WIDTH - 6, "    "),
    "",
    "  Try: /project jeopardy",
  ]);
}

function projectUsageBody(): string {
  return block("USAGE", [
    "  /project <name>",
    "",
    ...wrap("Show the details for a single project.", WIDTH - 4, "  "),
    "",
    "  Known projects:",
    ...wrap(PROJECT_NAMES.join(", "), WIDTH - 6, "    "),
    "",
    "  Examples: /project bizbot · /project chess",
  ]);
}

function skillsBody(): string {
  const lines: string[] = [];
  for (const domain of skillDomains) {
    lines.push(`  ${domain.id}`);
    lines.push(...wrap(domain.skills.map((s) => s.name).join(" · "), WIDTH - 6, "    "));
    lines.push("");
  }
  const total = skillDomains.reduce((n, d) => n + d.skills.length, 0);
  lines.push(`  ${total} skills across ${skillDomains.length} domains`);
  return block("SKILLS", lines);
}

function experienceBody(): string {
  const lines: string[] = [];
  for (const role of roles) {
    lines.push(`  ${role.id}  ${role.title}`);
    lines.push(`       ${role.company}`);
    lines.push(`       ${role.period}`);
    lines.push("");
  }
  lines.push(`  ${roles.length} roles · ${profile.location}`);
  return block("EXPERIENCE", lines);
}

function contactBody(): string {
  const labelWidth = Math.max(...contactLinks.map((l) => l.label.length)) + 3;
  const lines = contactLinks.map(
    (l) => `  ${l.icon ?? "·"} ${pad(l.label, labelWidth)}${l.display}`,
  );
  return block("CONTACT", [...lines, "", "  Open to work and interesting problems."]);
}

/**
 * Only the scroll action.
 *
 * ContactView renders an Email/Open button inside each contact card, right
 * next to the address it belongs to — a better place for it than a detached
 * row underneath. Emitting the same three links here as well just printed
 * every destination twice.
 */
function contactActions(): ChatAction[] {
  return scrollTo("contact", "Go to Contact");
}

function aboutBody(): string {
  return block("ABOUT", [
    `  ${profile.name}`,
    `  ${profile.title} · ${profile.location}`,
    "",
    ...wrap(profile.summary, WIDTH - 4, "  "),
  ]);
}

function unknownCommandBody(name: string): string {
  const typed = name ? `/${name}` : "/";
  // An empty name means the user typed a bare "/" — nothing to suggest.
  const suggestions = name ? matchCommands(name).slice(0, 3) : [];
  const lines = [...wrap(`Unknown command: ${typed}`, WIDTH - 4, "  ")];

  if (suggestions.length > 0) {
    lines.push("");
    lines.push("  Did you mean:");
    for (const c of suggestions) {
      lines.push(`    /${c.name}  —  ${c.description}`);
    }
  }

  lines.push("");
  lines.push(...wrap("Run /help for the full command list, or just type a question to ask the AI guide.", WIDTH - 4, "  "));

  return block("ERROR", lines);
}

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

export const commands: CommandDef[] = [
  {
    name: "help",
    aliases: ["h", "?", "commands"],
    description: "List every command",
    analyticsEvent: "chat_cmd_help",
    run: () => ({
      type: "message",
      content: helpBody(),
      view: {
        kind: "commands",
        items: commands.map((c) => ({
          name: c.name,
          args: c.args,
          description: c.description,
          aliases: c.aliases,
        })),
      },
    }),
  },
  {
    name: "about",
    aliases: ["who", "whoami", "bio"],
    description: "Who Jay is, in short",
    analyticsEvent: "chat_cmd_about",
    run: () => ({
      type: "message",
      content: aboutBody(),
      actions: scrollTo("about", "Go to About"),
    }),
  },
  {
    name: "projects",
    aliases: ["ls", "work", "portfolio"],
    description: "List all projects",
    analyticsEvent: "chat_cmd_projects",
    run: () => ({
      type: "message",
      content: projectsBody(),
      actions: scrollTo("projects", "Go to Projects"),
      view: { kind: "projects", items: projects },
    }),
  },
  {
    name: "project",
    aliases: ["p", "proj", "open"],
    description: "Details for one project",
    args: "<name>",
    analyticsEvent: "chat_cmd_project",
    run: (args) => {
      const query = args.trim();
      if (!query) return { type: "message", content: projectUsageBody() };

      const match = findProject(query);
      if (!match) return { type: "message", content: projectNotFoundBody(query) };

      return {
        type: "message",
        content: projectDetailBody(match),
        actions: projectActions(match),
        view: { kind: "project", item: match },
      };
    },
  },
  {
    name: "skills",
    aliases: ["stack", "tech"],
    description: "Tech stack by domain",
    analyticsEvent: "chat_cmd_skills",
    run: () => ({
      type: "message",
      content: skillsBody(),
      actions: scrollTo("skills", "Go to Skills"),
      view: { kind: "skills", domains: skillDomains },
    }),
  },
  {
    name: "experience",
    aliases: ["exp", "xp", "resume", "cv"],
    description: "Work history",
    analyticsEvent: "chat_cmd_experience",
    run: () => ({
      type: "message",
      content: experienceBody(),
      actions: scrollTo("experience", "Go to Experience"),
      view: { kind: "experience", roles },
    }),
  },
  {
    name: "contact",
    aliases: ["hire", "reach", "connect"],
    description: "Email and social links",
    analyticsEvent: "chat_cmd_contact",
    run: () => ({
      type: "message",
      content: contactBody(),
      actions: contactActions(),
      view: { kind: "contact", links: contactLinks },
    }),
  },
  {
    name: "home",
    aliases: ["top", "hero", "start"],
    description: "Jump to the top",
    analyticsEvent: "chat_cmd_home",
    run: () => ({
      type: "message",
      content: block("HOME", ["  Returning to the top of the page."]),
      actions: scrollTo("hero", "Go to Home"),
    }),
  },
  {
    name: "status",
    aliases: ["stat", "health", "ping"],
    description: "Check AI guide status",
    analyticsEvent: "chat_cmd_status",
    run: () => ({ type: "status" }),
  },
  {
    name: "clear",
    aliases: ["cls", "clr"],
    description: "Wipe the transcript",
    analyticsEvent: "chat_cmd_clear",
    run: () => ({ type: "clear" }),
  },
  {
    name: "exit",
    aliases: ["quit", "q", "close", "bye"],
    description: "Close the terminal",
    analyticsEvent: "chat_cmd_exit",
    run: () => ({ type: "close" }),
  },
];

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Splits a raw input into a command name and its argument string. */
export function parseCommand(input: string): { name: string; args: string } | null {
  const trimmed = input.trim();
  if (!trimmed.startsWith("/")) return null;

  const withoutSlash = trimmed.slice(1);
  const firstSpace = withoutSlash.search(/\s/);

  const rawName = firstSpace === -1 ? withoutSlash : withoutSlash.slice(0, firstSpace);
  const rawArgs = firstSpace === -1 ? "" : withoutSlash.slice(firstSpace + 1);

  return {
    name: rawName.toLowerCase(),
    args: rawArgs.trim().replace(/\s+/g, " "),
  };
}

/** Looks a command up by its canonical name or by any alias. */
export function findCommand(name: string): CommandDef | undefined {
  const needle = name.trim().replace(/^\//, "").toLowerCase();
  if (!needle) return undefined;
  return commands.find((c) => c.name === needle || c.aliases.includes(needle));
}

/**
 * Executes a slash command locally. Unknown commands resolve to a deterministic
 * error message — they never fall through to the AI endpoint.
 */
export function executeCommand(input: string): CommandOutcome {
  const parsed = parseCommand(input);

  if (!parsed) {
    return {
      type: "message",
      content: block("ERROR", [
        ...wrap("That is not a slash command.", WIDTH - 4, "  "),
        "",
        ...wrap(
          "Run /help for the command list, or type a question to ask the AI guide.",
          WIDTH - 4,
          "  ",
        ),
      ]),
    };
  }

  const command = findCommand(parsed.name);
  if (!command) {
    return { type: "message", content: unknownCommandBody(parsed.name) };
  }

  return command.run(parsed.args);
}

/**
 * Autocomplete. `prefix` may include the leading "/". Canonical-name matches
 * rank above alias-only matches; an empty prefix lists everything.
 */
export function matchCommands(prefix: string): CommandDef[] {
  const needle = prefix.trim().replace(/^\//, "").toLowerCase();
  if (!needle) return [...commands];

  const byName = commands.filter((c) => c.name.startsWith(needle));
  const byAlias = commands.filter(
    (c) => !c.name.startsWith(needle) && c.aliases.some((a) => a.startsWith(needle)),
  );

  return [...byName, ...byAlias];
}
