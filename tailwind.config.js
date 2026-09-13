/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#0A0E17',
          card: '#121824',
          border: '#1F293D',
          hover: '#1A2336',
          violet: '#8B5CF6',
          purple: '#A855F7',
          cyan: '#06B6D4',
          emerald: '#10B981',
          rose: '#F43F5E',
          amber: '#F59E0B'
        }
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ripple': 'ripple 1.8s infinite ease-out',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: 1, filter: 'drop-shadow(0 0 12px rgba(239, 68, 68, 0.8))' },
          '50%': { opacity: 0.7, filter: 'drop-shadow(0 0 4px rgba(239, 68, 68, 0.3))' },
        },
        'ripple': {
          '0%': { transform: 'scale(0.8)', opacity: 1 },
          '100%': { transform: 'scale(2.5)', opacity: 0 }
        }
      }
    },
  },
  plugins: [],
}
