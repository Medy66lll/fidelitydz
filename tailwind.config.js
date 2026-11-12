/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Core Identity
        emerald: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981', // Algerian Emerald
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        slate: {
          900: '#0f172a', // Midnight Slate
          950: '#020617',
        },
        amber: {
          500: '#f59e0b', // Warm Gold / Rewards
        },
        // Stitch Design System Tokens
        primary: {
          DEFAULT: '#006c49',
          container: '#10b981',
          fixed: '#6ffbbe',
          'fixed-dim': '#4edea3',
        },
        secondary: {
          DEFAULT: '#565e74',
          container: '#dae2fd',
          'fixed-dim': '#bec6e0',
        },
        tertiary: {
          DEFAULT: '#855300',
          container: '#f59e0b',
          fixed: '#ffddb8',
          'fixed-dim': '#ffb95f',
        },
        surface: {
          DEFAULT: '#f8f9ff',
          dim: '#cbdbf5',
          bright: '#f8f9ff',
          variant: '#d3e4fe',
          container: {
            lowest: '#ffffff',
            low: '#eff4ff',
            DEFAULT: '#e5eeff',
            high: '#dce9ff',
            highest: '#d3e4fe',
          }
        },
        'on-surface': '#0b1c30',
        'on-surface-variant': '#3c4a42',
        'inverse-surface': '#0f172a',
        'inverse-on-surface': '#eaf1ff',
        'outline-variant': '#bbcabf',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Cairo', 'sans-serif'],
        arabic: ['Cairo', '"Plus Jakarta Sans"', 'sans-serif'],
      },
      borderRadius: {
        'card': '1rem',
        'pill': '9999px',
      }
    },
  },
  plugins: [],
};
