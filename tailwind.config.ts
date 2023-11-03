import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./app/**/*.{ts,tsx,jsx,js}'],
  theme: {
    extend: {
      transitionDuration: {
        '2000': '2000ms',
        '5000': '5000ms'
      }
    }
  },
  plugins: [require('tailwindcss-animate')]
}

export default config
