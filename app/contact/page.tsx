import type { Metadata } from "next";
import ContentPage from "@/components/ContentPage";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Jay Andrade about development roles, freelance projects, or collaborations.",
  alternates: { canonical: "/contact" },
};

const links = [
  { label: "EMAIL", display: "imjayandrade@gmail.com", href: "mailto:imjayandrade@gmail.com" },
  { label: "LINKEDIN", display: "linkedin.com/in/jay-ryan-andrade", href: "https://www.linkedin.com/in/jay-ryan-andrade/" },
  { label: "GITHUB", display: "github.com/jay-ry", href: "https://github.com/jay-ry" },
];

export default function ContactPage() {
  return (
    <ContentPage code="007" label="CONTACT" title="ESTABLISH CONTACT." intro="Open to engineering roles, freelance projects, and interesting collaborations.">
      <div className="contact-page-grid">
        {links.map(link => (
          <a className="content-panel contact-page-card neon-border" href={link.href} key={link.label} target={link.href.startsWith("http") ? "_blank" : undefined} rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}>
            <span className="section-label">{link.label}</span>
            <strong>{link.display}</strong>
            <span>OPEN ↗</span>
          </a>
        ))}
      </div>
      <section className="content-panel"><h2>WHAT TO INCLUDE</h2><p>A short note about what you are building, the problem you want to solve, and any useful timing or project context is enough to start.</p></section>
    </ContentPage>
  );
}
