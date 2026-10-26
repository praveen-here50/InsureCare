import type { Config } from "tailwindcss";

const brand = {
  50: "#F1F6FE", 100: "#E1ECFD", 200: "#C3D8FB", 300: "#96BBF8", 400: "#5F96F2",
  500: "#3B74E8", 600: "#2557D6", 700: "#1F46B5", 800: "#1E3B8F", 900: "#1C3270", 950: "#121F47",
};

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      // `teal` is aliased to the brand indigo so every existing page picks up the new palette.
      colors: { brand, teal: brand },
      keyframes: {
        "fade-up": { from: { opacity: "0", transform: "translateY(14px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        grow: { from: { transform: "scaleX(0)" }, to: { transform: "scaleX(1)" } },
      },
      animation: {
        "fade-up": "fade-up .7s cubic-bezier(.22,1,.36,1) both",
        "fade-in": "fade-in .45s ease-out both",
        grow: "grow .9s cubic-bezier(.22,1,.36,1) both",
      },
    },
  },
  plugins: [],
};

export default config;
