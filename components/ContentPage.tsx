import Link from "next/link";
import type { ReactNode } from "react";

type ContentPageProps = {
  code: string;
  label: string;
  title: string;
  intro: string;
  children: ReactNode;
};

export default function ContentPage({ code, label, title, intro, children }: ContentPageProps) {
  return (
    <main className="content-page grid-bg">
      <div className="content-page-shell">
        <div className="content-page-heading">
          <span className="section-label">{`${code} // ${label}`}</span>
          <div className="sci-divider" />
          <h1>{title}</h1>
          <p className="content-page-intro">{intro}</p>
        </div>
        <div className="content-page-body">{children}</div>
        <Link href="/" className="content-back-link">← RETURN TO PORTFOLIO</Link>
      </div>
    </main>
  );
}
