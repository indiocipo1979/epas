// ─── ResultScreen.jsx ───
// Pantalla final: "Diploma de Guardián del Agua"
// Muestra el puntaje, un mensaje motivador y el botón para reiniciar.

import { motion } from 'framer-motion';
import FloatingCharacter from './FloatingCharacter';
import logoEpas from '../assets/logo-epas.png';
import logoNeuquen from '../assets/logo-neuquen.png';

export default function ResultScreen({ nombre, correctas, total, onReiniciar }) {
  // ── Calculamos el porcentaje de aciertos ──
  const porcentaje = Math.round((correctas / total) * 100);

  // ── Mensaje según el puntaje ──
  const getMensaje = () => {
    if (porcentaje === 100) return { titulo: "¡GUARDIÁN LEGENDARIO!", sub: "¡Perfecto! Sos un experto en el cuidado del agua. ¡El planeta te lo agradece!", emoji: "🏆" };
    if (porcentaje >= 70)  return { titulo: "¡GUARDIÁN DEL AGUA!", sub: "¡Excelente! Sabés mucho sobre cómo cuidar el agua. ¡Seguí así!", emoji: "🥇" };
    if (porcentaje >= 40)  return { titulo: "¡APRENDIZ GUARDIÁN!", sub: "¡Muy bien! Ya aprendiste muchas cosas importantes. ¡Practicá más!", emoji: "🥈" };
    return { titulo: "¡GUARDIÁN EN FORMACIÓN!", sub: "¡No te rindas! Cada respuesta es una oportunidad para aprender. ¡Intentalo de nuevo!", emoji: "💪" };
  };

  const { titulo, sub, emoji } = getMensaje();

  // ── Colores del diploma según puntaje ──
  const getColor = () => {
    if (porcentaje === 100) return "from-yellow-400 via-amber-500 to-orange-500";
    if (porcentaje >= 70)  return "from-cyan-400 via-blue-500 to-indigo-600";
    if (porcentaje >= 40)  return "from-teal-400 via-cyan-500 to-blue-600";
    return "from-blue-400 via-indigo-500 to-purple-600";
  };

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center p-4 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* ── Diploma principal ── */}
      <motion.div
        className={`
          relative w-full max-w-2xl rounded-3xl overflow-hidden
          bg-gradient-to-br ${getColor()}
          shadow-2xl border-4 border-white/30
        `}
        initial={{ scale: 0.5, rotate: -5 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      >
        {/* Decoración de fondo */}
        <div className="absolute inset-0 opacity-10">
          {['💧', '🌊', '💦', '🐟', '🌿', '⭐'].map((e, i) => (
            <span
              key={i}
              className="absolute text-6xl"
              style={{
                left: `${(i * 18) % 90}%`,
                top: `${(i * 25) % 80}%`,
                transform: `rotate(${i * 30}deg)`,
              }}
            >{e}</span>
          ))}
        </div>

        <div className="relative z-10 p-8 text-center">
          {/* ── Encabezado del diploma ── */}
          <div className="flex justify-between items-center mb-6 px-2">
            <img src={logoEpas} alt="EPAS" style={{ height: '30px' }} />
            <img src={logoNeuquen} alt="Neuquén" style={{ height: '48px' }} />
          </div>

          <motion.div
            className="bg-white/20 rounded-2xl px-6 py-2 inline-block mb-4 border border-white/40"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-white/90 font-bold text-sm tracking-widest uppercase">
              🎓 Diploma Oficial · Guardianes del Agua
            </p>
          </motion.div>

          {/* ── Nombre del Jugador ── */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-2"
          >
            <p className="text-white/70 text-xs font-black uppercase tracking-tighter mb-1">Este diploma se otorga a:</p>
            <h2 className="text-4xl md:text-5xl font-black text-white drop-shadow-md italic underline decoration-yellow-400 underline-offset-8">
              {nombre}
            </h2>
          </motion.div>

          {/* ── Título del diploma ── */}
          <motion.h1
            className="text-2xl md:text-3xl font-black text-white drop-shadow-lg mt-8 mb-2"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, type: "spring" }}
          >
            {titulo}
          </motion.h1>

          {/* ── Subtítulo ── */}
          <motion.p
            className="text-white/90 font-semibold text-base mb-6 leading-relaxed"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {sub}
          </motion.p>

          {/* ── Puntaje circular ── */}
          <motion.div
            className="flex items-center justify-center gap-6 mb-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {/* Aciertos */}
            <div className="bg-white/25 rounded-2xl px-6 py-3 border border-white/40 text-center">
              <p className="text-4xl font-black text-white">{correctas}/{total}</p>
              <p className="text-white/80 text-sm font-bold">Respuestas</p>
            </div>

            {/* Porcentaje grande */}
            <div className="bg-white/25 rounded-2xl px-6 py-3 border border-white/40 text-center">
              <p className="text-4xl font-black text-white">{porcentaje}%</p>
              <p className="text-white/80 text-sm font-bold">Aciertos</p>
            </div>

            {/* Estrellas */}
            <div className="bg-white/25 rounded-2xl px-6 py-3 border border-white/40 text-center">
              <p className="text-3xl">
                {porcentaje >= 80 ? "⭐⭐⭐" : porcentaje >= 50 ? "⭐⭐" : "⭐"}
              </p>
              <p className="text-white/80 text-sm font-bold">Estrellas</p>
            </div>
          </motion.div>

          {/* ── Botón de reinicio ── */}
          <motion.button
            onClick={onReiniciar}
            className="
              w-full py-5 rounded-2xl font-black text-2xl
              bg-white shadow-xl border-2 border-white/50
              flex items-center justify-center gap-3
            "
            style={{ color: porcentaje >= 70 ? '#0d47a1' : '#7b1fa2' }}
            whileHover={{ scale: 1.04, boxShadow: "0 0 30px rgba(255,255,255,0.6)" }}
            whileTap={{ scale: 0.96 }}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, type: "spring" }}
          >
            🔄 Reiniciar Misión
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
