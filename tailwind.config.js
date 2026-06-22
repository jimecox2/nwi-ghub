/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx,md,mdx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        // Breakpoint at which the desktop nav appears / hamburger hides
        nav: "800px",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
