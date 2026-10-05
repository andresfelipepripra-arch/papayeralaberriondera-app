import 'dotenv/config'
import nodemailer from 'nodemailer'

const transporte = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 30000,
})
export const REMITENTE_DEFAULT = process.env.EMAIL_FROM || `Papayera La Berriondera <${process.env.GMAIL_USER}>`

function formatearFechaLarga(fecha) {
  return new Date(fecha).toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function plantillaBase({ nombreNegocio, titulo, cuerpo }) {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #d97706;">${titulo}</h2>
      ${cuerpo}
      <p style="color: #888; font-size: 12px;">Notificación automática de ${nombreNegocio}.</p>
    </div>
  `
}

function datosContacto(cliente) {
  const partes = []
  if (cliente?.correo) partes.push(`<li><strong>Correo:</strong> ${cliente.correo}</li>`)
  if (cliente?.telefono) partes.push(`<li><strong>Teléfono:</strong> ${cliente.telefono}</li>`)
  return partes.join('\n')
}

export function construirRecordatorio({ cliente, evento, diasRestantes, nombreNegocio }) {
  const fecha = formatearFechaLarga(evento.fecha)
  const faltan = diasRestantes === 0 ? 'hoy' : diasRestantes === 1 ? 'mañana' : `en ${diasRestantes} días`
  const nombreCliente = cliente?.nombre ?? 'Cliente sin datos'

  const subject = `Recordatorio: evento con ${nombreCliente} es ${faltan}`
  const html = plantillaBase({
    nombreNegocio,
    titulo: `Tienes un evento ${faltan}`,
    cuerpo: `
      <p>Este es un recordatorio interno de <strong>${nombreNegocio}</strong> sobre un evento contratado:</p>
      <ul>
        <li><strong>Cliente:</strong> ${nombreCliente}</li>
        <li><strong>Fecha:</strong> ${fecha}</li>
        <li><strong>Ubicación:</strong> ${evento.ubicacion ?? 'Por confirmar'}</li>
        <li><strong>Estado:</strong> ${evento.estado ?? 'pendiente'}</li>
        ${datosContacto(cliente)}
      </ul>
    `,
  })

  return { subject, html }
}

export function construirSolicitudConfirmacion({ cliente, evento, diasRestantes, nombreNegocio }) {
  const fecha = formatearFechaLarga(evento.fecha)
  const faltan = diasRestantes === 0 ? 'es hoy' : diasRestantes === 1 ? 'falta 1 día' : `faltan ${diasRestantes} días`
  const nombreCliente = cliente?.nombre ?? 'Cliente sin datos'

  const subject = `Pendiente por confirmar: ${nombreCliente} — ${faltan}`
  const html = plantillaBase({
    nombreNegocio,
    titulo: 'Evento pendiente por confirmar',
    cuerpo: `
      <p>Este evento sigue en estado <strong>pendiente</strong> y ya se acerca la fecha — contacta al cliente para confirmar:</p>
      <ul>
        <li><strong>Cliente:</strong> ${nombreCliente}</li>
        <li><strong>Fecha:</strong> ${fecha}</li>
        <li><strong>Ubicación:</strong> ${evento.ubicacion ?? 'Por confirmar'}</li>
        ${datosContacto(cliente)}
      </ul>
    `,
  })

  return { subject, html }
}

export async function enviarCorreo({ from, to, subject, html }) {
  return transporte.sendMail({ from, to, subject, html })
}
