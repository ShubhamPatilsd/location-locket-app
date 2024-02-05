/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./app/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#120024",
        primary: "#DCCDE8",
      },
    },
  },
  plugins: [],
};
