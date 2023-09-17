import { Metadata } from "next";

import AISection from "../components/templates/client/ai-section";

import HeroSection from "../components/templates/client/hero-section";

const title = "Maksym Boytsov";
const description =
  "Welcome to Maksym Boytsov's personal website! As a full-stack software engineer and entrepreneur, I'm passionate about building innovative solutions that make a difference. Let's connect and bring ideas to life.";
const canonical = "https://www.maksym.page/";
const fullName = "Maksym Boytsov";
const image = "https://avatars.githubusercontent.com/u/32408893?v=4";

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
    images: image,
    url: canonical,
  },
  twitter: {
    title,
    description,
    images: image,
    card: "summary",
  },
};

export default function HomePage() {
  return (
    <main className="text-zinc-100">
      <HeroSection />
      <AISection />
    </main>
  );
}
