// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // BreachFix Color Palette
        'breachfix-navy': '#0D1B2A',        // Deep Navy background
        'breachfix-gold': '#FFD166',         // Gold primary accent
        'breachfix-white': '#F8F9FA',        // Soft white text
        'breachfix-emerald': '#2A9D8F',      // Emerald secondary
        'breachfix-sage': '#88C999',         // Sage green alternative
        'breachfix-gray': '#6C757D',         // Neutral gray
        'breachfix-dark': '#1A1A1A',         // Dark background variant
        
        // Legacy Netflix colors (for gradual migration)
        'netflix-red': '#e50914',
        'netflix-black': '#000000',
        'netflix-dark-gray': '#141414',
        'netflix-gray': '#333333',
        'netflix-light-gray': '#808080',
        'netflix-white': '#ffffff',
      },
      fontFamily: {
        'sans': ['Netflix Sans', 'Arial', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(100%)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
