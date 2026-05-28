import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'surface': {
          950: '#0e0c15',
          900: '#16141f',
          700: '#1f1c2b',
          500: '#5d5870',
          300: '#8e8a9c',
        },
        'base': {
          50:  '#fdfcfe',
          100: '#f8f6fc',
          200: '#e4e0ec',
          400: '#cccad2',
        },
        'violet': {
          300: '#b49cfd',
          400: '#a78bfa',
          500: '#8c60f3',
          600: '#7c3aed',
          700: '#6d28d9',
        },
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'system-ui'],
        body:    ['var(--font-body)', 'system-ui'],
        mono:    ['var(--font-mono)', 'monospace'],
        logo:    ['var(--font-logo)', 'system-ui'],
      },
      borderRadius: {
        'sm':   '4px',
        'md':   '8px',
        'lg':   '12px',
        'xl':   '16px',
        '2xl':  '24px',
      },
      transitionTimingFunction: {
        'ease-out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'ease-spring':   'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'ease-soft':     'cubic-bezier(0, 0.55, 0.45, 1)',
      },
      transitionDuration: {
        'fast':     '100ms',
        'normal':   '200ms',
        'moderate': '300ms',
      },
    },
  },
  plugins: [],
};

export default config;
