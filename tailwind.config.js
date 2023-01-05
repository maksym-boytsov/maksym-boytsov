module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        "gradient-fade": {
          "0%": { "background-position": "40% 100%" },
          "50%": { "background-position": "96% 0%" },
          "100%": { "background-position": "40% 100%" },
        },
      },
    },
  },
  plugins: [],
};
