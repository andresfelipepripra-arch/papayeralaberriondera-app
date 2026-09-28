export const ORDEN_ESTADOS = ['pendiente', 'confirmado', 'realizado', 'cancelado']

export const ESTADOS = {
  pendiente: {
    etiqueta: 'Pendiente',
    badge: 'bg-amber-500/15 text-amber-400',
    punto: 'bg-amber-400',
    barra: 'bg-amber-400',
  },
  confirmado: {
    etiqueta: 'Confirmado',
    badge: 'bg-blue-500/15 text-blue-400',
    punto: 'bg-blue-400',
    barra: 'bg-blue-500',
  },
  realizado: {
    etiqueta: 'Realizado',
    badge: 'bg-emerald-500/15 text-emerald-400',
    punto: 'bg-emerald-400',
    barra: 'bg-emerald-500',
  },
  cancelado: {
    etiqueta: 'Cancelado',
    badge: 'bg-slate-500/15 text-slate-400 line-through',
    punto: 'bg-slate-500',
    barra: 'bg-slate-500',
  },
}
