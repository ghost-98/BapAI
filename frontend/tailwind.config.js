/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        purple: {
          500: '#8B5CF6',
          600: '#7C3AED',
        },
        pink: {
          400: '#EC4899',
          500: '#D946EF',
        },
        orange: {
          50: '#FFF7ED',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
          700: '#C2410C',
        },
        amber: {
          50: '#FFFBEB',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
        },
        rose: {
          50: '#FFF1F2',
          200: '#FECDD3',
          300: '#FDA4AF',
          400: '#FB7185',
          500: '#F43F5E',
          600: '#E11D48',
        },
        cyan: {
          300: '#67E8F9',
          400: '#22D3EE',
          500: '#06B6D4',
        },
        blue: {
          400: '#60A5FA',
          500: '#3B82F6',
        },
        zinc: {
          300: '#D4D4D8',
          400: '#A1A1AA',
          500: '#71717A',
          700: '#3F3F46',
          800: '#27272A',
          900: '#18181B',
          950: '#09090B',
        }
      }
    },
  },
  plugins: [],
}