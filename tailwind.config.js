  // tailwind.config.js
  module.exports = {
    purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
     darkMode: false, // or 'media' or 'class'
     theme: {
       fontFamily: {
         'sans': ['DM Sans', 'Helvetica', 'Arial', 'sans-serif']
       },
       extend: {},
     },
     variants: {
       extend: {},
     },
     plugins: [],
   }