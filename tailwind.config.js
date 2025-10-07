/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f6f8f4',
          100: '#e3e9dd',
          200: '#c7d3bc',
          300: '#a5b594',
          400: '#87996f',
          500: '#6d7f55',
          600: '#556543',
          700: '#444f36',
          800: '#38402e',
          900: '#303629',
        },
        sage: {
          50: '#f7f8f6',
          100: '#e8ebe5',
          200: '#d1d7ca',
          300: '#adb9a3',
          400: '#8a9879',
          500: '#6f7d5f',
          600: '#57644b',
          700: '#454f3d',
          800: '#3a4133',
          900: '#32372c',
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
