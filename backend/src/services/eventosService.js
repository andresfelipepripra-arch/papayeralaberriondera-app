import { supabase } from '../config/supabaseClient.js'

const DIAS_ANTICIPACION_DEFAULT = 3

export async function listarEventos() {
  const { data, error } = await supabase
    .from('eventos')
    .select('*')
    .order('fecha', { ascending: true })

  if (error) throw new Error(error.message)
  return data
}

export async function listarEventosProximos(dias = DIAS_ANTICIPACION_DEFAULT) {
  const ahora = new Date().toISOString()
  const fechaLimite = new Date()
  fechaLimite.setDate(fechaLimite.getDate() + dias)

  const { data, error } = await supabase
    .from('eventos')
    .select('*, clientes (nombre, correo)')
    .gte('fecha', ahora)
    .lte('fecha', fechaLimite.toISOString())
    .eq('correo_recordatorio_enviado', false)

  if (error) throw new Error(error.message)
  return data
}

export async function marcarRecordatorioEnviado(id) {
  const { error } = await supabase
    .from('eventos')
    .update({ correo_recordatorio_enviado: true })
    .eq('id', id)

  if (error) throw new Error(error.message)
}