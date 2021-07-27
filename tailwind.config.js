  // tailwind.config.js
const colors = require('tailwindcss/colors')

  module.exports = {
    purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
     darkMode: false, // or 'media' or 'class'
     theme: {
       fontFamily: {
         'sans': ['DM Sans', 'Helvetica', 'Arial', 'sans-serif']
       },
       extend: {
         colors: {
          'primary': colors.trueGray,
          'secondary': colors.blue,
          'tertiary': colors.coolGray,
          'type': colors.warmGray,
          'background': colors.black
         }

        // colors: {
        //   'primary': colors.emerald,
        //   'secondary': colors.blue,
        //   'tertiary': colors.coolGray,
        //   'type': colors.warmGray,
        //   'background': colors.black
        //  }   

        // colors: {
        //   'primary': colors.fuchsia,
        //   'secondary': colors.green,
        //   'tertiary': colors.coolGray,
        //   'type': colors.warmGray,
        //   'background': colors.black
        //  }

        //  colors: {
        //   'primary': colors.fuchsia,
        //   'secondary': colors.green,
        //   'tertiary': colors.coolGray,
        //   'type': colors.warmGray,
        //   'background': colors.purple[900]
        //  }     
       },
     },
     variants: {
       extend: {},
     },
     plugins: [],
   }