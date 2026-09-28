import { ESTADOS } from '../../utils/estados'

const DESCONOCIDO = { badge: 'bg-slate-500/15 text-slate-300', punto: 'bg-slate-400' }

export default function EstadoBadge({ estado = 'pendiente' }) {
  const config = ESTADOS[estado] ?? { ...DESCONOCIDO, etiqueta: estado }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${config.badge}`}
    >
      <span className={`size-1.5 rounded-full ${config.punto}`} />
      {config.etiqueta}
    </span>
  )
}
