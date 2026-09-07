import type { Metadata } from "next";
import ContentPage from "@/components/ContentPage";

export const metadata: Metadata = { title: "Privacy Policy", description: "Privacy policy for jayandrade.com.", alternates: { canonical: "/privacy" } };

export default function PrivacyPage() {
  return (
    <ContentPage code="POL-01" label="PRIVACY" title="PRIVACY POLICY." intro="This policy explains what information may be processed when you use jayandrade.com and its related services.">
      <section className="content-panel"><h2>INFORMATION YOU PROVIDE</h2><p>If you contact me by email or through a linked service, I receive the information you choose to send, such as your name, email address, and message. Please avoid sending sensitive personal information.</p></section>
      <section className="content-panel"><h2>TECHNICAL AND USAGE DATA</h2><p>Hosting, security, analytics, and advertising providers may process standard technical information such as IP address, browser type, device details, pages viewed, timestamps, and referring pages. This information is used to operate, protect, understand, and improve the site.</p></section>
      <section className="content-panel"><h2>ADS AND COOKIES</h2><p>This site may use Google AdSense. Google and its partners may use cookies or similar technologies to serve and measure ads, including ads based on visits to this and other websites where permitted. You can manage personalised advertising through your Google ad settings and control cookies through your browser.</p></section>
      <section className="content-panel"><h2>THIRD-PARTY LINKS</h2><p>The site links to external websites, including GitHub, LinkedIn, and games.jayandrade.com. Their own privacy policies apply when you visit them.</p></section>
      <section className="content-panel"><h2>CONTACT</h2><p>For privacy questions or requests relating to information you have sent directly, email <a href="mailto:imjayandrade@gmail.com">imjayandrade@gmail.com</a>.</p></section>
      <p className="policy-date">Last updated: 7 September 2026</p>
    </ContentPage>
  );
}
