import { Router } from 'express'
import { ejecutarRecordatorios } from '../jobs/recordatorioJob.js'
import { obtenerConfiguracion } from '../services/configuracionService.js'
import { completarEventosVencidos } from '../services/eventosService.js'

const router = Router()

export function horaActualColombia() {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'America/Bogota',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date())
}

// Pura: decide si el job debe correr ahora, dada la configuración y la hora actual (HH:MM).
export function decidirEjecucion(configuracion, horaActual) {
  if (!configuracion.envio_automatico) {
    return { debeEjecutar: false, motivo: 'envío automático desactivado' }
  }

  const horaConfigurada = (configuracion.hora_envio ?? '08:00').slice(0, 5)
  if (horaActual < horaConfigurada) {
    return {
      debeEjecutar: false,
      motivo: `aún no es la hora (configurada: ${horaConfigurada}, actual: ${horaActual})`,
    }
  }

  return { debeEjecutar: true, motivo: null }
}

router.post('/recordatorios', async (req, res) => {
  const secret = req.get('x-cron-key')
  if (!secret || secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'No autorizado' })
  }

  try {
    // Corre en cada tick del cron, aunque no toque enviar recordatorios.
    const eventosCompletados = await completarEventosVencidos()
    const configuracion = await obtenerConfiguracion()
    const { debeEjecutar, motivo } = decidirEjecucion(configuracion, horaActualColombia())

    if (!debeEjecutar) {
      return res.json({ ejecutado: false, motivo, eventosCompletados })
    }

    const resultado = await ejecutarRecordatorios()
    res.json({ ejecutado: true, eventosCompletados, ...resultado })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
