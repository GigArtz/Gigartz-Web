// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0DE2D6", // Custom color for primary
        secondary: "#EF29DB", // Custom color for secondary
        background: "#060512", // Custom background color
        textPrimary: "#fff", // White text color
        textSecondary: "rgba(13, 226, 214, 0.7)", // Secondary text color
        buttonBackground: "rgba(0, 0, 0, 0.3)", // Button background
        error: "#ff4d4d", // Error color
        success: "#4CAF50", // Success color
      },
      spacing: {
        small: "8px",
        medium: "16px",
        large: "20px",
      },
      fontSize: {
        base: "16px",
        lg: "18px",
        xl: "24px",
        "2xl": "28px",
      },
      borderRadius: {
        DEFAULT: "10px",
        large: "20px",
      },
      boxShadow: {
        DEFAULT: "0 4px 6px rgba(0, 0, 0, 0.1)",
      },
      gradientColorStops: {
        primary: ["rgba(13, 226, 214, 0.7)", "rgba(239, 41, 219, 0.7)"],
      },
      keyframes: {
        fadeIn: { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
        fadeInUp: {
          "0%": { opacity: 0, transform: "translateY(20px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        popIn: {
          "0%": { transform: "scale(0.8)" },
          "100%": { transform: "scale(1)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%, 60%": { transform: "translateX(-5px)" },
          "40%, 80%": { transform: "translateX(5px)" },
        },
        bounceX: {
          "0%, 100%": { transform: "translateX(0)" },
          "50%": { transform: "translateX(8px)" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.5s ease",
        fadeInUp: "fadeInUp 0.5s ease",
        popIn: "popIn 0.3s cubic-bezier(.68,-0.55,.27,1.55)",
        shake: "shake 0.4s",
        bounceX: "bounceX 0.6s",
      },
    },
  },
  plugins: [],
};
