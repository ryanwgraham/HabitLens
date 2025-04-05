/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#FF6B6B',
          DEFAULT: '#FF4949',
          dark: '#FF2727',
        },
        secondary: {
          light: '#4ECDC4',
          DEFAULT: '#45B7AF',
          dark: '#3CA29A',
        },
        accent: {
          yellow: '#FFE66D',
          purple: '#6C63FF',
          pink: '#FF6B9C',
        },
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};