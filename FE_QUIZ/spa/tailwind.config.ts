import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca'
        }
      },
      fontFamily: {
        'rounded': ['Comic Sans MS', 'Chalkboard SE', 'Marker Felt', 'cursive'],
        'animated': ['Comic Sans MS', 'Chalkboard SE', 'Marker Felt', 'cursive']
      },
      boxShadow: {
        card: '0 10px 20px rgba(0,0,0,0.08)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      },
      borderRadius: {
        xl: '12px'
      },
      animation: {
        'reverse-slow': 'spin 1.5s linear infinite reverse',
        'heartbeat': 'heartbeat 1.5s ease-in-out infinite',
        'fade-in': 'fadeIn 0.8s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'wiggle': 'wiggle 0.5s ease-in-out',
        'float': 'float 3s ease-in-out infinite',
        'float-delayed': 'float 3s ease-in-out infinite 0.5s',
        'float-slow': 'float 4s ease-in-out infinite',
        'float-delayed-2': 'float 3s ease-in-out infinite 1s',
        'rainbow-shift': 'rainbowShift 3s ease-in-out infinite',
        'text-shimmer': 'textShimmer 2s ease-in-out infinite'
      },
      keyframes: {
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' }
        },
        fadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' }
        },
        slideUp: {
          'from': { 
            opacity: '0',
            transform: 'translateY(20px)'
          },
          'to': { 
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(1deg)' },
          '75%': { transform: 'rotate(-1deg)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        rainbowShift: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' }
        },
        textShimmer: {
          '0%': { opacity: '0.8' },
          '50%': { opacity: '1' },
          '100%': { opacity: '0.8' }
        }
      }
    }
  },
  plugins: []
} satisfies Config
