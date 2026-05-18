// ─── AdminPanel.jsx ───
// Panel de administración para gestionar preguntas y VER ESTADÍSTICAS.

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getPreguntas,
  addPregunta,
  updatePregunta,
  deletePregunta,
  reorderPregunta,
  resetPreguntas,
  getEstadisticas,
  deleteParticipacion,
} from '../utils/questionStorage';
import { PREGUNTAS as PREGUNTAS_DEFAULT } from '../data/questions';
import ImportModal from './ImportModal';

// ── Emojis disponibles ──
const EMOJIS = ['🌊', '🚰', '🏔️', '🌵', '💧', '🏢', '🌱', '🔧', '🚿', '🤝', '🐟', '⭐', '🌍', '🧪', '🏠', '❄️', '☀️', '🌧️', '🏞️', '🐠'];

// ── Template pregunta ──
const PREGUNTA_VACIA = { emoji: '💧', tema: 'Curiosidades', pregunta: '', opciones: ['', '', '', ''], correcta: 0, dato: '' };

export default function AdminPanel({ onVolver }) {
  const [view, setView] = useState('preguntas'); // 'preguntas' | 'stats'
  const [preguntas, setPreguntas] = useState([]);
  const [stats, setStats] = useState({ total: 0, promedio: 0, recientes: [] });
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ ...PREGUNTA_VACIA });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmDeleteParticipacion, setConfirmDeleteParticipacion] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pData, sData] = await Promise.all([
        getPreguntas(),
        getEstadisticas()
      ]);
      setPreguntas(pData || PREGUNTAS_DEFAULT);
      setStats(sData);
    } catch (error) {
      console.error(error);
      setPreguntas(PREGUNTAS_DEFAULT);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, tipo = 'success') => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 2500);
  };

  const handleNueva = () => { setForm({ ...PREGUNTA_VACIA }); setEditando('nueva'); };
  const handleEditar = (p) => { setForm({ ...p, opciones: [...p.opciones] }); setEditando(p.id); };

  const handleImportarMasivo = async (nuevasPreguntas) => {
    setShowImport(false);
    setLoading(true);
    try {
      // Agregamos una por una (o podrías hacer un rpc en supabase para bulk)
      for (const p of nuevasPreguntas) {
        await addPregunta(p);
      }
      await fetchData();
      showToast(`✨ Se importaron ${nuevasPreguntas.length} preguntas!`);
    } catch (e) {
      showToast('❌ Error en la importación masiva', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGuardar = async () => {
    if (!form.pregunta.trim()) return showToast('Escribí la pregunta', 'error');
    setLoading(true);
    try {
      let nuevas;
      if (editando === 'nueva') nuevas = await addPregunta(form);
      else nuevas = await updatePregunta(editando, form);
      setPreguntas(nuevas);
      setEditando(null);
      showToast('✅ Guardado correctamente');
    } catch (e) { showToast('❌ Error al guardar', 'error'); }
    finally { setLoading(false); }
  };

  const handleEliminar = async (id) => {
    setLoading(true);
    const nuevas = await deletePregunta(id);
    setPreguntas(nuevas);
    setConfirmDelete(null);
    setLoading(false);
    showToast('🗑️ Eliminada');
  };

  const handleReset = async () => {
    setLoading(true);
    const nuevas = await resetPreguntas();
    setPreguntas(nuevas);
    setConfirmReset(false);
    setLoading(false);
    showToast('🔄 Restauradas');
  };

  const handleEliminarParticipacion = async (id) => {
    setLoading(true);
    try {
      const ok = await deleteParticipacion(id);
      if (ok) {
        showToast('🗑️ Participación eliminada');
        await fetchData();
      } else {
        showToast('❌ Error al eliminar participación', 'error');
      }
    } catch (e) {
      showToast('❌ Error al eliminar participación', 'error');
    } finally {
      setConfirmDeleteParticipacion(null);
      setLoading(false);
    }
  };

  const LETTERS = ['A', 'B', 'C', 'D'];

  return (
    <div className="fixed inset-0 flex flex-col bg-slate-900 font-sans text-white overflow-hidden">
      
      {/* ═══ HEADER ═══ */}
      <div className="bg-slate-800/50 border-b border-white/10 p-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onVolver} className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm font-bold transition-all">
            ← Volver al juego
          </button>
          <div>
            <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
              📊 Panel de Control
            </h1>
            <div className="flex gap-4 mt-1">
              <button 
                onClick={() => setView('preguntas')}
                className={`text-xs font-black uppercase tracking-widest pb-1 border-b-2 transition-all ${view === 'preguntas' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-white/40 hover:text-white'}`}
              >
                Preguntas
              </button>
              <button 
                onClick={() => setView('stats')}
                className={`text-xs font-black uppercase tracking-widest pb-1 border-b-2 transition-all ${view === 'stats' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-white/40 hover:text-white'}`}
              >
                Estadísticas
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowImport(true)}
            className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-1.5 rounded-full text-xs font-black transition-all shadow-lg flex items-center gap-2"
          >
            📄 Importar Word
          </button>
          <div className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-4 py-1.5 rounded-full text-xs font-black">
            📚 {preguntas.length} Preguntas
          </div>
          <button onClick={() => setConfirmReset(true)} className="bg-red-500/10 text-red-400 border border-red-500/30 px-4 py-1.5 rounded-full text-xs font-black hover:bg-red-500/20 transition-all">
            🔄 Restaurar
          </button>
        </div>
      </div>

      {/* ═══ CONTENT ═══ */}
      <div className="flex-1 overflow-hidden flex">
        
        {/* VISTA PREGUNTAS */}
        {view === 'preguntas' && (
          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/20">
            <motion.button
              onClick={handleNueva}
              className="w-full p-6 border-2 border-dashed border-cyan-500/30 rounded-2xl text-cyan-400 font-black text-lg mb-6 hover:bg-cyan-500/5 hover:border-cyan-500 transition-all"
              whileHover={{ scale: 1.01 }}
            >
              + Agregar nueva misión
            </motion.button>

            <div className="space-y-3">
              {preguntas.map((p, i) => (
                <div key={p.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 hover:bg-white/10 transition-all">
                  <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center text-cyan-400 font-black">
                    {i + 1}
                  </div>
                  <div className="text-2xl">{p.emoji}</div>
                  <div className="flex-1">
                    <p className="font-bold text-sm leading-tight">{p.pregunta}</p>
                    <p className="text-[10px] text-white/40 font-bold uppercase mt-1">Opción Correcta: {LETTERS[p.correcta]}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEditar(p)} className="p-2 bg-white/5 rounded-lg hover:bg-cyan-500/20 text-cyan-400 transition-all">✏️</button>
                    <button onClick={() => setConfirmDelete(p.id)} className="p-2 bg-white/5 rounded-lg hover:bg-red-500/20 text-red-400 transition-all">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VISTA ESTADÍSTICAS */}
        {view === 'stats' && (
          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/20">
            {/* Cards de Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-br from-cyan-600 to-blue-700 p-8 rounded-3xl shadow-xl">
                <p className="text-white/60 font-black uppercase tracking-tighter text-sm mb-1">Participantes Totales</p>
                <h3 className="text-6xl font-black">{stats.total}</h3>
                <p className="text-white/80 text-xs font-bold mt-2">Chicos que completaron la misión 💧</p>
              </div>
              <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-8 rounded-3xl shadow-xl">
                <p className="text-white/60 font-black uppercase tracking-tighter text-sm mb-1">Efectividad General</p>
                <h3 className="text-6xl font-black">{stats.promedio}%</h3>
                <p className="text-white/80 text-xs font-bold mt-2">Promedio de aciertos en las escuelas 🎓</p>
              </div>
            </div>

            {/* RANKING TOP 10 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              <div className="lg:col-span-1">
                <h4 className="text-lg font-black mb-4 flex items-center gap-2 px-2 text-yellow-400">
                  🏆 Ranking Top 10
                </h4>
                <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                  {stats.ranking?.map((r, i) => (
                    <div key={r.id} className="flex items-center gap-4 p-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-all">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${i === 0 ? 'bg-yellow-400 text-slate-900' : i === 1 ? 'bg-slate-300 text-slate-900' : i === 2 ? 'bg-orange-500 text-white' : 'bg-white/10 text-white'}`}>
                        #{i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold truncate text-sm">{r.nombre}</p>
                        <p className="text-[10px] text-white/40 font-bold uppercase">{r.tiempo_total || 0} segundos</p>
                      </div>
                      <div className="text-cyan-400 font-black text-sm flex items-center gap-2">
                        <span>{r.puntaje}/{r.total}</span>
                        <button 
                          onClick={() => setConfirmDeleteParticipacion(r)} 
                          title="Eliminar participación"
                          className="text-red-400/50 hover:text-red-400 hover:bg-red-500/10 p-1 rounded transition-all text-xs"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                  {(!stats.ranking || stats.ranking.length === 0) && (
                    <div className="p-8 text-center text-white/20 italic text-sm">No hay datos aún</div>
                  )}
                </div>
              </div>

              {/* LISTA COMPLETA RECIENTES */}
              <div className="lg:col-span-2">
                <h4 className="text-lg font-black mb-4 flex items-center gap-2 px-2">
                  🕒 Últimas Participaciones
                </h4>
                <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-white/10 text-[10px] font-black uppercase text-white/50">
                      <tr>
                        <th className="p-4">Nombre</th>
                        <th className="p-4">Puntos</th>
                        <th className="p-4">Tiempo</th>
                        <th className="p-4">Fecha</th>
                        <th className="p-4 text-center">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs">
                      {stats.recientes.map((r, i) => (
                        <tr key={r.id} className="border-t border-white/5 hover:bg-white/5 transition-all">
                          <td className="p-4 font-bold">{r.nombre}</td>
                          <td className="p-4">
                            <span className="bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full font-black">
                              {r.puntaje}/{r.total}
                            </span>
                          </td>
                          <td className="p-4 text-white/60">{r.tiempo_total || 0}s</td>
                          <td className="p-4 text-white/30 font-bold">
                            {new Date(r.fecha).toLocaleDateString()}
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => setConfirmDeleteParticipacion(r)}
                              title="Eliminar participación"
                              className="text-red-400/50 hover:text-red-400 hover:bg-red-500/10 px-2 py-1 rounded-lg transition-all font-bold"
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PANEL DERECHO DE EDICIÓN */}
        <AnimatePresence>
          {editando !== null && (
            <motion.div 
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              className="w-full max-w-md bg-slate-800 border-l border-white/10 p-6 overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black">{editando === 'nueva' ? '📝 Nueva Pregunta' : '✏️ Editar Pregunta'}</h2>
                <button onClick={() => setEditando(null)} className="text-white/40 hover:text-white font-bold">✕</button>
              </div>

              {/* Emoji selector */}
              <label className="text-[10px] font-black uppercase text-white/40 mb-2 block">Icono de la Misión</label>
              <div className="flex flex-wrap gap-2 mb-6">
                {EMOJIS.map(e => (
                  <button key={e} onClick={() => setForm(f => ({ ...f, emoji: e }))} className={`w-10 h-10 text-xl rounded-xl flex items-center justify-center border-2 transition-all ${form.emoji === e ? 'border-cyan-500 bg-cyan-500/20' : 'border-white/10 bg-white/5 hover:border-white/30'}`}>
                    {e}
                  </button>
                ))}
              </div>

              {/* Form */}
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-white/40 mb-2 block">Categoría (Tema de la Ruleta)</label>
                  <select 
                    value={form.tema || 'Curiosidades'} 
                    onChange={e => {
                      const selectedTema = e.target.value;
                      const defaultEmojis = {
                        'Ríos y Geografía': '🏞️',
                        'Cuidado en Casa': '🏠',
                        'EPAS y Neuquén': '🏢',
                        'Salud y Cuerpo': '🧠',
                        'Curiosidades': '💧'
                      };
                      setForm(f => ({ 
                        ...f, 
                        tema: selectedTema,
                        emoji: (!f.emoji || f.emoji === '💧') ? (defaultEmojis[selectedTema] || '💧') : f.emoji 
                      }));
                    }}
                    className="w-full bg-slate-700/50 border border-white/10 rounded-xl p-3 text-sm focus:border-cyan-500 outline-none text-white font-bold cursor-pointer"
                  >
                    <option value="Ríos y Geografía">🏞️ Ríos y Geografía</option>
                    <option value="Cuidado en Casa">🏠 Cuidado en Casa</option>
                    <option value="EPAS y Neuquén">🏢 EPAS y Neuquén</option>
                    <option value="Salud y Cuerpo">🧠 Salud y Cuerpo</option>
                    <option value="Curiosidades">💧 Curiosidades</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-white/40 mb-2 block">Pregunta</label>
                  <textarea value={form.pregunta} onChange={e => setForm(f => ({ ...f, pregunta: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-cyan-500 outline-none h-24" placeholder="¿Cuál es el río...?" />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-white/40 mb-2 block">Opciones</label>
                  {form.opciones.map((op, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <button onClick={() => setForm(f => ({ ...f, correcta: i }))} className={`w-10 h-10 rounded-xl font-black border-2 transition-all ${form.correcta === i ? 'bg-green-500 border-green-500 text-white' : 'bg-white/5 border-white/10 text-white/40'}`}>
                        {LETTERS[i]}
                      </button>
                      <input value={op} onChange={e => {
                        const nuevas = [...form.opciones]; nuevas[i] = e.target.value;
                        setForm(f => ({ ...f, opciones: nuevas }));
                      }} className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 text-sm focus:border-cyan-500 outline-none" />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-white/40 mb-2 block">Dato Educativo (¿Sabías que...?)</label>
                  <textarea value={form.dato} onChange={e => setForm(f => ({ ...f, dato: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-cyan-500 outline-none h-20" placeholder="Este río nace en..." />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button onClick={handleGuardar} className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white font-black py-4 rounded-2xl shadow-lg transition-all">💾 Guardar Misión</button>
                <button onClick={() => setEditando(null)} className="px-6 bg-white/5 hover:bg-white/10 rounded-2xl font-bold transition-all">Cancelar</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* MODAL ELIMINAR PREGUNTA */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-800 p-8 rounded-3xl border border-white/10 max-w-xs w-full text-center shadow-2xl">
            <div className="text-5xl mb-4">🗑️</div>
            <h3 className="text-xl font-black mb-2">¿Eliminar misión?</h3>
            <p className="text-white/40 text-sm mb-6 font-bold uppercase tracking-widest">Esta acción no se puede deshacer</p>
            <div className="flex gap-3">
              <button onClick={() => handleEliminar(confirmDelete)} className="flex-1 bg-red-500 hover:bg-red-600 py-3 rounded-xl font-black transition-all">Eliminar</button>
              <button onClick={() => setConfirmDelete(null)} className="flex-1 bg-white/10 py-3 rounded-xl font-bold transition-all">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR PARTICIPANTE */}
      {confirmDeleteParticipacion && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-800 p-8 rounded-3xl border border-white/10 max-w-xs w-full text-center shadow-2xl">
            <div className="text-5xl mb-4">🗑️</div>
            <h3 className="text-xl font-black mb-2">¿Eliminar participante?</h3>
            <p className="text-cyan-400 font-bold text-sm mb-1">"{confirmDeleteParticipacion.nombre}"</p>
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider mb-6">Puntaje: {confirmDeleteParticipacion.puntaje}/{confirmDeleteParticipacion.total}</p>
            <p className="text-red-400 text-xs font-bold mb-6">Esta acción reajustará todas las estadísticas del panel.</p>
            <div className="flex gap-3">
              <button 
                onClick={() => handleEliminarParticipacion(confirmDeleteParticipacion.id)} 
                className="flex-1 bg-red-500 hover:bg-red-600 py-3 rounded-xl font-black transition-all"
              >
                Eliminar
              </button>
              <button 
                onClick={() => setConfirmDeleteParticipacion(null)} 
                className="flex-1 bg-white/10 py-3 rounded-xl font-bold transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL IMPORTACIÓN */}
      <AnimatePresence>
        {showImport && (
          <ImportModal 
            onClose={() => setShowImport(false)} 
            onImport={handleImportarMasivo} 
          />
        )}
      </AnimatePresence>

      {/* TOAST */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-8 py-3 rounded-2xl font-black shadow-2xl z-[300] ${toast.tipo === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
