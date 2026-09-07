import Link from "next/link";

const links = [
  ["About", "/about"],
  ["Projects", "/projects"],
  ["Contact", "/contact"],
  ["Privacy", "/privacy"],
  ["Terms", "/terms"],
] as const;

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div>
          <Link href="/" className="site-footer-brand">JAY.OS</Link>
          <p>Full-stack development, practical AI, and interactive products.</p>
        </div>
        <nav aria-label="Footer navigation" className="site-footer-links">
          {links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
          <a href="https://games.jayandrade.com" target="_blank" rel="noopener noreferrer">Hot Streak Games ↗</a>
        </nav>
      </div>
      <div className="site-footer-status">
        <span>© {new Date().getFullYear()} Jay Andrade</span>
        <span><b>■</b> SYSTEM NOMINAL</span>
      </div>
    </footer>
  );
}
