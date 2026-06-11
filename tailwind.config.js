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
        // Bleu de marque — unifié avec l'app mobile (#0078FF)
        brand: {
          50:  '#E6F1FF',
          100: '#CCE4FF',
          200: '#99C9FF',
          300: '#66ADFF',
          400: '#3392FF',
          500: '#0078FF',
          600: '#0060CC',
          700: '#004899',
          800: '#003066',
          900: '#001833',
          950: '#000C1A',
        },
        // Cyan secondaire — unifié avec l'app mobile (#1ABCCC)
        accent: {
          50:  '#E8F9FB',
          100: '#C7F1F5',
          200: '#94E5EC',
          300: '#5FD6E1',
          400: '#33C7D5',
          500: '#1ABCCC',
          600: '#1597A4',
          700: '#11737D',
          800: '#0C4F56',
          900: '#082B2F',
          950: '#04181A',
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
        'glow':    '0 0 20px -4px rgb(0 120 255 / 0.3)',
        'glow-lg': '0 0 40px -8px rgb(0 120 255 / 0.4)',
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
