import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        night: "#131313",
        surface: "#201F1F",
        "surface-hover": "#2A2A2A",
        "surface-low": "#0E0E0E",
        "surface-high": "#353534",
        "surface-container-low": "#1C1B1B",
        terminal: "#000000",
        "code-bg": "#0B0B0B",
        panel: "#1A1A1A",
        "panel-high": "#222222",
        hairline: "#2A2A2A",
        "outline-variant": "#444748",
        ink: "#E5E2E1",
        "ink-variant": "#C4C7C8",
        gray2: "#A0A0A0",
        gray3: "#6B6B6B",
        primary: "#3D5AFE",
        "primary-light": "#BBC3FF",
        "primary-dim": "#2848EE",
        secondary: "#DDB7FF",
        "secondary-dim": "#6F00BE",
        accent: "#FFB599",
        "accent-dim": "#C04500",
        volt: "#B8EF43",
        cyan: "#00FFFF",
        magenta: "#FF00FF",
        amber: "#FFBF00",
        "code-keyword": "#C9C6C5",
        "code-string": "#8E9192",
        "code-func": "#FFFFFF",
        "code-comment": "#444748",
      },
      fontFamily: {
        headline: ["var(--font-inter)", "Inter", "sans-serif"],
        body: ["var(--font-inter)", "Inter", "sans-serif"],
        code: ["var(--font-jetbrains-mono)", "JetBrains Mono", "monospace"],
      },
      fontSize: {
        "display-lg": ["48px", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "700" }],
        "headline-lg": ["40px", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "700" }],
        "headline-md": ["32px", { lineHeight: "1.2", fontWeight: "600" }],
        "headline-sm": ["24px", { lineHeight: "1.3", fontWeight: "600" }],
        "body-lg": ["18px", { lineHeight: "1.6", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "1.5", fontWeight: "400" }],
        "body-sm": ["14px", { lineHeight: "1.5", fontWeight: "400" }],
        "code-md": ["13px", { lineHeight: "1.5", fontWeight: "400" }],
        "label-caps": ["12px", { lineHeight: "1", letterSpacing: "0.1em", fontWeight: "700" }],
        "label-xs": ["11px", { lineHeight: "1.4", fontWeight: "600" }],
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        sm: "0.125rem",
        md: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
      },
      keyframes: {
        "log-in": {
          "0%": { opacity: "0", transform: "translateY(2px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "log-in": "log-in 120ms ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
