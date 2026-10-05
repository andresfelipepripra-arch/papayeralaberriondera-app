import { listarEventosVigentes, marcarRecordatorioEnviado } from '../services/eventosService.js'
import { obtenerConfiguracion } from '../services/configuracionService.js'
import { obtenerEnviosPrevios, registrarEnvio } from '../services/correosEnviadosService.js'
import {
  construirRecordatorio,
  construirSolicitudConfirmacion,
  enviarCorreo,
  REMITENTE_DEFAULT,
} from '../services/emailService.js'
import { diasRestantesDesde } from '../utils/fechas.js'

// Decide a qué "escalón" de recordatorio pertenece un evento, dado cuántos
// días faltan. Cada escalón cubre el rango (siguiente_menor, actual].
// Devuelve el tipo ('recordatorio_<dias>') o null si no aplica ninguno.
export function elegirEscalonRecordatorio(diasRecordatorioDesc, diasRestantes) {
  for (let i = 0; i < diasRecordatorioDesc.length; i++) {
    const actual = diasRecordatorioDesc[i]
    const siguienteMenor = diasRecordatorioDesc[i + 1] ?? -1

    if (diasRestantes <= actual && diasRestantes > siguienteMenor) {
      return `recordatorio_${actual}`
    }
  }
  return null
}

export function eventoRecordable(evento, ahora) {
  return evento.estado !== 'realizado' && evento.estado !== 'cancelado' && new Date(evento.fecha) >= ahora
}

export function debeSolicitarConfirmacion(estado, diasRestantes, diasConfirmacion) {
  return (estado ?? 'pendiente') === 'pendiente' && diasRestantes >= 0 && diasRestantes <= diasConfirmacion
}

async function intentarEnvio({ evento, cliente, tipo, subject, html, from, destinatario, contadores }) {
  try {
    await enviarCorreo({ from, to: destinatario, subject, html })
    await registrarEnvio({ eventoId: evento.id, clienteId: cliente?.id ?? null, tipo, destinatario, estado: 'enviado' })
    if (tipo.startsWith('recordatorio_')) await marcarRecordatorioEnviado(evento.id)
    contadores.enviados++
  } catch (error) {
    await registrarEnvio({
      eventoId: evento.id,
      clienteId: cliente?.id ?? null,
      tipo,
      destinatario,
      estado: 'fallido',
      error: error.message,
    })
    contadores.fallidos++
    console.error(`[recordatorio] Error al enviar "${tipo}" del evento ${evento.id}: ${error.message}`)
  }
}

export async function ejecutarRecordatorios() {
  console.log(`[recordatorio] Ejecutando: ${new Date().toISOString()}`)

  const configuracion = await obtenerConfiguracion()
  const ahora = new Date()
  const nombreNegocio = configuracion.nombre_negocio ?? 'Papayera'
  const from = configuracion.correo_remitente || REMITENTE_DEFAULT
  const destinatario = configuracion.correo_notificaciones
  const diasRecordatorio = [...new Set(configuracion.dias_recordatorio ?? [7, 3, 1])].sort((a, b) => b - a)
  const maxDias = Math.max(...diasRecordatorio, configuracion.dias_confirmacion ?? 0)

  const eventos = await listarEventosVigentes(maxDias)
  const enviosPrevios = await obtenerEnviosPrevios(eventos.map((e) => e.id))
  const contadores = { enviados: 0, fallidos: 0 }

  for (const evento of eventos) {
    const cliente = { nombre: evento.nombre_cliente, correo: evento.correo_cliente, telefono: evento.telefono_contacto }
    if (!eventoRecordable(evento, ahora)) continue

    const diasRestantes = diasRestantesDesde(evento.fecha, ahora)
    if (diasRestantes < 0) continue

    const tipoRecordatorio = elegirEscalonRecordatorio(diasRecordatorio, diasRestantes)
    if (tipoRecordatorio && !enviosPrevios.has(`${evento.id}:${tipoRecordatorio}`)) {
      const { subject, html } = construirRecordatorio({ cliente, evento, diasRestantes, nombreNegocio })
      await intentarEnvio({ evento, cliente, tipo: tipoRecordatorio, subject, html, from, destinatario, contadores })
    }

    if (debeSolicitarConfirmacion(evento.estado, diasRestantes, configuracion.dias_confirmacion ?? 14)) {
      const tipo = 'confirmacion'
      if (!enviosPrevios.has(`${evento.id}:${tipo}`)) {
        const { subject, html } = construirSolicitudConfirmacion({ cliente, evento, diasRestantes, nombreNegocio })
        await intentarEnvio({ evento, cliente, tipo, subject, html, from, destinatario, contadores })
      }
    }
  }

  console.log(`[recordatorio] Enviados: ${contadores.enviados}, fallidos: ${contadores.fallidos}`)
  return contadores
}
