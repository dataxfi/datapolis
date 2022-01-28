// tailwind.config.js
const colors = require("tailwindcss/colors");

module.exports = {
  purge: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    screens: {
      xs: "280px",
      sm: "320px",
      md: "560px",
      lg: "870px",
      xl: "1280px",
      "2xl": "1536px",
    },
    fontFamily: {
      sans: ["DM Sans", "Helvetica", "Arial", "sans-serif"],
      pollerOne: ['"Poller One"', "cursive"],
    },
    backgroundSize: {
      auto: "auto",
      cover: "cover",
      contain: "contain",
      lg: "300px",
      md: "150px",
      sm: "100px",
      xs: "50px",
    },
    extend: {
      spacing: {
        ".5": ".125rem",
        18: "4.5rem",
        19: "4.75rem",
        98: "25rem",
        100: "26rem",
        102: "27rem",
      },
      //  colors: {
      //   'primary': colors.trueGray,
      //   'secondary': colors.blue,
      //   'tertiary': colors.coolGray,
      //   'type': colors.warmGray,
      //   'background': colors.black
      //  }
      backgroundImage: {
        dataXgif: 'url("./assets/YellowXLoader.gif")',
        dataXcity: 'url("./assets/DataX-City.jpeg")',
        dataXtrade: 'url("./assets/TradeX.jpeg")',
        dataXstake: 'url("./assets/StakeX.jpeg")',
      },
      colors: {
        primary: colors.trueGray,
        secondary: colors.indigo,
        tertiary: colors.sky,
        type: colors.warmGray,
        background: colors.black,
        yellow: {
          DEFAULT: "#f3c429",
        },
        stake: {
          blue: "#0a456e",
          darkBlue: "#1a2646",
        },
        trade: {
          blue: "#313b65",
          darkBlue: "#0C161F",
        },
        city: {
          blue: "#3a7bbf",
          darkBlue: "#222222",
        },
      },

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
};
