import { Routes, Route } from 'react-router-dom'
import RutaProtegida from '../components/RutaProtegida'
import RutaAdmin from '../components/RutaAdmin'
import RutaModulo from '../components/RutaModulo'
import RutaInicio from '../components/RutaInicio'
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
        <Route index element={<RutaInicio><Dashboard /></RutaInicio>} />
        <Route path="eventos" element={<RutaModulo modulo="eventos"><EventosList /></RutaModulo>} />
        <Route path="calendario" element={<RutaModulo modulo="calendario"><Calendario /></RutaModulo>} />
        <Route path="paquetes" element={<RutaModulo modulo="paquetes"><Paquetes /></RutaModulo>} />
        <Route path="usuarios" element={<Usuarios />} />
        <Route path="configuracion" element={<RutaAdmin><Configuracion /></RutaAdmin>} />
        <Route path="recordatorios" element={<RutaAdmin><Recordatorios /></RutaAdmin>} />
      </Route>
    </Routes>
  )
}