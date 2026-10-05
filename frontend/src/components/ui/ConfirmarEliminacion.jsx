import { useEffect, useState } from 'react'
import Modal from './Modal'
import { IconoBasura } from './Iconos'

export default function ConfirmarEliminacion({ abierto, titulo, nombre, consecuencia, onCerrar, onConfirmar, cargando = false }) {
  const [paso, setPaso] = useState(1)

  useEffect(() => {
    if (abierto) setPaso(1)
  }, [abierto])

  const estiloCancelar =
    'rounded-lg px-4 py-2 text-sm font-semibold text-slate-300 ring-1 ring-white/10 transition hover:bg-white/5'
  const estiloEliminar =
    'rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60'

  return (
    <Modal abierto={abierto} onCerrar={onCerrar} titulo={titulo} icono={IconoBasura} ancho="max-w-md">
      {paso === 1 ? (
        <div className="space-y-6">
          <div className="space-y-3 text-sm text-slate-300">
            <p>
              Vas a eliminar <span className="font-semibold text-white">{nombre}</span>.
            </p>
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 font-medium text-red-300">
              Esta acción es irreversible: no se podrá recuperar.
            </p>
            {consecuencia && <p className="text-slate-400">{consecuencia}</p>}
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onCerrar} className={estiloCancelar}>
              Cancelar
            </button>
            <button type="button" onClick={() => setPaso(2)} className={estiloEliminar}>
              Continuar
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-3 text-sm">
            <p className="font-semibold text-white">¿Confirmas que quieres eliminar {nombre} de forma definitiva?</p>
            <p className="text-red-300">Después de esto no hay forma de recuperarlo.</p>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setPaso(1)} disabled={cargando} className={estiloCancelar}>
              Volver
            </button>
            <button type="button" onClick={onConfirmar} disabled={cargando} className={estiloEliminar}>
              {cargando ? 'Eliminando...' : 'Sí, eliminar definitivamente'}
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}
