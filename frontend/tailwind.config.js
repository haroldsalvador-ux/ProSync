/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#004170',
          dark:    '#002d4f',
          light:   '#005a9e',
        },
        burgundy: {
          DEFAULT: '#a50044',
          dark:    '#7d0033',
          light:   '#cc0055',
        },
      },
    },
  },
  plugins: [],
};
