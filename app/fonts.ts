import { Geist_Mono, Inter_Tight } from "next/font/google";

// Self-hosted at build time by next/font: no runtime request to Google.
// Variable weight (100–900).
export const sans = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  display: "swap",
});

export const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});
