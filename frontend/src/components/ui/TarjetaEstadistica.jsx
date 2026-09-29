export default function TarjetaEstadistica({ titulo, valor, detalle, icono: Icono, destacada = false }) {
  return (
    <div
      className={`rounded-xl border p-6 ${
        destacada
          ? 'border-transparent bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
          : 'border-white/5 bg-slate-900/60'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className={`text-xs font-medium ${destacada ? 'text-slate-900/80' : 'text-slate-400'}`}>{titulo}</p>
        {Icono && (
          <span
            className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
              destacada ? 'bg-slate-950/15 text-slate-950' : 'bg-amber-500/10 text-amber-400'
            }`}
          >
            <Icono className="size-4.5" />
          </span>
        )}
      </div>
      <p className={`mt-3 text-3xl font-bold tracking-tight ${destacada ? 'text-slate-950' : 'text-white'}`}>
        {valor}
      </p>
      {detalle && (
        <p className={`mt-1 text-xs ${destacada ? 'text-slate-900/75' : 'text-slate-500'}`}>{detalle}</p>
      )}
    </div>
  )
}
