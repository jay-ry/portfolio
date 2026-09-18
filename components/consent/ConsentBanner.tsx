"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { takeLastTrigger, type ConsentRegion } from "@/lib/consent";
import { useConsent } from "./useConsent";

/**
 * Non-modal by design: a persistent bottom banner shouldn't trap Tab focus
 * or block the rest of the page, so it uses role="region" rather than
 * role="dialog". Focus is only moved deliberately — into the panel when it
 * is reopened via the "Cookie settings" control, and back to that control on
 * close — never on the automatic first-visit appearance, which would steal
 * focus from wherever the visitor already was.
 */
export default function ConsentBanner({ region }: { region: ConsentRegion }) {
  const { choice, isPanelOpen, isVisible, accept, reject, closeSettings } = useConsent();
  const panelRef = useRef<HTMLDivElement>(null);
  const wasPanelOpenRef = useRef(false);

  useEffect(() => {
    const wasOpen = wasPanelOpenRef.current;
    wasPanelOpenRef.current = isPanelOpen;

    if (isPanelOpen && !wasOpen) {
      panelRef.current?.querySelector<HTMLElement>("button, a[href]")?.focus({ preventScroll: true });
      return;
    }
    if (!isPanelOpen && wasOpen) {
      takeLastTrigger()?.focus?.({ preventScroll: true });
    }
  }, [isPanelOpen]);

  if (!isVisible) return null;

  const canDismiss = choice !== null;
  const consentRequired = region === "consent-required";

  return (
    <div ref={panelRef} role="region" aria-label="Cookie consent" className="consent-banner neon-border">
      {canDismiss && (
        <button
          type="button"
          onClick={closeSettings}
          aria-label="Close cookie settings"
          className="consent-banner-close"
        >
          [X]
        </button>
      )}
      <p className="consent-banner-text">
        {consentRequired
          ? "This site uses cookies, including Google AdSense advertising cookies. Choose Accept or Reject, or read the "
          : "This site uses cookies, including Google AdSense advertising cookies, which are on unless you turn them off. Read the "}
        <Link href="/privacy">Privacy Policy</Link>.
      </p>
      <div className="consent-banner-actions">
        <button type="button" onClick={reject} className="consent-banner-btn">
          {consentRequired ? "REJECT" : "TURN OFF ADS"}
        </button>
        <button type="button" onClick={accept} className="consent-banner-btn consent-banner-btn--accept">
          {consentRequired ? "ACCEPT" : "GOT IT"}
        </button>
      </div>
    </div>
  );
}
