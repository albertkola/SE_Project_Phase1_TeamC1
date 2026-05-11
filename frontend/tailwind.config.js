/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#000000',
        surface: '#1C1C1C',
        'surface-elevated': '#2C2C2C',
        border: '#333333',
        'text-primary': '#FFFFFF',
        'text-secondary': '#AAAAAA',
        'text-muted': '#666666',
        accent: '#FFFFFF',
        success: '#00C853',
        warning: '#FFB300',
        error: '#FF3B30',
        'rating-star': '#FFD700',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        h1: ['32px', { lineHeight: '1.2', fontWeight: '700' }],
        h2: ['24px', { lineHeight: '1.3', fontWeight: '600' }],
        h3: ['18px', { lineHeight: '1.4', fontWeight: '600' }],
        body: ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        small: ['12px', { lineHeight: '1.4', fontWeight: '400' }],
      },
      spacing: {
        'grid-1': '8px',
        'grid-2': '16px',
        'grid-3': '24px',
        'grid-4': '32px',
        'grid-5': '40px',
        'grid-6': '48px',
      },
    },
  },
  plugins: [],
};
