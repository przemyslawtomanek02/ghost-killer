import { defineTheme } from "@astryxdesign/core/theme";
import { stoneTheme } from "@astryxdesign/theme-stone/built";

// stone's own accent is monochrome (near-black/near-white) — we want stone's
// warm, earthy neutrals and shape language, but with Facebook's blue as the
// accent instead.
//
// This is a literal override, not `expandColorScale({accent: "#1877F2"})`:
// that generator always lightens the dark-mode value for contrast (HCT tone
// spacing), and it does so almost identically regardless of the seed hue —
// #1877F2 and a prior seed both came out as a pale periwinkle
// (~#B7C3FF/#BCC2FF), nothing like Facebook's actual blue. Since the app
// only ever renders in dark mode (mode="dark" in Providers), we can just
// hardcode the one value that's actually seen: Facebook's blue itself, with
// white on-accent text (matches how Facebook uses its own blue).
//
// Matches the "stone" theme's own type pairing (Figtree body / Montserrat
// headings / JetBrains Mono code), self-hosted via next/font (app/fonts.ts)
// instead of stone's literal family names, which aren't loaded anywhere.
// `family` must be a single space-free token or defineTheme wraps the whole
// string in quotes — so the var() reference goes in `family` and the
// fallback stack in `fallbacks`, appended unquoted after it.
export const brandTheme = defineTheme({
  name: "analyss",
  extends: stoneTheme,
  tokens: {
    "--color-accent": "#1877F2",
    "--color-accent-muted": "color-mix(in srgb, var(--color-accent) 20%, transparent)",
    "--color-on-accent": "#FFFFFF",
    "--color-text-accent": "var(--color-accent)",
    "--color-icon-accent": "var(--color-accent)",
  },
  typography: {
    body: {
      family: "var(--font-figtree)",
      fallbacks:
        'Figtree, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    },
    heading: {
      family: "var(--font-montserrat)",
      fallbacks:
        'Montserrat, Figtree, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      weights: { 3: "bold", 4: "bold" },
    },
    code: {
      family: "var(--font-jetbrains-mono)",
      fallbacks: '"JetBrains Mono", "SF Mono", Monaco, Consolas, monospace',
    },
  },
});

// Borderless, filled inputs and cards (astryx.atmeta.com's own "smooth" look).
// This can't be done through defineTheme's `components` override: that CSS
// lands inside the same `astryx-base` cascade layer as Astryx's own
// component styles, and those StyleX-generated rules boost their own
// specificity with a `:not(#\#):not(#\#)` hack specifically so ordinary
// same-layer overrides can't beat them. The only thing that reliably wins
// against a layered rule regardless of specificity is an *unlayered* one —
// see app/globals.css, which is deliberately left outside any @layer for
// exactly this override.
