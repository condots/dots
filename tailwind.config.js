/** @type {import('tailwindcss').Config} */
import typography from "@tailwindcss/typography";

export default {
  content: [
    "./index.html",
    "./node_modules/primereact/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        lato: ["Lato", "sans-serif"],
        roboto: ["Roboto Slab", "sans-serif"],
      },
      colors: {
        spdx: {
          dark: "#00416b",
          light: "#b3dbff",
        },
      },
    },
  },
  plugins: [typography],
};
