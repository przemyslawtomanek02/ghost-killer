import { Figtree, Montserrat, JetBrains_Mono } from "next/font/google";

// Matches Astryx's "stone" theme typography (Figtree body / Montserrat
// headings / JetBrains Mono code), self-hosted via next/font instead of
// stone's own @font-face — see app/astryx-theme.ts and globals.css for how
// these variables get wired into both Astryx and Tailwind's font-sans.
export const figtree = Figtree({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-figtree",
  display: "swap",
});

export const montserrat = Montserrat({
  subsets: ["latin", "latin-ext"],
  weight: ["600", "700", "800"],
  variable: "--font-montserrat",
  display: "swap",
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});
