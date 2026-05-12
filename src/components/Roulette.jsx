import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

// ─── Genera los timestamps de los ticks simulando la deceleración de la ruleta ───
// La curva imita la ease [0.2, 0.8, 0.2, 1]: arranca rápido, frena suave al final.
function generateTickTimestamps(durationMs = 3000) {
  const timestamps = [];
  // Empieza con intervalos de ~60ms (rápido) y termina en ~400ms (lento)
  let t = 0;
  let interval = 60;
  const maxInterval = 420;
  const accelFactor = 1.07; // cuánto crece el intervalo en cada tick

  while (t < durationMs) {
    timestamps.push(t);
    t += interval;
    interval = Math.min(interval * accelFactor, maxInterval);
  }
  return timestamps;
}

const THEMES = [
  { name: 'Ríos y Geografía', color: '#29ABE2', icon: '🏞️' },
  { name: 'Cuidado en Casa', color: '#E5007D', icon: '🏠' },
  { name: 'EPAS y Neuquén', color: '#F7941D', icon: '🏢' },
  { name: 'Salud y Cuerpo', color: '#8CC63F', icon: '🧠' },
  { name: 'Curiosidades', color: '#FFD700', icon: '💧' }
];

export default function Roulette({ onSpinEnd, onSpinStart, spinning }) {
  const [rotation, setRotation] = useState(0);
  const containerRef = useRef(null);
  const tickTimersRef = useRef([]);

  // Cada rebanada ocupa 360 / 5 = 72 grados
  const sliceAngle = 360 / THEMES.length;

  // ── Limpiar timers al desmontar ──
  useEffect(() => {
    return () => tickTimersRef.current.forEach(clearTimeout);
  }, []);

  // ── Reproduce el tick.ogg con deceleración progresiva ──
  const playSpinSound = () => {
    // Cancelar cualquier serie anterior
    tickTimersRef.current.forEach(clearTimeout);
    tickTimersRef.current = [];

    const timestamps = generateTickTimestamps(3000);
    timestamps.forEach((t) => {
      const id = setTimeout(() => {
        try {
          const audio = new Audio('/assets/sounds/tick.ogg');
          audio.volume = 0.45;
          audio.playbackRate = 1.0;
          audio.play().catch(() => {}); // silencia el error si el browser bloquea
        } catch (_) {}
      }, t);
      tickTimersRef.current.push(id);
    });
  };

  const handleSpinClick = () => {
    if (spinning) return;
    if (onSpinStart) onSpinStart();
    playSpinSound(); // 🎶 Sonido tipo Preguntados
    
    // Elegir un índice ganador al azar
    const winnerIndex = Math.floor(Math.random() * THEMES.length);
    
    // Calcular grados adicionales para que la flecha apunte al centro de la sección ganadora.
    // La sección 0 va de 0 a 72 grados, su centro está en 36.
    // Para que la sección quede arriba (donde apunta el indicador), 
    // necesitamos contrarrestar el giro. 
    // Indicador está arriba (0 grados o 270 grados en SVG).
    // Nuestra configuración: slice 0 inicia en 0 grados (eje X positivo).
    // Arriba (indicador) corresponde a -90 grados (o 270 grados).
    // Centro del slice i = i * 72 + 36.
    // Para que apunte arriba, la rotación final debería ser: 270 - (i * 72 + 36)
    
    const centerOffset = winnerIndex * sliceAngle + sliceAngle / 2;
    // Si el apuntador está arriba (270 grados):
    const targetRotation = 270 - centerOffset;
    
    // Agregar múltiples vueltas (por ejemplo 5 vueltas completas)
    const extraSpins = 360 * 5;
    
    const currentRotation = rotation % 360;
    let rotationToAdd = (targetRotation - currentRotation + 360) % 360;
    
    // Si la rotación a sumar es muy pequeña, le agregamos una vuelta extra para que se note el giro
    if (rotationToAdd < 45) rotationToAdd += 360;

    const finalRotation = rotation + extraSpins + rotationToAdd;

    setRotation(finalRotation);

    // Esperar el tiempo de la animación para reportar el ganador
    setTimeout(() => {
      onSpinEnd(winnerIndex);
    }, 3000); // 3 segundos que dura la animación
  };

  // Coordenadas para construir el SVG del círculo partido en 5
  // Radio 100, Centro (100, 100)
  const renderSlices = () => {
    return THEMES.map((theme, i) => {
      const startAngle = i * sliceAngle;
      const endAngle = startAngle + sliceAngle;
      
      const x1 = 100 + 100 * Math.cos((Math.PI * startAngle) / 180);
      const y1 = 100 + 100 * Math.sin((Math.PI * startAngle) / 180);
      
      const x2 = 100 + 100 * Math.cos((Math.PI * endAngle) / 180);
      const y2 = 100 + 100 * Math.sin((Math.PI * endAngle) / 180);

      // Posición del icono en el medio de la rebanada (radio 65 para que quede adentro)
      const midAngle = startAngle + sliceAngle / 2;
      const iconX = 100 + 65 * Math.cos((Math.PI * midAngle) / 180);
      const iconY = 100 + 65 * Math.sin((Math.PI * midAngle) / 180);

      const pathData = `M 100 100 L ${x1} ${y1} A 100 100 0 0 1 ${x2} ${y2} Z`;

      return (
        <g key={i}>
          <path d={pathData} fill={theme.color} stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
          <text 
            x={iconX} 
            y={iconY} 
            fontSize="30" 
            textAnchor="middle" 
            dominantBaseline="middle"
            transform={`rotate(${midAngle + 90}, ${iconX}, ${iconY})`}
          >
            {theme.icon}
          </text>
        </g>
      );
    });
  };

  return (
    <div className="flex flex-col items-center justify-center relative w-full max-w-lg mx-auto p-4">
      
      {/* Indicador superior (Flecha) */}
      <div className="absolute top-0 z-10 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[30px] border-t-white drop-shadow-md" style={{ transform: 'translateY(-10px)' }}></div>
      
      {/* Ruleta */}
      <div 
        ref={containerRef}
        className="relative w-96 h-96 rounded-full shadow-2xl border-4 border-white/80 bg-white/10 backdrop-blur-sm p-1"
        style={{ cursor: spinning ? 'default' : 'pointer' }}
        onClick={handleSpinClick}
      >
        <motion.div
          className="w-full h-full rounded-full overflow-hidden"
          animate={{ rotate: rotation }}
          transition={{ duration: 3, ease: [0.2, 0.8, 0.2, 1] }} // Curva decelerada para simular fricción
        >
          <svg viewBox="0 0 200 200" width="100%" height="100%" className="rounded-full">
            {renderSlices()}
          </svg>
        </motion.div>
        
        {/* Centro de la ruleta */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-inner flex items-center justify-center font-bold text-epas-sky">
          EPAS
        </div>
      </div>

      {/* Botón Girar (Opcional, también se puede clickear la ruleta) */}
      <motion.button
        className="mt-8 px-8 py-3 bg-white text-epas-sky font-black text-xl rounded-full shadow-lg"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleSpinClick}
        disabled={spinning}
        style={{ opacity: spinning ? 0.5 : 1 }}
      >
        {spinning ? 'GIRANDO...' : '¡GIRAR RULETA!'}
      </motion.button>
    </div>
  );
}

export { THEMES };
