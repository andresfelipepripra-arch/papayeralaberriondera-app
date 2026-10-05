import { supabase } from '../config/supabaseClient.js'

export async function obtenerEnviosPrevios(idsEventos) {
  if (idsEventos.length === 0) return new Set()

  const { data, error } = await supabase
    .from('correos_enviados')
    .select('evento_id, tipo')
    .in('evento_id', idsEventos)
    .eq('estado', 'enviado')

  if (error) throw new Error(error.message)
  return new Set(data.map((fila) => `${fila.evento_id}:${fila.tipo}`))
}

export async function registrarEnvio({ eventoId, clienteId, tipo, destinatario, estado, error: mensajeError }) {
  const { error } = await supabase.from('correos_enviados').insert({
    evento_id: eventoId,
    cliente_id: clienteId,
    tipo,
    destinatario,
    estado,
    error: mensajeError ?? null,
  })

  // Un choque con el índice único (ya se había registrado un envío exitoso) no es un fallo real.
  if (error && error.code !== '23505') throw new Error(error.message)
}

export async function listarHistorial(limite = 50) {
  const { data, error } = await supabase
    .from('correos_enviados')
    .select('*, eventos (fecha, ubicacion, nombre_cliente)')
    .order('created_at', { ascending: false })
    .limit(limite)

  if (error) throw new Error(error.message)
  return data
}
