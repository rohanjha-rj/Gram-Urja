/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#16a34a',
        'primary-dark': '#14532d',
        'sky-blue': '#0284c7',
        'solar-yellow': '#f59e0b',
        'navy': '#0f172a',
        'surface': '#f8fafc',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
