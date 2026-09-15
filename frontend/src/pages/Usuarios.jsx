import { useEffect, useState } from 'react'
import {
  crearUsuario,
  eliminarUsuario,
  getUsuarios,
} from '../services/usuariosService'

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [mensaje, setMensaje] = useState(null)

  const cargar = async () => {
    setLoading(true)
    try {
      const data = await getUsuarios()
      setUsuarios(data)
    } catch (err) {
      console.error(err)
      setError('Error al cargar los usuarios')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  const handleCrear = async (e) => {
    e.preventDefault()
    setError(null)
    setMensaje(null)
    try {
      await crearUsuario({ email, password })
      setMensaje(`Usuario creado: ${email}`)
      setEmail('')
      setPassword('')
      await cargar()
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.error || 'Error al crear el usuario')
    }
  }

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar este usuario?')) return
    setError(null)
    setMensaje(null)
    try {
      await eliminarUsuario(id)
      setUsuarios((prev) => prev.filter((u) => u.id !== id))
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.error || 'Error al eliminar el usuario')
    }
  }

  return (
    <div>
      <h2>Gestión de usuarios</h2>

      <form onSubmit={handleCrear} style={{ marginBottom: '16px' }}>
        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={estiloInput}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          style={estiloInput}
        />
        <button type="submit">Crear usuario</button>
      </form>

      {mensaje && <p style={{ color: 'green' }}>{mensaje}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {loading ? (
        <p>Cargando usuarios...</p>
      ) : (
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th style={estiloCelda}>Correo</th>
              <th style={estiloCelda}>Creado</th>
              <th style={estiloCelda}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario.id}>
                <td style={estiloCelda}>{usuario.email}</td>
                <td style={estiloCelda}>
                  {new Date(usuario.created_at).toLocaleString('es-CO')}
                </td>
                <td style={estiloCelda}>
                  <button onClick={() => handleEliminar(usuario.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

const estiloInput = { marginRight: '8px', padding: '6px' }
const estiloCelda = {
  border: '1px solid #ccc',
  padding: '8px',
  textAlign: 'left',
}