/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#F2FBF6',
          100: '#E1F6EB',
          200: '#C2EDD6',
          300: '#93DEB6',
          400: '#52B788',
          500: '#40916C',
          600: '#2D6A4F',
          700: '#1B4332',
          800: '#143527',
          900: '#0B2017',
        },
        warm: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
          700: '#C2410C',
        },
        cream: {
          50: '#FAF9F6',
          100: '#F5F3EC',
          200: '#EEEADE',
          300: '#E4DEC9',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      boxShadow: {
        soft: '0 4px 20px -2px rgba(27, 67, 50, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        hover: '0 12px 30px -4px rgba(27, 67, 50, 0.12), 0 4px 10px -2px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
};
