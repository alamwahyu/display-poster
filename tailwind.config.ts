import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17202A",
        panel: "#F7F8FA",
        line: "#E5E8EC",
        accent: "#1D6F68",
        warn: "#B45309"
      }
    }
  },
  plugins: []
};

export default config;
