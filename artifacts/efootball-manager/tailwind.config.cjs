module.exports = {
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)'],
        display: ['var(--font-display)'],
        gaming: ['var(--font-gaming)']
      }
    }
  },
  plugins: [require('@tailwindcss/typography')]
};
