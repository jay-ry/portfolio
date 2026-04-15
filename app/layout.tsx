import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DEV.PORTFOLIO // FULL-STACK",
  description: "Full-Stack Developer Portfolio — Retro-Futuristic Edition",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="scanlines">
        {children}
      </body>
    </html>
  );
}
