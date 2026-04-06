/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        pressStart: ['"Press Start 2P"', 'cursive'],
      },
      colors: {
        primaryWhite: '#FFFFFF',
        goldenYellow: '#FFC72C',
        vibratingBlue: '#00AEEF',
        crimsonRed: '#EE3C3C',
        lightGreen: '#8BC34A',
        textBlack: '#1A1A1A',
      },
    },
  },
  plugins: [],
};
