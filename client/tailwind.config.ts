import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f3faf7',
          100: '#d8efe4',
          500: '#1f7a4f',
          600: '#18603e',
          700: '#124931'
        },
        accent: {
          500: '#d19a2a'
        },
        // map design tokens (CSS variables) so Tailwind utilities can use them
        primary: 'var(--color-primary)',
        accentToken: 'var(--color-accent)',
        surface: 'var(--color-surface)',
        bg: 'var(--color-bg)',
        text: 'var(--color-text)',
        muted: 'var(--color-muted)'
      },
      fontFamily: {
        sans: ['DM Sans', 'ui-sans-serif', 'system-ui'],
        mono: ['DM Mono', 'ui-monospace', 'SFMono-Regular']
      },
      boxShadow: {
        soft: '0 8px 24px rgba(0, 0, 0, 0.28)'
      }
    }
  },
  plugins: []
};

export default config;
