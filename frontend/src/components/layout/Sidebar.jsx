import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  IconoAjustes,
  IconoCalendario,
  IconoCampana,
  IconoChevron,
  IconoCuadricula,
  IconoCubo,
  IconoEscudo,
  IconoLista,
  IconoSalir,
} from '../ui/Iconos'
import logo from '../../assets/logo-papayera.png'

const links = [
  { to: '/', label: 'Dashboard', icono: IconoCuadricula, soloAdmin: true },
  { to: '/calendario', label: 'Calendario', icono: IconoCalendario, modulo: 'calendario' },
  { to: '/eventos', label: 'Eventos', icono: IconoLista, modulo: 'eventos' },
  { to: '/paquetes', label: 'Paquetes', icono: IconoCubo, modulo: 'paquetes' },
  { to: '/usuarios', label: 'Usuarios', icono: IconoEscudo, soloAdmin: true },
  { to: '/recordatorios', label: 'Recordatorios', icono: IconoCampana, soloAdmin: true },
  { to: '/configuracion', label: 'Configuración', icono: IconoAjustes, soloAdmin: true },
]

export default function Sidebar({ nombre, abierto, onCerrar, colapsado, onAlternarColapsar }) {
  const { user, rol, modulos, signOut } = useAuth()
  const email = user?.email ?? ''

  return (
    <>
      {abierto && <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={onCerrar} />}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-white/5 bg-slate-900 transition-[transform,width] duration-200 lg:translate-x-0 ${
          abierto ? 'translate-x-0' : '-translate-x-full'
        } ${colapsado ? 'lg:w-20' : ''}`}
      >
        <button
          type="button"
          onClick={onAlternarColapsar}
          aria-label={colapsado ? 'Expandir menú' : 'Contraer menú'}
          className="absolute -right-3 top-8 z-10 hidden size-6 items-center justify-center rounded-full border border-white/10 bg-slate-800 text-slate-300 shadow transition hover:bg-slate-700 hover:text-white lg:flex"
        >
          <IconoChevron className={`size-3.5 transition-transform ${colapsado ? '' : 'rotate-180'}`} />
        </button>

        <div className={`flex shrink-0 items-center gap-3 border-b border-white/5 px-5 py-5 ${colapsado ? 'lg:justify-center lg:px-3' : ''}`}>
          <img src={logo} alt="" className="size-10 shrink-0 rounded-full object-cover" />
          <div className={`min-w-0 ${colapsado ? 'lg:hidden' : ''}`}>
            <p className="truncate text-sm font-bold text-white">{nombre}</p>
            <p className="text-xs text-slate-400">Panel de gestión</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden px-3 py-4">
          {links
            .filter((link) => {
              if (link.soloAdmin) return rol === 'admin'
              return rol === 'admin' || modulos?.includes(link.modulo)
            })
            .map(({ to, label, icono: Icono }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                onClick={onCerrar}
                title={colapsado ? label : undefined}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${colapsado ? 'lg:justify-center lg:px-0' : ''} ${
                    isActive
                      ? 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20'
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
                  }`
                }
              >
                <Icono className="size-5 shrink-0" />
                <span className={colapsado ? 'lg:hidden' : ''}>{label}</span>
              </NavLink>
            ))}
        </nav>

        <div className="shrink-0 border-t border-white/5 p-4">
          <div className={`flex items-center gap-3 ${colapsado ? 'lg:justify-center' : ''}`}>
            <div
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-slate-950"
              title={colapsado ? email : undefined}
            >
              {email.slice(0, 2).toUpperCase()}
            </div>
            <div className={`min-w-0 ${colapsado ? 'lg:hidden' : ''}`}>
              <p className="truncate text-sm font-semibold text-white">{rol === 'admin' ? 'Administrador' : 'Músico'}</p>
              <p className="truncate text-xs text-slate-400">{email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => signOut()}
            title={colapsado ? 'Cerrar sesión' : undefined}
            className={`mt-4 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-slate-100 ${
              colapsado ? 'lg:justify-center' : ''
            }`}
          >
            <IconoSalir className="size-5 shrink-0" />
            <span className={colapsado ? 'lg:hidden' : ''}>Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </>
  )
}
