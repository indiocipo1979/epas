// ─── ImportModal.jsx ───
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import mammoth from 'mammoth';

export default function ImportModal({ onImport, onClose }) {
  const [file, setFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [preview, setPreview] = useState([]);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && (selected.name.endsWith('.docx') || selected.name.endsWith('.doc'))) {
      setFile(selected);
      setError(null);
      parseWord(selected);
    } else {
      setError('Por favor selecciona un archivo .docx válido');
    }
  };

  const parseWord = async (file) => {
    setParsing(true);
    setPreview([]);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const arrayBuffer = e.target.result;
        // Mammoth convierte a HTML manteniendo las negritas como <strong>
        const result = await mammoth.convertToHtml({ arrayBuffer });
        const html = result.value;
        
        // Procesar el HTML para extraer preguntas
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        const paragraphs = Array.from(tempDiv.querySelectorAll('p, li'));
        
        const detected = [];
        let currentQ = null;

        paragraphs.forEach(p => {
          const text = p.innerText.trim();
          if (!text || text.length < 2) return;

          // Extraer negritas
          const strongs = Array.from(p.querySelectorAll('strong, b')).map(el => el.innerText.trim());

          // Detectar si es el "Dato educativo"
          const isDato = text.toLowerCase().startsWith('dato educativo');

          if (isDato && currentQ) {
            currentQ.dato = text.replace(/^dato\s+educativo:\s*/i, '').trim();
            return;
          }

          // Detectar si tiene las opciones en la misma línea (formato horizontal)
          const hasHorizontalOptions = (text.match(/\b[A-Da-d][\)\.\-]\s+/g) || []).length >= 2;

          if (hasHorizontalOptions) {
            const firstOptionMatch = text.match(/\b[A-Da-d][\)\.\-]\s+/);
            if (firstOptionMatch) {
              const firstOptionIndex = firstOptionMatch.index;
              let questionText = text.substring(0, firstOptionIndex).trim();
              
              // Limpiar número de pregunta al inicio (ej. "1. ")
              questionText = questionText.replace(/^\d+[\.\)]\s*/, '').trim();

              const optionsPart = text.substring(firstOptionIndex).trim();

              // Parsear las opciones individuales
              const optRegex = /\b([A-Da-d])[\)\.\-]\s*(.*?)(?=\b[A-Da-d][\)\.\-]\s+|$)/gi;
              const opciones = [];
              let correctaIndex = 0;
              let oMatch;

              while ((oMatch = optRegex.exec(optionsPart)) !== null) {
                const key = oMatch[1].toUpperCase();
                const optionText = oMatch[2].trim();
                opciones.push(optionText);

                // Comprobar si esta opción está en negrita
                const optionClean = (key + optionText).replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
                
                const isBold = strongs.some(strongText => {
                  const strongClean = strongText.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
                  return strongClean === optionClean || strongClean.includes(optionClean) || optionClean.includes(strongClean);
                });

                if (isBold) {
                  correctaIndex = opciones.length - 1;
                }
              }

              if (currentQ && currentQ.opciones.length >= 2) {
                detected.push(currentQ);
              }

              const TEMAS_DISPONIBLES = [
                { name: 'Ríos y Geografía', emoji: '🏞️' },
                { name: 'Cuidado en Casa', emoji: '🏠' },
                { name: 'EPAS y Neuquén', emoji: '🏢' },
                { name: 'Salud y Cuerpo', emoji: '🧠' },
                { name: 'Curiosidades', emoji: '💧' }
              ];
              const randomTema = TEMAS_DISPONIBLES[Math.floor(Math.random() * TEMAS_DISPONIBLES.length)];

              currentQ = {
                pregunta: questionText,
                opciones: opciones,
                correcta: correctaIndex,
                tema: randomTema.name,
                emoji: randomTema.emoji,
                dato: ''
              };
            }
          } else {
            // Formato tradicional (opciones en párrafos separados)
            const startsWithOption = /^[a-zA-Z][\)\.\-]/.test(text) || text.startsWith('•');
            const isQuestion = text.includes('?') || /^\d+[\.\)]/.test(text);
            const isBold = p.querySelector('strong') || p.querySelector('b');

            if (startsWithOption && currentQ) {
              currentQ.opciones.push(text);
              if (isBold) {
                currentQ.correcta = currentQ.opciones.length - 1;
              }
            } else if (isQuestion || text.length > 40) {
              if (currentQ && currentQ.opciones.length >= 2) {
                detected.push(currentQ);
              }
              
              const TEMAS_DISPONIBLES = [
                { name: 'Ríos y Geografía', emoji: '🏞️' },
                { name: 'Cuidado en Casa', emoji: '🏠' },
                { name: 'EPAS y Neuquén', emoji: '🏢' },
                { name: 'Salud y Cuerpo', emoji: '🧠' },
                { name: 'Curiosidades', emoji: '💧' }
              ];
              const randomTema = TEMAS_DISPONIBLES[Math.floor(Math.random() * TEMAS_DISPONIBLES.length)];

              currentQ = {
                pregunta: text.replace(/^\d+[\.\)]\s*/, '').trim(),
                opciones: [],
                correcta: 0,
                tema: randomTema.name,
                emoji: randomTema.emoji,
                dato: ''
              };
            } else if (currentQ) {
              if (currentQ.opciones.length >= 2 && !currentQ.dato) {
                currentQ.dato = text;
              } else if (currentQ.opciones.length < 4) {
                currentQ.opciones.push(text);
                if (isBold) {
                  currentQ.correcta = currentQ.opciones.length - 1;
                }
              }
            }
          }
        });

        // No olvidar la última
        if (currentQ && currentQ.opciones.length >= 2) {
          detected.push(currentQ);
        }
        setPreview(detected);
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      setError('No se pudo leer el archivo. Asegúrate de que no esté protegido.');
    } finally {
      setParsing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md">
      <motion.div 
        className="bg-slate-800 w-full max-w-4xl max-h-[90vh] rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-slate-800/50">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              📄 Importador Mágico de Word
            </h2>
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-1">
              Las respuestas en <strong className="text-cyan-400 text-sm">NEGRITA</strong> se marcarán como correctas
            </p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">✕</button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/20">
          
          {/* Dropzone */}
          <div className="relative border-2 border-dashed border-white/10 rounded-2xl p-10 text-center hover:border-cyan-500/50 transition-all bg-white/5 group">
            <input 
              type="file" 
              accept=".docx" 
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">📄</div>
            <p className="text-white font-bold">{file ? file.name : 'Arrastrá tu archivo de Word aquí o hacé clic'}</p>
            <p className="text-white/40 text-xs mt-2 uppercase font-black">Solo archivos .docx</p>
          </div>

          {error && <div className="p-4 bg-red-500/20 border border-red-500/50 text-red-400 rounded-xl text-sm font-bold">{error}</div>}

          {/* Preview */}
          {preview.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-white font-black flex items-center gap-2">
                ✨ Misiones detectadas ({preview.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {preview.map((p, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-left">
                    <p className="text-xs font-black text-cyan-400 mb-1">Misión #{i+1}</p>
                    <p className="text-sm font-bold leading-tight mb-3">{p.pregunta}</p>
                    <div className="space-y-1">
                      {p.opciones.map((op, oi) => (
                        <div key={oi} className={`text-[10px] p-2 rounded-lg flex items-center justify-between ${oi === p.correcta ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-black/20 text-white/40'}`}>
                          <span>{op}</span>
                          {oi === p.correcta && <span>✅</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {parsing && (
            <div className="text-center p-10">
              <div className="animate-spin text-4xl mb-4">⌛</div>
              <p className="text-white font-bold">Analizando documento...</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-slate-800/80 flex gap-4">
          <button 
            disabled={preview.length === 0}
            onClick={() => onImport(preview)}
            className={`flex-1 py-4 rounded-2xl font-black text-lg shadow-xl transition-all ${preview.length > 0 ? 'bg-cyan-500 hover:bg-cyan-600 text-white' : 'bg-white/5 text-white/20 cursor-not-allowed'}`}
          >
            🚀 Importar {preview.length} misiones
          </button>
          <button onClick={onClose} className="px-8 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-all">Cancelar</button>
        </div>
      </motion.div>
    </div>
  );
}
