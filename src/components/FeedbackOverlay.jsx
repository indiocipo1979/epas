// ─── FeedbackOverlay.jsx ───
// Muestra el mensaje animado de feedback tras cada respuesta.
// "¡GENIAL!", "¡SPLASH!", "¡PUM!" para correctas; mensaje de error para incorrectas.
// También muestra el dato educativo interesante de cada pregunta.

import { motion, AnimatePresence } from 'framer-motion';

export default function FeedbackOverlay({ visible, esCorrecta, mensaje, dato, onContinuar }) {
  return (
    <AnimatePresence>
      {visible && (
        // Fondo semitransparente que bloquea la pantalla
        <motion.div
          className="fixed inset-0 z-40 flex items-center justify-center p-6"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', paddingBottom: '72px' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* ── Tarjeta de feedback ── */}
          <motion.div
            className={`
              relative max-w-lg w-full rounded-3xl p-8 text-center shadow-2xl border-4
              ${esCorrecta
                ? 'bg-gradient-to-br from-emerald-500 to-green-600 border-green-300'
                : 'bg-gradient-to-br from-red-500 to-rose-700 border-red-300'
              }
            `}
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {/* Ícono grande */}
            <motion.div
              className="text-7xl mb-3"
              animate={{ rotate: [0, -10, 10, -5, 5, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6 }}
            >
              {esCorrecta ? '🎉' : '💪'}
            </motion.div>

            {/* ── Texto principal animado ── */}
            <motion.h2
              className="text-4xl font-black text-white mb-2 drop-shadow-lg"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {mensaje}
            </motion.h2>

            {/* Estado: correcta / incorrecta */}
            <motion.p
              className="text-lg font-bold text-white/90 mb-4"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {esCorrecta ? "¡Respuesta correcta!" : "Eso no era... ¡pero podés aprender!"}
            </motion.p>

            {/* ── Dato educativo ── */}
            <motion.div
              className="bg-white/20 rounded-2xl p-4 mb-6 text-left"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-sm font-bold text-white/80 mb-1">🧠 ¿Sabías que...?</p>
              <p className="text-white font-semibold text-sm leading-relaxed">{dato}</p>
            </motion.div>

            {/* ── Botón para continuar ── */}
            <motion.button
              onClick={onContinuar}
              className={`
                w-full py-4 rounded-2xl font-black text-xl
                shadow-lg border-2 border-white/50
                ${esCorrecta
                  ? 'bg-white text-green-600 hover:bg-green-50'
                  : 'bg-white text-red-600 hover:bg-red-50'
                }
              `}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              ¡Siguiente pregunta! →
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
