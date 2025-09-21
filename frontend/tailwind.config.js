/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#4A4E9D',
        'primary-dark': '#2A2D5C',
        'accent': '#8A5CF5',
        'accent-hover': '#7b4cdb',
        'cta': '#5256ad',
      },
    },
  },
  plugins: [],
}