import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { MODULOS_DISPONIBLES } from '../utils/modulos'

export default function RutaModulo({ modulo, children }) {
  const { rol, modulos } = useAuth()

  if (rol === null) return <p>Cargando permisos...</p>
  if (rol === 'admin' || modulos?.includes(modulo)) return children

  const permitido = MODULOS_DISPONIBLES.find((m) => modulos?.includes(m.clave))
  if (permitido) return <Navigate to={permitido.ruta} replace />

  return <p className="text-slate-400">No tienes ningún módulo habilitado. Pide a un administrador que te asigne uno.</p>
}
