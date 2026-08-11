/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0a0908',
          900: '#0f0d0b',
          800: '#171412',
          700: '#221e1a',
          600: '#332c25',
        },
        gold: {
          50: '#faf5e6',
          100: '#f2e4b8',
          200: '#e8cf86',
          300: '#dbb659',
          400: '#c99a3a',
          500: '#b8862c',
          600: '#976b22',
          700: '#78541c',
          800: '#5a3f16',
        },
        bone: '#f2ede2',
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      letterSpacing: {
        widest2: '0.35em',
      },
      transitionTimingFunction: {
        silk: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};
