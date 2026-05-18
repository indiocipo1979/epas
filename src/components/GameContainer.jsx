// ─── GameContainer.jsx ───
// Componente principal del juego. Controla el flujo completo:
// Pantalla inicio → Preguntas → Feedback → Pantalla final
// Rediseñado con la identidad visual oficial EPAS va a la Escuela

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import EnergyBar from './EnergyBar';
import QuestionCard from './QuestionCard';
import FeedbackOverlay from './FeedbackOverlay';
import ResultScreen from './ResultScreen';
import ConfettiEffect from './ConfettiEffect';
import FloatingCharacter from './FloatingCharacter';
import logoEpas from '../assets/logo-epas.png';
import logoNeuquen from '../assets/logo-neuquen.png';
import { MENSAJES_CORRECTA, MENSAJES_INCORRECTA, PREGUNTAS as PREGUNTAS_DEFAULT } from '../data/questions';
import { getPreguntas } from '../utils/questionStorage';
import { supabase } from '../lib/supabase';
import useSound from 'use-sound';
import RouletteGameMode from './RouletteGameMode';

// ─── Paleta de fondos rotativos por pregunta (celeste / magenta / naranja) ───
const BG_COLORS = [
  { bg: '#29ABE2', shadow: '#1A8ABE' },  // Celeste
  { bg: '#E5007D', shadow: '#B5006A' },  // Magenta
  { bg: '#F7941D', shadow: '#D4780A' },  // Naranja
];

// ─── Estrellas decorativas flotantes EPAS ───
function DecorativeStars({ colorIndex }) {
  const stars = [
    { top: '8%',  left: '5%',   size: '2rem',  delay: 0,   duration: 3 },
    { top: '5%',  left: '48%',  size: '2.5rem', delay: 0.8, duration: 3.5 },
    { top: '12%', right: '6%',  size: '1.8rem', delay: 1.5, duration: 2.8 },
    { top: '75%', left: '3%',   size: '1.5rem', delay: 0.5, duration: 4 },
    { top: '80%', left: '50%',  size: '2rem',   delay: 1.2, duration: 3.2 },
    { top: '70%', right: '4%',  size: '1.6rem', delay: 0.3, duration: 3.8 },
  ];
  return (
    <>
      {stars.map((s, i) => (
        <motion.div
          key={`${colorIndex}-${i}`}
          style={{
            position: 'absolute',
            top: s.top,
            left: s.left,
            right: s.right,
            fontSize: s.size,
            color: '#FFD700',
            filter: 'drop-shadow(0 0 6px rgba(255,215,0,0.7))',
            zIndex: 1,
            pointerEvents: 'none',
          }}
          animate={{ y: [0, -16, 0], rotate: [0, 20, -10, 0] }}
          transition={{ duration: s.duration, delay: s.delay, repeat: Infinity, ease: 'easeInOut' }}
        >
          ★
        </motion.div>
      ))}
    </>
  );
}

// ─── Footer institucional EPAS (con acceso admin) ───
function InstitutionalFooter({ onAdmin }) {
  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.72)', // Vidrio translúcido premium
        backdropFilter: 'blur(16px) saturate(120%)', // Desenfoque potente y saturación del fondo
        borderTop: '2px solid rgba(255, 255, 255, 0.5)', // Borde superior blanco brillante
        boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.06)', // Sombra suave hacia arriba
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '24px',
        padding: '8px 24px',
        flexShrink: 0,
        height: '64px',
        transition: 'background 0.5s ease', // Transición suave al cambiar de fondo
      }}
    >
      {/* Badge EPAS va a la Escuela */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1A3A6B 0%, #0D203F 100%)', // Gradiente azul profundo
          borderRadius: '10px',
          padding: '5px 12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          lineHeight: 1.1,
          boxShadow: '0 4px 12px rgba(26, 58, 107, 0.25)',
        }}
      >
        <span style={{ color: '#ffffff', fontSize: '8px', fontWeight: 800, letterSpacing: '0.6px', textTransform: 'uppercase' }}>
          EPAS <span style={{ color: '#29ABE2' }}>va a la</span>
        </span>
        <span style={{ color: '#FFD700', fontSize: '13px', fontWeight: 900, letterSpacing: '1px' }}>
          ESCUELA
        </span>
      </div>

      {/* Separador */}
      <div style={{ width: '1.5px', height: '28px', background: 'rgba(26, 58, 107, 0.15)' }} />

      {/* Logo EPAS institucional */}
      <img src={logoEpas} alt="Logo EPAS" style={{ height: '36px', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.05))' }} />

      {/* Separador */}
      <div style={{ width: '1.5px', height: '28px', background: 'rgba(26, 58, 107, 0.15)' }} />

      {/* Gobierno de la Provincia */}
      <img src={logoNeuquen} alt="Gobierno de Neuquén" style={{ height: '44px', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.05))' }} />

      {/* Botón admin (icono discreto) */}
      <div style={{ width: '1.5px', height: '28px', background: 'rgba(26, 58, 107, 0.15)' }} />
      <button
        onClick={onAdmin}
        title="Panel de Administración"
        style={{
          background: 'rgba(26, 58, 107, 0.08)',
          border: '1px solid rgba(26, 58, 107, 0.15)',
          borderRadius: '10px',
          padding: '6px 12px',
          cursor: 'pointer',
          fontSize: '16px',
          transition: 'all 0.2s ease',
          display: 'flex', 
          alignItems: 'center', 
          gap: '4px',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(26, 58, 107, 0.15)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(26, 58, 107, 0.08)'}
      >
        ⚙️
      </button>
    </div>
  );
}

