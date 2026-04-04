import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        base: {
          950: "#050505",
          900: "#0b0b0c",
          800: "#121214",
          700: "#1c1c20",
          600: "#2b2b31",
        },
        gold: {
          50: "#fff8df",
          200: "#f6dd8f",
          300: "#e7c35b",
          400: "#c79e28",
        },
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(231,195,91,0.12), 0 20px 80px rgba(0,0,0,0.45)",
      },
      backgroundImage: {
        colosseum:
          "radial-gradient(circle at top, rgba(231,195,91,0.12), transparent 34%), radial-gradient(circle at bottom right, rgba(255,255,255,0.06), transparent 22%), linear-gradient(180deg, #111114 0%, #080808 100%)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui"],
      },
    },
  },
  plugins: [],
};

export default config;
