/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          500: '#667eea',
          600: '#764ba2',
        },
        gray: {
          50: '#fafafa',
          100: '#f8fafc',
          200: '#e5e7eb',
          300: '#e2e8f0',
          400: '#999999',
          500: '#888888',
          600: '#666666',
          700: '#333333',
          800: '#2a2a2a',
          900: '#1a1a1a',
        }
      },
      fontFamily: {
        inter: ['Inter', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
      },
      spacing: {
        '15': '3.75rem', // 60px for top nav height
        '18': '4.375rem', // 70px for collapsed sidebar
        '70': '17.5rem',  // 280px for expanded sidebar
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'tooltip-fade-in': 'tooltipFadeIn 0.2s ease',
      },
      keyframes: {
        tooltipFadeIn: {
          'from': {
            opacity: '0',
            transform: 'translateY(-50%) translateX(-5px)',
          },
          'to': {
            opacity: '1',
            transform: 'translateY(-50%) translateX(0)',
          }
        }
      },
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      }
    }
  }
}
