import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  IconoAjustes,
  IconoCalendario,
  IconoCampana,
  IconoCuadricula,
  IconoCubo,
  IconoEscudo,
  IconoLista,
  IconoSalir,
  IconoUsuarios,
} from '../ui/Iconos'
import logo from '../../assets/logo-papayera.png'

const links = [
  { to: '/', label: 'Dashboard', icono: IconoCuadricula },
  { to: '/calendario', label: 'Calendario', icono: IconoCalendario },
  { to: '/eventos', label: 'Eventos', icono: IconoLista },
  { to: '/paquetes', label: 'Paquetes', icono: IconoCubo },
  { to: '/clientes', label: 'Clientes', icono: IconoUsuarios },
  { to: '/usuarios', label: 'Usuarios', icono: IconoEscudo, soloAdmin: true },
  { to: '/recordatorios', label: 'Recordatorios', icono: IconoCampana, soloAdmin: true },
  { to: '/configuracion', label: 'Configuración', icono: IconoAjustes, soloAdmin: true },
]

export default function Sidebar({ nombre, abierto, onCerrar }) {
  const { user, rol, signOut } = useAuth()
  const email = user?.email ?? ''

  return (
    <>
      {abierto && <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={onCerrar} />}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-white/5 bg-slate-900 transition-transform lg:translate-x-0 ${
          abierto ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-3 border-b border-white/5 px-5 py-5">
          <img src={logo} alt="" className="size-10 shrink-0 rounded-full object-cover" />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-white">{nombre}</p>
            <p className="text-xs text-slate-400">Panel de gestión</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {links
            .filter((link) => !link.soloAdmin || rol === 'admin')
            .map(({ to, label, icono: Icono }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                onClick={onCerrar}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20'
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
                  }`
                }
              >
                <Icono className="size-5 shrink-0" />
                {label}
              </NavLink>
            ))}
        </nav>

        <div className="border-t border-white/5 p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-slate-950">
              {email.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {rol === 'admin' ? 'Administrador' : 'Operador'}
              </p>
              <p className="truncate text-xs text-slate-400">{email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => signOut()}
            className="mt-4 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-slate-100"
          >
            <IconoSalir className="size-5" />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  )
}
