export default function Panel({ titulo, subtitulo, accion, className = '', children }) {
  return (
    <section className={`rounded-xl border border-white/5 bg-slate-900/60 p-6 ${className}`}>
      {(titulo || accion) && (
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            {titulo && <h2 className="text-base font-semibold text-white">{titulo}</h2>}
            {subtitulo && <p className="mt-0.5 text-xs text-slate-400">{subtitulo}</p>}
          </div>
          {accion}
        </div>
      )}
      {children}
    </section>
  )
}
