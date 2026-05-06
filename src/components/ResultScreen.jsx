// ─── ResultScreen.jsx ───
// Pantalla final con sistema de MEDALLAS (Oro, Plata, Bronce)
// Muestra un gran icono de medalla y permite descargar el PDF.

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

  // ── Configuración de Categoría y Medalla ──
  const getMedalla = () => {
    if (porcentaje === 100) {
      return { 
        icon: "🥇", 
        label: "MEDALLA DE ORO", 
        rango: "Guardián Legendario",
        color: "text-yellow-400",
        grad: "from-yellow-400 via-amber-500 to-orange-500"
      };
    }
    if (porcentaje >= 70) {
      return { 
        icon: "🥈", 
        label: "MEDALLA DE PLATA", 
        rango: "Guardián Experto",
        color: "text-gray-300",
        grad: "from-slate-300 via-gray-400 to-slate-500"
      };
    }
    if (porcentaje >= 40) {
      return { 
        icon: "🥉", 
        label: "MEDALLA DE BRONCE", 
        rango: "Guardián en Camino",
        color: "text-orange-300",
        grad: "from-orange-400 via-amber-700 to-orange-900"
      };
    }
    return { 
      icon: "💧", 
      label: "MÉRITO DE PARTICIPACIÓN", 
      rango: "Guardián en Formación",
      color: "text-blue-300",
      grad: "from-blue-400 via-indigo-500 to-purple-600"
    };
  };

  const medalla = getMedalla();

  // ── Lógica para descargar PDF ──
  const handleDownloadPDF = async () => {
    const element = diplomaRef.current;
    
    const printContainer = document.createElement('div');
    printContainer.style.position = 'absolute';
    printContainer.style.left = '-9999px';
    printContainer.style.top = '0';
    printContainer.style.width = '1123px'; 
    printContainer.style.height = '794px';
    document.body.appendChild(printContainer);

    const clone = element.cloneNode(true);
    clone.style.width = '1123px';
    clone.style.height = '794px';
    clone.style.maxWidth = 'none';
    clone.style.borderRadius = '0';
    clone.style.border = '20px solid rgba(255,255,255,0.3)';
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
      pdf.save(`Diploma_${medalla.label.replace(/\s+/g, '_')}_${nombre.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      document.body.removeChild(printContainer);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 flex flex-col items-center justify-center p-4 z-50 bg-black/70 backdrop-blur-md overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* ── DIPLOMA (Contenedor que se exporta) ── */}
      <motion.div 
        ref={diplomaRef}
        className={`
          relative w-full max-w-2xl rounded-3xl overflow-hidden
          bg-gradient-to-br ${medalla.grad}
          shadow-2xl border-4 border-white/30 p-8 text-center
        `}
        initial={{ scale: 0.8, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200 }}
      >
        {/* Decoración de fondo */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          {['💧', '🌊', '💦', '🐟', '🌿', '⭐'].map((e, i) => (
            <span key={i} className="absolute text-7xl" style={{ left: `${(i * 18) % 90}%`, top: `${(i * 25) % 80}%`, transform: `rotate(${i * 30}deg)` }}>{e}</span>
          ))}
        </div>

        <div className="relative z-10 flex flex-col items-center">
          {/* Logos */}
          <div className="flex justify-between items-center w-full mb-4">
            <img src={logoEpas} alt="EPAS" className="h-8 md:h-10 object-contain" />
            <img src={logoNeuquen} alt="Neuquén" className="h-12 md:h-14 object-contain" />
          </div>

          <div className="bg-white/20 rounded-full px-6 py-1 inline-block mb-4 border border-white/40">
            <p className="text-white font-black text-[10px] tracking-widest uppercase">
              Misión Gota · EPAS va a la Escuela
            </p>
          </div>

          {/* GRAN MEDALLA CENTRAL */}
          <motion.div 
            className="mb-2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: 'spring' }}
          >
            <div className="text-8xl md:text-9xl filter drop-shadow-2xl">{medalla.icon}</div>
            <p className={`font-black text-xl md:text-2xl mt-2 drop-shadow-lg ${medalla.color}`}>
              {medalla.label}
            </p>
          </motion.div>

          <p className="text-white/80 text-[10px] font-bold uppercase tracking-[0.2em] mb-1 italic">
            SE OTORGA ESTE DIPLOMA A:
          </p>

          <h2 className="text-4xl md:text-5xl font-black text-white drop-shadow-2xl italic mb-3 border-b-4 border-white/30 inline-block px-6 pb-1">
            {nombre}
          </h2>

          <h1 className="text-2xl font-black text-white/90 mb-4">
            {medalla.rango}
          </h1>

          <div className="flex justify-center gap-6 mt-2">
            <div className="bg-black/10 rounded-xl px-4 py-2 border border-white/20">
              <p className="text-white/70 text-[9px] font-bold uppercase">Misión</p>
              <p className="text-white text-lg font-black">{correctas}/{total}</p>
            </div>
            <div className="bg-black/10 rounded-xl px-4 py-2 border border-white/20">
              <p className="text-white/70 text-[9px] font-bold uppercase">Aciertos</p>
              <p className="text-white text-lg font-black">{porcentaje}%</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── BOTONES ACCIÓN ── */}
      <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full max-w-md">
        <motion.button
          onClick={handleDownloadPDF}
          className="flex-1 bg-green-500 hover:bg-green-600 text-white font-black py-4 px-6 rounded-2xl shadow-xl flex items-center justify-center gap-2 text-lg border-b-4 border-green-700"
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        >
          📥 Descargar PDF
        </motion.button>

        <motion.button
          onClick={onReiniciar}
          className="flex-1 bg-white hover:bg-gray-100 text-epas-sky font-black py-4 px-6 rounded-2xl shadow-xl text-lg border-b-4 border-gray-300"
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        >
          🔄 Jugar de nuevo
        </motion.button>
      </div>
    </motion.div>
  );
}
