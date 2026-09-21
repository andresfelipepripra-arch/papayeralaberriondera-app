import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const formatoPesos = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 })

export function formatearPrecio(numero) {
  const valor = Number(numero)
  if (numero === null || numero === undefined || numero === '' || Number.isNaN(valor)) return '—'
  return `$${formatoPesos.format(valor)}`
}

function formatearConPatron(fecha, patron) {
  if (!fecha) return '—'
  const date = new Date(fecha)
  if (Number.isNaN(date.getTime())) return '—'
  return format(date, patron, { locale: es })
}

export function formatearFecha(fecha) {
  return formatearConPatron(fecha, "d 'de' MMMM 'de' yyyy")
}

export function formatearFechaHora(fecha) {
  return formatearConPatron(fecha, "d 'de' MMMM 'de' yyyy, h:mm aaaa")
}
