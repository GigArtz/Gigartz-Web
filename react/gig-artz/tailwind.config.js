// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0DE2D6",       // Custom color for primary
        secondary: "#EF29DB",     // Custom color for secondary
        background: "#060512",    // Custom background color
        textPrimary: "#fff",      // White text color
        textSecondary: "rgba(13, 226, 214, 0.7)", // Secondary text color
        buttonBackground: "rgba(0, 0, 0, 0.3)",  // Button background
        error: "#ff4d4d",         // Error color
        success: "#4CAF50",       // Success color
      },
      spacing: {
        small: '8px',
        medium: '16px',
        large: '20px',
      },
      fontSize: {
        base: '16px',
        lg: '18px',
        xl: '24px',
        '2xl': '28px',
      },
      borderRadius: {
        DEFAULT: '10px',
        large: '20px',
      },
      boxShadow: {
        DEFAULT: '0 4px 6px rgba(0, 0, 0, 0.1)',
      },
      gradientColorStops: {
        primary: ["rgba(13, 226, 214, 0.7)", "rgba(239, 41, 219, 0.7)"],
      },
    },
  },
  plugins: [],
};
