import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  actualizarEvento,
  crearEvento,
  getEventoPorId,
} from '../../services/eventosService'
import { clientesService } from '../../services/clientesService'
import { paquetesService } from '../../services/paquetesService'

const estados = ['pendiente', 'confirmado', 'realizado', 'cancelado']

export default function EventoForm() {
  const { id } = useParams()
  const esEdicion = Boolean(id)
  const navigate = useNavigate()

  const [clientes, setClientes] = useState([])
  const [paquetes, setPaquetes] = useState([])
  const [form, setForm] = useState({
    cliente_id: '',
    paquete_id: '',
    fecha: '',
    ubicacion: '',
    estado: 'pendiente',
    notas: '',
  })
  const [cargandoForm, setCargandoForm] = useState(esEdicion)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const inicializar = async () => {
      try {
        const [clientesData, paquetesData, evento] = await Promise.all([
          clientesService.getTodos(),
          paquetesService.getTodos(),
          esEdicion ? getEventoPorId(id) : Promise.resolve(null),
        ])

        setClientes(clientesData)
        setPaquetes(paquetesData)

        if (evento) {
          setForm({
            cliente_id: evento.cliente_id ?? '',
            paquete_id: evento.paquete_id ?? '',
            fecha: evento.fecha ? aInputDatetimeLocal(evento.fecha) : '',
            ubicacion: evento.ubicacion ?? '',
            estado: evento.estado ?? 'pendiente',
            notas: evento.notas ?? '',
          })
        }
      } catch (err) {
        console.error(err)
        setError('Error al cargar los datos del formulario')
      } finally {
        setCargandoForm(false)
      }
    }

    inicializar()
  }, [id, esEdicion])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const payload = {
      cliente_id: form.cliente_id,
      paquete_id: form.paquete_id || null,
      fecha: new Date(form.fecha).toISOString(),
      ubicacion: form.ubicacion || null,
      estado: form.estado,
      notas: form.notas || null,
    }

    try {
      if (esEdicion) {
        await actualizarEvento(id, payload)
      } else {
        await crearEvento(payload)
      }
      navigate('/eventos')
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.error || 'Error al guardar el evento')
      setLoading(false)
    }
  }

  if (cargandoForm) return <p>Cargando formulario...</p>

  return (
    <div style={{ maxWidth: 600 }}>
      <h2>{esEdicion ? 'Editar evento' : 'Nuevo evento'}</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '12px' }}>
          <label htmlFor="cliente_id">Cliente</label>
          <br />
          <select id="cliente_id" name="cliente_id" value={form.cliente_id} onChange={handleChange} required style={estiloInput}>
            <option value="">Selecciona un cliente</option>
            {clientes.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>{cliente.nombre}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label htmlFor="paquete_id">Paquete</label>
          <br />
          <select id="paquete_id" name="paquete_id" value={form.paquete_id} onChange={handleChange} style={estiloInput}>
            <option value="">Sin paquete</option>
            {paquetes.map((paquete) => (
              <option key={paquete.id} value={paquete.id}>
                {paquete.nombre} - ${paquete.precio}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label htmlFor="fecha">Fecha y hora</label>
          <br />
          <input
            id="fecha"
            name="fecha"
            type="datetime-local"
            value={form.fecha}
            onChange={handleChange}
            required
            style={estiloInput}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label htmlFor="ubicacion">Ubicación</label>
          <br />
          <input
            id="ubicacion"
            name="ubicacion"
            type="text"
            value={form.ubicacion}
            onChange={handleChange}
            style={estiloInput}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label htmlFor="estado">Estado</label>
          <br />
          <select id="estado" name="estado" value={form.estado} onChange={handleChange} style={estiloInput}>
            {estados.map((estado) => (
              <option key={estado} value={estado}>{estado}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label htmlFor="notas">Notas</label>
          <br />
          <textarea
            id="notas"
            name="notas"
            rows={3}
            value={form.notas}
            onChange={handleChange}
            style={{ ...estiloInput, width: '100%', boxSizing: 'border-box' }}
          />
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : (esEdicion ? 'Actualizar' : 'Crear')}
        </button>
      </form>
    </div>
  )
}

function aInputDatetimeLocal(iso) {
  const fecha = new Date(iso)
  const local = new Date(fecha.getTime() - fecha.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 16)
}

const estiloInput = { width: '100%', padding: '8px', boxSizing: 'border-box' }