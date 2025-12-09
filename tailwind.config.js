/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#2C2C2C',
        darkest: '#00181f',
        darker: '#00222C',
        secondary: '#FFFFFF',
        coSecondary: '#F8CA37',
        // search: '#686D7690',
        search: '#F6F6F690',
        leader: '#395664',
        leaderBorder: '#183F4E',
        news: '#e7e8ea',
        category: 'rgba(255,255,255)',
        brands: '#F7F8FC',
        persons: '#BCCCDC',
        accent: '#F4F6FF',
        title: '#000000',
        coTitle: '#F8EFD4',
        iconBG: '#002631',
        backBtn: '#F6F6F690',
        dataHolder: '#42424290',
        notification: '#CD1818',
        leaderTitle: '#A6AEBF',
        seeAll: '#D6DEDE',
        catPersons: '#E7E8EA',
        date: '#541212',

        light: {
          100: '#FFFAE6',
          200: '#EEEEEE',
          300: '#FFFFFF',
        },
        dark: {
          100: '#373A40',
          200: '#151515',
        },
      },
    },
  },
  plugins: [],
};
