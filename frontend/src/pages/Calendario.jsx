import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { getEventos } from '../services/eventosService'

moment.locale('es')
const localizer = momentLocalizer(moment)

const estados = ['todos', 'pendiente', 'confirmado', 'realizado', 'cancelado']

const estilosPorEstado = {
  pendiente: { backgroundColor: '#f5c518', color: '#3d3200' },
  confirmado: { backgroundColor: '#2563eb', color: '#ffffff' },
  realizado: { backgroundColor: '#16a34a', color: '#ffffff' },
  cancelado: { backgroundColor: '#9ca3af', color: '#7f1d1d', textDecoration: 'line-through' },
}

const estiloEvento = (evento) => ({ style: estilosPorEstado[evento.estado] ?? {} })

export default function Calendario() {
  const [eventos, setEventos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filtroEstado, setFiltroEstado] = useState('todos')
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

  const seleccionarEvento = (evento) => {
    navigate(`/eventos/${evento.id}`)
  }

  if (loading) return <p>Cargando calendario...</p>
  if (error) return <p>{error}</p>

  const misEventos = eventos
    .filter((evento) => filtroEstado === 'todos' || (evento.estado ?? 'pendiente') === filtroEstado)
    .map((evento) => {
      const fechaInicio = new Date(evento.fecha)
      return {
        id: evento.id,
        title: evento.clientes?.nombre ?? evento.ubicacion ?? 'Evento',
        start: fechaInicio,
        end: fechaInicio,
        estado: evento.estado ?? 'pendiente',
      }
    })

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} style={{ padding: '8px' }}>
          {estados.map((estado) => (
            <option key={estado} value={estado}>
              {estado === 'todos' ? 'Todos los estados' : estado}
            </option>
          ))}
        </select>
      </div>

      <div style={{ height: 600 }}>
        <Calendar
          localizer={localizer}
          events={misEventos}
          startAccessor="start"
          endAccessor="end"
          onSelectEvent={seleccionarEvento}
          eventPropGetter={estiloEvento}
        />
      </div>
    </div>
  )
}