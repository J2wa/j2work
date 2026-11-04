import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL("https://careers.acesintelligence.xyz"),
  title: {
    default: "Careers at ACES Intelligence",
    template: "%s | ACES Careers",
  },
  description:
    "Bring your expertise to the future of AI. Explore opportunities in data annotation, model evaluation, quality assurance, and AI engineering at ACES Intelligence.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {children}
        <Toaster position="bottom-right" richColors closeButton />
      </body>
    </html>
  );
}
