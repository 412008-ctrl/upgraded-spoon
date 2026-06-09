/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./*.html'],
  theme: {
    extend: {
      colors: {
        background: '#020617',
        surface: '#0b1224',
        panel: '#111827',
        accent: '#fbbf24',
        accentSoft: '#fde68a',
        muted: '#94a3b8',
        border: '#334155',
      },
      boxShadow: {
        glow: '0 18px 50px -22px rgba(15, 23, 42, 0.95)',
      },
      borderRadius: {
        xl2: '28px',
      },
      fontFamily: {
        sans: ['Noto Sans TC', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
