export default function Toggle({ checked, onChange, label, descripcion }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        {label && <p className="text-sm font-semibold text-slate-100">{label}</p>}
        {descripcion && <p className="text-xs text-slate-400">{descripcion}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? 'bg-amber-500' : 'bg-slate-700'}`}
      >
        <span
          className={`absolute top-0.5 size-5 rounded-full bg-white transition ${checked ? 'left-5' : 'left-0.5'}`}
        />
      </button>
    </div>
  )
}
