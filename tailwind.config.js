// tailwind.config.js
const colors = require("tailwindcss/colors");

module.exports = {
  purge: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  darkMode: 'media',
  mode: "jit",
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
      montserrat: ["'Montserrat'", "sans-serif"],
      yantramanav: ["'Yantramanav'", "sans"],
      spectral: ["'Spectral SC'", "Times New Roman", "Times", "serif"],
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
      border: {
        6: "6px",
      },
      spacing: {
        "1px": "1px",
        "2px": "2px",
        ".5": ".125rem",
        18: "4.5rem",
        19: "4.75rem",
        98: "25rem",
        100: "26rem",
        102: "27rem",
        103: "28rem",
        104: "29rem",
        105: "30rem",
        107: "32rem",
        109: "34rem",
        111: "36rem,",
      },
      backgroundImage: {
        dataXgif: 'url("./assets/DataX-X-Fold.gif")',
        dataXcity: 'url("./assets/DataX-City.jpeg")',
        dataXtrade: 'url("./assets/TradeX.jpeg")',
        dataXstake: 'url("./assets/StakeX.jpeg")',
      },
      colors: {
        primary: colors.gray,
        secondary: colors.indigo,
        tertiary: colors.sky,
        gray: colors.stone,
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
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
