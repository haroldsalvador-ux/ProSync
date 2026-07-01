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
          DEFAULT: '#c4005a',
          dark:    '#a50044',
          light:   '#ff2d7e',
        },
        // Acento vibrante secundario — coherente con la app de usuarios
        accent: {
          DEFAULT: '#22d3ee',
          dark:    '#0891b2',
          light:   '#67e8f9',
        },
      },
      backgroundImage: {
        'blaugrana': 'linear-gradient(135deg, #0d1b30 0%, #1b2a4e 38%, #2a0a22 72%, #0d1b30 100%)',
        'glass-sheen': 'linear-gradient(135deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.03) 100%)',
      },
      boxShadow: {
        'glass':             '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
        'glass-lg':          '0 20px 60px rgba(0,0,0,0.5)',
        'neon-burgundy':     '0 0 22px rgba(196,0,90,0.45)',
        'neon-burgundy-lg':  '0 0 38px rgba(196,0,90,0.6)',
        'neon-accent':       '0 0 22px rgba(34,211,238,0.45)',
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
