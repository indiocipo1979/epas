/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        game: ['"Nunito"', 'sans-serif'],
      },
      colors: {
        // ── Paleta oficial EPAS / EPAS va a la Escuela ──
        epas: {
          magenta: '#E5007D',       // Fondo rosa fuerte (diapositiva 1)
          magentaDark: '#B5006A',   // Variante oscura magenta
          magentaLight: '#FF4DA6',  // Hover / acento
          sky: '#29ABE2',           // Celeste principal (diapositivas 2-3)
          skyDark: '#1A8ABE',       // Celeste oscuro
          skyLight: '#7DCFF0',      // Celeste claro
          orange: '#F7941D',        // Naranja (diapositiva 4)
          orangeDark: '#D4780A',    // Naranja oscuro
          star: '#FFD700',          // Amarillo estrella decorativa
          starWarm: '#FFC107',      // Amarillo cálido
          navy: '#1A3A6B',          // Azul institucional EPAS
          white: '#FFFFFF',
          cardBg: '#F4F9FF',        // Fondo tarjetas cuaderno
        },
        // ── Colores semánticos del juego ──
        correct: '#43A047',         // Verde correcto
        incorrect: '#E53935',       // Rojo incorrecto
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-18px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        waterFill: {
          '0%': { transform: 'scaleX(0)' },
          '100%': { transform: 'scaleX(1)' },
        },
        popIn: {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '70%': { transform: 'scale(1.15)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '15%': { transform: 'translateX(-10px)' },
          '30%': { transform: 'translateX(10px)' },
          '45%': { transform: 'translateX(-8px)' },
          '60%': { transform: 'translateX(8px)' },
          '75%': { transform: 'translateX(-4px)' },
          '90%': { transform: 'translateX(4px)' },
        },
        confettiFall: {
          '0%': { transform: 'translateY(-20px) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(110vh) rotate(720deg)', opacity: '0' },
        },
        pulse: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        bounce: {
          '0%, 100%': { transform: 'translateY(0)', animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)' },
          '50%': { transform: 'translateY(-12px)', animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)' },
        },
        feedbackPop: {
          '0%': { transform: 'scale(0) rotate(-15deg)', opacity: '0' },
          '60%': { transform: 'scale(1.3) rotate(5deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 10px #00E5FF, 0 0 20px #00E5FF' },
          '50%': { boxShadow: '0 0 25px #00E5FF, 0 0 50px #29B6F6' },
        }
      },
      animation: {
        float: 'float 3s ease-in-out infinite',
        shimmer: 'shimmer 2.5s linear infinite',
        waterFill: 'waterFill 0.6s ease-out forwards',
        popIn: 'popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        shake: 'shake 0.5s ease-in-out',
        confettiFall: 'confettiFall 2.5s ease-out forwards',
        feedbackPop: 'feedbackPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        glow: 'glow 2s ease-in-out infinite',
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
