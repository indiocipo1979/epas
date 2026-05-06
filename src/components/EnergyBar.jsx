// ─── EnergyBar.jsx ───
// Este componente muestra la "Barra de Agua" en la parte superior.
// Se llena con cada respuesta correcta. Simula un líquido que sube.

import { motion } from 'framer-motion';

export default function EnergyBar({ current, total }) {
  // Calculamos el porcentaje de llenado (0 a 100)
  const porcentaje = Math.round((current / total) * 100);

  return (
    <div className="flex items-center gap-3 w-full">
      {/* Ícono de gota */}
      <span className="text-2xl">💧</span>

      {/* Contenedor de la barra */}
      <div className="flex-1 relative h-6 bg-blue-900/60 rounded-full border-2 border-cyan-400/50 overflow-hidden shadow-inner">

        {/* ── Relleno animado (agua) ── */}
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            background: 'linear-gradient(90deg, #0288D1 0%, #29B6F6 50%, #00E5FF 100%)',
          }}
          initial={{ width: 0 }}
          animate={{ width: `${porcentaje}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          {/* Efecto de ola en el borde del agua */}
          <div
            className="absolute right-0 inset-y-0 w-6 opacity-60"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4))',
            }}
          />
        </motion.div>

        {/* ── Burbujas dentro de la barra ── */}
        {current > 0 && (
          <>
            <motion.div
              className="absolute left-[10%] top-1 w-2 h-2 rounded-full bg-white/30"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
            />
            <motion.div
              className="absolute left-[30%] top-2 w-1.5 h-1.5 rounded-full bg-white/20"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.7 }}
            />
          </>
        )}

        {/* ── Texto de porcentaje centrado ── */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-black text-white drop-shadow-md">
            {porcentaje}% 💦
          </span>
        </div>
      </div>

      {/* Contador numérico */}
      <span className="text-sm font-bold text-cyan-300 whitespace-nowrap">
        {current}/{total}
      </span>
    </div>
  );
}
