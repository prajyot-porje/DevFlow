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
          950: 'var(--color-surface-950)',
          900: 'var(--color-surface-900)',
          700: 'var(--color-surface-700)',
          500: 'var(--color-surface-500)',
          300: 'var(--color-surface-300)',
        },
        'base': {
          50:  'var(--color-base-50)',
          100: 'var(--color-base-100)',
          200: 'var(--color-base-200)',
          400: 'var(--color-base-400)',
        },
        'violet': {
          300: 'var(--color-violet-300)',
          400: 'var(--color-violet-400)',
          500: 'var(--color-violet-500)',
          600: 'var(--color-violet-600)',
          700: 'var(--color-violet-700)',
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
