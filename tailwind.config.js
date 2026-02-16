/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        sage: "#9CB0A3",
        cream: "#F5F5DC",
        coral: "#E6AAC4",
        mist: "#F8F4EA",
        clay: "#6E7F75",
      },
      fontFamily: {
        body: ["Nunito", "sans-serif"],
        heading: ["Quicksand", "sans-serif"],
      },
      boxShadow: {
        soft: "0 18px 40px -24px rgba(96, 113, 104, 0.45)",
      },
      borderRadius: {
        mega: "2.25rem",
      },
    },
  },
  plugins: [],
};
