/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#004170',
          dark:    '#0a1628',
          deep:    '#06101a',
          mid:     '#162040',
          light:   '#1e3a5f',
        },
        burgundy: {
          DEFAULT: '#a50044',
          dark:    '#7d0033',
          light:   '#cc0055',
        },
      },
      backgroundImage: {
        'blaugrana': 'linear-gradient(135deg, #0a1628 0%, #162040 40%, #1a0614 70%, #0a1628 100%)',
      },
      boxShadow: {
        'glass':             '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
        'glass-lg':          '0 20px 60px rgba(0,0,0,0.5)',
        'neon-burgundy':     '0 0 20px rgba(165,0,68,0.35)',
        'neon-burgundy-lg':  '0 0 35px rgba(165,0,68,0.55)',
        'neon-blue':         '0 0 20px rgba(0,65,112,0.4)',
      },
      animation: {
        'float':       'float 6s ease-in-out infinite',
        'pulse-slow':  'pulse 4s ease-in-out infinite',
        'fade-in':     'fadeIn 0.4s ease-out',
        'slide-up':    'slideUp 0.4s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
