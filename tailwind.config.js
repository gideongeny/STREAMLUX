/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#ff6b35",
        dark: "#0f172a",
        "dark-lighten": "#1e293b",
        "dark-lighten-2": "#334155",
        "gray-lighten": "#94a3b8",
        "gray-darken": "#4b5563",
      },
      fontFamily: {
        roboto: ["Roboto", "sans-serif"],
      },
      gridTemplateColumns: {
        sm: "repeat(auto-fill, minmax(130px, 1fr))",
        lg: "repeat(auto-fill, minmax(160px, 1fr))",
      },
    },
  },
  plugins: [],
};
