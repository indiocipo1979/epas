// ─── questionStorage.js ───
// Utilidad para gestionar preguntas en Supabase (Base de Datos).
// Permite operaciones CRUD que impactan en todos los usuarios en tiempo real.

import { supabase } from '../lib/supabase';
import { PREGUNTAS as PREGUNTAS_DEFAULT } from '../data/questions';

// ── Obtener todas las preguntas ──
export async function getPreguntas() {
  const { data, error } = await supabase
    .from('preguntas')
    .select('*')
    .order('orden', { ascending: true });

  if (error) {
    console.error('Error cargando preguntas de Supabase:', error);
    return [];
  }

  // Si la base está vacía, cargamos las predeterminadas la primera vez
  if (data.length === 0) {
    console.log('Base vacía, cargando predeterminadas...');
    await resetPreguntas();
    return getPreguntas();
  }

  return data;
}

// ── Agregar una pregunta nueva ──
export async function addPregunta(pregunta) {
  // Calculamos el siguiente orden
  const { data: actual } = await supabase.from('preguntas').select('orden').order('orden', { ascending: false }).limit(1);
  const nextOrder = actual && actual.length > 0 ? (actual[0].orden + 1) : 0;

  const nueva = { ...pregunta, orden: nextOrder };
  const { data, error } = await supabase.from('preguntas').insert([nueva]).select();
  
  if (error) throw error;
  return getPreguntas();
}

// ── Actualizar una pregunta existente ──
export async function updatePregunta(id, datos) {
  const { error } = await supabase
    .from('preguntas')
    .update(datos)
    .eq('id', id);

  if (error) throw error;
  return getPreguntas();
}

// ── Eliminar una pregunta ──
export async function deletePregunta(id) {
  const { error } = await supabase
    .from('preguntas')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return getPreguntas();
}

// ── Reordenar una pregunta (mover arriba/abajo) ──
export async function reorderPregunta(id, direction) {
  const preguntas = await getPreguntas();
  const index = preguntas.findIndex(p => p.id === id);
  if (index === -1) return preguntas;

  const newIndex = direction === 'up' ? index - 1 : index + 1;
  if (newIndex < 0 || newIndex >= preguntas.length) return preguntas;

  const p1 = preguntas[index];
  const p2 = preguntas[newIndex];

  // Intercambiamos el campo 'orden'
  const { error } = await supabase
    .from('preguntas')
    .update({ orden: p2.orden })
    .eq('id', p1.id);

  const { error: error2 } = await supabase
    .from('preguntas')
    .update({ orden: p1.orden })
    .eq('id', p2.id);

  if (error || error2) console.error('Error reordenando');
  
  return getPreguntas();
}

// ── Restaurar las preguntas predeterminadas ──
export async function resetPreguntas() {
  // 1. Borrar todas
  await supabase.from('preguntas').delete().neq('id', 0); // Borra todo
  
  // 2. Insertar las default con un orden secuencial
  const batch = PREGUNTAS_DEFAULT.map((p, i) => {
    // eslint-disable-next-line no-unused-vars
    const { id, ...resto } = p; // Quitamos el ID viejo para que Supabase asigne uno nuevo
    return { ...resto, orden: i };
  });

  const { error } = await supabase.from('preguntas').insert(batch);
  if (error) console.error('Error restaurando preguntas:', error);
  
  return getPreguntas();
}
