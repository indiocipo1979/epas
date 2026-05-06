import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

let client = null;

// Solo intentamos crear el cliente si las variables existen y son válidas
if (url && key && url.includes('supabase.co')) {
  try {
    client = createClient(url, key);
  } catch (e) {
    console.error('Error al inicializar Supabase client:', e);
  }
}

export const supabase = client;
