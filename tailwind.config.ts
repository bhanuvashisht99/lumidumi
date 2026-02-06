/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FFFCF5', // Beeswax White
          100: '#F9EED9', // Soft Soy
          200: '#E8DCC0',
          300: '#D4A35C', // Honey Gold
        },
        charcoal: '#2D2A26', // Off-black
        earth: '#8C7E6A', // Earth Taupe for secondary text
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
    },
  },
  plugins: [],
}