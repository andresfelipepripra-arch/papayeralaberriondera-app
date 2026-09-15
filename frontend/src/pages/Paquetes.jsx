import { useEffect, useState } from 'react'
import { paquetesService } from '../services/paquetesService'

const vacio = { nombre: '', descripcion: '', precio: '', duracion_horas: '', incluye: '' }

export default function Paquetes() {
  const [paquetes, setPaquetes] = useState([])
  const [form, setForm] = useState(vacio)
  const [editandoId, setEditandoId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [mensaje, setMensaje] = useState(null)

  const cargar = async () => {
    setLoading(true)
    try {
      const data = await paquetesService.getTodos()
      setPaquetes(data)
    } catch (err) {
      console.error(err)
      setError('Error al cargar los paquetes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setMensaje(null)
    try {
      const payload = {
        nombre: form.nombre,
        descripcion: form.descripcion || null,
        precio: Number(form.precio),
        duracion_horas: form.duracion_horas ? Number(form.duracion_horas) : null,
        incluye: form.incluye || null,
      }
      if (editandoId) {
        await paquetesService.actualizar(editandoId, payload)
        setMensaje('Paquete actualizado')
      } else {
        await paquetesService.crear(payload)
        setMensaje('Paquete creado')
      }
      setForm(vacio)
      setEditandoId(null)
      await cargar()
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.error || 'Error al guardar el paquete')
    }
  }

  const handleEditar = (paquete) => {
    setEditandoId(paquete.id)
    setForm({
      nombre: paquete.nombre,
      descripcion: paquete.descripcion ?? '',
      precio: paquete.precio,
      duracion_horas: paquete.duracion_horas ?? '',
      incluye: paquete.incluye ?? '',
    })
  }

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar este paquete?')) return
    setError(null)
    setMensaje(null)
    try {
      await paquetesService.eliminar(id)
      setPaquetes((prev) => prev.filter((p) => p.id !== id))
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.error || 'Error al eliminar el paquete')
    }
  }

  return (
    <div>
      <h2>Paquetes</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: '16px' }}>
        <h3>{editandoId ? 'Editar paquete' : 'Crear paquete'}</h3>
        <div>
          <input name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} required style={estiloInput} />
          <input name="precio" type="number" step="0.01" placeholder="Precio" value={form.precio} onChange={handleChange} required style={estiloInput} />
          <input name="duracion_horas" type="number" step="0.5" placeholder="Duración (horas)" value={form.duracion_horas} onChange={handleChange} style={estiloInput} />
        </div>
        <div>
          <input name="descripcion" placeholder="Descripción" value={form.descripcion} onChange={handleChange} style={estiloInputLargo} />
        </div>
        <div>
          <textarea name="incluye" placeholder="¿Qué incluye?" value={form.incluye} onChange={handleChange} style={estiloInputLargo} rows={2} />
        </div>
        {editandoId && (
          <button type="button" onClick={() => { setEditandoId(null); setForm(vacio) }}>Cancelar</button>
        )}
        <button type="submit">{editandoId ? 'Actualizar' : 'Crear'}</button>
      </form>

      {mensaje && <p style={{ color: 'green' }}>{mensaje}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {loading ? (
        <p>Cargando paquetes...</p>
      ) : (
        <table style={estiloTabla}>
          <thead>
            <tr>
              <th style={estiloCelda}>Nombre</th>
              <th style={estiloCelda}>Precio</th>
              <th style={estiloCelda}>Duración</th>
              <th style={estiloCelda}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paquetes.map((paquete) => (
              <tr key={paquete.id}>
                <td style={estiloCelda}>{paquete.nombre}</td>
                <td style={estiloCelda}>${paquete.precio}</td>
                <td style={estiloCelda}>{paquete.duracion_horas ? `${paquete.duracion_horas} h` : '—'}</td>
                <td style={estiloCelda}>
                  <button onClick={() => handleEditar(paquete)}>Editar</button>{' '}
                  <button onClick={() => handleEliminar(paquete.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

const estiloInput = { marginRight: '8px', marginBottom: '8px', padding: '6px' }
const estiloInputLargo = { width: '100%', marginBottom: '8px', padding: '6px', boxSizing: 'border-box' }
const estiloTabla = { borderCollapse: 'collapse', width: '100%' }
const estiloCelda = { border: '1px solid #ccc', padding: '8px', textAlign: 'left' }