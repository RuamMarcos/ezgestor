/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js,jsx,ts,tsx,vue}", 
    "./public/index.html",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}


/** @type {import('tailwindcss').Config} */
export default {
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
