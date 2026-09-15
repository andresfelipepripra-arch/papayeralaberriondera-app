import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { getEventos } from '../services/eventosService'

moment.locale('es')
const localizer = momentLocalizer(moment)

export default function Calendario() {
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

  const seleccionarEvento = (evento) => {
    navigate(`/eventos/${evento.id}`)
  }

  if (loading) return <p>Cargando calendario...</p>
  if (error) return <p>{error}</p>

  const misEventos = eventos.map((evento) => {
    const fechaInicio = new Date(evento.fecha)
    return {
      id: evento.id,
      title: evento.clientes?.nombre ?? evento.ubicacion ?? 'Evento',
      start: fechaInicio,
      end: fechaInicio,
    }
  })

  return (
    <div style={{ height: 600 }}>
      <Calendar
        localizer={localizer}
        events={misEventos}
        startAccessor="start"
        endAccessor="end"
        onSelectEvent={seleccionarEvento}
      />
    </div>
  )
}