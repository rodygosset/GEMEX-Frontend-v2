const colors = require('tailwindcss/colors')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    colors: {
      ...colors,
      'primary': '#2962FF',
      'secondary': '#AA00FA',
      'success': '#16B364',
      'warning': '#FFA200',
      'error': '#D92D20'
    },
    fontFamily: {
      'sans': ['Josefin Sans', 'sans-serif'],
    },
    fontSize: {
      xs: '1.2rem',
      sm: '1.4rem',
      base: '1.6rem',
      xl: '2rem',
      '2xl': '2.4rem',
      '3xl': '3.4rem',
      '4xl': '4.8rem',
      '5xl': '6rem',
    },
    extend: {},
  },
  plugins: [
    require("tailwindcss-animate"),
    require("autoprefixer")
  ],
}

