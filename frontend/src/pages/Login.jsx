import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await signIn(email, password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message || 'No se pudo iniciar sesión')
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 320, margin: '40px auto' }}>
      <h2>Iniciar sesión</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '12px' }}>
          <label htmlFor="email">Correo</label>
          <br />
          <input
            id="email"
            type="email"
            placeholder="tucorreo@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={estiloInput}
          />
        </div>
        <div style={{ marginBottom: '12px' }}>
          <label htmlFor="password">Contraseña</label>
          <br />
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={estiloInput}
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Iniciando sesión...' : 'Ingresar'}
        </button>
      </form>
    </div>
  )
}

const estiloInput = { width: '100%', padding: '8px', boxSizing: 'border-box' }