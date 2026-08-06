/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-outfit)', 'system-ui', 'sans-serif'],
        cinzel: ['var(--font-cinzel)', 'serif'],
      },
      colors: {
        mtg: {
          bg: "#05070a",
          panel: "#0b0f19",
          card: "#111726",
          border: "#1e2738",
          amber: "#f59e0b",
          cyan: "#06b6d4",
          emerald: "#10b981",
          purple: "#8b5cf6",
          rose: "#f43f5e",
        },
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 3s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 15px rgba(245, 158, 11, 0.2)' },
          '100%': { boxShadow: '0 0 30px rgba(245, 158, 11, 0.5)' },
        },
      },
    },
  },
  plugins: [],
};
