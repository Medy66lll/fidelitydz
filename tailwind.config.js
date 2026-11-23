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
        // ====================================================================
        // Perceptually Uniform OKLCH Scales (Color Expert System)
        // Calibrated with flat perceptual derivatives, zero muddy midtones,
        // and strict in-gamut mapping for sRGB + Display P3.
        // ====================================================================
        emerald: {
          50: 'oklch(97.5% 0.024 158 / <alpha-value>)',
          100: 'oklch(93.5% 0.052 158 / <alpha-value>)',
          200: 'oklch(86.5% 0.092 158 / <alpha-value>)',
          300: 'oklch(78.5% 0.132 158 / <alpha-value>)',
          400: 'oklch(70.0% 0.165 158 / <alpha-value>)',
          500: 'oklch(62.0% 0.178 158 / <alpha-value>)', // Algerian Emerald Anchor
          600: 'oklch(53.0% 0.165 158 / <alpha-value>)',
          700: 'oklch(44.0% 0.145 158 / <alpha-value>)',
          800: 'oklch(35.0% 0.115 158 / <alpha-value>)',
          900: 'oklch(26.0% 0.085 158 / <alpha-value>)',
          950: 'oklch(18.0% 0.055 158 / <alpha-value>)',
        },
        slate: {
          50: 'oklch(98.5% 0.005 248 / <alpha-value>)',
          100: 'oklch(95.0% 0.010 248 / <alpha-value>)',
          200: 'oklch(89.0% 0.016 248 / <alpha-value>)',
          300: 'oklch(80.0% 0.022 248 / <alpha-value>)',
          400: 'oklch(68.0% 0.026 248 / <alpha-value>)',
          500: 'oklch(54.0% 0.030 248 / <alpha-value>)',
          600: 'oklch(42.0% 0.030 248 / <alpha-value>)',
          700: 'oklch(32.0% 0.030 248 / <alpha-value>)',
          800: 'oklch(22.0% 0.030 252 / <alpha-value>)',
          900: 'oklch(15.0% 0.025 255 / <alpha-value>)', // Midnight Slate Canvas
          950: 'oklch(11.0% 0.020 258 / <alpha-value>)', // Deep Obsidian Floor
        },
        amber: {
          50: 'oklch(97.5% 0.030 85 / <alpha-value>)',
          100: 'oklch(93.0% 0.070 85 / <alpha-value>)',
          200: 'oklch(87.0% 0.110 82 / <alpha-value>)',
          300: 'oklch(82.0% 0.145 80 / <alpha-value>)',
          400: 'oklch(78.0% 0.165 78 / <alpha-value>)',
          500: 'oklch(73.0% 0.175 76 / <alpha-value>)', // Warm Gold / Reward Accent
          600: 'oklch(63.0% 0.165 72 / <alpha-value>)',
          700: 'oklch(52.0% 0.145 68 / <alpha-value>)',
          800: 'oklch(41.0% 0.120 62 / <alpha-value>)',
          900: 'oklch(30.0% 0.090 58 / <alpha-value>)',
          950: 'oklch(20.0% 0.060 55 / <alpha-value>)',
        },
        // Semantic Token Mapping
        primary: {
          DEFAULT: 'oklch(62.0% 0.178 158 / <alpha-value>)',
          hover: 'oklch(53.0% 0.165 158 / <alpha-value>)',
          container: 'oklch(93.5% 0.052 158 / <alpha-value>)',
          'on-container': 'oklch(26.0% 0.085 158 / <alpha-value>)',
          fixed: 'oklch(86.5% 0.092 158 / <alpha-value>)',
          'fixed-dim': 'oklch(70.0% 0.165 158 / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'oklch(42.0% 0.030 248 / <alpha-value>)',
          container: 'oklch(95.0% 0.010 248 / <alpha-value>)',
          'fixed-dim': 'oklch(80.0% 0.022 248 / <alpha-value>)',
        },
        reward: {
          DEFAULT: 'oklch(73.0% 0.175 76 / <alpha-value>)',
          hover: 'oklch(63.0% 0.165 72 / <alpha-value>)',
          surface: 'oklch(97.5% 0.030 85 / <alpha-value>)',
        },
        surface: {
          DEFAULT: 'oklch(98.5% 0.005 248)',
          dim: 'oklch(95.0% 0.010 248)',
          bright: 'oklch(100% 0 0)',
          variant: 'oklch(93.0% 0.012 248)',
          container: {
            lowest: '#ffffff',
            low: 'oklch(98.5% 0.005 248)',
            DEFAULT: 'oklch(95.0% 0.010 248)',
            high: 'oklch(91.0% 0.014 248)',
            highest: 'oklch(87.0% 0.018 248)',
          }
        },
        'on-surface': 'oklch(15.0% 0.025 255)',
        'on-surface-variant': 'oklch(42.0% 0.030 248)',
        'inverse-surface': 'oklch(11.0% 0.020 258)',
        'inverse-on-surface': 'oklch(98.5% 0.005 248)',
        'outline-variant': 'oklch(89.0% 0.016 248)',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Cairo', 'sans-serif'],
        arabic: ['Cairo', '"Plus Jakarta Sans"', 'sans-serif'],
      },
      borderRadius: {
        'card': '1.25rem',
        'pill': '9999px',
      },
      boxShadow: {
        'glow-emerald': '0 0 40px -10px oklch(62% 0.178 158 / 0.35)',
        'glow-emerald-lg': '0 0 60px -12px oklch(62% 0.178 158 / 0.45)',
        'glow-amber': '0 0 35px -8px oklch(73% 0.175 76 / 0.35)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.08)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
      }
    },
  },
  plugins: [],
};
