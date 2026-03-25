/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        dark: "var(--sl-surface-0)",
        "dark-lighten": "var(--sl-surface-1)",
        "dark-lighten-2": "var(--sl-surface-2)",
        "gray-lighten": "var(--sl-text-muted)",
      },
      fontFamily: {
        roboto: ["Roboto", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
