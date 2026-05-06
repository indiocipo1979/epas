// ─── AnswerButton.jsx ───
// Botón de respuesta individual. Muestra el efecto visual según si fue elegido
// y si es correcto o incorrecto. Incluye animaciones de bounce, shake y color.

import { motion } from 'framer-motion';

export default function AnswerButton({ texto, indice, onClick, estado, deshabilitado }) {
  // estado puede ser: null | "correcta" | "incorrecta" | "correcta-no-elegida"

  // ── Colores y estilos según el estado ──
  const getEstilo = () => {
    switch (estado) {
      case "correcta":
        return "bg-gradient-to-r from-green-400 to-emerald-500 border-green-300 shadow-green-500/50 shadow-lg scale-105";
      case "incorrecta":
        return "bg-gradient-to-r from-red-500 to-rose-600 border-red-400 shadow-red-500/50 shadow-lg";
      case "correcta-no-elegida":
        return "bg-gradient-to-r from-green-500/60 to-emerald-600/60 border-green-400/60";
      default:
        return "bg-white/10 hover:bg-white/20 border-white/30 hover:border-cyan-400/70";
    }
  };

  // ── Letras para las opciones A, B, C, D ──
  const letras = ["A", "B", "C", "D"];

  return (
    <motion.button
      onClick={!deshabilitado ? onClick : undefined}
      disabled={deshabilitado}
      className={`
        relative w-full text-left px-5 py-4 rounded-2xl border-2 transition-colors
        font-bold text-white text-base md:text-lg cursor-pointer
        flex items-center gap-4
        ${getEstilo()}
        ${deshabilitado ? 'cursor-not-allowed' : 'cursor-pointer'}
      `}
      // ── Animación de entrada con bounce por índice ──
      initial={{ opacity: 0, x: -40 }}
      animate={{
        opacity: 1,
        x: 0,
        // Si es incorrecta, hace shake
        ...(estado === "incorrecta" ? {
          x: [-10, 10, -8, 8, -4, 4, 0],
          transition: { duration: 0.4 }
        } : {})
      }}
      transition={{
        delay: indice * 0.1,
        type: "spring",
        stiffness: 300,
        damping: 20
      }}
      // ── Efecto de presionado ──
      whileTap={!deshabilitado ? { scale: 0.94 } : {}}
      whileHover={!deshabilitado && !estado ? { scale: 1.03, x: 5 } : {}}
    >
      {/* Badge de letra */}
      <span className={`
        flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center
        font-black text-lg border-2
        ${estado === "correcta" || estado === "correcta-no-elegida"
          ? "bg-green-600 border-green-300 text-white"
          : estado === "incorrecta"
            ? "bg-red-700 border-red-400 text-white"
            : "bg-white/20 border-white/40 text-cyan-200"
        }
      `}>
        {letras[indice]}
      </span>

      {/* Texto de la opción */}
      <span className="flex-1 leading-tight">{texto}</span>

      {/* Ícono de correcto/incorrecto */}
      {estado === "correcta" && (
        <motion.span
          className="text-2xl"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          ✅
        </motion.span>
      )}
      {estado === "incorrecta" && (
        <motion.span
          className="text-2xl"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >
          ❌
        </motion.span>
      )}
      {estado === "correcta-no-elegida" && (
        <span className="text-xl">💡</span>
      )}
    </motion.button>
  );
}
