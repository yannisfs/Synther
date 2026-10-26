/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#CC0000',
          green: '#004225',
          blue: '#0055A4',
          lightblue: '#30A2DA',
          orange: '#F47321',
          warm: '#FF8000',
          silver: '#888888',
          gold: '#CFB53B',
        },
      },
    },
  },
  plugins: [],
};
