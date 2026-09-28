import { supabase } from '../config/supabaseClient.js'
import { inicioDelDiaOperativoActualISO } from '../utils/fechas.js'

export async function listarEventos() {
  const { data, error } = await supabase
    .from('eventos')
    .select('*')
    .order('fecha', { ascending: true })

  if (error) throw new Error(error.message)
  return data
}

// Eventos no cancelados, desde el inicio del día operativo actual (hora
// Colombia) hasta `maxDias` días adelante. El límite inferior es el inicio
// del día operativo, no el instante actual, para no perder eventos de hoy
// cuya hora ya pasó (p. ej. un evento a las 6am cuando el job corre a las
// 8am) ni eventos de madrugada que en realidad son "la misma noche" de un
// evento anterior. La deduplicación de envíos vive en `correos_enviados`.
export async function listarEventosVigentes(maxDias) {
  const fechaLimite = new Date()
  fechaLimite.setDate(fechaLimite.getDate() + maxDias)

  const { data, error } = await supabase
    .from('eventos')
    .select('*, clientes (id, nombre, correo, telefono)')
    .gte('fecha', inicioDelDiaOperativoActualISO())
    .lte('fecha', fechaLimite.toISOString())
    .neq('estado', 'cancelado')

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