import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Providers from "./providers";
import Cursor from "@/components/Cursor";
import Nav from "@/components/Nav";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  metadataBase: new URL("https://jayandrade.com"),
  title: {
    default: "Jay Andrade | Full-Stack Developer",
    template: "%s | Jay Andrade",
  },
  description: "Portfolio of Jay Andrade, a full-stack developer building web applications, AI-enabled products, real-time platforms, and hardware prototypes.",
  alternates: { canonical: "/" },
  other: { "google-adsense-account": "ca-pub-6779169274814993" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="scanlines">
        <Script
          id="google-adsense"
          async
          strategy="afterInteractive"
          crossOrigin="anonymous"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6779169274814993"
        />
        <Providers>
          <Cursor />
          <Nav />
          {children}
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
