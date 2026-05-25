/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#EEEDFB',
          100: '#D5D4F7',
          200: '#ABAAF0',
          300: '#807FE8',
          400: '#5655E1',
          500: '#3B37E9',
          600: '#2F2BBC',
          700: '#23208F',
          800: '#171561',
          900: '#0B0A34',
        },
        // accent = brand pour un design unifié (supprime le teal)
        accent: {
          50:  '#EEEDFB',
          100: '#D5D4F7',
          200: '#ABAAF0',
          300: '#807FE8',
          400: '#5655E1',
          500: '#3B37E9',
          600: '#2F2BBC',
          700: '#23208F',
          800: '#171561',
          900: '#0B0A34',
        },
        // Tokens sémantiques liés aux variables CSS
        background: 'rgb(var(--bg) / <alpha-value>)',
        foreground:  'rgb(var(--fg) / <alpha-value>)',
        card: {
          DEFAULT:    'rgb(var(--card) / <alpha-value>)',
          foreground: 'rgb(var(--card-fg) / <alpha-value>)',
        },
        muted: {
          DEFAULT:    'rgb(var(--muted) / <alpha-value>)',
          foreground: 'rgb(var(--muted-fg) / <alpha-value>)',
        },
        border: 'rgb(var(--border) / <alpha-value>)',
        input:  'rgb(var(--input) / <alpha-value>)',
        ring:   'rgb(var(--ring) / <alpha-value>)',
      },
      fontFamily: {
        sans:    ['Outfit', 'Segoe UI', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft':    '0 2px 8px -2px rgb(0 0 0 / 0.06), 0 4px 16px -4px rgb(0 0 0 / 0.08)',
        'soft-lg': '0 4px 16px -4px rgb(0 0 0 / 0.08), 0 8px 32px -8px rgb(0 0 0 / 0.12)',
        'glow':    '0 0 20px -4px rgb(59 55 233 / 0.3)',
        'glow-lg': '0 0 40px -8px rgb(59 55 233 / 0.4)',
      },
      animation: {
        'slide-up':   'slideUp 0.25s ease both',
        'slide-down': 'slideDown 0.2s ease both',
        'fade-in':    'fadeIn 0.2s ease both',
        'pulse-dot':  'pulseDot 1.5s ease-in-out infinite',
        'float':      'float 6s ease-in-out infinite',
        'blob':       'blob 8s ease-in-out infinite',
      },
      keyframes: {
        slideUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          from: { opacity: '0', transform: 'translateY(-8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        pulseDot: {
          '0%, 100%': { transform: 'scale(1)',   opacity: '1'   },
          '50%':      { transform: 'scale(1.4)', opacity: '0.7' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        blob: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%':      { transform: 'translate(20px, -30px) scale(1.05)' },
          '66%':      { transform: 'translate(-15px, 15px) scale(0.95)' },
        },
      },
    },
  },
  plugins: [],
}
