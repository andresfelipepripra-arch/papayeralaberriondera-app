import { supabase } from '../config/supabaseClient.js'

export async function obtenerConfiguracion() {
  const { data, error } = await supabase.from('configuracion').select('*').eq('id', 1).single()

  if (error) throw new Error(error.message)
  return data
}
