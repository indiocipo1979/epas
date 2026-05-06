// ─── ResultScreen.jsx ───
// Pantalla final: "Diploma de Guardián del Agua"
// Muestra el puntaje, un mensaje motivador y el botón para descargar PDF y reiniciar.

import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import logoEpas from '../assets/logo-epas.png';
import logoNeuquen from '../assets/logo-neuquen.png';

export default function ResultScreen({ nombre, correctas, total, onReiniciar }) {
  const diplomaRef = useRef();

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

  // ── Lógica para descargar PDF ──
  const handleDownloadPDF = async () => {
    const element = diplomaRef.current;
    
    // Crear un contenedor temporal para el renderizado A4
    const printContainer = document.createElement('div');
    printContainer.style.position = 'absolute';
    printContainer.style.left = '-9999px';
    printContainer.style.top = '0';
    printContainer.style.width = '1123px'; // A4 Apaisado px approx
    printContainer.style.height = '794px';
    document.body.appendChild(printContainer);

    // Clonar el diploma y ajustarlo al tamaño A4
    const clone = element.cloneNode(true);
    clone.style.width = '1123px';
    clone.style.height = '794px';
    clone.style.maxWidth = 'none';
    clone.style.borderRadius = '0';
    clone.style.border = '20px solid rgba(255,255,255,0.4)';
    printContainer.appendChild(clone);

    try {
      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        logging: false,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [1123, 794]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, 1123, 794);
      pdf.save(`Diploma_EPAS_${nombre.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error("Error generando PDF:", error);
      alert("Hubo un error al generar el PDF. Por favor intentá de nuevo.");
    } finally {
      document.body.removeChild(printContainer);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 flex flex-col items-center justify-center p-4 z-50 bg-black/60 backdrop-blur-md overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* ── Contenedor del Diploma (Vista en pantalla) ── */}
      <motion.div 
        ref={diplomaRef}
        className={`
          relative w-full max-w-2xl rounded-3xl overflow-hidden
          bg-gradient-to-br ${getColor()}
          shadow-2xl border-4 border-white/30 p-8 text-center
        `}
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200 }}
      >
        {/* Decoración de fondo */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          {['💧', '🌊', '💦', '🐟', '🌿', '⭐'].map((e, i) => (
            <span
              key={i}
              className="absolute text-7xl"
              style={{
                left: `${(i * 18) % 90}%`,
                top: `${(i * 25) % 80}%`,
                transform: `rotate(${i * 30}deg)`,
              }}
            >{e}</span>
          ))}
        </div>

        <div className="relative z-10">
          {/* Logos */}
          <div className="flex justify-between items-center mb-6">
            <img src={logoEpas} alt="EPAS" className="h-8 md:h-10 object-contain" />
            <img src={logoNeuquen} alt="Neuquén" className="h-12 md:h-14 object-contain" />
          </div>

          <div className="bg-white/20 rounded-full px-6 py-2 inline-block mb-4 border border-white/40">
            <p className="text-white font-black text-xs tracking-widest uppercase">
              🎓 Diploma de Guardián del Agua
            </p>
          </div>

          <p className="text-white/80 text-xs font-bold uppercase tracking-widest mb-1 italic">
            Certificamos con orgullo que:
          </p>

          <h2 className="text-4xl md:text-5xl font-black text-white drop-shadow-2xl italic mb-4 border-b-4 border-yellow-400 inline-block px-4 pb-1">
            {nombre}
          </h2>

          <h1 className="text-2xl md:text-3xl font-black text-white drop-shadow-lg mb-3">
            {titulo}
          </h1>

          <p className="text-white/90 font-bold text-base mb-6 max-w-md mx-auto leading-tight">
            {sub}
          </p>

          {/* Stats en el diploma */}
          <div className="flex justify-center gap-4 mb-2">
            <div className="bg-black/10 rounded-xl px-4 py-2 border border-white/20">
              <p className="text-white/70 text-[10px] font-bold uppercase">Aciertos</p>
              <p className="text-white text-xl font-black">{correctas}/{total}</p>
            </div>
            <div className="bg-black/10 rounded-xl px-4 py-2 border border-white/20">
              <p className="text-white/70 text-[10px] font-bold uppercase">Calificación</p>
              <p className="text-white text-xl font-black">{porcentaje}%</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Botones de Acción (Fuera del diploma) ── */}
      <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full max-w-md">
        <motion.button
          onClick={handleDownloadPDF}
          className="flex-1 bg-green-500 hover:bg-green-600 text-white font-black py-4 px-6 rounded-2xl shadow-xl flex items-center justify-center gap-2 text-lg transition-colors border-b-4 border-green-700"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          🎓 Descargar Diploma (PDF)
        </motion.button>

        <motion.button
          onClick={onReiniciar}
          className="flex-1 bg-white hover:bg-gray-100 text-epas-sky font-black py-4 px-6 rounded-2xl shadow-xl text-lg transition-colors border-b-4 border-gray-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          🔄 Jugar de nuevo
        </motion.button>
      </div>
    </motion.div>
  );
}
