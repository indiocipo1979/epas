// ─── ConfettiEffect.jsx ───
// Muestra partículas de confeti cuando el jugador responde correctamente.
// Usa Framer Motion para animación de caída con rotación y colores variados.

import { motion } from 'framer-motion';
import { useMemo } from 'react';

// Colores vibrantes del confeti
const COLORES = [
  '#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1',
  '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E9', '#82E0AA',
];

// Formas del confeti
const FORMAS = ['rounded-full', 'rounded-sm', 'rounded-none'];

export default function ConfettiEffect({ activo }) {
  // Generamos 50 piezas de confeti con posiciones y propiedades aleatorias
  const piezas = useMemo(() =>
    Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,          // Posición horizontal (% del ancho)
      delay: Math.random() * 0.8,       // Retraso de animación
      duracion: 1.5 + Math.random(),    // Duración de la caída
      color: COLORES[Math.floor(Math.random() * COLORES.length)],
      ancho: 6 + Math.floor(Math.random() * 10),
      alto: 6 + Math.floor(Math.random() * 10),
      forma: FORMAS[Math.floor(Math.random() * FORMAS.length)],
    })), []
  );

  if (!activo) return null;

  return (
    // Contenedor que cubre toda la pantalla
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {piezas.map((pieza) => (
        <motion.div
          key={pieza.id}
          className={`absolute top-0 ${pieza.forma}`}
          style={{
            left: `${pieza.x}%`,
            width: pieza.ancho,
            height: pieza.alto,
            backgroundColor: pieza.color,
          }}
          initial={{ y: -20, opacity: 1, rotate: 0 }}
          animate={{
            y: '110vh',
            opacity: [1, 1, 0],
            rotate: 360 * (Math.random() > 0.5 ? 1 : -1) * 2,
            x: [0, (Math.random() - 0.5) * 200],
          }}
          transition={{
            duration: pieza.duracion,
            delay: pieza.delay,
            ease: "easeIn",
          }}
        />
      ))}
    </div>
  );
}
