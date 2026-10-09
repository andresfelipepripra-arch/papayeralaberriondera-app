import 'dotenv/config'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
export const REMITENTE_DEFAULT = process.env.EMAIL_FROM || 'Papayera La Berriondera <onboarding@resend.dev>'

const ZONA_HORARIA = 'America/Bogota'
const LOGO_URL = 'https://papayeralaberriondera-app.vercel.app/logo-papayera.png'
const ETIQUETAS_ESTADO = { pendiente: 'Pendiente', confirmado: 'Confirmado', realizado: 'Realizado', cancelado: 'Cancelado' }

function escapar(texto) {
  return String(texto ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function formatearFecha(fecha) {
  return new Date(fecha).toLocaleDateString('es-CO', {
    timeZone: ZONA_HORARIA,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatearHora(fecha) {
  return new Date(fecha).toLocaleTimeString('es-CO', { timeZone: ZONA_HORARIA, hour: 'numeric', minute: '2-digit' })
}

function partesDelDia(fecha) {
  const dia = new Date(fecha).toLocaleDateString('es-CO', { timeZone: ZONA_HORARIA, day: 'numeric' })
  const mes = new Date(fecha).toLocaleDateString('es-CO', { timeZone: ZONA_HORARIA, month: 'short' }).replace('.', '')
  return { dia, mes }
}

// duracion_horas se guarda como fracción decimal de una hora (0.75 = 45 min).
function formatearDuracion(horas) {
  const valor = Number(horas)
  if (horas === null || horas === undefined || horas === '' || !Number.isFinite(valor) || valor <= 0) return null

  const totalMinutos = Math.round(valor * 60)
  const h = Math.floor(totalMinutos / 60)
  const min = totalMinutos % 60

  if (h === 0) return `${min} min`
  const textoHoras = `${h} ${h === 1 ? 'hora' : 'horas'}`
  return min === 0 ? textoHoras : `${textoHoras} ${min} min`
}

// El evento puede tener su propia duración (ej. se extendió a 2 horas);
// si no la tiene, se usa la del paquete contratado.
function duracionDelEvento(evento) {
  return formatearDuracion(evento.duracion_horas ?? evento.paquetes?.duracion_horas)
}

function lugarDelEvento(evento) {
  return [evento.ciudad, evento.barrio, evento.ubicacion].filter(Boolean).join(' · ') || 'Por confirmar'
}

function telefonosDelEvento(evento, cliente) {
  const principal = evento.telefono_contacto ?? cliente?.telefono
  const nombrePrincipal = evento.nombre_contacto ?? cliente?.nombre
  const lineas = []

  if (principal) {
    lineas.push(
      `<a href="tel:${escapar(principal)}" style="color:#0f172a;text-decoration:none;font-weight:600;">${escapar(principal)}</a>` +
        (nombrePrincipal ? ` <span style="color:#64748b;">· ${escapar(nombrePrincipal)}</span>` : ''),
    )
  }
  if (evento.telefono_alterno) {
    lineas.push(
      `<a href="tel:${escapar(evento.telefono_alterno)}" style="color:#0f172a;text-decoration:none;font-weight:600;">${escapar(evento.telefono_alterno)}</a>` +
        (evento.nombre_telefono_alterno ? ` <span style="color:#64748b;">· ${escapar(evento.nombre_telefono_alterno)}</span>` : ''),
    )
  }

  return lineas.length ? lineas.join('<br>') : 'Sin teléfono registrado'
}

function filaDato(etiqueta, valorHtml) {
  return `
    <tr>
      <td style="padding:10px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:13px;width:120px;vertical-align:top;">${etiqueta}</td>
      <td style="padding:10px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-size:14px;vertical-align:top;">${valorHtml}</td>
    </tr>`
}

function plantillaCorreo({ nombreNegocio, etiqueta, titulo, pastilla, evento, cliente, filas, boton }) {
  const { dia, mes } = partesDelDia(evento.fecha)
  const nombreCliente = escapar(cliente?.nombre ?? 'Cliente sin datos')

  return `
<!doctype html>
<html lang="es">
  <body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f1f5f9;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;">
            <tr>
              <td align="center" style="background:#0f172a;border-radius:16px 16px 0 0;padding:28px 24px;">
                <img src="${LOGO_URL}" width="84" height="84" alt="${escapar(nombreNegocio)}" style="display:block;margin:0 auto 14px;border-radius:50%;">
                <div style="color:#f59e0b;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">${etiqueta}</div>
                <div style="color:#ffffff;font-size:22px;font-weight:700;margin-top:6px;">${titulo}</div>
              </td>
            </tr>
            <tr>
              <td style="background:#ffffff;border-radius:0 0 16px 16px;padding:24px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td width="72" valign="top">
                      <div style="background:#fef3c7;border-radius:12px;text-align:center;padding:10px 0;">
                        <div style="color:#b45309;font-size:26px;font-weight:700;line-height:1;">${dia}</div>
                        <div style="color:#b45309;font-size:11px;font-weight:700;text-transform:uppercase;margin-top:4px;">${mes}</div>
                      </div>
                    </td>
                    <td valign="top" style="padding-left:14px;">
                      <div style="display:inline-block;background:#f59e0b;color:#0f172a;font-size:12px;font-weight:700;border-radius:999px;padding:4px 10px;">${pastilla}</div>
                      <div style="color:#0f172a;font-size:18px;font-weight:700;margin-top:8px;">${nombreCliente}</div>
                      <div style="color:#64748b;font-size:13px;margin-top:2px;">${escapar(formatearFecha(evento.fecha))} · ${formatearHora(evento.fecha)}</div>
                    </td>
                  </tr>
                </table>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:20px;">
                  ${filas}
                </table>

                ${boton}
              </td>
            </tr>
          </table>

          <p style="color:#94a3b8;font-size:12px;text-align:center;margin:16px 0 0;">
            Notificación interna de ${escapar(nombreNegocio)}. No se envía al cliente.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

function filasDelEvento(evento, cliente) {
  return [
    filaDato('Lugar', escapar(lugarDelEvento(evento))),
    filaDato('Teléfonos', telefonosDelEvento(evento, cliente)),
    evento.tipo_evento ? filaDato('Tipo', escapar(evento.tipo_evento)) : '',
    duracionDelEvento(evento) ? filaDato('Duración', escapar(duracionDelEvento(evento))) : '',
    filaDato('Estado', ETIQUETAS_ESTADO[evento.estado ?? 'pendiente'] ?? escapar(evento.estado)),
  ].join('')
}

function botonLlamar(cliente, evento) {
  const telefono = evento.telefono_contacto ?? cliente?.telefono
  if (!telefono) return ''
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" style="margin-top:22px;">
      <tr>
        <td style="background:#f59e0b;border-radius:10px;">
          <a href="tel:${escapar(telefono)}" style="display:inline-block;padding:12px 22px;color:#0f172a;font-size:14px;font-weight:700;text-decoration:none;">Llamar al contacto</a>
        </td>
      </tr>
    </table>`
}

export function construirRecordatorio({ cliente, evento, diasRestantes, nombreNegocio }) {
  const faltan = diasRestantes === 0 ? 'hoy' : diasRestantes === 1 ? 'mañana' : `en ${diasRestantes} días`
  const nombreCliente = cliente?.nombre ?? 'Cliente sin datos'

  const subject = `Recordatorio: evento con ${nombreCliente} es ${faltan}`
  const html = plantillaCorreo({
    nombreNegocio,
    etiqueta: 'Recordatorio',
    titulo: `Tienes un evento ${faltan}`,
    pastilla: diasRestantes === 0 ? 'Hoy' : diasRestantes === 1 ? 'Mañana' : `En ${diasRestantes} días`,
    evento,
    cliente,
    filas: filasDelEvento(evento, cliente),
    boton: botonLlamar(cliente, evento),
  })

  return { subject, html }
}

export function construirSolicitudConfirmacion({ cliente, evento, diasRestantes, nombreNegocio }) {
  const faltan = diasRestantes === 0 ? 'es hoy' : diasRestantes === 1 ? 'falta 1 día' : `faltan ${diasRestantes} días`
  const nombreCliente = cliente?.nombre ?? 'Cliente sin datos'

  const subject = `Pendiente por confirmar: ${nombreCliente} — ${faltan}`
  const html = plantillaCorreo({
    nombreNegocio,
    etiqueta: 'Confirmación pendiente',
    titulo: 'Este evento aún no está confirmado',
    pastilla: 'Pendiente',
    evento,
    cliente,
    filas: filasDelEvento(evento, cliente),
    boton: botonLlamar(cliente, evento),
  })

  return { subject, html }
}

export async function enviarCorreo({ from, to, subject, html }) {
  return resend.emails.send({ from, to: [to], subject, html })
}
