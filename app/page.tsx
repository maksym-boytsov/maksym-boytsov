import { Metadata } from "next";

import CreateCompletionForm from "../components/templates/client/create-completion-form";
import ContactForm from "../components/templates/client/contact-form";
import HeroSection from "../components/templates/client/hero-section";

const title = "Maksym Boytsov";
const description =
  "Welcome to Maksym Boytsov's personal website! As a full-stack software engineer and entrepreneur, I'm passionate about building innovative solutions that make a difference. Let's connect and bring ideas to life.";
const canonical = "https://www.maksym.page/";
const fullName = "Maksym Boytsov";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical },
  applicationName: "Maksym Boytsov",
  colorScheme: "dark",
  authors: {
    url: "https://www.maksym.page/",
    name: fullName,
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
  creator: fullName,
  robots: "index, follow",
  openGraph: {
    title,
    description,
    type: "profile",
    locale: "en_US",
    url: canonical,
  },
  twitter: {
    title,
    description,
    card: "summary",
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
