import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Palette SOSLocal — bleu de marque #0078FF (unifié mobile)
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
        },
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
        },
        // Couleurs sémantiques utilisant CSS variables (theme-aware)
        background: 'rgb(var(--bg) / <alpha-value>)',
        foreground: 'rgb(var(--fg) / <alpha-value>)',
        card: 'rgb(var(--card) / <alpha-value>)',
        'card-foreground': 'rgb(var(--card-fg) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        'muted-foreground': 'rgb(var(--muted-fg) / <alpha-value>)',
        border: 'rgb(var(--border) / <alpha-value>)',
        input: 'rgb(var(--input) / <alpha-value>)',
        ring: 'rgb(var(--ring) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Outfit', 'Segoe UI', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Outfit', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      animation: {
        'slide-up':       'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-down':     'slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-in-right': 'slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in':        'fadeIn 0.3s ease both',
        'fade-in-slow':   'fadeIn 0.8s ease both',
        'scale-in':       'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both',
        'pulse-dot':      'pulseDot 1.5s ease-in-out infinite',
        'float':          'float 6s ease-in-out infinite',
        'gradient':       'gradient 8s linear infinite',
        'shimmer':        'shimmer 2.5s infinite',
        'blob':           'blob 7s infinite',
      },
      keyframes: {
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          from: { opacity: '0', transform: 'translateY(-20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(20px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        pulseDot: {
          '0%,100%': { transform: 'scale(1)', opacity: '1' },
          '50%':     { transform: 'scale(1.4)', opacity: '0.7' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%':     { transform: 'translateY(-20px)' },
        },
        gradient: {
          '0%,100%': { backgroundPosition: '0% 50%' },
          '50%':     { backgroundPosition: '100% 50%' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        blob: {
          '0%,100%': { transform: 'translate(0, 0) scale(1)' },
          '33%':     { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%':     { transform: 'translate(-20px, 20px) scale(0.9)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-mesh':
          'radial-gradient(at 27% 37%, hsla(215, 98%, 61%, 0.15) 0px, transparent 50%), radial-gradient(at 97% 21%, hsla(178, 100%, 56%, 0.1) 0px, transparent 50%), radial-gradient(at 52% 99%, hsla(215, 78%, 32%, 0.08) 0px, transparent 50%), radial-gradient(at 10% 29%, hsla(178, 75%, 39%, 0.12) 0px, transparent 50%)',
      },
      boxShadow: {
        'glow':       '0 0 20px rgb(0 169 157 / 0.3)',
        'glow-lg':    '0 0 40px rgb(0 169 157 / 0.4)',
        'soft':       '0 2px 8px -2px rgb(0 0 0 / 0.04), 0 4px 16px -4px rgb(0 0 0 / 0.08)',
        'soft-lg':    '0 4px 16px -4px rgb(0 0 0 / 0.08), 0 8px 32px -8px rgb(0 0 0 / 0.12)',
      },
    },
  },
  plugins: [],
}

export default config
