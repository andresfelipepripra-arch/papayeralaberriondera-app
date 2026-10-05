import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { precioEfectivo } from './formatters'

const enMil = (valor) => Math.round(Number(valor) / 1000)

function horaCorta(fecha) {
  const horas24 = fecha.getHours()
  const horas12 = horas24 % 12 === 0 ? 12 : horas24 % 12
  const minutos = String(fecha.getMinutes()).padStart(2, '0')
  return `${horas12}:${minutos}${horas24 < 12 ? 'am' : 'pm'}`
}

export function construirResumenEvento(evento, paquete) {
  const fecha = new Date(evento.fecha)
  const total = precioEfectivo(evento, paquete)
  const abonado = Number(evento.abonado) || 0
  const falta = Math.max(total - abonado, 0)

  const dia = format(fecha, 'EEEE', { locale: es })
  const contacto = [evento.telefono_contacto ?? evento.clientes?.telefono, evento.nombre_contacto ?? evento.clientes?.nombre]
    .filter(Boolean)
    .join(' - ')

  return [
    `${dia.charAt(0).toUpperCase() + dia.slice(1)} ${format(fecha, 'd MMMM', { locale: es })}`,
    [evento.barrio, horaCorta(fecha)].filter(Boolean).join(' - '),
    `Dirección: ${evento.ubicacion ?? ''}`,
    `Contacto: ${contacto}`,
    `Tipo de evento: ${evento.tipo_evento ?? ''}`,
    `Formato: ${paquete?.nombre ?? evento.paquetes?.nombre ?? ''}`,
    `Cobrar: ${enMil(falta)}, total ${enMil(total)}, ${abonado > 0 ? `ya abono ${enMil(abonado)} mil` : 'ya abono 0'}`,
    'Pagos:',
  ].join('\n')
}
