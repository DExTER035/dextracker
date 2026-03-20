/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        border: 'var(--border)',
        primary: 'var(--primary)',
        gold: 'var(--gold)',
        danger: 'var(--danger)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        text: 'var(--text)',
        muted: 'var(--muted)',
        cyan: '#22d3ee',
        violet: '#8b5cf6',
      },
      fontFamily: {
        heading: ['var(--font-heading)'],
        ui: ['var(--font-ui)'],
        mono: ['var(--font-mono)'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(139, 92, 246, 0.3), 0 10px 40px -10px rgba(139, 92, 246, 0.25)',
        buttonGlow: '0 0 20px rgba(139, 92, 246, 0.6), inset 0 0 15px rgba(34, 211, 238, 0.4)',
        cardGlow: '0 4px 30px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        activeNav: '-3px 0 20px rgba(34, 211, 238, 0.6)',
      },
      transitionDuration: {
        DEFAULT: '200ms',
        200: '200ms',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(0.98)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        },
        pageFadeIn: {
          '0%': { opacity: '0', transform: 'translateX(10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-3px)' },
        },
        flipPage: {
          '0%': { transform: 'perspective(400px) rotateY(0deg)' },
          '100%': { transform: 'perspective(400px) rotateY(15deg)' },
        },
        floatSleep: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        coinFlip: {
          '0%': { transform: 'perspective(400px) rotateY(0)' },
          '100%': { transform: 'perspective(400px) rotateY(360deg)' },
        },
        wobble: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-10deg)' },
          '75%': { transform: 'rotate(10deg)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-2px)' },
          '75%': { transform: 'translateX(2px)' },
        },
        flicker: {
          '0%, 100%': { opacity: '1', filter: 'drop-shadow(0 0 8px rgba(251,146,60,0.8))' },
          '50%': { opacity: '0.8', filter: 'drop-shadow(0 0 12px rgba(251,146,60,1))' },
        },
        targetPulse: {
          '0%': { boxShadow: '0 0 0 0 rgba(34, 211, 238, 0.4)' },
          '100%': { boxShadow: '0 0 0 10px rgba(34, 211, 238, 0)' },
        },
        rippleBurst: {
          '0%': { transform: 'scale(0.8)', opacity: '1' },
          '100%': { transform: 'scale(2.5)', opacity: '0' },
        },
        coinDrop: {
          '0%': { transform: 'translateY(-20px)' },
          '60%': { transform: 'translateY(0)' },
          '80%': { transform: 'translateY(-5px)' },
          '100%': { transform: 'translateY(0)' },
        },
        floatText: {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-50px)', opacity: '0' },
        },
        fireRain: {
          '0%': { transform: 'translateY(-10px) scale(1)', opacity: '1' },
          '100%': { transform: 'translateY(100vh) scale(0.5)', opacity: '0' },
        },
        drawCheck: {
          '0%': { strokeDashoffset: '100' },
          '100%': { strokeDashoffset: '0' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        badgeFlip: {
          '0%': { transform: 'perspective(600px) rotateY(0)' },
          '50%': { transform: 'perspective(600px) rotateY(180deg)', filter: 'drop-shadow(0 0 20px gold)' },
          '100%': { transform: 'perspective(600px) rotateY(360deg)', filter: 'drop-shadow(0 0 10px gold)' },
        }
      },
      animation: {
        fadeIn: 'fadeIn 400ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
        pulseSoft: 'pulseSoft 3s ease-in-out infinite',
        shimmer: 'shimmer 2s infinite',
        bounceSoft: 'bounceSoft 0.8s ease-in-out infinite',
        flipPage: 'flipPage 0.3s forwards',
        floatSleep: 'floatSleep 2s ease-in-out infinite',
        coinFlip: 'coinFlip 0.6s ease-in-out forwards',
        wobble: 'wobble 0.4s ease-in-out infinite',
        shake: 'shake 0.3s ease-in-out infinite',
        flicker: 'flicker 1.5s infinite',
        targetPulse: 'targetPulse 1.2s infinite',
        rippleBurst: 'rippleBurst 0.6s ease-out forwards',
        coinDrop: 'coinDrop 0.5s ease-out forwards',
        floatText: 'floatText 1s ease-out forwards',
        fireRain: 'fireRain 2s linear forwards',
        drawCheck: 'drawCheck 0.4s ease-out forwards',
        slideInRight: 'slideInRight 0.3s ease-out forwards',
        badgeFlip: 'badgeFlip 0.8s ease-in-out forwards',
        pageFadeIn: 'pageFadeIn 300ms cubic-bezier(0.4, 0, 0.2, 1) forwards',
      },
      transitionTimingFunction: {
        DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}
