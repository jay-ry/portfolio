import type { Metadata } from "next";
import Link from "next/link";
import ContentPage from "@/components/ContentPage";
import CookieSettingsButton from "@/components/consent/CookieSettingsButton";

export const metadata: Metadata = { title: "Privacy Policy", description: "Privacy policy for jayandrade.com.", alternates: { canonical: "/privacy" } };

export default function PrivacyPage() {
  return (
    <ContentPage code="POL-01" label="PRIVACY" title="PRIVACY POLICY." intro="This policy explains what information may be processed when you use jayandrade.com and its related services.">
      <section className="content-panel"><h2>INFORMATION YOU PROVIDE</h2><p>If you contact me by email or through a linked service, I receive the information you choose to send, such as your name, email address, and message. Please avoid sending sensitive personal information.</p></section>
      <section className="content-panel"><h2>TECHNICAL AND USAGE DATA</h2><p>Hosting, security, analytics, and advertising providers may process standard technical information such as IP address, browser type, device details, pages viewed, timestamps, and referring pages. This information is used to operate, protect, understand, and improve the site.</p></section>
      <section className="content-panel">
        <h2>ADS AND COOKIES</h2>
        <p>This site uses Google AdSense to display advertising. Google and its partners use cookies — including Google&apos;s DoubleClick/DART cookie — and similar technologies to serve ads, personalise them based on your visits to this and other websites, and measure their performance, where permitted by the cookie choice described below. Other third-party advertising vendors besides Google may also set cookies or use similar technologies to serve ads on this site.</p>
        <p>You can opt out of personalised advertising through <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">Google Ads Settings</a> and manage participating vendors&apos; interest-based ads through the <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer">Digital Advertising Alliance&apos;s opt-out page</a>. You can also control or clear cookies through your browser settings at any time.</p>
        <p>This site shows a cookie banner on first visit so you can accept or reject advertising cookies. You can change that choice at any time: <CookieSettingsButton /></p>
      </section>
      <section className="content-panel">
        <h2>GDPR / EEA &amp; UK VISITORS</h2>
        <p>If you are located in the European Economic Area or the United Kingdom, non-essential cookies — including the advertising cookies described above — are only set with your consent, given or withheld through the cookie banner or the Cookie settings control on this page. Where processing relies on consent, you may withdraw it at any time with the same control, without affecting processing carried out before the withdrawal.</p>
        <p>You have the right to request access to the personal data processed about you, to request its erasure, and to object to its processing. To exercise these rights, use the <Link href="/contact">contact form</Link>.</p>
      </section>
      <section className="content-panel">
        <h2>DO NOT SELL OR SHARE MY PERSONAL INFORMATION (CCPA)</h2>
        <p>This site does not sell personal information for money. California residents have the right under the CCPA to opt out of the &quot;sale&quot; or &quot;sharing&quot; of personal information, which for this site means opting out of interest-based advertising cookies. Selecting Reject in the cookie banner — or reopening Cookie settings above and choosing Reject — serves as this site&apos;s opt-out mechanism. You can also exercise your CCPA rights via the <Link href="/contact">contact form</Link>.</p>
      </section>
      <section className="content-panel"><h2>THIRD-PARTY LINKS</h2><p>The site links to external websites, including GitHub, LinkedIn, and games.jayandrade.com. Their own privacy policies apply when you visit them.</p></section>
      <section className="content-panel"><h2>CONTACT</h2><p>For privacy questions or requests relating to information you have sent directly, email <a href="mailto:imjayandrade@gmail.com">imjayandrade@gmail.com</a>.</p></section>
      <p className="policy-date">Last updated: 18 September 2026</p>
    </ContentPage>
  );
}
