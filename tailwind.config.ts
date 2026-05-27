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
        'navy': {
          950: '#0A0F1A',
          900: '#111827',
          700: '#1E293B',
          500: '#475569',
          300: '#94A3B8',
        },
        'cream': {
          50:  '#F0ECDD',
          100: '#E8E2CE',
          200: '#D9D1B8',
          400: '#B5A882',
        },
        'accent': {
          400: '#38BDF8',
          500: '#0EA5E9',
          700: '#0369A1',
        },
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'system-ui'],
        body:    ['var(--font-body)', 'system-ui'],
        mono:    ['var(--font-mono)', 'monospace'],
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
