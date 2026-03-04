/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'blast-dark': '#0F1117',
        'blast-navy': '#1a1f3a',
      },
    },
  },
  plugins: [],
};
