import { formatearDuracion, formatearFechaHora, formatearPrecio, itemsDeIncluye, precioEfectivo } from '../utils/formatters'
import Modal from '../components/ui/Modal'
import EstadoBadge from '../components/ui/EstadoBadge'
import { IconoCheck, IconoCubo } from '../components/ui/Iconos'

const MAX_EVENTOS_LISTADOS = 8

function Bloque({ titulo, children }) {
  return (
    <section className="rounded-lg border border-white/5 bg-slate-950/40 p-5">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{titulo}</h3>
      {children}
    </section>
  )
}

function Dato({ etiqueta, children }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-500">{etiqueta}</p>
      <div className="mt-1 text-sm text-slate-200">{children}</div>
    </div>
  )
}

export default function PaqueteDetalleModal({ paquete, eventos, onCerrar, onEditar }) {
  const eventosDelPaquete = paquete
    ? eventos
        .filter((e) => e.paquete_id === paquete.id)
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    : []
  const noCancelados = eventosDelPaquete.filter((e) => (e.estado ?? 'pendiente') !== 'cancelado')
  const facturado = noCancelados.reduce((suma, e) => suma + precioEfectivo(e, paquete), 0)
  const items = itemsDeIncluye(paquete?.incluye)

  return (
    <Modal
      abierto={Boolean(paquete)}
      onCerrar={onCerrar}
      titulo={paquete?.nombre ?? 'Paquete'}
      subtitulo={paquete ? formatearPrecio(paquete.precio) : undefined}
      icono={IconoCubo}
      ancho="max-w-3xl"
    >
      {paquete && (
        <div className="space-y-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <Bloque titulo="Precio y duración">
              <div className="grid grid-cols-2 gap-4">
                <Dato etiqueta="Precio base">
                  <span className="text-lg font-semibold text-amber-400">{formatearPrecio(paquete.precio)}</span>
                </Dato>
                <Dato etiqueta="Duración">{formatearDuracion(paquete.duracion_horas) ?? 'Sin definir'}</Dato>
                <div className="col-span-2">
                  <Dato etiqueta="Creado el">{formatearFechaHora(paquete.created_at)}</Dato>
                </div>
              </div>
            </Bloque>

            <Bloque titulo="Uso del paquete">
              <div className="grid grid-cols-2 gap-4">
                <Dato etiqueta="Eventos">
                  <span className="text-lg font-semibold text-white">{eventosDelPaquete.length}</span>
                </Dato>
                <Dato etiqueta="Facturado">
                  <span className="text-lg font-semibold text-white">{formatearPrecio(facturado)}</span>
                </Dato>
              </div>
              <p className="mt-3 text-xs text-slate-500">Facturado suma los eventos no cancelados, con su precio ajustado si lo tienen.</p>
            </Bloque>
          </div>

          {paquete.descripcion && (
            <Bloque titulo="Descripción">
              <p className="text-sm text-slate-300">{paquete.descripcion}</p>
            </Bloque>
          )}

          <Bloque titulo="Qué incluye">
            {items.length > 0 ? (
              <ul className="grid gap-1.5 sm:grid-cols-2">
                {items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <IconoCheck className="mt-0.5 size-4 shrink-0 text-emerald-400" />
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400">No hay ítems registrados</p>
            )}
          </Bloque>

          <Bloque titulo="Eventos con este paquete">
            {eventosDelPaquete.length === 0 ? (
              <p className="text-sm text-slate-400">Este paquete todavía no se ha usado en ningún evento</p>
            ) : (
              <>
                <ul className="divide-y divide-white/5">
                  {eventosDelPaquete.slice(0, MAX_EVENTOS_LISTADOS).map((evento) => (
                    <li key={evento.id} className="flex flex-wrap items-center justify-between gap-3 py-2.5">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">{evento.nombre_cliente ?? 'Sin cliente'}</p>
                        <p className="text-xs text-slate-400">{formatearFechaHora(evento.fecha)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-amber-400">{formatearPrecio(precioEfectivo(evento, paquete))}</span>
                        <EstadoBadge estado={evento.estado ?? 'pendiente'} />
                      </div>
                    </li>
                  ))}
                </ul>
                {eventosDelPaquete.length > MAX_EVENTOS_LISTADOS && (
                  <p className="mt-3 text-center text-xs text-slate-500">
                    y {eventosDelPaquete.length - MAX_EVENTOS_LISTADOS} más
                  </p>
                )}
              </>
            )}
          </Bloque>

          <div className="flex justify-end border-t border-white/5 pt-5">
            <button
              type="button"
              onClick={() => onEditar(paquete)}
              className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-400"
            >
              Editar paquete
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}
