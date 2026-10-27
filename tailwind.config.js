/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"Fira Code"', '"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
        display: ['"Exo 2"', 'system-ui', 'sans-serif'], // headings (loaded from Google Fonts in index.html)
        old: ['"Noto Serif"', 'Georgia', 'serif'], // old Baku's era titles (Google Fonts too)
      },
      colors: {
        neon: '#00ff66',
      },
      screens: {
        short: { raw: '(max-height: 520px)' }, // phones held sideways: compact layouts
      },
    },
  },
  plugins: [],
}
