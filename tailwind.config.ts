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
        background: "var(--background)",
        foreground: "var(--foreground)",
        "accent-sage": "#7C9070",
        "accent-terracotta": "#D4845E",
        "accent-blue": "#5B9BD5",
        "bg-card": "#FFFFFF",
        "bg-page": "#F7F6F3",
        "border-subtle": "#F0EFEC",
        "text-primary": "#2D2D2D",
        "text-secondary": "#6B6B6B",
        "text-tertiary": "#8E8E93",
      },
      fontFamily: {
        fraunces: ["var(--font-fraunces)", "serif"],
        jakarta: ["var(--font-jakarta)", "sans-serif"],
      },
      borderRadius: {
        btn: "10px",
        card: "16px",
      },
    },
  },
  plugins: [],
};
export default config;
