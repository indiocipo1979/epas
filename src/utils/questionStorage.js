// ─── questionStorage.js ───
// Utilidad para gestionar preguntas en localStorage.
// La primera vez carga las preguntas predeterminadas del juego.
// Luego, todas las operaciones CRUD persisten en localStorage.

import { PREGUNTAS as PREGUNTAS_DEFAULT } from '../data/questions';

const STORAGE_KEY = 'epas_mision_gota_preguntas';

// ── Obtener todas las preguntas ──
export function getPreguntas() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Error leyendo preguntas de localStorage:', e);
  }
  // Primera vez: cargar las predeterminadas
  savePreguntas(PREGUNTAS_DEFAULT);
  return [...PREGUNTAS_DEFAULT];
}

// ── Guardar todas las preguntas ──
export function savePreguntas(preguntas) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preguntas));
  } catch (e) {
    console.error('Error guardando preguntas:', e);
  }
}

// ── Agregar una pregunta nueva ──
export function addPregunta(pregunta) {
  const preguntas = getPreguntas();
  const maxId = preguntas.reduce((max, p) => Math.max(max, p.id || 0), 0);
  const nueva = { ...pregunta, id: maxId + 1 };
  preguntas.push(nueva);
  savePreguntas(preguntas);
  return preguntas;
}

// ── Actualizar una pregunta existente ──
export function updatePregunta(id, datos) {
  const preguntas = getPreguntas();
  const index = preguntas.findIndex(p => p.id === id);
  if (index !== -1) {
    preguntas[index] = { ...preguntas[index], ...datos };
    savePreguntas(preguntas);
  }
  return preguntas;
}

// ── Eliminar una pregunta ──
export function deletePregunta(id) {
  let preguntas = getPreguntas();
  preguntas = preguntas.filter(p => p.id !== id);
  savePreguntas(preguntas);
  return preguntas;
}

// ── Reordenar una pregunta (mover arriba/abajo) ──
export function reorderPregunta(id, direction) {
  const preguntas = getPreguntas();
  const index = preguntas.findIndex(p => p.id === id);
  if (index === -1) return preguntas;
  const newIndex = direction === 'up' ? index - 1 : index + 1;
  if (newIndex < 0 || newIndex >= preguntas.length) return preguntas;
  [preguntas[index], preguntas[newIndex]] = [preguntas[newIndex], preguntas[index]];
  savePreguntas(preguntas);
  return preguntas;
}

// ── Restaurar las preguntas predeterminadas ──
export function resetPreguntas() {
  savePreguntas(PREGUNTAS_DEFAULT);
  return [...PREGUNTAS_DEFAULT];
}
