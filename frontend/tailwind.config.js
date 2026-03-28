/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cyber: {
          blue: '#00d4ff',
          red: '#ff0050',
          green: '#00ff88',
          yellow: '#ffd000',
          purple: '#b026ff',
          orange: '#ff8800',
        },
        dark: {
          900: '#0a0e17',
          800: '#111827',
          700: '#1a1f2e',
          600: '#1e293b',
          500: '#334155',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
