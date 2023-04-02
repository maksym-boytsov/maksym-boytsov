import { Metadata } from "next";

import CreateCompletionForm from "../components/templates/client/create-completion-form";
import ContactForm from "../components/templates/client/contact-form";
import HeroSection from "../components/templates/client/hero-section";

export const metadata: Metadata = {
  title: "Maksym Boytsov",
  description:
    "Welcome to Maksym Boytsov's personal website! As a full-stack software engineer and entrepreneur, I'm passionate about building innovative solutions that make a difference. Let's connect and bring ideas to life.",
  alternates: { canonical: "https://www.maksym.page/" },
  applicationName: "Maksym Boytsov",
  authors: {
    url: "https://www.maksym.page/",
    name: "Maksym Boytsov",
  },
  generator: "Next.js",
  keywords: [
    "Maksym Boytsov",
    "Maksym",
    "Boytsov",
    "Software Engineer",
    "Full Stack",
    "Entrepreneur",
    "Web3",
    "AI",
    "Crypto",
    "Blockchain",
  ],
  themeColor: "#18181b",
  creator: "Maksym Boytsov",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_IE",
    url: "https://www.maksym.page/",
    title: "Maksym Boytsov",
    description:
      "Welcome to Maksym Boytsov's personal website! As a full-stack software engineer and entrepreneur, I'm passionate about building innovative solutions that make a difference. Let's connect and bring ideas to life.",
  },
};

export default function HomePage() {
  return (
    <main className="text-zinc-100">
      <HeroSection />
      <CreateCompletionForm />
      <ContactForm />
    </main>
  );
}
