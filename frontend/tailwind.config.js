/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    './node_modules/flowbite-react/lib/esm/**/*.js'
  ],
  theme: {
    extend: {
      animation: {
        shake: 'shake 0.7s ease-in-out'
      },
      keyframes: {
        shake: {
          '0%': {
            transform: 'translateX(0)',
          },
          '10%': {
            transform: 'translateX(-25px)',
          },
          '20%': {
            transform: 'translateX(25px)',
          },
          '30%': {
            transform: 'translateX(-25px)',
          },
          '40%': {
            transform: 'translateX(25px)',
          },
          '50%': {
            transform: 'translateX(-25px)',
          },
          '60%': {
            transform: 'translateX(25px)',
          },
          '70%': {
            transform: 'translateX(-25px)',
          },
          '80%': {
            transform: 'translateX(25px)',
          },
          '90%': {
            transform: 'translateX(-25px)',
          },
          '100%': {
            transform: 'translateX(0)',
          },
        }
      }
    },
  },
  plugins: [
    require('flowbite/plugin')
  ],
};
