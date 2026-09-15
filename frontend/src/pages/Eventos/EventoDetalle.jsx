import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getEventoPorId } from '../../services/eventosService'

export default function EventoDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [evento, setEvento] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await getEventoPorId(id)
        setEvento(data)
      } catch (err) {
        console.error(err)
        setError('Error al cargar el evento')
      } finally {
        setLoading(false)
      }
    }

    cargar()
  }, [id])

  if (loading) return <p>Cargando evento...</p>
  if (error) return <p>{error}</p>
  if (!evento) return <p>No se encontró el evento</p>

  return (
    <div style={{ maxWidth: 600 }}>
      <h2>Detalle del evento</h2>

      <dl style={estiloLista}>
        <dt style={estiloTitulo}>Cliente</dt>
        <dd>{evento.clientes?.nombre ?? '—'}</dd>

        <dt style={estiloTitulo}>Paquete</dt>
        <dd>{evento.paquetes?.nombre ?? 'Sin paquete'}</dd>

        <dt style={estiloTitulo}>Fecha</dt>
        <dd>{new Date(evento.fecha).toLocaleString('es-CO')}</dd>

        <dt style={estiloTitulo}>Ubicación</dt>
        <dd>{evento.ubicacion ?? '—'}</dd>

        <dt style={estiloTitulo}>Estado</dt>
        <dd>{evento.estado ?? 'pendiente'}</dd>

        <dt style={estiloTitulo}>Notas</dt>
        <dd>{evento.notas ?? '—'}</dd>

        <dt style={estiloTitulo}>Recordatorio</dt>
        <dd>{evento.correo_recordatorio_enviado ? 'Enviado' : 'No enviado'}</dd>
      </dl>

      <button onClick={() => navigate(`/eventos/${evento.id}/editar`)}>Editar</button>{' '}
      <button onClick={() => navigate('/eventos')}>Volver a eventos</button>
    </div>
  )
}

const estiloLista = { margin: 0 }
const estiloTitulo = { fontWeight: 'bold', marginTop: '12px' }