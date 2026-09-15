import { useEffect, useState } from 'react'
import { getEventos } from '../services/eventosService'
import { clientesService } from '../services/clientesService'
import { paquetesService } from '../services/paquetesService'

export default function Dashboard() {
  const [eventos, setEventos] = useState([])
  const [clientes, setClientes] = useState([])
  const [paquetes, setPaquetes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const cargar = async () => {
      try {
        const [eventosData, clientesData, paquetesData] = await Promise.all([
          getEventos(),
          clientesService.getTodos(),
          paquetesService.getTodos(),
        ])
        setEventos(eventosData)
        setClientes(clientesData)
        setPaquetes(paquetesData)
      } catch (err) {
        console.error(err)
        setError('Error al cargar el resumen')
      } finally {
        setLoading(false)
      }
    }

    cargar()
  }, [])

  if (loading) return <p>Cargando resumen...</p>
  if (error) return <p>{error}</p>

  const ahora = new Date()
  const proximos = eventos
    .filter((e) => new Date(e.fecha) >= ahora)
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
  const proximos5 = proximos.slice(0, 5)

  return (
    <div>
      <h2>Dashboard</h2>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <div style={estiloTarjeta}>
          <strong>Eventos próximos</strong>
          <p>{proximos.length}</p>
        </div>
        <div style={estiloTarjeta}>
          <strong>Clientes</strong>
          <p>{clientes.length}</p>
        </div>
        <div style={estiloTarjeta}>
          <strong>Paquetes</strong>
          <p>{paquetes.length}</p>
        </div>
      </div>

      <h3>Próximos 5 eventos</h3>
      {proximos5.length === 0 ? (
        <p>No hay eventos programados</p>
      ) : (
        <ul>
          {proximos5.map((evento) => (
            <li key={evento.id}>
              <strong>{evento.clientes?.nombre ?? 'Sin cliente'}</strong> —{' '}
              {new Date(evento.fecha).toLocaleString('es-CO')}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

const estiloTarjeta = {
  border: '1px solid #ccc',
  borderRadius: '8px',
  padding: '16px',
  minWidth: '140px',
  textAlign: 'center',
}