export default function GameContainer({ onAdmin }) {
  // ── Estado del juego ──
  const [preguntas, setPreguntas]             = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [pantalla, setPantalla]               = useState('inicio');
  const [nombre, setNombre]                   = useState(''); // Nuevo estado para el nombre
  const [indicePregunta, setIndicePregunta]   = useState(0);
  const [correctas, setCorrectas]             = useState(0);
  const [feedback, setFeedback]               = useState({ visible: false, esCorrecta: false, mensaje: '', dato: '' });
  const [confeti, setConfeti]                 = useState(false);
  const [colorIndex, setColorIndex]           = useState(0);
  const [timeLeft, setTimeLeft]               = useState(15); // Tiempo inicial subido a 15
  const [timerActive, setTimerActive]         = useState(false);
  const [tiempoTotal, setTiempoTotal]         = useState(0); 
  const [timestampInicio, setTimestampInicio] = useState(null); // Para cálculo real

  // ── Sonidos ──
  const [playCorrect] = useSound('/assets/sounds/correct.mp3', { volume: 0.7 });
  const [playIncorrect] = useSound('/assets/sounds/incorrect.mp3', { volume: 0.8 });
  const [playTick] = useSound('/assets/sounds/tick.ogg', { volume: 0.5 });

  // ── Cargar preguntas al iniciar y escuchar cambios ──
  useEffect(() => {
    // 1. Temporizador de seguridad (fuerza el inicio en 2.5 seg pase lo que pase)
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500);

    // 2. Carga inicial
    const cargar = async () => {
      try {
        let data = await getPreguntas();
        if (!data || data.length === 0) data = [...PREGUNTAS_DEFAULT];

        // RETROCOMPATIBILIDAD: Si alguna pregunta no tiene tema, le asignamos uno aleatorio
        const TEMAS_COMPAT = [
          { name: 'Ríos y Geografía', emoji: '🏞️' },
          { name: 'Cuidado en Casa', emoji: '🏠' },
          { name: 'EPAS y Neuquén', emoji: '🏢' },
          { name: 'Salud y Cuerpo', emoji: '🧠' },
          { name: 'Curiosidades', emoji: '💧' }
        ];

        const normalizadas = data.map(p => {
          if (!p.tema) {
            const randomTema = TEMAS_COMPAT[Math.floor(Math.random() * TEMAS_COMPAT.length)];
            return {
              ...p,
              tema: randomTema.name,
              emoji: p.emoji && p.emoji !== '💧' ? p.emoji : randomTema.emoji
            };
          }
          return p;
        });

        // MEZCLA ALEATORIA (Fisher-Yates Shuffle)
        const mezcladas = [...normalizadas].sort(() => Math.random() - 0.5);
        
        // SELECCIONAR SOLO 10
        setPreguntas(mezcladas.slice(0, 10));
      } catch (e) {
        console.error("Fallo carga:", e);
        const TEMAS_COMPAT = [
          { name: 'Ríos y Geografía', emoji: '🏞️' },
          { name: 'Cuidado en Casa', emoji: '🏠' },
          { name: 'EPAS y Neuquén', emoji: '🏢' },
          { name: 'Salud y Cuerpo', emoji: '🧠' },
          { name: 'Curiosidades', emoji: '💧' }
        ];
        const normalizadas = PREGUNTAS_DEFAULT.map(p => {
          if (!p.tema) {
            const randomTema = TEMAS_COMPAT[Math.floor(Math.random() * TEMAS_COMPAT.length)];
            return { ...p, tema: randomTema.name, emoji: randomTema.emoji };
          }
          return p;
        });
        const mezcladas = [...normalizadas].sort(() => Math.random() - 0.5);
        setPreguntas(mezcladas.slice(0, 10));
      } finally {
        setLoading(false);
        clearTimeout(timer);
      }
    };
    cargar();

    // 3. Escuchar cambios (solo si supabase está configurado)
    if (supabase) {
      try {
        const channel = supabase
          .channel('cambios-preguntas')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'preguntas' }, () => {
            cargar(); 
          })
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
          clearTimeout(timer);
        };
      } catch (e) {
        console.error("Error suscripcion:", e);
      }
    }
    return () => clearTimeout(timer);
  }, []);

  // ── Lógica del Temporizador (Solo Clásico) ──
  useEffect(() => {
    let interval;
    if (timerActive && timeLeft > 0 && pantalla === 'juego_clasico' && !feedback.visible) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerActive && pantalla === 'juego_clasico' && !feedback.visible) {
      // TIEMPO AGOTADO
      setTimerActive(false);
      handleRespuesta(-1); // -1 indica que no se seleccionó nada (incorrecta)
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft, pantalla, feedback.visible]);

  // ── Alerta sonora de tiempo crítico (Solo Clásico) ──
  useEffect(() => {
    if (timerActive && timeLeft <= 5 && timeLeft > 0 && pantalla === 'juego_clasico' && !feedback.visible) {
      playTick();
    }
  }, [timeLeft, timerActive, pantalla, feedback.visible, playTick]);

  const bgColor  = BG_COLORS[colorIndex % BG_COLORS.length];

  // ── Respuesta del usuario ──
  const triggerSound = (esCorrecta) => {
    if (esCorrecta === true) {
      playCorrect();
    } else {
      playIncorrect();
    }
  };

  const handleRespuesta = (esCorrecta, dato) => {
    setTimerActive(false); // Detener el reloj apenas responde
    
    if (esCorrecta === true) {
      setCorrectas(prev => prev + 1);
      setConfeti(true);
      setTimeout(() => setConfeti(false), 3000);
    }
    
    // Si esCorrecta es -1, significa tiempo agotado
    const esTiempoAgotado = esCorrecta === -1;
    if (esTiempoAgotado) {
      playIncorrect(); // Play sound if timeout
    }
    const mensajes = esCorrecta === true ? MENSAJES_CORRECTA : MENSAJES_INCORRECTA;
    let mensaje = mensajes[Math.floor(Math.random() * mensajes.length)];
    
    if (esTiempoAgotado) {
      mensaje = "¡Se acabó el tiempo! ⏱️ Tenés que ser más rápido.";
    }

    setFeedback({ visible: true, esCorrecta: esCorrecta === true, mensaje, dato });
  };

  // ── Finalizar partida (Común para ambos modos) ──
  const finalizarPartida = async (correctasFinales, totalPreguntas) => {
    setCorrectas(correctasFinales);
    const segundosTotales = Math.round((Date.now() - timestampInicio) / 1000);
    
    if (supabase) {
      console.log('Intentando guardar participacion...', { nombre, correctas: correctasFinales, segundosTotales });
      const { error } = await supabase.from('participaciones').insert([{
        nombre: nombre || 'Anónimo',
        puntaje: correctasFinales,
        total: totalPreguntas,
        tiempo_total: segundosTotales
      }]);
      
      if (error) {
        console.error('Error CRÍTICO de Supabase:', error.message);
        if (error.message.includes('tiempo_total')) {
            await supabase.from('participaciones').insert([{
            nombre: nombre || 'Anónimo',
            puntaje: correctasFinales,
            total: totalPreguntas
          }]);
        }
      } else {
        console.log('✅ Partida guardada con éxito');
      }
    }
    setPantalla('final');
  };

  // ── Avanzar a la siguiente pregunta (Solo Clásico) ──
  const handleContinuar = async () => {
    setFeedback(f => ({ ...f, visible: false }));
    setTimeout(async () => {
      const siguiente = indicePregunta + 1;
      if (siguiente >= qList.length) {
        finalizarPartida(correctas, qList.length);
      } else {
        setIndicePregunta(siguiente);
        setColorIndex(prev => prev + 1); // Rotar color de fondo
        setTimeLeft(15); // Reset a 15
        setTimerActive(true);
      }
    }, 200);
  };

  // ── Reiniciar ──
  const handleReiniciar = async () => {
    setLoading(true);
    const data = await getPreguntas(); 
    setPreguntas(data);
    setIndicePregunta(0);
    setCorrectas(0);
    setFeedback({ visible: false, esCorrecta: false, mensaje: '', dato: '' });
    setConfeti(false);
    setColorIndex(0);
    setTiempoTotal(0); // Reset tiempo
    setPantalla('inicio');
    setLoading(false);
  };

  // ── Renderizado de seguridad ──
  if (loading) {
    return (
      <div style={{ position: 'fixed', inset: 0, backgroundColor: '#29ABE2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>Cargando Misión...</p>
      </div>
    );
  }

  // Fallback para preguntas
  const qList = (preguntas && preguntas.length > 0) ? preguntas : PREGUNTAS_DEFAULT;
  const preguntaActual = qList[indicePregunta] || PREGUNTAS_DEFAULT[0];

  return (
    <div className="fixed inset-0 flex flex-col font-game overflow-hidden" style={{ backgroundColor: bgColor.bg }}>

      {/* ── Fondo animado con color EPAS ── */}
      <motion.div
        className="fixed inset-0"
        style={{ zIndex: 0 }}
        animate={{ backgroundColor: bgColor.bg }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
      />

      {/* ── Estrellas decorativas ── */}
      <DecorativeStars colorIndex={colorIndex} />

      {/* ── Confeti ── */}
      <ConfettiEffect activo={confeti} />

      {/* ── Alerta de tiempo crítico (Borde rojo - Solo Clásico) ── */}
      <AnimatePresence>
        {timeLeft <= 3 && pantalla === 'juego_clasico' && !feedback.visible && (
          <motion.div 
            className="fixed inset-0 pointer-events-none border-[12px] border-red-500/40 z-[99]"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, repeat: Infinity }}
          />
        )}
      </AnimatePresence>

      {/* ── Feedback overlay ── */}
      <FeedbackOverlay
        visible={feedback.visible}
        esCorrecta={feedback.esCorrecta}
        mensaje={feedback.mensaje}
        dato={feedback.dato}
        onContinuar={handleContinuar}
      />

      {/* ═══════════════════════════════════
          CONTENIDO PRINCIPAL (flex-1)
      ═══════════════════════════════════ */}
      <div className="flex-1 flex flex-col relative" style={{ zIndex: 2 }}>

        {/* ══════════════════════════════
            PANTALLA DE INICIO
        ══════════════════════════════ */}
        <AnimatePresence>
          {pantalla === 'inicio' && (
            <motion.div
              className="fixed inset-0 flex flex-col items-center justify-center p-6"
              style={{ zIndex: 10, paddingBottom: '72px', overflowY: 'auto' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >

              {/* Personaje flotante */}
              <motion.div
                className="flex justify-center mb-3"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              >
                <FloatingCharacter size="lg" happy={true} />
              </motion.div>

              {/* Título */}
              <motion.h1
                className="text-5xl md:text-6xl font-black text-white text-center drop-shadow-xl leading-tight mb-2"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              >
                <span style={{ color: '#FFD700' }}>Misión</span>{' '}
                <span className="text-white">Gota</span>
              </motion.h1>
              <motion.h2
                className="text-xl md:text-2xl font-black text-white/90 text-center mb-1"
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                💧 Guardianes del Agua
              </motion.h2>

              <motion.p
                className="text-white font-bold text-sm text-center max-w-sm mx-auto leading-relaxed mb-6 opacity-90"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                ¡Demostrá que sos un verdadero Guardián del Agua!
                Respondé {preguntas.length} preguntas sobre el cuidado del agua en Neuquén.
              </motion.p>

              {/* Chips de datos */}
              <motion.div
                className="flex gap-3 mb-8 flex-wrap justify-center"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                {[
                  { icon: '❓', label: `${preguntas.length} Preguntas` },
                  { icon: '🌊', label: 'Neuquén y Patagonia' },
                  { icon: '🏆', label: 'Diploma guardián' },
                ].map((item, i) => (
                  <div
                    key={i}
                    style={{
                      background: 'rgba(255,255,255,0.22)',
                      border: '2px solid rgba(255,255,255,0.4)',
                      borderRadius: '14px',
                      padding: '10px 16px',
                      textAlign: 'center',
                      backdropFilter: 'blur(8px)',
                    }}
                  >
                    <div style={{ fontSize: '1.5rem', marginBottom: '2px' }}>{item.icon}</div>
                    <div style={{ color: '#fff', fontSize: '11px', fontWeight: 800 }}>{item.label}</div>
                  </div>
                ))}
              </motion.div>

              {/* Input de Nombre */}
              <motion.div
                className="w-full max-w-xs mb-6"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.55 }}
              >
                <input
                  type="text"
                  placeholder="Tu nombre aquí..."
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full p-4 rounded-2xl border-4 border-white/30 bg-white/20 text-white placeholder:text-white/50 text-center font-black text-xl outline-none focus:border-white/60 transition-all"
                />
              </motion.div>

              {/* Botones de INICIAR */}
              <motion.div
                className="flex flex-col gap-4 w-full max-w-xs"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.7, type: 'spring', stiffness: 300 }}
              >
                <motion.button
                  onClick={() => {
                    if (!nombre.trim()) {
                      alert('¡Por favor, ingresá tu nombre para recibir tu diploma!');
                      return;
                    }
                    setPantalla('juego_clasico');
                    setTimestampInicio(Date.now());
                    setColorIndex(0);
                    setTimeLeft(15);
                    setTimerActive(true);
                  }}
                  style={{
                    background: '#FFD700',
                    color: '#1A3A6B',
                    padding: '0 20px',
                    height: '64px',
                    borderRadius: '50px',
                    fontSize: '18px',
                    fontWeight: 900,
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 6px 24px rgba(0,0,0,0.25), 0 0 0 4px rgba(255,255,255,0.3)',
                    fontFamily: 'Nunito, sans-serif',
                    width: '100%',
                    whiteSpace: 'nowrap',
                  }}
                  whileHover={{ scale: 1.05, boxShadow: '0 10px 36px rgba(0,0,0,0.3)' }}
                  whileTap={{ scale: 0.96 }}
                >
                  🚀 Modo Clásico
                </motion.button>
                
                <motion.button
                  onClick={() => {
                    if (!nombre.trim()) {
                      alert('¡Por favor, ingresá tu nombre para recibir tu diploma!');
                      return;
                    }
                    setPantalla('juego_ruleta');
                    setTimestampInicio(Date.now());
                  }}
                  style={{
                    background: '#E5007D',
                    color: '#FFFFFF',
                    padding: '0 20px',
                    height: '64px',
                    borderRadius: '50px',
                    fontSize: '18px',
                    fontWeight: 900,
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 6px 24px rgba(0,0,0,0.25), 0 0 0 4px rgba(255,255,255,0.3)',
                    fontFamily: 'Nunito, sans-serif',
                    width: '100%',
                    whiteSpace: 'nowrap',
                  }}
                  whileHover={{ scale: 1.05, boxShadow: '0 10px 36px rgba(0,0,0,0.3)' }}
                  whileTap={{ scale: 0.96 }}
                >
                  🎡 ¡Modo Ruleta Mágica!</motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ══════════════════════════════
            PANTALLA DE JUEGO (CLÁSICO)
        ══════════════════════════════ */}
        <AnimatePresence>
          {pantalla === 'juego_clasico' && (
            <motion.div
              className="fixed inset-0 flex"
              style={{ zIndex: 10, paddingBottom: '64px' }}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            >
              {/* Panel izquierdo: personaje + reloj grande + mini stats (solo md+) */}
              <div className="hidden md:flex flex-col items-center justify-center w-52 flex-shrink-0 p-4 gap-3">

                {/* ── Reloj grande sobre la gota ── */}
                <motion.div
                  className={`flex flex-col items-center justify-center rounded-3xl px-4 py-3 w-full shadow-2xl border-4 ${
                    timeLeft <= 3
                      ? 'bg-red-600 border-red-300 shadow-red-500/60'
                      : timeLeft <= 7
                        ? 'bg-yellow-400 border-yellow-200 shadow-yellow-400/40'
                        : 'bg-white/20 border-white/40'
                  }`}
                  animate={timeLeft <= 3 ? { scale: [1, 1.08, 1], rotate: [-2, 2, -1, 0] } : { scale: 1 }}
                  transition={{ repeat: Infinity, duration: 0.45 }}
                >
                  <span style={{ fontSize: '2.8rem', lineHeight: 1 }}>⏱️</span>
                  <span
                    className="font-black text-white drop-shadow-md"
                    style={{ fontSize: '3.5rem', lineHeight: 1, fontFamily: 'Nunito, sans-serif' }}
                  >
                    {timeLeft}
                  </span>
                  <span className="text-white/80 text-xs font-bold mt-1">segundos</span>
                </motion.div>

                <FloatingCharacter size="md" happy={true} />

                <div className="glass-card p-3 text-center w-full">
                  <div className="text-2xl font-black text-white">{correctas}</div>
                  <div className="text-white/80 text-xs font-bold">Correctas ✅</div>
                </div>
                <div className="glass-card p-3 text-center w-full">
                  <div className="text-2xl font-black text-white">
                    {indicePregunta - correctas}
                  </div>
                  <div className="text-white/80 text-xs font-bold">Incorrectas ❌</div>
                </div>
              </div>

              {/* Panel derecho: pregunta */}
              <div className="flex-1 flex flex-col p-4 md:p-6 min-w-0">

                {/* Header con barras */}
                <div className="glass-card p-4 mb-4 flex-shrink-0 relative overflow-hidden">
                  {/* Barra de Tiempo (Fusible) */}
                  <div className="absolute top-0 left-0 h-1.5 bg-white/10 w-full overflow-hidden">
                    <motion.div 
                      className={`h-full ${timeLeft > 7 ? 'bg-green-400' : timeLeft > 3 ? 'bg-yellow-400' : 'bg-red-500'}`}
                      initial={{ width: '100%' }}
                      animate={{ width: `${(timeLeft / 15) * 100}%` }}
                      transition={{ duration: 1, ease: 'linear' }}
                    />
                  </div>

                  <div className="flex items-center justify-between mt-1 mb-2">
                    <span className="text-white font-black text-sm md:text-base">
                      📍 Tu Progreso
                    </span>
                    <div className="flex items-center gap-2">
                      {/* Segundero en móviles */}
                      <motion.div
                        className={`md:hidden flex items-center gap-1 text-white px-3 py-1 rounded-xl font-black text-xs shadow-lg border ${
                          timeLeft <= 3
                            ? 'bg-red-600 border-red-300'
                            : timeLeft <= 7
                              ? 'bg-yellow-500 border-yellow-200'
                              : 'bg-white/20 border-white/40'
                        }`}
                        animate={timeLeft <= 3 ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ repeat: timeLeft <= 3 ? Infinity : 0, duration: 0.5 }}
                      >
                        <span>⏱️</span>
                        <span>{timeLeft}s</span>
                      </motion.div>
                      {/* Badge de Puntos */}
                      <div className="bg-yellow-400 text-slate-900 px-3 py-1 rounded-xl font-black text-xs shadow-lg">
                        ✨ {correctas} GOTAS
                      </div>
                    </div>
                  </div>
                  <EnergyBar current={indicePregunta + 1} total={qList.length} />
                </div>

                {/* Tarjeta de pregunta */}
                <div className="flex-1 overflow-y-auto">
                  <QuestionCard
                    pregunta={preguntaActual}
                    indicePregunta={indicePregunta}
                    total={qList.length}
                    onRespuesta={handleRespuesta}
                    onPlaySound={triggerSound}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* ══════════════════════════════
              PANTALLA DE JUEGO (RULETA)
          ══════════════════════════════ */}
          {pantalla === 'juego_ruleta' && (
            <RouletteGameMode 
              preguntas={qList}
              onGameEnd={finalizarPartida}
            />
          )}
        </AnimatePresence>

        {/* ══════════════════════════════
            PANTALLA FINAL
        ══════════════════════════════ */}
        {pantalla === 'final' && (
          <ResultScreen
            nombre={nombre}
            correctas={correctas}
            total={qList.length}
            onReiniciar={handleReiniciar}
          />
        )}
      </div>

      {/* ── Footer institucional siempre visible ── */}
      <div style={{ position: 'relative', zIndex: 20 }}>
        <InstitutionalFooter onAdmin={onAdmin} />
      </div>
    </div>
  );
}
