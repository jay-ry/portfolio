import type { Metadata } from "next";
import ContentPage from "@/components/ContentPage";

export const metadata: Metadata = { title: "Terms of Use", description: "Terms of use for jayandrade.com.", alternates: { canonical: "/terms" } };

export default function TermsPage() {
  return (
    <ContentPage code="POL-02" label="TERMS" title="TERMS OF USE." intro="These terms apply when you browse jayandrade.com or use its publicly available content and features.">
      <section className="content-panel"><h2>USE OF THE SITE</h2><p>You may browse the site and use its public features for lawful, personal, and informational purposes. Do not attempt to disrupt the site, gain unauthorised access, automate abusive requests, or misuse its content or services.</p></section>
      <section className="content-panel"><h2>PORTFOLIO CONTENT</h2><p>Project descriptions and other portfolio material are provided to demonstrate experience and work. Unless stated otherwise, they are not an offer, warranty, professional recommendation, or promise of a particular result.</p></section>
      <section className="content-panel"><h2>EXTERNAL SERVICES</h2><p>Links may take you to third-party sites and services. Those services are controlled by their respective operators, and their own terms and policies apply.</p></section>
      <section className="content-panel"><h2>AVAILABILITY</h2><p>The site and its features are provided as available. Content may be corrected, updated, moved, or removed, and uninterrupted availability cannot be guaranteed.</p></section>
      <section className="content-panel"><h2>CONTACT</h2><p>Questions about these terms can be sent to <a href="mailto:imjayandrade@gmail.com">imjayandrade@gmail.com</a>.</p></section>
      <p className="policy-date">Last updated: 7 September 2026</p>
    </ContentPage>
  );
}
