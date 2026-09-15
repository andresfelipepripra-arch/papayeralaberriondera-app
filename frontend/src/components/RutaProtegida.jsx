import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RutaProtegida({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <p>Cargando sesión...</p>

  return user ? children : <Navigate to="/login" replace />
}