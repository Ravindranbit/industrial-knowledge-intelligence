module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1C1917',
        secondary: '#44403C',
        accent: '#C2410C',
        bg: '#FAF9F6',
        blue: {
          50: '#FAF5ED',   // warm cream tint
          100: '#EADFCB',
          200: '#D2BFA4',
          300: '#C5AF92',
          400: '#A28C73',
          500: '#B45309',   // warm terracotta/amber accent
          600: '#1C1917',   // premium deep charcoal for primary buttons
          700: '#44403C',   // dark stone for hover text
          800: '#2E251B',
          900: '#1C1917',
          950: '#0C0A09'
        },
        slate: {
          50: '#FAF8F5',   // soft cream page background
          100: '#F3EFE9',  // light warm gray container bg
          200: '#E9E3D9',  // soft divider lines
          300: '#DDD5C7',
          400: '#A8A29E',  // stone-400
          500: '#78716C',  // stone-500 (muted text)
          600: '#57534E',  // stone-600
          700: '#44403C',  // stone-700
          800: '#292524',  // stone-800
          900: '#1C1917',  // stone-900 (primary text)
          950: '#0C0A09'
        }
      }
    }
  },
  plugins: []
}
