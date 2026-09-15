import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { eliminarEvento, getEventos } from '../../services/eventosService'

export default function EventosList() {
  const [eventos, setEventos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

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

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar este evento?')) return
    try {
      await eliminarEvento(id)
      setEventos((prev) => prev.filter((e) => e.id !== id))
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.error || 'Error al eliminar el evento')
    }
  }

  if (loading) return <p>Cargando eventos...</p>
  if (error) return <p>{error}</p>

  return (
    <div>
      <button type="button" onClick={() => navigate('/eventos/nuevo')} style={{ marginBottom: '16px' }}>
        + Nuevo evento
      </button>

      {eventos.length === 0 ? (
        <p>No hay eventos programados</p>
      ) : (
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th style={estiloCelda}>Fecha</th>
              <th style={estiloCelda}>Cliente</th>
              <th style={estiloCelda}>Ubicación</th>
              <th style={estiloCelda}>Estado</th>
              <th style={estiloCelda}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {eventos.map((evento) => (
              <tr key={evento.id}>
                <td style={estiloCelda}>{new Date(evento.fecha).toLocaleString('es-CO')}</td>
                <td style={estiloCelda}>{evento.clientes?.nombre ?? '—'}</td>
                <td style={estiloCelda}>{evento.ubicacion ?? '—'}</td>
                <td style={estiloCelda}>{evento.estado ?? 'pendiente'}</td>
                <td style={estiloCelda}>
                  <button onClick={() => navigate(`/eventos/${evento.id}`)}>Ver detalle</button>{' '}
                  <button onClick={() => navigate(`/eventos/${evento.id}/editar`)}>Editar</button>{' '}
                  <button onClick={() => handleEliminar(evento.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

const estiloCelda = {
  border: '1px solid #ccc',
  padding: '8px',
  textAlign: 'left',
}