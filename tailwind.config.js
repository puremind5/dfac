/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        blink: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(0.1)' },
        },
        wave: {
          '0%, 100%': { transform: 'rotate(-12deg)' },
          '50%': { transform: 'rotate(12deg)' },
        },
        dropBanana: {
          '0%': { 
            transform: 'translateX(-50%) translateY(0)',
            opacity: '0'
          },
          '20%': {
            opacity: '1'
          },
          '100%': { 
            transform: 'translateX(-50%) translateY(140px)',
            opacity: '1'
          }
        }
      },
      animation: {
        blink: 'blink 3s infinite',
        wave: 'wave 2s infinite',
        dropBanana: 'dropBanana 0.5s ease-in forwards'
      }
    },
  },
  plugins: [],
}