import cron from 'node-cron'
import {
  listarEventosProximos,
  marcarRecordatorioEnviado,
} from '../services/eventosService.js'
import { enviarRecordatorio } from '../services/emailService.js'

const DIAS_ANTICIPACION = 3

export async function ejecutarRecordatorios() {
  console.log(`[recordatorio] Ejecutando: ${new Date().toISOString()}`)

  let enviados = 0
  try {
    const eventos = await listarEventosProximos(DIAS_ANTICIPACION)

    for (const evento of eventos) {
      const cliente = evento.clientes
      if (!cliente || !cliente.email) continue

      try {
        await enviarRecordatorio({ cliente, evento })
        await marcarRecordatorioEnviado(evento.id)
        enviados++
      } catch (error) {
        console.error(`[recordatorio] Error al enviar correo del evento ${evento.id}: ${error.message}`)
      }
    }

    console.log(`[recordatorio] Se enviaron ${enviados} correos de recordatorio`)
    return { enviados }
  } catch (error) {
    console.error(`[recordatorio] Error en la ejecución: ${error.message}`)
    throw error
  }
}

export function iniciarRecordatorioJob() {
  cron.schedule('0 8 * * *', () => {
    ejecutarRecordatorios()
  })

  console.log('[recordatorio] Cron programado: todos los días a las 8:00 AM')
}