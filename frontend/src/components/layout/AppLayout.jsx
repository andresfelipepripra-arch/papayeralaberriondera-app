import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { IconoMenu } from '../ui/Iconos'
import { useConfiguracion } from '../../context/ConfiguracionContext'

const CLAVE_COLAPSADO = 'papayera_sidebar_colapsado'

function leerColapsado() {
  try {
    return localStorage.getItem(CLAVE_COLAPSADO) === '1'
  } catch {
    return false
  }
}

export default function AppLayout() {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [colapsado, setColapsado] = useState(leerColapsado)
  const { configuracion } = useConfiguracion()
  const nombre = configuracion?.nombre_negocio ?? 'Papayera'

  const alternarColapsar = () => {
    setColapsado((prev) => {
      const siguiente = !prev
      try {
        localStorage.setItem(CLAVE_COLAPSADO, siguiente ? '1' : '0')
      } catch {
        // si el navegador bloquea localStorage, simplemente no se recuerda la preferencia
      }
      return siguiente
    })
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 scheme-dark">
      <Sidebar
        nombre={nombre}
        abierto={menuAbierto}
        onCerrar={() => setMenuAbierto(false)}
        colapsado={colapsado}
        onAlternarColapsar={alternarColapsar}
      />

      <div className={`transition-[padding] duration-200 ${colapsado ? 'lg:pl-20' : 'lg:pl-64'}`}>
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-white/5 bg-slate-950/90 px-4 py-3 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setMenuAbierto(true)}
            aria-label="Abrir menú"
            className="text-slate-300 transition hover:text-white"
          >
            <IconoMenu className="size-6" />
          </button>
          <span className="truncate text-sm font-semibold text-white">{nombre}</span>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
