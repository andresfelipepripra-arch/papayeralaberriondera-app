import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RutaAdmin({ children }) {
  const { rol } = useAuth()

  if (rol === null) return <p>Cargando permisos...</p>

  return rol === 'admin' ? children : <Navigate to="/" replace />
}
