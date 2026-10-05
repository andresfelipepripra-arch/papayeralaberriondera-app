import { useEffect } from 'react'
import { IconoX } from './Iconos'

export default function Modal({ abierto, onCerrar, titulo, subtitulo, icono: Icono, ancho = 'max-w-xl', cabecera, children }) {
  useEffect(() => {
    if (!abierto) return

    const alPresionarTecla = (e) => {
      if (e.key === 'Escape') onCerrar()
    }
    document.addEventListener('keydown', alPresionarTecla)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', alPresionarTecla)
      document.body.style.overflow = ''
    }
  }, [abierto, onCerrar])

  if (!abierto) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onCerrar}
        className="absolute inset-0 cursor-default bg-slate-950/80 backdrop-blur-sm"
      />
      <div
        className={`relative flex max-h-[90vh] w-full ${ancho} flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl`}
      >
        {cabecera ?? (
          <div className="flex shrink-0 items-start justify-between gap-3 border-b border-white/5 px-5 py-4 sm:px-6 sm:py-5">
            <div className="flex items-center gap-3">
              {Icono && (
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                  <Icono className="size-5" />
                </span>
              )}
              <div>
                <h2 className="text-lg font-bold text-white">{titulo}</h2>
                {subtitulo && <p className="mt-0.5 text-xs text-slate-400">{subtitulo}</p>}
              </div>
            </div>
            <button
              type="button"
              onClick={onCerrar}
              aria-label="Cerrar"
              className="flex size-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/5 hover:text-white"
            >
              <IconoX className="size-5" />
            </button>
          </div>
        )}

        <div className="overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">{children}</div>
      </div>
    </div>
  )
}
