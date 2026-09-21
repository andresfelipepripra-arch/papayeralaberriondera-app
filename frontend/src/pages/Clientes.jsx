import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { clientesService } from '../services/clientesService'

const vacio = { nombre: '', telefono: '', correo: '' }

export default function Clientes() {
  const [clientes, setClientes] = useState([])
  const [form, setForm] = useState(vacio)
  const [editandoId, setEditandoId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')

  const cargar = async () => {
    setLoading(true)
    try {
      const data = await clientesService.getTodos()
      setClientes(data)
    } catch (err) {
      console.error(err)
      toast.error('Error al cargar los clientes')
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
    try {
      const payload = {
        nombre: form.nombre,
        telefono: form.telefono || null,
        correo: form.correo || null,
      }
      if (editandoId) {
        await clientesService.actualizar(editandoId, payload)
        toast.success('Cliente actualizado')
      } else {
        await clientesService.crear(payload)
        toast.success('Cliente creado')
      }
      setForm(vacio)
      setEditandoId(null)
      await cargar()
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.error || 'Error al guardar el cliente')
    }
  }

  const handleEditar = (cliente) => {
    setEditandoId(cliente.id)
    setForm({
      nombre: cliente.nombre,
      telefono: cliente.telefono ?? '',
      correo: cliente.correo ?? '',
    })
  }

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar este cliente?')) return
    try {
      await clientesService.eliminar(id)
      setClientes((prev) => prev.filter((c) => c.id !== id))
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.error || 'Error al eliminar el cliente')
    }
  }

  const textoBusqueda = busqueda.trim().toLowerCase()
  const clientesFiltrados = clientes.filter((cliente) =>
    cliente.nombre.toLowerCase().includes(textoBusqueda)
  )

  return (
    <div>
      <h2>Clientes</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: '16px' }}>
        <h3>{editandoId ? 'Editar cliente' : 'Crear cliente'}</h3>
        <div>
          <input name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} required style={estiloInput} />
          <input name="telefono" placeholder="Teléfono" value={form.telefono} onChange={handleChange} style={estiloInput} />
          <input name="correo" type="email" placeholder="Correo" value={form.correo} onChange={handleChange} style={estiloInput} />
        </div>
        {editandoId && (
          <button type="button" onClick={() => { setEditandoId(null); setForm(vacio) }}>Cancelar</button>
        )}
        <button type="submit">{editandoId ? 'Actualizar' : 'Crear'}</button>
      </form>

      <input
        type="text"
        placeholder="Buscar por nombre"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        style={{ ...estiloInput, width: '100%', boxSizing: 'border-box', marginBottom: '16px' }}
      />

      {loading ? (
        <p>Cargando clientes...</p>
      ) : clientes.length === 0 ? (
        <p>No hay clientes registrados</p>
      ) : clientesFiltrados.length === 0 ? (
        <p>No hay clientes que coincidan con la búsqueda</p>
      ) : (
        <table style={estiloTabla}>
          <thead>
            <tr>
              <th style={estiloCelda}>Nombre</th>
              <th style={estiloCelda}>Teléfono</th>
              <th style={estiloCelda}>Correo</th>
              <th style={estiloCelda}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientesFiltrados.map((cliente) => (
              <tr key={cliente.id}>
                <td style={estiloCelda}>{cliente.nombre}</td>
                <td style={estiloCelda}>{cliente.telefono ?? '—'}</td>
                <td style={estiloCelda}>{cliente.correo ?? '—'}</td>
                <td style={estiloCelda}>
                  <button onClick={() => handleEditar(cliente)}>Editar</button>{' '}
                  <button onClick={() => handleEliminar(cliente.id)}>Eliminar</button>
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
const estiloTabla = { borderCollapse: 'collapse', width: '100%' }
const estiloCelda = { border: '1px solid #ccc', padding: '8px', textAlign: 'left' }