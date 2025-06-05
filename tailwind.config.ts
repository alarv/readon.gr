import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#6366f1",
          50: "#f0f0ff",
          100: "#e7e7ff",
          200: "#d2d2ff",
          300: "#b1b1ff",
          400: "#8b87ff",
          500: "#6366f1",
          600: "#5a5ae8",
          700: "#4c4dd4",
          800: "#3e3faa",
          900: "#353687",
          950: "#1f1f51",
        },
        secondary: {
          DEFAULT: "#a855f7",
          50: "#faf5ff",
          100: "#f3e8ff",
          200: "#e9d5ff",
          300: "#d8b4fe",
          400: "#c084fc",
          500: "#a855f7",
          600: "#9333ea",
          700: "#7c3aed",
          800: "#6b21a8",
          900: "#581c87",
          950: "#3b0764",
        },
        accent: {
          DEFAULT: "#06b6d4",
          50: "#ecfeff",
          100: "#cffafe",
          200: "#a5f3fc",
          300: "#67e8f9",
          400: "#22d3ee",
          500: "#06b6d4",
          600: "#0891b2",
          700: "#0e7490",
          800: "#155e75",
          900: "#164e63",
          950: "#083344",
        },
        // Readon brand gradient colors
        readon: {
          purple: "#a855f7",
          violet: "#8b5cf6", 
          indigo: "#6366f1",
          blue: "#3b82f6",
          cyan: "#06b6d4",
        },
      },
      backgroundImage: {
        'readon-gradient': 'linear-gradient(to right, #a855f7, #8b5cf6, #6366f1, #3b82f6, #06b6d4)',
        'readon-gradient-vertical': 'linear-gradient(to bottom, #a855f7, #8b5cf6, #6366f1, #3b82f6, #06b6d4)',
      },
    },
  },
  plugins: [],
};

export default config;