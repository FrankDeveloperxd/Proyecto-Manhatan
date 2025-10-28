/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',                 // 👈 ACTÍVALO POR CLASE
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#4FAEDD",          // opcional: tu color como utilitario
      },
    },
  },
  plugins: [],
};
