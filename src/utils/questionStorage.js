import { supabase } from '../lib/supabase';
import { PREGUNTAS as PREGUNTAS_DEFAULT } from '../data/questions';

// Nombre de la clave para almacenamiento local de respaldo
const LOCAL_STORAGE_KEY = 'mision_gota_preguntas';

// Helper para obtener preguntas locales
const getLocales = () => {
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
  return saved ? JSON.parse(saved) : PREGUNTAS_DEFAULT;
};

// Helper para guardar preguntas locales
const saveLocales = (preguntas) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(preguntas));
  return preguntas;
};

// ── Obtener todas las preguntas ──
export async function getPreguntas() {
  if (!supabase) return getLocales();

  try {
    const { data, error } = await supabase
      .from('preguntas')
      .select('*')
      .order('orden', { ascending: true });

    if (error || !data || data.length === 0) {
      console.warn('Usando respaldo local por error o base vacía');
      return getLocales();
    }
    return data;
  } catch (e) {
    return getLocales();
  }
}

// ── Añadir pregunta ──
export async function addPregunta(nueva) {
  if (supabase) {
    try {
      const { data: actuales } = await supabase.from('preguntas').select('orden');
      const maxOrden = actuales?.reduce((max, p) => Math.max(max, p.orden || 0), -1) ?? -1;
      
      const { error } = await supabase.from('preguntas').insert([{ 
        ...nueva, 
        orden: maxOrden + 1 
      }]);
      
      if (!error) return getPreguntas();
    } catch (e) { console.error(e); }
  }

  // Fallback Local
  const locales = getLocales();
  const actualizada = [...locales, { ...nueva, id: Date.now(), orden: locales.length }];
  return saveLocales(actualizada);
}

// ── Actualizar pregunta ──
export async function updatePregunta(id, cambios) {
  if (supabase && typeof id === 'number' && id < 1000000000000) { // IDs de Supabase son bajos
    try {
      const { error } = await supabase.from('preguntas').update(cambios).eq('id', id);
      if (!error) return getPreguntas();
    } catch (e) { console.error(e); }
  }

  // Fallback Local
  const locales = getLocales();
  const actualizada = locales.map(p => p.id === id ? { ...p, ...cambios } : p);
  return saveLocales(actualizada);
}

// ── Eliminar pregunta ──
export async function deletePregunta(id) {
  if (supabase && typeof id === 'number' && id < 1000000000000) {
    try {
      const { error } = await supabase.from('preguntas').delete().eq('id', id);
      if (!error) return getPreguntas();
    } catch (e) { console.error(e); }
  }

  // Fallback Local
  const locales = getLocales();
  const actualizada = locales.filter(p => p.id !== id);
  return saveLocales(actualizada);
}

// ── Reordenar pregunta ──
export async function reorderPregunta(id, direccion) {
  const preguntas = await getPreguntas();
  const index = preguntas.findIndex(p => p.id === id);
  if (index === -1) return preguntas;

  const nuevas = [...preguntas];
  const targetIndex = direccion === 'up' ? index - 1 : index + 1;

  if (targetIndex >= 0 && targetIndex < nuevas.length) {
    [nuevas[index], nuevas[targetIndex]] = [nuevas[targetIndex], nuevas[index]];
    
    // Actualizamos el campo 'orden'
    const final = nuevas.map((p, i) => ({ ...p, orden: i }));

    if (supabase) {
      try {
        // En un caso real haríamos un upsert, pero para simplificar y asegurar:
        for (const p of final) {
          if (typeof p.id === 'number' && p.id < 1000000000000) {
            await supabase.from('preguntas').update({ orden: p.orden }).eq('id', p.id);
          }
        }
      } catch (e) { console.error(e); }
    }
    
    return saveLocales(final);
  }
  return preguntas;
}

// ── Restaurar predeterminadas ──
export async function resetPreguntas() {
  if (supabase) {
    try {
      await supabase.from('preguntas').delete().neq('id', 0);
      const batch = PREGUNTAS_DEFAULT.map((p, i) => {
        const { id, ...resto } = p;
        return { ...resto, orden: i };
      });
      await supabase.from('preguntas').insert(batch);
    } catch (e) { console.error(e); }
  }
  
  localStorage.removeItem(LOCAL_STORAGE_KEY);
  return PREGUNTAS_DEFAULT;
}
// ── Obtener estadísticas de participaciones ──
export async function getEstadisticas() {
  if (!supabase) return { total: 0, promedio: 0, recientes: [] };

  try {
    const { data, error } = await supabase
      .from('participaciones')
      .select('*')
      .order('fecha', { ascending: false });

    if (error) throw error;

    const total = data.length;
    const sumaPuntajes = data.reduce((acc, p) => acc + (p.puntaje / p.total), 0);
    const promedio = total > 0 ? Math.round((sumaPuntajes / total) * 100) : 0;

    return {
      total,
      promedio,
      recientes: data.slice(0, 50) // Últimos 50
    };
  } catch (e) {
    console.error('Error al obtener estadísticas:', e);
    return { total: 0, promedio: 0, recientes: [] };
  }
}
