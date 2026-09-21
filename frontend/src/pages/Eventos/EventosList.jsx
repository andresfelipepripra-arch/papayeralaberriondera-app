import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { eliminarEvento, getEventos } from '../../services/eventosService'
import { formatearFechaHora } from '../../utils/formatters'

const estados = ['todos', 'pendiente', 'confirmado', 'realizado', 'cancelado']

export default function EventosList() {
  const [eventos, setEventos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [busqueda, setBusqueda] = useState('')
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

  const textoBusqueda = busqueda.trim().toLowerCase()
  const eventosFiltrados = eventos.filter((evento) => {
    const coincideEstado = filtroEstado === 'todos' || evento.estado === filtroEstado
    const coincideBusqueda =
      !textoBusqueda ||
      evento.clientes?.nombre?.toLowerCase().includes(textoBusqueda) ||
      evento.ubicacion?.toLowerCase().includes(textoBusqueda)
    return coincideEstado && coincideBusqueda
  })

  return (
    <div>
      <button type="button" onClick={() => navigate('/eventos/nuevo')} style={{ marginBottom: '16px' }}>
        + Nuevo evento
      </button>

      <div style={{ marginBottom: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} style={estiloInput}>
          {estados.map((estado) => (
            <option key={estado} value={estado}>
              {estado === 'todos' ? 'Todos los estados' : estado}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Buscar por cliente o ubicación"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ ...estiloInput, flex: 1, minWidth: '200px' }}
        />
      </div>

      {eventos.length === 0 ? (
        <p>No hay eventos programados</p>
      ) : eventosFiltrados.length === 0 ? (
        <p>No hay eventos que coincidan con el filtro</p>
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
            {eventosFiltrados.map((evento) => (
              <tr key={evento.id}>
                <td style={estiloCelda}>{formatearFechaHora(evento.fecha)}</td>
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

const estiloInput = {
  padding: '8px',
}