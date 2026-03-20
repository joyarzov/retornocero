/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        'serif': ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
        'mono': ['Courier New', 'monospace'],
      },
      colors: {
        chord: {
          light: '#1d4ed8',  // blue-700
          dark: '#fb923c',   // orange-400
        }
      }
    },
  },
  plugins: [],
}
