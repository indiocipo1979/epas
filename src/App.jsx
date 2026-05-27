// ─── App.jsx ───
// Componente raíz de la aplicación.
// Maneja la navegación entre el juego y el panel de administración.
// Acceso al admin: click en el logo EPAS del footer o vía hash #admin

import { useState, useEffect } from 'react';
import GameContainer from './components/GameContainer';
import AdminPanel from './components/AdminPanel';

// ── CONTROL DE MANTENIMIENTO EN PRODUCCIÓN ──
// Cambiar a false para reactivar el sitio público en producción.
// En modo de desarrollo local (npm run dev), la app siempre se verá normal.
const EN_MANTENIMIENTO = true;

function App() {
  const mostrarMantenimiento = EN_MANTENIMIENTO && !import.meta.env.DEV;

  // ── Detectar si se accede con #admin en la URL ──
  const [vista, setVista] = useState(() => {
    return window.location.hash === '#admin' ? 'admin' : 'juego';
  });

  const [autenticado, setAutenticado] = useState(false);
  const ADMIN_PASSWORD = 'epas'; // Podés cambiarla después

  // ── Escuchar cambios en el hash ──
  useEffect(() => {
    const handleHash = () => {
      const nuevaVista = window.location.hash === '#admin' ? 'admin' : 'juego';
      setVista(nuevaVista);
      // Si salimos del admin, resetear la sesión
      if (nuevaVista !== 'admin') setAutenticado(false);
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // ── Funciones de navegación ──
  const irAdmin = () => {
    window.location.hash = '#admin';
    setVista('admin');
  };

  const irJuego = () => {
    window.location.hash = '';
    setVista('juego');
    setAutenticado(false);
  };

  if (mostrarMantenimiento) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-[#0a1f44] via-[#0d2754] to-[#123673] flex flex-col items-center justify-center p-6 z-[1000] font-game select-none overflow-hidden text-white">
        {/* Animated ambient glowing spots */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[10%] left-[15%] w-48 h-48 rounded-full bg-blue-500/10 blur-[80px] animate-pulse"></div>
          <div className="absolute bottom-[20%] right-[10%] w-64 h-64 rounded-full bg-cyan-500/10 blur-[100px] animate-pulse delay-1000"></div>
          <div className="absolute top-[50%] left-[80%] w-40 h-40 rounded-full bg-indigo-500/10 blur-[80px] animate-pulse delay-700"></div>
        </div>

        <div className="glass-card max-w-md w-full p-8 md:p-10 text-center flex flex-col items-center shadow-[0_0_50px_rgba(41,171,226,0.15)] border border-white/10 rounded-[2rem] bg-white/5 backdrop-blur-xl">
          {/* Animated Water Drop Icon */}
          <div className="relative mb-8 animate-[float_4s_ease-in-out_infinite]">
            <div className="absolute -inset-4 rounded-full bg-cyan-400/20 blur-xl animate-ping opacity-60"></div>
            <div className="relative w-24 h-24 flex items-center justify-center bg-gradient-to-tr from-[#29ABE2] to-cyan-300 rounded-full shadow-[0_12px_40px_rgba(41,171,226,0.4)]">
              <span className="text-5xl animate-pulse">💧</span>
            </div>
          </div>

          <div className="inline-flex items-center bg-cyan-500/10 border border-cyan-400/20 px-4 py-1.5 rounded-full text-cyan-300 font-bold text-xs md:text-sm tracking-wider uppercase mb-6">
            🛠️ Mantenimiento Técnico
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-white leading-tight mb-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
            Misión Gota
          </h1>
          <p className="text-cyan-100/80 font-bold text-sm md:text-base mb-8 max-w-xs leading-relaxed">
            Estamos realizando mejoras en el juego y actualizando contenidos para traerte nuevas sorpresas. ¡Volvemos muy pronto!
          </p>

          {/* Simple Loading Bar */}
          <div className="w-full bg-[#0a1f44]/80 rounded-full h-3 border border-white/5 overflow-hidden mb-6 p-0.5">
            <div className="bg-gradient-to-r from-[#29ABE2] to-cyan-300 h-full rounded-full animate-[loading_3s_ease-in-out_infinite]"></div>
          </div>

          <div className="text-cyan-200/50 text-xs font-semibold mt-2">
            Ente Provincial de Agua y Saneamiento (EPAS)
          </div>
        </div>

        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) scale(1); }
            50% { transform: translateY(-12px) scale(1.01); }
          }
          @keyframes loading {
            0% { width: 8%; }
            50% { width: 92%; }
            100% { width: 8%; }
          }
        `}</style>
      </div>
    );
  }

  if (vista === 'admin') {
    if (!autenticado) {
      return (
        <div className="fixed inset-0 bg-[#1A3A6B] flex items-center justify-center p-6 z-[100] font-game">
          <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-sm w-full text-center">
            <div className="text-4xl mb-4">🔐</div>
            <h2 className="text-2xl font-black text-[#1A3A6B] mb-2">Acceso Restringido</h2>
            <p className="text-gray-500 font-bold text-sm mb-6">Ingresá la clave de administrador</p>
            <input
              type="password"
              placeholder="Clave..."
              autoFocus
              className="w-full p-4 bg-gray-100 rounded-xl border-2 border-transparent focus:border-[#29ABE2] outline-none text-center text-xl font-bold mb-4"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (e.target.value === ADMIN_PASSWORD) setAutenticado(true);
                  else {
                    alert('Clave incorrecta ❌');
                    e.target.value = '';
                  }
                }
              }}
            />
            <button
              onClick={irJuego}
              className="text-gray-400 font-bold text-sm hover:text-gray-600 transition-colors"
            >
              Cancelar y Volver al Juego
            </button>
          </div>
        </div>
      );
    }
    return <AdminPanel onVolver={irJuego} />;
  }

  return <GameContainer onAdmin={irAdmin} />;
}

export default App;
