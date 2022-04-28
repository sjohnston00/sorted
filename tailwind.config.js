module.exports = {
  content: ["./app/**/*.{ts,tsx,jsx,js}"],
  theme: {
    extend: {
      screens: {
        standalone: {
          raw: "(display-mode: standalone)",
        },
      },
    },
  },
  variants: {},
  plugins: [],
}
