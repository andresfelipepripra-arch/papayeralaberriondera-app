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
    .select('*, paquetes (duracion_horas)')
    .gte('fecha', inicioDelDiaOperativoActualISO())
    .lte('fecha', fechaLimite.toISOString())
    .neq('estado', 'cancelado')

  if (error) throw new Error(error.message)
  return data
}

// Pasa a realizado los eventos que ya ocurrieron y todavía están pendientes o
// confirmados, y los marca como pagados por completo. Los cancelados no se tocan.
export async function completarEventosVencidos() {
  const { data, error } = await supabase
    .from('eventos')
    .select('id, precio, paquetes(precio)')
    .in('estado', ['pendiente', 'confirmado'])
    .lt('fecha', new Date().toISOString())

  if (error) throw new Error(error.message)

  for (const evento of data) {
    const total = evento.precio ?? evento.paquetes?.precio ?? 0
    const { error: errorUpdate } = await supabase
      .from('eventos')
      .update({ estado: 'realizado', abonado: total })
      .eq('id', evento.id)

    if (errorUpdate) throw new Error(errorUpdate.message)
  }

  return data.length
}

export async function marcarRecordatorioEnviado(id) {
  const { error } = await supabase
    .from('eventos')
    .update({ correo_recordatorio_enviado: true })
    .eq('id', id)

  if (error) throw new Error(error.message)
}