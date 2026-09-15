import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/eventos', label: 'Eventos' },
  { to: '/calendario', label: 'Calendario' },
  { to: '/paquetes', label: 'Paquetes' },
  { to: '/clientes', label: 'Clientes' },
  { to: '/usuarios', label: 'Usuarios' },
]

export default function Navbar() {
  const { user, signOut } = useAuth()

  return (
    <nav>
      <NavLink to="/">Papayera - Administración</NavLink>
      <ul>
        {links.map((link) => (
          <li key={link.to}>
            <NavLink to={link.to}>{link.label}</NavLink>
          </li>
        ))}
      </ul>
      {user && (
        <div>
          <span>{user.email}</span>
          <button onClick={() => signOut()}>Cerrar sesión</button>
        </div>
      )}
    </nav>
  )
}