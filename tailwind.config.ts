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
        bi: {
          navy: "#003366",
          gold: "#FFCC00",
          gray: "#F4F4F4",
        },
        status: {
          safe: "#22c55e",
          warning: "#f97316",
          danger: "#ef4444",
        },
      },
      fontFamily: {
        sans: ["Inter", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
