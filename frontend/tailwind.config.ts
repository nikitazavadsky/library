import { type Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    fontFamily: {
      sans: ['Raleway', 'sans-serif'],
    },
    extend: {},
  },
  daisyui: {
    themes: ["emerald"],
  },
  plugins: [require("daisyui")],
} satisfies Config;
