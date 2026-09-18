"use client";

import Script from "next/script";
import { useConsent } from "./useConsent";

export default function AdSenseScript() {
  const { choice } = useConsent();

  if (choice !== "accepted") return null;

  return (
    <Script
      id="google-adsense"
      async
      strategy="afterInteractive"
      crossOrigin="anonymous"
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6779169274814993"
    />
  );
}
