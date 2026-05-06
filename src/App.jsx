// ─── App.jsx ───
// Componente raíz de la aplicación.
// Maneja la navegación entre el juego y el panel de administración.
// Acceso al admin: click en el logo EPAS del footer o vía hash #admin

import { useState, useEffect } from 'react';
import GameContainer from './components/GameContainer';
import AdminPanel from './components/AdminPanel';

function App() {
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
