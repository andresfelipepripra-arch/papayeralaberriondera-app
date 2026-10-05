import { Routes, Route } from 'react-router-dom'
import RutaProtegida from '../components/RutaProtegida'
import RutaAdmin from '../components/RutaAdmin'
import AppLayout from '../components/layout/AppLayout'
import Login from '../pages/Login'
import Dashboard from '../pages/Dashboard'
import EventosList from '../pages/Eventos/EventosList'
import Calendario from '../pages/Calendario'
import Paquetes from '../pages/Paquetes'
import Usuarios from '../pages/Usuarios'
import Configuracion from '../pages/Configuracion'
import Recordatorios from '../pages/Recordatorios'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<RutaProtegida><AppLayout /></RutaProtegida>}>
        <Route index element={<Dashboard />} />
        <Route path="eventos" element={<EventosList />} />
        <Route path="calendario" element={<Calendario />} />
        <Route path="paquetes" element={<Paquetes />} />
        <Route path="usuarios" element={<Usuarios />} />
        <Route path="configuracion" element={<RutaAdmin><Configuracion /></RutaAdmin>} />
        <Route path="recordatorios" element={<RutaAdmin><Recordatorios /></RutaAdmin>} />
      </Route>
    </Routes>
  )
}