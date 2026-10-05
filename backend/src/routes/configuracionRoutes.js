import { Router } from 'express'
import { supabase } from '../config/supabaseClient.js'
import { requiereAdmin } from '../middleware/requiereAdmin.js'
import { obtenerConfiguracion } from '../services/configuracionService.js'
import { listarHistorial } from '../services/correosEnviadosService.js'
import { construirRecordatorio, construirSolicitudConfirmacion, REMITENTE_DEFAULT } from '../services/emailService.js'
import { diasRestantesDesde, inicioDelDiaOperativoActualISO } from '../utils/fechas.js'

const router = Router()

const CAMPOS_TEXTO = ['nombre_negocio', 'telefono', 'correo_contacto', 'logo_url', 'correo_remitente', 'correo_notificaciones']
const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const REGEX_HORA = /^([01]\d|2[0-3]):([0-5]\d)$/

function esUrlHttp(valor) {
  try {
    const { protocol } = new URL(valor)
    return protocol === 'http:' || protocol === 'https:'
  } catch {
    return false
  }
}

function correoDeRemitente(valor) {
  const match = valor.match(/<([^>]+)>/)
  return match ? match[1].trim() : valor.trim()
}

function validarYNormalizar(body) {
  const datos = {}

  for (const campo of CAMPOS_TEXTO) {
    if (body[campo] === undefined) continue

    const valor = body[campo]
    if (valor !== null && typeof valor !== 'string') {
      return { error: `${campo} debe ser texto` }
    }

    const limpio = valor === null ? '' : valor.trim()
    datos[campo] = limpio === '' ? null : limpio
  }

  if ('nombre_negocio' in datos && datos.nombre_negocio === null) {
    return { error: 'El nombre del negocio es obligatorio' }
  }
  if ('correo_notificaciones' in datos && datos.correo_notificaciones === null) {
    return { error: 'El correo de notificaciones es obligatorio' }
  }
  if (datos.correo_notificaciones && !REGEX_CORREO.test(datos.correo_notificaciones)) {
    return { error: 'El correo de notificaciones no es válido' }
  }
  if (datos.correo_contacto && !REGEX_CORREO.test(datos.correo_contacto)) {
    return { error: 'El correo de contacto no es válido' }
  }
  if (datos.logo_url && !esUrlHttp(datos.logo_url)) {
    return { error: 'El logo debe ser una URL http(s) válida' }
  }
  if (datos.correo_remitente && !REGEX_CORREO.test(correoDeRemitente(datos.correo_remitente))) {
    return { error: 'El correo remitente no es válido (usa "correo@dominio.com" o "Nombre <correo@dominio.com>")' }
  }

  if (body.envio_automatico !== undefined) {
    if (typeof body.envio_automatico !== 'boolean') {
      return { error: 'envio_automatico debe ser verdadero o falso' }
    }
    datos.envio_automatico = body.envio_automatico
  }

  if (body.hora_envio !== undefined) {
    if (typeof body.hora_envio !== 'string' || !REGEX_HORA.test(body.hora_envio)) {
      return { error: 'hora_envio debe tener el formato HH:MM' }
    }
    datos.hora_envio = body.hora_envio
  }

  if (body.dias_recordatorio !== undefined) {
    const dias = body.dias_recordatorio
    const validos =
      Array.isArray(dias) &&
      dias.length >= 1 &&
      dias.length <= 6 &&
      dias.every((d) => Number.isInteger(d) && d >= 0 && d <= 90)
    if (!validos) {
      return { error: 'dias_recordatorio debe ser una lista de 1 a 6 números enteros entre 0 y 90' }
    }
    datos.dias_recordatorio = dias
  }

  if (body.ganancia_por_evento !== undefined) {
    const ganancia = body.ganancia_por_evento
    if (typeof ganancia !== 'number' || !Number.isFinite(ganancia) || ganancia < 0) {
      return { error: 'ganancia_por_evento debe ser un número mayor o igual a 0' }
    }
    datos.ganancia_por_evento = ganancia
  }

  if (body.dias_confirmacion !== undefined) {
    const dias = body.dias_confirmacion
    if (!Number.isInteger(dias) || dias < 0 || dias > 90) {
      return { error: 'dias_confirmacion debe ser un número entero entre 0 y 90' }
    }
    datos.dias_confirmacion = dias
  }

  if (Object.keys(datos).length === 0) {
    return { error: 'No hay campos para actualizar' }
  }

  return { datos }
}

router.get('/', async (_req, res) => {
  try {
    const data = await obtenerConfiguracion()
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.put('/', requiereAdmin, async (req, res) => {
  const { datos, error: errorValidacion } = validarYNormalizar(req.body ?? {})

  if (errorValidacion) {
    return res.status(400).json({ error: errorValidacion })
  }

  try {
    const { data, error } = await supabase
      .from('configuracion')
      .update(datos)
      .eq('id', 1)
      .select()
      .single()

    if (error) throw new Error(error.message)
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get('/vista-previa', requiereAdmin, async (req, res) => {
  const tipo = req.query.tipo === 'confirmacion' ? 'confirmacion' : 'recordatorio'

  try {
    const configuracion = await obtenerConfiguracion()
    const nombreNegocio = configuracion.nombre_negocio ?? 'Papayera'
    const from = configuracion.correo_remitente || REMITENTE_DEFAULT
    const to = configuracion.correo_notificaciones

    const { data: eventos, error } = await supabase
      .from('eventos')
      .select('*')
      .gte('fecha', inicioDelDiaOperativoActualISO())
      .neq('estado', 'cancelado')
      .order('fecha', { ascending: true })
      .limit(10)

    if (error) throw new Error(error.message)

    const eventoReal =
      tipo === 'confirmacion' ? eventos.find((e) => (e.estado ?? 'pendiente') === 'pendiente') : eventos[0]

    const cliente = eventoReal
      ? { nombre: eventoReal.nombre_cliente, correo: eventoReal.correo_cliente, telefono: eventoReal.telefono_contacto }
      : { nombre: 'Nombre del cliente', correo: 'cliente@correo.com', telefono: '300 000 0000' }
    const evento = eventoReal ?? {
      fecha: new Date(Date.now() + 7 * 86400000).toISOString(),
      ubicacion: 'Ubicación del evento',
      estado: 'pendiente',
    }
    const diasRestantes = eventoReal
      ? Math.max(0, diasRestantesDesde(evento.fecha, new Date()))
      : (tipo === 'confirmacion' ? configuracion.dias_confirmacion : configuracion.dias_recordatorio?.[0]) ?? 7

    const { subject, html } =
      tipo === 'confirmacion'
        ? construirSolicitudConfirmacion({ cliente, evento, diasRestantes, nombreNegocio })
        : construirRecordatorio({ cliente, evento, diasRestantes, nombreNegocio })

    res.json({ from, to, subject, html, esReal: Boolean(eventoReal) })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get('/historial-correos', requiereAdmin, async (_req, res) => {
  try {
    const historial = await listarHistorial(50)
    res.json(historial)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
