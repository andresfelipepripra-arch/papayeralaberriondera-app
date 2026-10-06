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

export function formatearFechaConDia(fecha) {
  return formatearConPatron(fecha, "EEEE, d 'de' MMMM 'de' yyyy")
}

export function formatearFechaCorta(fecha) {
  return formatearConPatron(fecha, 'd MMM')
}

export function formatearDia(fecha) {
  return formatearConPatron(fecha, 'd')
}

export function formatearMesCorto(fecha) {
  return formatearConPatron(fecha, 'MMM')
}

export function formatearHora(fecha) {
  return formatearConPatron(fecha, 'h:mm aaaa')
}

const formatoCorto = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 1 })

export function formatearPrecioCorto(numero) {
  const valor = Number(numero)
  if (numero === null || numero === undefined || numero === '' || Number.isNaN(valor)) return '—'
  if (Math.abs(valor) >= 1_000_000) return `$${formatoCorto.format(valor / 1_000_000)} M`
  if (Math.abs(valor) >= 1_000) return `$${formatoCorto.format(valor / 1_000)} mil`
  return formatearPrecio(valor)
}

// El evento puede tener su propio precio (ajustado por distancia/ubicación);
// si no lo tiene, se usa el precio base del paquete contratado.
export function precioEfectivo(evento, paquete) {
  const valor = evento?.precio ?? paquete?.precio
  const numero = Number(valor)
  return valor != null && Number.isFinite(numero) ? numero : 0
}

// "incluye" se guarda como texto libre, un ítem por línea.
export function itemsDeIncluye(incluye) {
  return (incluye ?? '')
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)
}

// duracion_horas se guarda como fracción decimal de una hora (0.75 = 45 min).
// Menos de 1 hora se muestra en minutos; 1 hora o más, en horas (+ minutos si sobran).
export function formatearDuracion(horas) {
  const valor = Number(horas)
  if (horas === null || horas === undefined || horas === '' || !Number.isFinite(valor) || valor <= 0) return null

  const totalMinutos = Math.round(valor * 60)
  const h = Math.floor(totalMinutos / 60)
  const min = totalMinutos % 60

  if (h === 0) return `${min} min`
  const textoHoras = `${h} ${h === 1 ? 'hora' : 'horas'}`
  return min === 0 ? textoHoras : `${textoHoras} ${min} min`
}

// La ganancia es propia de cada evento; si no tiene una, se usa la general de configuración.
export function gananciaDeEvento(evento, configuracion) {
  const valor = evento.ganancia_evento ?? configuracion?.ganancia_por_evento ?? 70000
  const numero = Number(valor)
  return Number.isFinite(numero) ? numero : 0
}
