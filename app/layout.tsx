import type { Metadata } from "next";
import Script from "next/script";
import {
  Atkinson_Hyperlegible_Next,
  Bricolage_Grotesque,
} from "next/font/google";
import { Toaster } from "sonner";
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

export const metadata: Metadata = {
  metadataBase: new URL("https://careers.acesintelligence.xyz"),
  title: {
    default: "Careers at ACES Intelligence",
    template: "%s | ACES Careers",
  },
  description:
    "Find open roles in data annotation, model evaluation, quality assurance and engineering, or join the ACES Intelligence Domain Specialist Talent Pool.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${bodyFont.variable} ${headingFont.variable}`}>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {children}
        <Toaster position="bottom-right" richColors closeButton />
        <Script src="/aces-logo.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
