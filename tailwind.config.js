/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        display: ['"Outfit"', 'sans-serif'],
      },
      colors: {
        bg: '#F9F8F4',
        surface: '#FFFFFF',
        kisan: '#2A5C38',
        kisanLight: '#E8F3EB',
        harvest: '#E6A338',
        harvestLight: '#FFF6E5',
        charcoal: '#2D3748',
        soil: '#8C7355',
        danger: '#DC2626'
      },
      boxShadow: {
        'card': '0 4px 20px -2px rgba(42, 92, 56, 0.08)',
        'card-hover': '0 8px 30px -4px rgba(42, 92, 56, 0.12)',
      }
    },
  },
  plugins: [],
}
