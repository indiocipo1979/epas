// ─── AdminPanel.jsx ───
// Panel de administración para gestionar las preguntas del juego.
// Permite: ver, crear, editar, eliminar y reordenar preguntas.
// Diseño profesional con identidad EPAS.

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getPreguntas,
  addPregunta,
  updatePregunta,
  deletePregunta,
  reorderPregunta,
  resetPreguntas,
} from '../utils/questionStorage';
import { PREGUNTAS as PREGUNTAS_DEFAULT } from '../data/questions';

// ── Emojis disponibles para las preguntas ──
const EMOJIS = ['🌊', '🚰', '🏔️', '🌵', '💧', '🏢', '🌱', '🔧', '🚿', '🤝', '🐟', '⭐', '🌍', '🧪', '🏠', '❄️', '☀️', '🌧️', '🏞️', '🐠'];

// ── Pregunta vacía (template) ──
const PREGUNTA_VACIA = {
  emoji: '💧',
  pregunta: '',
  opciones: ['', '', '', ''],
  correcta: 0,
  dato: '',
};

export default function AdminPanel({ onVolver }) {
  const [preguntas, setPreguntas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(null); // null | 'nueva' | id
  const [form, setForm] = useState({ ...PREGUNTA_VACIA });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [toast, setToast] = useState(null);

  // ── Cargar preguntas al iniciar ──
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getPreguntas();
      // Si la base de datos devuelve algo, lo usamos. Si no, usamos las locales.
      if (data && data.length > 0) {
        setPreguntas(data);
      } else {
        setPreguntas(PREGUNTAS_DEFAULT);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setPreguntas(PREGUNTAS_DEFAULT);
    } finally {
      setLoading(false);
    }
  };

  // ── Mostrar toast ──
  const showToast = (msg, tipo = 'success') => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 2500);
  };

  // ── Abrir formulario para nueva pregunta ──
  const handleNueva = () => {
    setForm({ ...PREGUNTA_VACIA });
    setEditando('nueva');
  };

  // ── Abrir formulario para editar ──
  const handleEditar = (pregunta) => {
    setForm({
      emoji: pregunta.emoji,
      pregunta: pregunta.pregunta,
      opciones: [...pregunta.opciones],
      correcta: pregunta.correcta,
      dato: pregunta.dato,
    });
    setEditando(pregunta.id);
  };

  // ── Guardar pregunta ──
  const handleGuardar = async () => {
    // Validación
    if (!form.pregunta.trim()) return showToast('Escribí la pregunta', 'error');
    if (form.opciones.some(o => !o.trim())) return showToast('Completá las 4 opciones', 'error');
    if (!form.dato.trim()) return showToast('Escribí el dato educativo', 'error');

    setLoading(true);
    try {
      let nuevas;
      if (editando === 'nueva') {
        nuevas = await addPregunta(form);
        showToast('✅ Pregunta agregada');
      } else {
        nuevas = await updatePregunta(editando, form);
        showToast('✅ Pregunta actualizada');
      }
      setPreguntas(nuevas);
      setEditando(null);
    } catch (e) {
      showToast('❌ Error al guardar', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ── Eliminar pregunta ──
  const handleEliminar = async (id) => {
    setLoading(true);
    const nuevas = await deletePregunta(id);
    setPreguntas(nuevas);
    setConfirmDelete(null);
    setLoading(false);
    showToast('🗑️ Pregunta eliminada');
  };

  // ── Reordenar ──
  const handleReorder = async (id, dir) => {
    const nuevas = await reorderPregunta(id, dir);
    setPreguntas([...nuevas]);
  };

  // ── Restaurar predeterminadas ──
  const handleReset = async () => {
    setLoading(true);
    const nuevas = await resetPreguntas();
    setPreguntas(nuevas);
    setConfirmReset(false);
    setLoading(false);
    showToast('🔄 Preguntas restauradas');
  };

  // ── Exportar JSON para código fuente ──
  const handleExport = () => {
    const json = JSON.stringify(preguntas, null, 2);
    navigator.clipboard.writeText(`export const PREGUNTAS = ${json};`).then(() => {
      showToast('📋 ¡JSON copiado al portapapeles!');
    });
  };

  // ── Actualizar campo de opción ──
  const setOpcion = (index, value) => {
    const nuevas = [...form.opciones];
    nuevas[index] = value;
    setForm(f => ({ ...f, opciones: nuevas }));
  };

  const LETTERS = ['A', 'B', 'C', 'D'];

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      overflow: 'hidden',
      fontFamily: "'Nunito', sans-serif",
      display: 'flex', flexDirection: 'column',
    }}>

      {/* ═══ HEADER ═══ */}
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        padding: '12px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={onVolver}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '10px',
              color: '#fff', cursor: 'pointer',
              padding: '8px 16px', fontSize: '14px', fontWeight: 700,
              fontFamily: "'Nunito', sans-serif",
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.2)'}
            onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.1)'}
          >
            ← Volver al juego
          </button>
          <div>
            <h1 style={{ color: '#fff', fontSize: '20px', fontWeight: 900, margin: 0, letterSpacing: '0.5px' }}>
              ⚙️ Panel de Administración
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', margin: 0, fontWeight: 600 }}>
              Misión Gota · EPAS va a la Escuela
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            background: 'rgba(41,171,226,0.2)', color: '#29ABE2',
            padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 800,
            border: '1px solid rgba(41,171,226,0.3)',
          }}>
            📚 {preguntas.length} preguntas
          </span>
          <button
            onClick={handleExport}
            style={{
              background: 'rgba(34,197,94,0.15)',
              border: '1px solid rgba(34,197,94,0.3)',
              borderRadius: '10px', color: '#22c55e', cursor: 'pointer',
              padding: '8px 14px', fontSize: '13px', fontWeight: 700,
              fontFamily: "'Nunito', sans-serif",
            }}
          >
            📋 Exportar JSON
          </button>
          <button
            onClick={() => setConfirmReset(true)}
            style={{
              background: 'rgba(239,68,68,0.15)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '10px', color: '#ef4444', cursor: 'pointer',
              padding: '8px 14px', fontSize: '13px', fontWeight: 700,
              fontFamily: "'Nunito', sans-serif",
            }}
          >
            🔄 Restaurar
          </button>
        </div>
      </div>

      {/* ═══ CONTENT ═══ */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>

        {/* ── LISTA DE PREGUNTAS ── */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '20px 24px',
          scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.2) transparent',
          opacity: loading ? 0.6 : 1, pointerEvents: loading ? 'none' : 'auto',
          transition: 'opacity 0.2s',
        }}>

          {/* Botón nueva pregunta */}
          <motion.button
            onClick={handleNueva}
            style={{
              width: '100%', padding: '16px',
              background: 'linear-gradient(135deg, rgba(41,171,226,0.15), rgba(41,171,226,0.05))',
              border: '2px dashed rgba(41,171,226,0.4)',
              borderRadius: '16px', color: '#29ABE2', cursor: 'pointer',
              fontSize: '16px', fontWeight: 800, fontFamily: "'Nunito', sans-serif",
              marginBottom: '16px',
              transition: 'all 0.2s',
            }}
            whileHover={{ scale: 1.01, borderColor: '#29ABE2' }}
            whileTap={{ scale: 0.99 }}
          >
            + Agregar nueva pregunta
          </motion.button>

          {/* Lista */}
          <AnimatePresence>
            {preguntas.map((p, index) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                style={{
                  background: editando === p.id
                    ? 'rgba(41,171,226,0.12)'
                    : 'rgba(255,255,255,0.04)',
                  border: editando === p.id
                    ? '1px solid rgba(41,171,226,0.4)'
                    : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '14px',
                  padding: '14px 18px',
                  marginBottom: '10px',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {/* Número */}
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    background: 'rgba(41,171,226,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#29ABE2', fontWeight: 900, fontSize: '14px', flexShrink: 0,
                  }}>
                    {index + 1}
                  </div>

                  {/* Emoji */}
                  <span style={{ fontSize: '24px', flexShrink: 0 }}>{p.emoji}</span>

                  {/* Texto pregunta */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      color: '#fff', fontSize: '14px', fontWeight: 700,
                      margin: 0, overflow: 'hidden', textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {p.pregunta}
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', margin: '2px 0 0', fontWeight: 600 }}>
                      Correcta: {LETTERS[p.correcta]} — {p.opciones[p.correcta]}
                    </p>
                  </div>

                  {/* Acciones */}
                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                    <ActionBtn icon="▲" onClick={() => handleReorder(p.id, 'up')} disabled={index === 0} />
                    <ActionBtn icon="▼" onClick={() => handleReorder(p.id, 'down')} disabled={index === preguntas.length - 1} />
                    <ActionBtn icon="✏️" onClick={() => handleEditar(p)} color="#29ABE2" />
                    <ActionBtn icon="🗑️" onClick={() => setConfirmDelete(p.id)} color="#ef4444" />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {preguntas.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.3)' }}>
              <p style={{ fontSize: '48px', marginBottom: '12px' }}>📭</p>
              <p style={{ fontWeight: 700, fontSize: '16px' }}>No hay preguntas</p>
              <p style={{ fontSize: '13px', marginTop: '6px' }}>Agregá una nueva o restaurá las predeterminadas</p>
            </div>
          )}
        </div>

        {/* ── FORMULARIO (panel derecho) ── */}
        <AnimatePresence>
          {editando !== null && (
            <motion.div
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{
                width: '440px', flexShrink: 0,
                background: 'rgba(255,255,255,0.03)',
                borderLeft: '1px solid rgba(255,255,255,0.1)',
                overflowY: 'auto', padding: '24px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h2 style={{ color: '#fff', fontSize: '18px', fontWeight: 900, margin: 0 }}>
                  {editando === 'nueva' ? '📝 Nueva pregunta' : '✏️ Editar pregunta'}
                </h2>
                <button
                  onClick={() => setEditando(null)}
                  style={{
                    background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px',
                    color: '#fff', cursor: 'pointer', padding: '6px 12px', fontSize: '13px',
                    fontWeight: 700, fontFamily: "'Nunito', sans-serif",
                  }}
                >
                  ✕ Cerrar
                </button>
              </div>

              {/* Emoji selector */}
              <FormLabel>Emoji de la pregunta</FormLabel>
              <div style={{
                display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px',
              }}>
                {EMOJIS.map(e => (
                  <button
                    key={e}
                    onClick={() => setForm(f => ({ ...f, emoji: e }))}
                    style={{
                      width: '38px', height: '38px', fontSize: '20px',
                      background: form.emoji === e ? 'rgba(41,171,226,0.3)' : 'rgba(255,255,255,0.06)',
                      border: form.emoji === e ? '2px solid #29ABE2' : '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '10px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s',
                    }}
                  >
                    {e}
                  </button>
                ))}
              </div>

              {/* Pregunta */}
              <FormLabel>Pregunta</FormLabel>
              <textarea
                value={form.pregunta}
                onChange={e => setForm(f => ({ ...f, pregunta: e.target.value }))}
                placeholder="Escribí la pregunta aquí..."
                rows={3}
                style={textareaStyle}
              />

              {/* Opciones */}
              <FormLabel>Opciones de respuesta</FormLabel>
              {form.opciones.map((op, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                  <button
                    onClick={() => setForm(f => ({ ...f, correcta: i }))}
                    title={form.correcta === i ? 'Respuesta correcta' : 'Marcar como correcta'}
                    style={{
                      width: '36px', height: '36px', flexShrink: 0,
                      borderRadius: '10px', border: 'none', cursor: 'pointer',
                      background: form.correcta === i
                        ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                        : 'rgba(255,255,255,0.08)',
                      color: form.correcta === i ? '#fff' : 'rgba(255,255,255,0.4)',
                      fontWeight: 900, fontSize: '14px',
                      fontFamily: "'Nunito', sans-serif",
                      transition: 'all 0.2s',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    {LETTERS[i]}
                  </button>
                  <input
                    value={op}
                    onChange={e => setOpcion(i, e.target.value)}
                    placeholder={`Opción ${LETTERS[i]}...`}
                    style={inputStyle}
                  />
                </div>
              ))}
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', fontWeight: 600, marginBottom: '16px', marginTop: '4px' }}>
                💡 Hacé click en la letra para marcar la respuesta correcta
              </p>

              {/* Dato educativo */}
              <FormLabel>Dato educativo (¿Sabías que...?)</FormLabel>
              <textarea
                value={form.dato}
                onChange={e => setForm(f => ({ ...f, dato: e.target.value }))}
                placeholder="Dato que se muestra después de responder..."
                rows={2}
                style={textareaStyle}
              />

              {/* Botones */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <motion.button
                  onClick={handleGuardar}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    flex: 1, padding: '14px',
                    background: 'linear-gradient(135deg, #29ABE2, #1A8ABE)',
                    border: 'none', borderRadius: '12px',
                    color: '#fff', fontWeight: 900, fontSize: '15px',
                    cursor: 'pointer', fontFamily: "'Nunito', sans-serif",
                  }}
                >
                  💾 {editando === 'nueva' ? 'Agregar pregunta' : 'Guardar cambios'}
                </motion.button>
                <button
                  onClick={() => setEditando(null)}
                  style={{
                    padding: '14px 20px',
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '12px', color: '#fff',
                    fontWeight: 700, fontSize: '14px', cursor: 'pointer',
                    fontFamily: "'Nunito', sans-serif",
                  }}
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ═══ MODALES ═══ */}

      {/* Confirmar eliminación */}
      <AnimatePresence>
        {confirmDelete !== null && (
          <ModalOverlay onClose={() => setConfirmDelete(null)}>
            <p style={{ fontSize: '40px', marginBottom: '8px' }}>🗑️</p>
            <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: 900, marginBottom: '8px' }}>
              ¿Eliminar esta pregunta?
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginBottom: '20px', fontWeight: 600 }}>
              Esta acción no se puede deshacer
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button onClick={() => handleEliminar(confirmDelete)} style={dangerBtnStyle}>
                Sí, eliminar
              </button>
              <button onClick={() => setConfirmDelete(null)} style={cancelBtnStyle}>
                Cancelar
              </button>
            </div>
          </ModalOverlay>
        )}
      </AnimatePresence>

      {/* Confirmar restauración */}
      <AnimatePresence>
        {confirmReset && (
          <ModalOverlay onClose={() => setConfirmReset(false)}>
            <p style={{ fontSize: '40px', marginBottom: '8px' }}>🔄</p>
            <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: 900, marginBottom: '8px' }}>
              ¿Restaurar preguntas predeterminadas?
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginBottom: '20px', fontWeight: 600 }}>
              Esto eliminará todas las preguntas actuales y cargará las originales del juego
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button onClick={handleReset} style={dangerBtnStyle}>
                Sí, restaurar
              </button>
              <button onClick={() => setConfirmReset(false)} style={cancelBtnStyle}>
                Cancelar
              </button>
            </div>
          </ModalOverlay>
        )}
      </AnimatePresence>

      {/* Toast notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            style={{
              position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
              background: toast.tipo === 'error'
                ? 'linear-gradient(135deg, #dc2626, #b91c1c)'
                : 'linear-gradient(135deg, #059669, #047857)',
              color: '#fff', padding: '12px 28px', borderRadius: '14px',
              fontSize: '14px', fontWeight: 800, zIndex: 100,
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══ Sub-componentes utilitarios ═══

function FormLabel({ children }) {
  return (
    <label style={{
      color: 'rgba(255,255,255,0.6)', fontSize: '12px', fontWeight: 800,
      textTransform: 'uppercase', letterSpacing: '0.8px',
      display: 'block', marginBottom: '6px',
    }}>
      {children}
    </label>
  );
}

function ActionBtn({ icon, onClick, disabled, color }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '32px', height: '32px', borderRadius: '8px',
        background: disabled ? 'transparent' : 'rgba(255,255,255,0.06)',
        border: disabled ? '1px solid transparent' : `1px solid ${color ? color + '33' : 'rgba(255,255,255,0.1)'}`,
        color: disabled ? 'rgba(255,255,255,0.15)' : (color || 'rgba(255,255,255,0.6)'),
        cursor: disabled ? 'default' : 'pointer',
        fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.15s', fontFamily: "'Nunito', sans-serif",
      }}
    >
      {icon}
    </button>
  );
}

function ModalOverlay({ children, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 90,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        onClick={e => e.stopPropagation()}
        style={{
          background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '20px', padding: '32px', textAlign: 'center',
          maxWidth: '380px', width: '90%',
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

// ═══ Estilos reutilizables ═══

const inputStyle = {
  flex: 1, padding: '10px 14px',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '10px', color: '#fff',
  fontSize: '14px', fontWeight: 600,
  fontFamily: "'Nunito', sans-serif",
  outline: 'none',
};

const textareaStyle = {
  width: '100%', padding: '12px 14px',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '10px', color: '#fff',
  fontSize: '14px', fontWeight: 600, resize: 'vertical',
  fontFamily: "'Nunito', sans-serif",
  outline: 'none', marginBottom: '16px',
};

const dangerBtnStyle = {
  padding: '10px 24px', background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
  border: 'none', borderRadius: '10px', color: '#fff',
  fontWeight: 800, fontSize: '14px', cursor: 'pointer',
  fontFamily: "'Nunito', sans-serif",
};

const cancelBtnStyle = {
  padding: '10px 24px', background: 'rgba(255,255,255,0.1)',
  border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: '10px', color: '#fff',
  fontWeight: 700, fontSize: '14px', cursor: 'pointer',
  fontFamily: "'Nunito', sans-serif",
};
