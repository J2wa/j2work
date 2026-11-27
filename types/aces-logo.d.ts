import type { DetailedHTMLProps, HTMLAttributes } from "react";

interface AcesLogoAttributes
  extends DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> {
  size?: string | number;
  href?: string;
  target?: string;
  rel?: string;
  theme?: "light" | "dark" | "mono" | "auto";
  wordmark?: "auto" | "show" | "hide";
  animate?: "intro" | "none";
  track?: "on" | "off";
  loading?: boolean;
  label?: string;
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "aces-logo": AcesLogoAttributes;
    }
  }
}
