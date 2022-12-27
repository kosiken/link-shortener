/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        buttonColor: '#8ec625',
        buttonTextColor: '#282860',
        cardBg: '#1e293b',
      }
    },
  },
  plugins: [],
}
