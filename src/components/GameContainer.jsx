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
        background: '#ffffff',
        borderTop: '2px solid #e0e0e0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '24px',
        padding: '8px 24px',
        flexShrink: 0,
        height: '64px',
      }}
    >
      {/* Badge EPAS va a la Escuela */}
      <div
        style={{
          background: '#1A3A6B',
          borderRadius: '6px',
          padding: '4px 10px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          lineHeight: 1.1,
        }}
      >
        <span style={{ color: '#ffffff', fontSize: '8px', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
          EPAS <span style={{ color: '#29ABE2' }}>va a la</span>
        </span>
        <span style={{ color: '#FFD700', fontSize: '14px', fontWeight: 900, letterSpacing: '1px' }}>
          ESCUELA
        </span>
      </div>

      {/* Separador */}
      <div style={{ width: '1px', height: '32px', background: '#e0e0e0' }} />

      {/* Logo EPAS institucional */}
      <img src={logoEpas} alt="Logo EPAS" style={{ height: '38px', objectFit: 'contain' }} />

      {/* Separador */}
      <div style={{ width: '1px', height: '32px', background: '#e0e0e0' }} />

      {/* Provincia del Neuquén (Ya incluido en el logo del gobierno usualmente, pero lo dejamos si el logo es solo escudo) */}
      {/* En este caso el logoNeuquen ya tiene el texto, así que omitimos el texto manual */}


      {/* Gobierno de la Provincia */}
      <img src={logoNeuquen} alt="Gobierno de Neuquén" style={{ height: '48px', objectFit: 'contain' }} />

        {/* Botón admin (icono discreto) */}
        <div style={{ width: '1px', height: '32px', background: '#e0e0e0' }} />
        <button
          onClick={onAdmin}
          title="Panel de Administración"
          style={{
            background: 'rgba(0,0,0,0.04)',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            padding: '6px 10px',
            cursor: 'pointer',
            fontSize: '16px',
            transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', gap: '4px',
          }}
          onMouseEnter={e => e.target.style.background = 'rgba(0,0,0,0.1)'}
          onMouseLeave={e => e.target.style.background = 'rgba(0,0,0,0.04)'}
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
  const [timeLeft, setTimeLeft]               = useState(10); // Tiempo inicial
  const [timerActive, setTimerActive]         = useState(false);
  const [tiempoTotal, setTiempoTotal]         = useState(0); 
  const [timestampInicio, setTimestampInicio] = useState(null); // Para cálculo real

  // ── Cargar preguntas al iniciar y escuchar cambios ──
  useEffect(() => {
    // 1. Temporizador de seguridad (fuerza el inicio en 2.5 seg pase lo que pase)
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500);

    // 2. Carga inicial
    const cargar = async () => {
      try {
        const data = await getPreguntas();
        if (data && data.length > 0) {
          setPreguntas(data);
        } else {
          setPreguntas(PREGUNTAS_DEFAULT);
        }
      } catch (e) {
        console.error("Fallo carga:", e);
        setPreguntas(PREGUNTAS_DEFAULT);
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

  // ── Lógica del Temporizador ──
  useEffect(() => {
    let interval;
    if (timerActive && timeLeft > 0 && pantalla === 'juego' && !feedback.visible) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerActive && pantalla === 'juego' && !feedback.visible) {
      // TIEMPO AGOTADO
      setTimerActive(false);
      handleRespuesta(-1); // -1 indica que no se seleccionó nada (incorrecta)
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft, pantalla, feedback.visible]);

  const bgColor  = BG_COLORS[colorIndex % BG_COLORS.length];

  // ── Respuesta del usuario ──
  const handleRespuesta = (esCorrecta, dato) => {
    setTimerActive(false); // Detener el reloj apenas responde
    
    if (esCorrecta === true) {
      setCorrectas(prev => prev + 1);
      setConfeti(true);
      setTimeout(() => setConfeti(false), 3000);
    }
    
    // Si esCorrecta es -1, significa tiempo agotado
    const esTiempoAgotado = esCorrecta === -1;
    const mensajes = esCorrecta === true ? MENSAJES_CORRECTA : MENSAJES_INCORRECTA;
    let mensaje = mensajes[Math.floor(Math.random() * mensajes.length)];
    
    if (esTiempoAgotado) {
      mensaje = "¡Se acabó el tiempo! ⏱️ Tenés que ser más rápido.";
    }

    setFeedback({ visible: true, esCorrecta: esCorrecta === true, mensaje, dato });
  };

  // ── Avanzar a la siguiente pregunta ──
  const handleContinuar = async () => {
    setFeedback(f => ({ ...f, visible: false }));
    setTimeout(async () => {
      const siguiente = indicePregunta + 1;
      if (siguiente >= qList.length) {
        // Cálculo final de tiempo real en segundos
        const segundosTotales = Math.round((Date.now() - timestampInicio) / 1000);
        
        if (supabase) {
          console.log('Intentando guardar participacion...', { nombre, correctas, segundosTotales });
          const { error } = await supabase.from('participaciones').insert([{
            nombre: nombre || 'Anónimo',
            puntaje: correctas,
            total: qList.length,
            tiempo_total: segundosTotales
          }]);
          
          if (error) {
            console.error('Error CRÍTICO de Supabase:', error.message);
            // Si falla por la columna, intentamos guardar sin tiempo para no perder el dato
            if (error.message.includes('tiempo_total')) {
               await supabase.from('participaciones').insert([{
                nombre: nombre || 'Anónimo',
                puntaje: correctas,
                total: qList.length
              }]);
            }
          } else {
            console.log('✅ Partida guardada con éxito');
          }
        }
        setPantalla('final');
      } else {
        setIndicePregunta(siguiente);
        setColorIndex(prev => prev + 1); // Rotar color de fondo
        setTimeLeft(10);
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

      {/* ── Alerta de tiempo crítico (Borde rojo) ── */}
      <AnimatePresence>
        {timeLeft <= 3 && pantalla === 'juego' && !feedback.visible && (
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

              {/* Botón INICIAR */}
              <motion.button
                onClick={() => {
                  if (!nombre.trim()) {
                    alert('¡Por favor, ingresá tu nombre para recibir tu diploma!');
                    return;
                  }
                  setPantalla('juego');
                  setTimestampInicio(Date.now()); // Marcamos el inicio real
                  setColorIndex(0);
                  setTimeLeft(10);
                  setTimerActive(true);
                }}
                style={{
                  background: '#FFD700',
                  color: '#1A3A6B',
                  padding: '16px 40px',
                  borderRadius: '50px',
                  fontSize: '22px',
                  fontWeight: 900,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 6px 24px rgba(0,0,0,0.25), 0 0 0 4px rgba(255,255,255,0.3)',
                  fontFamily: 'Nunito, sans-serif',
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.7, type: 'spring', stiffness: 300 }}
                whileHover={{ scale: 1.08, boxShadow: '0 10px 36px rgba(0,0,0,0.3)' }}
                whileTap={{ scale: 0.96 }}
              >
                🚀 ¡Iniciar Misión!
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ══════════════════════════════
            PANTALLA DE JUEGO
        ══════════════════════════════ */}
        <AnimatePresence>
          {pantalla === 'juego' && (
            <motion.div
              className="fixed inset-0 flex"
              style={{ zIndex: 10, paddingBottom: '64px' }}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            >
              {/* Panel izquierdo: personaje + mini stats (solo md+) */}
              <div className="hidden md:flex flex-col items-center justify-center w-52 flex-shrink-0 p-4 gap-4">
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
                      className={`h-full ${timeLeft > 5 ? 'bg-green-400' : timeLeft > 2 ? 'bg-yellow-400' : 'bg-red-500'}`}
                      initial={{ width: '100%' }}
                      animate={{ width: `${(timeLeft / 10) * 100}%` }}
                      transition={{ duration: 1, ease: 'linear' }}
                    />
                  </div>

                  <div className="flex items-center justify-between mt-1 mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-white font-black text-sm md:text-base">
                        📍 Tu Progreso
                      </span>
                      {/* RELOJ VISUAL PREMIUM */}
                      <motion.div 
                        className={`flex items-center gap-1 px-4 py-1.5 rounded-2xl font-black text-lg shadow-lg ${
                          timeLeft <= 3 ? 'bg-red-600 text-white shadow-red-500/50' : 'bg-white/90 text-epas-sky'
                        }`}
                        animate={timeLeft <= 3 ? { 
                          scale: [1, 1.2, 1],
                          rotate: [-2, 2, -2, 0]
                        } : {}}
                        transition={{ repeat: Infinity, duration: 0.4 }}
                      >
                        ⏱️ {timeLeft}
                      </motion.div>
                    </div>
                    {/* Badge de Puntos */}
                    <div className="bg-yellow-400 text-slate-900 px-3 py-1 rounded-xl font-black text-xs shadow-lg">
                      ✨ {correctas} GOTAS
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
                  />
                </div>
              </div>
            </motion.div>
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
