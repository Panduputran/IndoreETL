/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // INI YANG BIKIN TAILWIND BISA BACA JSX!
  ],
  theme: {
    extend: {},
  },
  plugins: [
    import('tailwind-scrollbar'), // Opsional kalau lu pake plugin scrollbar, hapus aja kalau error
  ],
}