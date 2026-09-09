import 'dotenv/config'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const EMAIL_FROM = process.env.EMAIL_FROM || 'Papayera La Berriondera <onboarding@resend.dev>'

export async function enviarRecordatorio({ cliente, evento }) {
  const fecha = new Date(evento.fecha).toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #d97706;">Hola, ${cliente.nombre}!</h2>
      <p>Te recordamos que tienes un evento programado con nosotros:</p>
      <ul>
        <li><strong>Fecha:</strong> ${fecha}</li>
        <li><strong>Ubicación:</strong> ${evento.ubicacion}</li>
      </ul>
      <p>Si tienes alguna duda, no dudes en escribirnos.</p>
      <p>Nos vemos pronto!</p>
    </div>
  `

  return resend.emails.send({
    from: EMAIL_FROM,
    to: [cliente.email],
    subject: `Recordatorio de tu evento - ${fecha}`,
    html,
  })
}