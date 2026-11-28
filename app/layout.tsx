import type { Metadata } from "next";
import Script from "next/script";
import {
  Atkinson_Hyperlegible_Next,
  Bricolage_Grotesque,
  Instrument_Serif,
  JetBrains_Mono,
} from "next/font/google";
import { Toaster } from "sonner";
import { EcosystemBar } from "@/components/brand";
import { MotionEngine } from "@/components/motion-engine";
import "./globals.css";

const bodyFont = Atkinson_Hyperlegible_Next({
  subsets: ["latin"],
  variable: "--font-atkinson",
  display: "swap",
  adjustFontFallback: false,
});
const headingFont = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
  adjustFontFallback: false,
});
const serifFont = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
  adjustFontFallback: false,
});
const monoFont = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-mono",
  display: "swap",
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://careers.acesintelligence.xyz"),
  title: {
    default: "ACES Careers — Open Roles & Specialist Opportunities",
    template: "ACES Careers — %s",
  },
  description:
    "Find open roles in data annotation, model evaluation, quality assurance, and engineering, or join the ACES Intelligence Domain Specialist Talent Pool.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${bodyFont.variable} ${headingFont.variable} ${serifFont.variable} ${monoFont.variable}`}
    >
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <EcosystemBar />
        {children}
        <MotionEngine />
        <Toaster position="bottom-right" richColors closeButton />
        <Script src="/aces-logo.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
