/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        border: 'var(--border)',
        primary: 'var(--primary)',
        gold: 'var(--gold)',
        danger: 'var(--danger)',
        success: 'var(--success)',
        text: 'var(--text)',
        muted: 'var(--muted)',
      },
      fontFamily: {
        ui: ['var(--font-ui)'],
        mono: ['var(--font-mono)'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(0, 212, 170, 0.35), 0 0 22px rgba(0, 212, 170, 0.12)',
      },
      transitionDuration: {
        200: '200ms',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
      },
      animation: {
        fadeIn: 'fadeIn 200ms ease-out',
      },
    },
  },
  plugins: [],
}
