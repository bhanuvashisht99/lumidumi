/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      cream: {
        50: '#FAFAF9', // Warm Alabaster (was #FEFCF8)
        100: '#F5F5F4', // Light Stone (was #F7F3E9)
        200: '#E7E5E4', // Warm Grey (was #E8DCC0)
        300: '#C5A059', // Muted Metallic Gold (was #D4AF37)
      },
      charcoal: '#1C1917', // Warm Black (was #2C2C2C)
      'charcoal-light': '#44403C', // Stone Grey
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
    },
  },
  plugins: [],
}