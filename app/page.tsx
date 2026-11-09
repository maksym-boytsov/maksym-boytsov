import type { Metadata } from "next";
import { MessageForm } from "@/components/contact/message-form";
import { MadeForYou } from "@/components/art/made-for-you";
import { SocialLinks } from "@/components/site/social-links";
import { CREDIT, LINKS, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const NOW = [
  { label: "Thinking about", text: "AI, security, crypto, and how technologies are evolving" },
  { label: "Training", text: "Gym three times a week, plus the occasional cardio" },
  { label: "Open to", text: "Opportunities that can change the world. You never know" },
];

const PERSON_LD = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: SITE_NAME,
  url: SITE_URL,
  jobTitle: "Head of Engineering",
  worksFor: { "@type": "Organization", name: "ChainPatrol", url: "https://chainpatrol.com" },
  address: { "@type": "PostalAddress", addressLocality: "Warsaw", addressCountry: "PL" },
  description: SITE_DESCRIPTION,
  sameAs: [LINKS.x, LINKS.linkedin, LINKS.github],
};

export default function Home() {
  return (
    <div className="paper">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(PERSON_LD).replace(/</g, "\\u003c") }}
      />
      <header className="p-wrap p-top">
        <h1 className="p-brand">Maksym Boytsov</h1>
        <nav aria-label="Elsewhere">
          <SocialLinks />
        </nav>
      </header>

      <main>
        <div className="p-wrap">
          {/* The drawing made for this visitor is the hero; the name lives in the header. */}
          <section className="p-hero" aria-label="Made for you today">
            <MadeForYou />
            <div className="p-hero-text">
              <p className="p-intro">
                I&apos;m Maksym, and I lead engineering at ChainPatrol.
                <br />
                I wanted this page to give you something, not just tell you about me.
              </p>
              <p className="p-meta">Head of Engineering · Warsaw</p>
            </div>
          </section>

          <section className="p-section" aria-labelledby="now-title">
            <h2 className="p-label" id="now-title">
              Right now
            </h2>
            <div className="p-now">
              {NOW.map((cell) => (
                <div key={cell.label}>
                  <span>{cell.label}</span>
                  <p>{cell.text}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Full-width ink band: the note writer reads as its own room, not part of the footer. */}
        <section className="ask-room" aria-labelledby="chat-title">
          <div className="p-wrap">
            <MessageForm />
          </div>
        </section>
      </main>

      <footer className="p-wrap p-footer">
        <p className="p-credit">{CREDIT}</p>
        <nav className="p-footer-links" aria-label="Elsewhere, footer">
          <SocialLinks />
          <a href={LINKS.email}>Email</a>
        </nav>
      </footer>
    </div>
  );
}
