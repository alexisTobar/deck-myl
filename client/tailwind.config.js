/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // ◄--- AGREGA ESTA LÍNEA AQUÍ (Es la que habilita el botón)
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}