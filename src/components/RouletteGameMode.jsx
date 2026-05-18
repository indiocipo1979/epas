import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Roulette, { THEMES } from './Roulette';
import QuestionCard from './QuestionCard';
import EnergyBar from './EnergyBar';
import FloatingCharacter from './FloatingCharacter';
import FeedbackOverlay from './FeedbackOverlay';
import ConfettiEffect from './ConfettiEffect';
import { MENSAJES_CORRECTA, MENSAJES_INCORRECTA } from '../data/questions';
import useSound from 'use-sound';

export default function RouletteGameMode({ preguntas, onGameEnd }) {
  const [step, setStep] = useState('spin'); // 'spin' | 'question'
  const [spinning, setSpinning] = useState(false);
  
  const [preguntasRestantes, setPreguntasRestantes] = useState([...preguntas]);
  const [jugadas, setJugadas] = useState(0);
  const [correctas, setCorrectas] = useState(0);
  
  const [currentTheme, setCurrentTheme] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  
  const [timeLeft, setTimeLeft] = useState(15);
  const [timerActive, setTimerActive] = useState(false);
  const [feedback, setFeedback] = useState({ visible: false, esCorrecta: false, mensaje: '', dato: '' });
  const [confeti, setConfeti] = useState(false);

  const TOTAL_PREGUNTAS = 10;

  const [playTick] = useSound('/assets/sounds/tick.ogg', { volume: 0.5 });
  const [playCorrect] = useSound('/assets/sounds/correct.mp3', { volume: 0.7 });
  const [playIncorrect] = useSound('/assets/sounds/incorrect.mp3', { volume: 0.8 });
  const [playSpin, { stop: stopSpin }] = useSound('/assets/sounds/roulette.mp3', { volume: 0.6 });

  // ── Lógica del Temporizador ──
  useEffect(() => {
    let interval;
    if (timerActive && timeLeft > 0 && step === 'question' && !feedback.visible) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerActive && step === 'question' && !feedback.visible) {
      setTimerActive(false);
      handleRespuesta(-1);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft, step, feedback.visible]);

  useEffect(() => {
    if (timerActive && timeLeft <= 5 && timeLeft > 0 && step === 'question' && !feedback.visible) {
      playTick();
    }
  }, [timeLeft, timerActive, step, feedback.visible, playTick]);

  const handleSpinEnd = (themeIndex) => {
    stopSpin(); // Detener sonido de giro
    const theme = THEMES[themeIndex];
    setCurrentTheme(theme);
    
    let preguntasTema = preguntasRestantes.filter(p => p.tema === theme.name);
    
    if (preguntasTema.length === 0) {
      preguntasTema = preguntasRestantes;
    }
    
    if (preguntasTema.length === 0) {
      onGameEnd(correctas, TOTAL_PREGUNTAS);
      return;
    }

    const randomQ = preguntasTema[Math.floor(Math.random() * preguntasTema.length)];
    
    setPreguntasRestantes(prev => prev.filter(p => p.id !== randomQ.id));
    setCurrentQuestion(randomQ);
    
    setTimeout(() => {
      setStep('question');
      setTimeLeft(15);
      setTimerActive(true);
      setSpinning(false);
    }, 2000);
  };

  const handleRespuesta = (esCorrecta) => {
    setTimerActive(false);
    const esTiempoAgotado = esCorrecta === -1;
    let isSuccess = esCorrecta === true;

    if (isSuccess) {
      setCorrectas(prev => prev + 1);
      setConfeti(true);
      setTimeout(() => setConfeti(false), 3000);
      playCorrect();
    } else {
      playIncorrect();
    }

    const mensajes = isSuccess ? MENSAJES_CORRECTA : MENSAJES_INCORRECTA;
    let mensaje = mensajes[Math.floor(Math.random() * mensajes.length)];
    
    if (esTiempoAgotado) {
      mensaje = "¡Se acabó el tiempo! ⏱️ Tenés que ser más rápido.";
    }

    setFeedback({ 
      visible: true, 
      esCorrecta: isSuccess, 
      mensaje, 
      dato: currentQuestion.dato 
    });
  };

  const handleContinuar = () => {
    setFeedback(f => ({ ...f, visible: false }));
    setTimeout(() => {
      const isSuccess = feedback.esCorrecta;
      const nuevasJugadas = jugadas + 1;
      setJugadas(nuevasJugadas);
      
      if (nuevasJugadas >= TOTAL_PREGUNTAS) {
        // Enviar resultado
        // Nota: sumamos correctas actuales, ya se actualizó el state si fue success
        onGameEnd(correctas, TOTAL_PREGUNTAS);
      } else {
        setStep('spin');
        setCurrentTheme(null);
        setCurrentQuestion(null);
      }
    }, 200);
  };

  const bgColor = currentTheme ? currentTheme.color : '#29ABE2';

  return (
    <>
      <ConfettiEffect activo={confeti} />
      <FeedbackOverlay
        visible={feedback.visible}
        esCorrecta={feedback.esCorrecta}
        mensaje={feedback.mensaje}
        dato={feedback.dato}
        onContinuar={handleContinuar}
      />
      <motion.div
        className="fixed inset-0 flex"
        style={{ zIndex: 10, paddingBottom: '64px', backgroundColor: bgColor }}
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0, backgroundColor: bgColor }}
        exit={{ opacity: 0, x: -100 }}
        transition={{ duration: 0.5 }}
      >
        <AnimatePresence>
          {timeLeft <= 3 && step === 'question' && !feedback.visible && (
            <motion.div 
              className="fixed inset-0 pointer-events-none border-[12px] border-red-500/40 z-[99]"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, repeat: Infinity }}
            />
          )}
        </AnimatePresence>

        <div className="hidden md:flex flex-col items-center justify-center w-52 flex-shrink-0 p-4 gap-3">

          {/* ── Reloj grande sobre la gota (solo durante pregunta) ── */}
          {step === 'question' && (
            <motion.div
              className={`flex flex-col items-center justify-center rounded-3xl px-4 py-3 w-full shadow-2xl border-4 ${
                timeLeft <= 3
                  ? 'bg-red-600 border-red-300 shadow-red-500/60'
                  : timeLeft <= 7
                    ? 'bg-yellow-400 border-yellow-200 shadow-yellow-400/40'
                    : 'bg-white/20 border-white/40'
              }`}
              initial={{ scale: 0, opacity: 0 }}
              animate={[
                { scale: 1, opacity: 1 },
                ...(timeLeft <= 3 ? [{ scale: [1, 1.08, 1], rotate: [-2, 2, -1, 0] }] : [])
              ]}
              transition={{ repeat: timeLeft <= 3 ? Infinity : 0, duration: 0.45 }}
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
          )}

          <FloatingCharacter size="md" happy={true} />
          <div className="glass-card p-3 text-center w-full">
            <div className="text-2xl font-black text-white">{correctas}</div>
            <div className="text-white/80 text-xs font-bold">Correctas ✅</div>
          </div>
          <div className="glass-card p-3 text-center w-full">
            <div className="text-2xl font-black text-white">
              {jugadas - correctas}
            </div>
            <div className="text-white/80 text-xs font-bold">Incorrectas ❌</div>
          </div>
        </div>

        <div className="flex-1 flex flex-col p-4 md:p-6 min-w-0">
          <div className="glass-card p-4 mb-4 flex-shrink-0 relative overflow-hidden">
            {step === 'question' && (
              <div className="absolute top-0 left-0 h-1.5 bg-white/10 w-full overflow-hidden">
                <motion.div 
                  className={`h-full ${timeLeft > 7 ? 'bg-green-400' : timeLeft > 3 ? 'bg-yellow-400' : 'bg-red-500'}`}
                  initial={{ width: '100%' }}
                  animate={{ width: `${(timeLeft / 15) * 100}%` }}
                  transition={{ duration: 1, ease: 'linear' }}
                />
              </div>
            )}

            <div className="flex items-center justify-between mt-1 mb-2">
              <span className="text-white font-black text-sm md:text-base">
                📍 Tu Progreso ({jugadas + 1}/{TOTAL_PREGUNTAS})
              </span>
              <div className="flex items-center gap-2">
                {step === 'question' && (
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
                )}
                <div className="bg-yellow-400 text-slate-900 px-3 py-1 rounded-xl font-black text-xs shadow-lg">
                  ✨ {correctas} GOTAS
                </div>
              </div>
            </div>
            <EnergyBar current={jugadas + 1} total={TOTAL_PREGUNTAS} />
          </div>

          <div className="flex-1 flex flex-col items-center justify-center overflow-y-auto">
            {step === 'spin' ? (
              <div className="flex flex-col items-center justify-center h-full w-full relative">
                <h2 className="text-white font-black text-3xl md:text-4xl mb-8 drop-shadow-md text-center">
                  {currentTheme ? `¡${currentTheme.name} ${currentTheme.icon}!` : '¡Girá para elegir tema!'}
                </h2>
                <Roulette 
                  onSpinEnd={handleSpinEnd} 
                  onSpinStart={() => {
                    setSpinning(true);
                    playSpin();
                  }}
                  spinning={spinning} 
                />
              </div>
            ) : (
              currentQuestion && (
                <QuestionCard
                  pregunta={currentQuestion}
                  indicePregunta={jugadas}
                  total={TOTAL_PREGUNTAS}
                  onRespuesta={handleRespuesta}
                  onPlaySound={() => {}}
                />
              )
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}
