/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1B5E20', // Deep Forest Green
          dark: '#0d3c11',
          light: '#2e7d32',
        },
        secondary: {
          DEFAULT: '#2E7D32', // Medium Green
          light: '#4caf50',
          dark: '#1b5e20',
        },
        accent: {
          DEFAULT: '#FFB300', // Warm Amber/Yellow
          dark: '#ff8f00',
          light: '#ffe082',
        },
        customBg: '#F8FAF8', // Off-white Greenish
        customText: '#1E293B', // Slate
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
