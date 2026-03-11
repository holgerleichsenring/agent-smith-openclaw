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
        bg: { DEFAULT: "#0a0a0a", surface: "#141414", border: "#262626" },
        human: { DEFAULT: "#f59e0b", dim: "#78350f" },
        agent: { DEFAULT: "#06b6d4", dim: "#164e63" },
        text: { DEFAULT: "#e5e5e5", muted: "#737373" },
      },
      fontFamily: {
        serif: ["Georgia", "Times New Roman", "serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
