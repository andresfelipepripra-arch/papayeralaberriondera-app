export default function Donut({ segmentos, centro }) {
  const total = segmentos.reduce((suma, segmento) => suma + segmento.valor, 0)
  let acumulado = 0

  return (
    <div className="relative size-36 shrink-0">
      <svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden="true">
        <circle cx="50" cy="50" r="40" fill="none" strokeWidth="12" className="stroke-white/5" />
        {total > 0 &&
          segmentos.map((segmento) => {
            const porcentaje = (segmento.valor / total) * 100
            const desplazamiento = -acumulado
            acumulado += porcentaje

            return (
              <circle
                key={segmento.id}
                cx="50"
                cy="50"
                r="40"
                fill="none"
                strokeWidth="12"
                pathLength="100"
                strokeDasharray={`${porcentaje} ${100 - porcentaje}`}
                strokeDashoffset={desplazamiento}
                className={segmento.trazo}
              />
            )
          })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{centro}</div>
    </div>
  )
}
