"use client";

import { openConsentPanel } from "@/lib/consent";

export default function CookieSettingsButton() {
  return (
    <button
      type="button"
      className="consent-settings-link"
      onClick={(e) => openConsentPanel(e.currentTarget)}
    >
      COOKIE SETTINGS
    </button>
  );
}
