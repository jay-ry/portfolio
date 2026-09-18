import { headers } from "next/headers";
import type { ConsentRegion } from "./consent";

const CONSENT_REQUIRED_COUNTRIES = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU",
  "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES",
  "SE", "IS", "LI", "NO", "GB", "CH",
]);

export function regionForCountry(country: string | null | undefined): ConsentRegion {
  const code = (country ?? "").trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) return "consent-required";

  // Cloudflare's placeholders for "no country" and Tor exits — neither is a real country.
  if (code === "XX" || code === "T1") return "consent-required";

  return CONSENT_REQUIRED_COUNTRIES.has(code) ? "consent-required" : "default-allow";
}

export function countryHeaderName(): string | null {
  const name = (process.env.CONSENT_COUNTRY_HEADER ?? "").trim().toLowerCase();
  return name === "" ? null : name;
}

export async function consentRegion(): Promise<ConsentRegion> {
  const configured = countryHeaderName();

  // Read a header even when none is configured: a headers() call `next build`
  // can skip lets it prerender the root layout, baking one visitor's region
  // into static HTML served to everyone.
  const country = (await headers()).get(configured ?? "cf-ipcountry");

  return configured === null ? "consent-required" : regionForCountry(country);
}
