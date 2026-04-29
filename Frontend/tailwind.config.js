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
          DEFAULT: '#1C4CA5',
          light: '#3163C4',
          dark: '#14387D',
        },
        secondary: {
          DEFAULT: '#FF5500',
          light: '#FF7733',
          dark: '#CC4400',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
