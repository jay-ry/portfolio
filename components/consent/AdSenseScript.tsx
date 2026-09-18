"use client";

import Script from "next/script";
import { adsAllowed, type ConsentRegion } from "@/lib/consent";
import { useConsent } from "./useConsent";

export default function AdSenseScript({ region }: { region: ConsentRegion }) {
  const { choice } = useConsent();

  if (!adsAllowed(choice, region)) return null;

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
