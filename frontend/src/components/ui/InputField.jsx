export default function InputField({ id, label, icono: Icono, derecha, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-slate-100">
        {label}
      </label>
      <div className="relative">
        {Icono && (
          <Icono className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
        )}
        <input
          id={id}
          className={`w-full rounded-lg border border-white/5 bg-slate-800/60 py-3.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-500/60 focus:outline-none focus:ring-2 focus:ring-amber-500/30 ${Icono ? 'pl-12' : 'pl-4'} ${derecha ? 'pr-12' : 'pr-4'}`}
          {...props}
        />
        {derecha && <div className="absolute right-4 top-1/2 -translate-y-1/2">{derecha}</div>}
      </div>
    </div>
  )
}
