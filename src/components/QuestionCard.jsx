// ─── QuestionCard.jsx ───
// Muestra la pregunta actual y los 4 botones de respuesta.
// Gestiona el estado de respuesta seleccionada y envía el resultado al padre.

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AnswerButton from './AnswerButton';

export default function QuestionCard({
  pregunta,         // Objeto con la pregunta
  indicePregunta,   // Número de pregunta actual (0-based)
  total,            // Total de preguntas
  onRespuesta,      // Callback cuando el usuario elige una respuesta
  onPlaySound,      // Callback para reproducir sonido inmediato
}) {
  // ── Estado local: qué opción eligió el usuario ──
  const [elegida, setElegida] = useState(null);

  // ── Cuando el usuario hace click en una respuesta ──
  const handleClick = (indice) => {
    if (elegida !== null) return; // Evitar doble click
    setElegida(indice);

    const esCorrecta = indice === pregunta.correcta;
    if (onPlaySound) {
      onPlaySound(esCorrecta);
    }

    // Esperamos un momento para que se vea la animación antes de continuar
    setTimeout(() => {
      onRespuesta(esCorrecta, pregunta.dato, pregunta.correcta);
      setElegida(null); // Reset para la siguiente pregunta
    }, 600);
  };

  // ── Determinar el estado visual de cada botón ──
  const getEstadoBoton = (indice) => {
    if (elegida === null) return null;
    if (indice === elegida) {
      return indice === pregunta.correcta ? "correcta" : "incorrecta";
    }
    if (indice === pregunta.correcta) return "correcta-no-elegida";
    return null;
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        // ── Clave única para que Framer sepa que cambió la pregunta ──
        key={pregunta.id}
        className="flex flex-col h-full"

        // ── Entrada: slide desde la derecha ──
        initial={{ opacity: 0, x: 80 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -80 }}
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
      >
        {/* ── Indicador de progreso ── */}
        <div className="flex items-center gap-2 mb-4">
          {Array.from({ length: total }, (_, i) => (
            <motion.div
              key={i}
              className={`h-2 flex-1 rounded-full ${
                i < indicePregunta
                  ? 'bg-cyan-400'
                  : i === indicePregunta
                    ? 'bg-white'
                    : 'bg-white/20'
              }`}
              animate={i === indicePregunta ? { opacity: [0.5, 1, 0.5] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          ))}
        </div>

        {/* ── Número de pregunta ── */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-3xl">{pregunta.emoji}</span>
          <span className="text-cyan-300 font-bold text-sm">
            Pregunta {indicePregunta + 1} de {total}
          </span>
        </div>

        {/* ── Texto de la pregunta ── */}
        <motion.div
          className="glass-card p-5 mb-5 flex-shrink-0"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-white font-black text-xl md:text-2xl leading-tight">
            {pregunta.pregunta}
          </h2>
        </motion.div>

        {/* ── Opciones de respuesta ── */}
        <div className="flex flex-col gap-3 flex-1">
          {pregunta.opciones.map((opcion, indice) => (
            <AnswerButton
              key={indice}
              indice={indice}
              texto={opcion}
              onClick={() => handleClick(indice)}
              estado={getEstadoBoton(indice)}
              deshabilitado={elegida !== null}
            />
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
