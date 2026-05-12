/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#EEF6FD',
          100: '#DAECfB',
          200: '#B5D6F7',
          300: '#79B8F0',
          400: '#4C9AE3',
          500: '#2B7FD4',
          600: '#2460B0',
          700: '#1E4E96',
          800: '#1A3F7A',
          900: '#0D2347',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
      animation: {
        'slide-up':  'slideUp 0.25s ease both',
        'fade-in':   'fadeIn 0.2s ease both',
        'pulse-dot': 'pulseDot 1.5s ease-in-out infinite',
      },
      keyframes: {
        slideUp:  {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn:   {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        pulseDot: {
          '0%, 100%': { transform: 'scale(1)',   opacity: '1'   },
          '50%':      { transform: 'scale(1.4)', opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
}
