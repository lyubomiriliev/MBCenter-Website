/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'mb-black': '#000000',
        'mb-anthracite': '#1a1a1a',
        'mb-surface': '#0a0a0a',
        'mb-silver': '#c0c0c0',
        'mb-chrome': '#e8e8e8',
        'mb-blue': '#00adef',
        'mb-border': '#2a2a2a',
      },
      borderRadius: {
        'card': '0.75rem',
        'button': '0.5rem',
      },
      boxShadow: {
        'subtle': '0 2px 8px rgba(0, 0, 0, 0.3)',
        'card': '0 4px 16px rgba(0, 0, 0, 0.4)',
      },
      spacing: {
        'section': '8rem',
        'section-sm': '4rem',
      },
    },
  },
  plugins: [],
}


