// ─── FloatingCharacter.jsx ───
// Este componente muestra la "Gota" animada flotante, el personaje principal del juego.
// Flota suavemente de arriba a abajo de forma infinita con expresión amigable.

import { motion } from 'framer-motion';

// Variantes de animación para la levitación infinita
const floatVariants = {
  animate: {
    y: [0, -20, 0],           // Sube 20px y vuelve
    rotate: [-2, 2, -2],      // Leve balanceo
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    }
  }
};

// Animación del brillo interior de la gota
const glowVariants = {
  animate: {
    opacity: [0.5, 1, 0.5],
    scale: [0.95, 1.05, 0.95],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    }
  }
};

export default function FloatingCharacter({ size = "md", happy = true }) {
  // Tamaños según prop
  const sizes = {
    sm: { container: "w-20 h-24", drop: 80 },
    md: { container: "w-32 h-36", drop: 128 },
    lg: { container: "w-44 h-52", drop: 176 },
  };
  const s = sizes[size] || sizes.md;

  return (
    <motion.div
      className={`relative ${s.container} flex items-center justify-center`}
      variants={floatVariants}
      animate="animate"
    >
      {/* Sombra dinámica bajo la gota */}
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-3 rounded-full bg-blue-900/50 blur-sm"
        animate={{ scaleX: [1, 0.7, 1], opacity: [0.6, 0.3, 0.6] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Gota SVG con cara animada */}
      <svg
        width={s.drop}
        height={s.drop}
        viewBox="0 0 100 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* ── Cuerpo de la gota ── */}
        <defs>
          <radialGradient id="dropGrad" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#80DEEA" />
            <stop offset="50%" stopColor="#29B6F6" />
            <stop offset="100%" stopColor="#0277BD" />
          </radialGradient>
          <radialGradient id="shineGrad" cx="30%" cy="25%" r="50%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.8)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>

        {/* Forma de gota */}
        <path
          d="M50 5 C50 5, 15 45, 15 70 A35 35 0 0 0 85 70 C85 45, 50 5, 50 5Z"
          fill="url(#dropGrad)"
        />

        {/* Brillo (reflejo) */}
        <motion.path
          d="M50 5 C50 5, 15 45, 15 70 A35 35 0 0 0 85 70 C85 45, 50 5, 50 5Z"
          fill="url(#shineGrad)"
          variants={glowVariants}
          animate="animate"
        />

        {/* Reflejo pequeño */}
        <ellipse cx="34" cy="42" rx="7" ry="12" fill="rgba(255,255,255,0.4)" transform="rotate(-25 34 42)" />

        {/* ── Ojos ── */}
        {/* Ojo izquierdo */}
        <ellipse cx="40" cy="68" rx="6" ry="7" fill="white" />
        <motion.ellipse
          cx="40" cy="69"
          rx="3.5" ry="4"
          fill="#1a237e"
          animate={happy ? { scaleY: [1, 0.1, 1] } : {}}
          transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
        />
        <ellipse cx="38" cy="67" rx="1.2" ry="1.2" fill="white" />

        {/* Ojo derecho */}
        <ellipse cx="60" cy="68" rx="6" ry="7" fill="white" />
        <motion.ellipse
          cx="60" cy="69"
          rx="3.5" ry="4"
          fill="#1a237e"
          animate={happy ? { scaleY: [1, 0.1, 1] } : {}}
          transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
        />
        <ellipse cx="58" cy="67" rx="1.2" ry="1.2" fill="white" />

        {/* ── Boca sonriente ── */}
        {happy ? (
          <path
            d="M40 82 Q50 92 60 82"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
        ) : (
          <path
            d="M40 88 Q50 80 60 88"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
        )}

        {/* ── Mejillas rosadas ── */}
        <ellipse cx="33" cy="78" rx="5" ry="3" fill="rgba(255,100,150,0.35)" />
        <ellipse cx="67" cy="78" rx="5" ry="3" fill="rgba(255,100,150,0.35)" />

        {/* ── Pequeñas gotitas decorativas ── */}
        <circle cx="25" cy="55" r="3" fill="rgba(41,182,246,0.5)" />
        <circle cx="78" cy="60" r="2" fill="rgba(41,182,246,0.5)" />
      </svg>
    </motion.div>
  );
}
