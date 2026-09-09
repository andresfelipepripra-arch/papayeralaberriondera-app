import { useEffect, useState } from 'react'
import { getEventos } from '../../services/eventosService'

export default function EventosList() {
  const [eventos, setEventos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await getEventos()
        setEventos(data)
      } catch (err) {
        console.error(err)
        setError('Error al cargar los eventos')
      } finally {
        setLoading(false)
      }
    }

    cargar()
  }, [])

  if (loading) return <p>Cargando eventos...</p>
  if (error) return <p>{error}</p>
  if (eventos.length === 0) return <p>No hay eventos programados</p>

  return (
    <table style={{ borderCollapse: 'collapse', width: '100%' }}>
      <thead>
        <tr>
          <th style={estiloCelda}>Fecha</th>
          <th style={estiloCelda}>Ubicación</th>
          <th style={estiloCelda}>Estado</th>
        </tr>
      </thead>
      <tbody>
        {eventos.map((evento) => (
          <tr key={evento.id}>
            <td style={estiloCelda}>{new Date(evento.fecha).toLocaleString('es-CO')}</td>
            <td style={estiloCelda}>{evento.ubicacion ?? '—'}</td>
            <td style={estiloCelda}>
              {evento.correo_recordatorio_enviado ? 'Recordatorio enviado' : 'Pendiente'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

const estiloCelda = {
  border: '1px solid #ccc',
  padding: '8px',
  textAlign: 'left',
}