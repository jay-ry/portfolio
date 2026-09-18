export type ConsentChoice = "accepted" | "rejected";

/**
 * `consent-required` is the fail-safe: it also covers a visitor whose country
 * could not be determined, not only a confirmed EEA/UK/Swiss one.
 */
export type ConsentRegion = "consent-required" | "default-allow";

export function adsAllowed(choice: ConsentChoice | null, region: ConsentRegion): boolean {
  if (choice !== null) return choice === "accepted";
  return region === "default-allow";
}

const STORAGE_KEY = "cookie-consent";

type Listener = () => void;

let choice: ConsentChoice | null = null;
let hydrated = false;
let panelOpen = false;
let lastTrigger: HTMLElement | null = null;
const listeners = new Set<Listener>();

function emit(): void {
  listeners.forEach((listener) => listener());
}

function hydrate(): void {
  if (hydrated) return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === "accepted" || raw === "rejected") choice = raw;
  } catch {
    // Inaccessible storage (Safari private mode, blocked cookies, etc.) —
    // treat this visit as undecided rather than throwing.
  }
}

function persist(next: ConsentChoice): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Non-fatal — the in-memory choice still applies for this page view.
  }
}

export function subscribeConsent(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getConsentSnapshot(): ConsentChoice | null {
  hydrate();
  return choice;
}

export function getConsentServerSnapshot(): ConsentChoice | null {
  return null;
}

export function getPanelOpenSnapshot(): boolean {
  return panelOpen;
}

export function getPanelOpenServerSnapshot(): boolean {
  return false;
}

export function acceptConsent(): void {
  choice = "accepted";
  hydrated = true;
  persist("accepted");
  panelOpen = false;
  emit();
}

export function rejectConsent(): void {
  choice = "rejected";
  hydrated = true;
  persist("rejected");
  panelOpen = false;
  emit();
}

export function openConsentPanel(trigger?: HTMLElement | null): void {
  lastTrigger = trigger ?? null;
  panelOpen = true;
  emit();
}

export function closeConsentPanel(): void {
  panelOpen = false;
  emit();
}

/** Consumed once by the banner to restore focus after a manual close. */
export function takeLastTrigger(): HTMLElement | null {
  const el = lastTrigger;
  lastTrigger = null;
  return el;
}
