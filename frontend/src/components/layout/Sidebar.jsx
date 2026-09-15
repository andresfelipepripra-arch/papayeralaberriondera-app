import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/eventos', label: 'Eventos' },
  { to: '/calendario', label: 'Calendario' },
  { to: '/paquetes', label: 'Paquetes' },
  { to: '/clientes', label: 'Clientes' },
  { to: '/usuarios', label: 'Usuarios' },
]

export default function Sidebar() {
  return (
    <aside>
      <ul>
        {links.map((link) => (
          <li key={link.to}>
            <NavLink to={link.to}>{link.label}</NavLink>
          </li>
        ))}
      </ul>
    </aside>
  )
}