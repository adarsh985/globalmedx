/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        theme: {
          bg: 'var(--theme-bg)',
          card: 'var(--theme-card)',
          'card-hover': 'var(--theme-card-hover)',
          text: 'var(--theme-text-primary)',
          'text-sec': 'var(--theme-text-secondary)',
          'text-muted': 'var(--theme-text-muted)',
          border: 'var(--theme-border)',
          'border-hover': 'var(--theme-border-hover)',
          accent: 'var(--theme-accent)',
          'accent-hover': 'var(--theme-accent-hover)',
        },
        status: {
          red: 'var(--status-red)',
          'red-bg': 'var(--status-red-bg)',
          'red-border': 'var(--status-red-border)',
          green: 'var(--status-green)',
          'green-bg': 'var(--status-green-bg)',
          'green-border': 'var(--status-green-border)',
          orange: 'var(--status-orange)',
          'orange-bg': 'var(--status-orange-bg)',
          'orange-border': 'var(--status-orange-border)',
          amber: 'var(--status-amber)',
          'amber-bg': 'var(--status-amber-bg)',
          'amber-border': 'var(--status-amber-border)',
          blue: 'var(--status-blue)',
          'blue-bg': 'var(--status-blue-bg)',
          'blue-border': 'var(--status-blue-border)',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
