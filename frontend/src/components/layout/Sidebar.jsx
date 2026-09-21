import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/eventos', label: 'Eventos' },
  { to: '/calendario', label: 'Calendario' },
  { to: '/paquetes', label: 'Paquetes' },
  { to: '/clientes', label: 'Clientes' },
  { to: '/usuarios', label: 'Usuarios', soloAdmin: true },
]

export default function Sidebar() {
  const { rol } = useAuth()

  return (
    <aside>
      <ul>
        {links
          .filter((link) => !link.soloAdmin || rol === 'admin')
          .map((link) => (
            <li key={link.to}>
              <NavLink to={link.to}>{link.label}</NavLink>
            </li>
          ))}
      </ul>
    </aside>
  )
}