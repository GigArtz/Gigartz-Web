/* Tailwind Config Additions for Custom Animations */

module.exports = {
  // ... existing config
  theme: {
    extend: {
      // ... existing extensions
      animation: {
        "fade-in-up": "fadeInUp 0.6s ease-out forwards",
        "fade-in-left": "fadeInLeft 0.6s ease-out forwards",
        "fade-in-right": "fadeInRight 0.6s ease-out forwards",
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "slide-in-up": "slideInUp 0.5s ease-out forwards",
        "slide-in-left": "slideInLeft 0.5s ease-out forwards",
        "slide-in-right": "slideInRight 0.5s ease-out forwards",
        "slide-down": "slideDown 0.4s ease-out forwards",
        "bounce-in": "bounceIn 0.8s ease-out forwards",
      },
      keyframes: {
        fadeInUp: {
          "0%": {
            opacity: "0",
            transform: "translate3d(0, 40px, 0)",
          },
          "100%": {
            opacity: "1",
            transform: "translate3d(0, 0, 0)",
          },
        },
        fadeInLeft: {
          "0%": {
            opacity: "0",
            transform: "translate3d(-40px, 0, 0)",
          },
          "100%": {
            opacity: "1",
            transform: "translate3d(0, 0, 0)",
          },
        },
        fadeInRight: {
          "0%": {
            opacity: "0",
            transform: "translate3d(40px, 0, 0)",
          },
          "100%": {
            opacity: "1",
            transform: "translate3d(0, 0, 0)",
          },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideInUp: {
          "0%": {
            opacity: "0",
            transform: "translate3d(0, 20px, 0)",
          },
          "100%": {
            opacity: "1",
            transform: "translate3d(0, 0, 0)",
          },
        },
        slideInLeft: {
          "0%": {
            opacity: "0",
            transform: "translate3d(-30px, 0, 0)",
          },
          "100%": {
            opacity: "1",
            transform: "translate3d(0, 0, 0)",
          },
        },
        slideInRight: {
          "0%": {
            opacity: "0",
            transform: "translate3d(30px, 0, 0)",
          },
          "100%": {
            opacity: "1",
            transform: "translate3d(0, 0, 0)",
          },
        },
        slideDown: {
          "0%": {
            opacity: "0",
            transform: "translate3d(0, -20px, 0)",
          },
          "100%": {
            opacity: "1",
            transform: "translate3d(0, 0, 0)",
          },
        },
        bounceIn: {
          "0%": {
            opacity: "0",
            transform: "scale3d(0.3, 0.3, 0.3)",
          },
          "50%": {
            opacity: "1",
          },
          "60%": {
            transform: "scale3d(1.1, 1.1, 1.1)",
          },
          "75%": {
            transform: "scale3d(0.9, 0.9, 0.9)",
          },
          "100%": {
            opacity: "1",
            transform: "scale3d(1, 1, 1)",
          },
        },
      },
    },
  },
  // ... rest of config
};
