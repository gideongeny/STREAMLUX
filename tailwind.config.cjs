/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        dark: "#0b0b0f",
        "dark-lighten": "#14141a",
        "dark-lighten-2": "#1b1b24",
        "gray-lighten": "#b3b3c1",
      },
      fontFamily: {
        roboto: ["Roboto", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
