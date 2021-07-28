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
        
        //  colors: {
        //   'primary': colors.fuchsia,
        //   'secondary': colors.green,
        //   'tertiary': colors.coolGray,
        //   'type': {
        //     50: colors.warmGray[900],
        //     100: colors.warmGray[900],
        //     200: colors.warmGray[800],
        //     300: colors.warmGray[700],
        //     400: colors.warmGray[600],
        //     600: colors.warmGray[400],
        //     700: colors.warmGray[300],
        //     800: colors.warmGray[200],
        //     900: colors.warmGray[100],
        //   },
        //   'background': colors.purple[100]
        //  }          
        
       },
     },
     variants: {
       extend: {},
     },
     plugins: [],
   }