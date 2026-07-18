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
        "dark-darken": "#050505",
        "cinema-black": "#000000",
        "cinema-charcoal": "#0a0a0a",
        "cinema-smoke": "#111111",
        "cinema-steel": "#1a1a1a",
        "cinema-ash": "#222222",
        accent: {
          orange: "#ff6b35",
          ember: "#ff4500",
          gold: "#fbbf24",
          cyan: "#06b6d4",
        },
      },
      fontFamily: {
        outfit: ["Outfit", "ui-sans-serif", "system-ui", "sans-serif"],
        bebas: ["Bebas Neue", "sans-serif"],
        inter: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        heading: ["var(--sl-font-heading)", "sans-serif"],
        ui: ["var(--sl-font-ui)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      gridTemplateColumns: {
        sm: "repeat(auto-fill, minmax(130px, 1fr))",
        lg: "repeat(auto-fill, minmax(160px, 1fr))",
      },
      boxShadow: {
        "cinema-glow": "0 0 40px rgba(255, 107, 53, 0.15), 0 0 80px rgba(255, 107, 53, 0.05)",
        "cinema-card": "0 8px 32px rgba(0, 0, 0, 0.6), 0 2px 8px rgba(0, 0, 0, 0.4)",
        "cinema-hover": "0 16px 48px rgba(255, 107, 53, 0.25), 0 8px 24px rgba(0, 0, 0, 0.5)",
        "glass-subtle": "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
        "premium-lg": "0 20px 60px -15px rgba(0, 0, 0, 0.7)",
        "neon-primary": "0 0 20px rgba(255, 107, 53, 0.4), 0 0 60px rgba(255, 107, 53, 0.15), 0 0 100px rgba(255, 107, 53, 0.05)",
      },
      borderRadius: {
        "cinema": "1.25rem",
        "cinema-lg": "1.5rem",
        "cinema-xl": "2rem",
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "fade-in-up": "fadeInUp 0.7s ease-out forwards",
        "fade-in-down": "fadeInDown 0.5s ease-out forwards",
        "scale-in": "scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "slide-up": "slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "glow-pulse": "glowPulse 3s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "cinema-reveal": "cinemaReveal 1s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "gradient-x": "gradientX 8s ease infinite",
        "text-shimmer": "textShimmer 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeInDown: {
          "0%": { opacity: "0", transform: "translateY(-20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(40px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(255, 107, 53, 0.2)" },
          "50%": { boxShadow: "0 0 40px rgba(255, 107, 53, 0.4), 0 0 80px rgba(255, 107, 53, 0.1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        cinemaReveal: {
          "0%": { opacity: "0", transform: "translateY(60px) scale(0.95)", filter: "blur(10px)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)", filter: "blur(0px)" },
        },
        gradientX: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        textShimmer: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "cinema-vignette": "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.8) 100%)",
        "cinema-fade-b": "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.95) 100%)",
        "cinema-fade-r": "linear-gradient(to right, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 40%, transparent 100%)",
        "cinema-fade-t": "linear-gradient(to top, transparent 0%, rgba(0,0,0,0.7) 100%)",
      },
      transitionTimingFunction: {
        "cinema": "cubic-bezier(0.16, 1, 0.3, 1)",
        "cinema-bounce": "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      backdropBlur: {
        "cinema": "40px",
        "cinema-heavy": "60px",
      },
    },
  },
  plugins: [],
};
