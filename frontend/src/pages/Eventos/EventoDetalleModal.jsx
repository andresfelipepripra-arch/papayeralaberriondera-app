import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { eliminarEvento, getEventoPorId } from '../../services/eventosService'
import { formatearDuracion, formatearFechaHora, formatearPrecio, itemsDeIncluye, precioEfectivo } from '../../utils/formatters'
import { construirResumenEvento } from '../../utils/resumenEvento'
import { colorAvatar, inicialesDe } from '../../utils/avatar'
import Modal from '../../components/ui/Modal'
import ConfirmarEliminacion from '../../components/ui/ConfirmarEliminacion'
import EstadoBadge from '../../components/ui/EstadoBadge'
import {
  IconoBasura,
  IconoCopiar,
  IconoCalendario,
  IconoCampana,
  IconoCheck,
  IconoCubo,
  IconoLapiz,
  IconoNota,
  IconoTelefono,
  IconoUbicacion,
  IconoUsuarios,
} from '../../components/ui/Iconos'

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

function FilaTelefono({ numero, etiqueta }) {
  return (
    <a href={`tel:${numero}`} className="flex items-center gap-2 text-slate-300 transition hover:text-amber-400">
      <IconoTelefono className="size-4 shrink-0 text-slate-500" />
      <span>{numero}</span>
      {etiqueta && <span className="text-xs text-slate-500">({etiqueta})</span>}
    </a>
  )
}

export default function EventoDetalleModal({ eventoId, onCerrar, onEditar, onEliminado }) {
  const { rol } = useAuth()
  const esAdmin = rol === 'admin'
  const [evento, setEvento] = useState(null)
  const [pidiendoEliminar, setPidiendoEliminar] = useState(false)
  const [eliminando, setEliminando] = useState(false)

  useEffect(() => {
    setEvento(null)
    setPidiendoEliminar(false)
    if (!eventoId) return
    let cancelado = false

    getEventoPorId(eventoId)
      .then((data) => {
        if (!cancelado) setEvento(data)
      })
      .catch((err) => {
        console.error(err)
        toast.error('Error al cargar el evento')
        onCerrar()
      })

    return () => {
      cancelado = true
    }
  }, [eventoId])

  const copiarResumen = async () => {
    try {
      await navigator.clipboard.writeText(construirResumenEvento(evento, evento?.paquetes))
      toast.success('Resumen copiado')
    } catch (err) {
      console.error(err)
      toast.error('No se pudo copiar el resumen')
    }
  }

  const confirmarEliminar = async () => {
    setEliminando(true)
    try {
      await eliminarEvento(eventoId)
      toast.success('Evento eliminado')
      onEliminado()
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.error || 'Error al eliminar el evento')
    } finally {
      setEliminando(false)
      setPidiendoEliminar(false)
    }
  }

  const cliente = evento ? { nombre: evento.nombre_cliente } : undefined
  const paquete = evento?.paquetes
  const items = itemsDeIncluye(paquete?.incluye)
  const telefono = evento?.telefono_contacto
  const total = evento ? precioEfectivo(evento, paquete) : 0
  const abonado = Number(evento?.abonado) || 0
  const falta = total - abonado
  const ajustado = evento?.precio != null && paquete && Number(evento.precio) !== Number(paquete.precio)

  return (
    <>
    <Modal
      abierto={Boolean(eventoId) && !pidiendoEliminar}
      onCerrar={onCerrar}
      titulo={cliente?.nombre ?? 'Evento'}
      subtitulo={evento ? formatearFechaHora(evento.fecha) : undefined}
      icono={IconoCalendario}
      ancho="max-w-3xl"
    >
      {!evento ? (
        <p className="text-slate-400">Cargando evento...</p>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <EstadoBadge estado={evento.estado ?? 'pendiente'} />
            {evento.tipo_evento && (
              <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold text-slate-300 ring-1 ring-white/10">
                {evento.tipo_evento}
              </span>
            )}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Bloque titulo="Lugar y fecha">
              <div className="space-y-4">
                <Dato etiqueta="Fecha y hora">{formatearFechaHora(evento.fecha)}</Dato>
                <Dato etiqueta="Ciudad y ubicación">
                  <span className="flex items-start gap-2">
                    <IconoUbicacion className="mt-0.5 size-4 shrink-0 text-slate-500" />
                    {[evento.ciudad, evento.barrio, evento.ubicacion].filter(Boolean).join(' · ') || 'Sin ubicación'}
                  </span>
                </Dato>
                <Dato etiqueta="Recordatorio">
                  <span
                    className={`flex items-center gap-2 ${evento.correo_recordatorio_enviado ? 'text-emerald-400' : 'text-slate-400'}`}
                  >
                    <IconoCampana className="size-4 shrink-0" />
                    {evento.correo_recordatorio_enviado ? 'Enviado' : 'Aún no enviado'}
                  </span>
                </Dato>
                <Dato etiqueta="Registrado el">{formatearFechaHora(evento.created_at)}</Dato>
              </div>
            </Bloque>

            <Bloque titulo="Cliente y contacto">
              {cliente ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${colorAvatar(cliente.nombre)}`}
                    >
                      {inicialesDe(cliente.nombre)}
                    </span>
                    <div>
                      <p className="font-semibold text-white">{cliente.nombre}</p>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-white/5 pt-3 text-sm">
                    {evento.nombre_contacto && (
                      <p className="flex items-center gap-2 text-slate-300">
                        <IconoUsuarios className="size-4 shrink-0 text-slate-500" />
                        <span>
                          <span className="text-xs text-slate-500">Contacto: </span>
                          {evento.nombre_contacto}
                        </span>
                      </p>
                    )}

                    {telefono ? (
                      <FilaTelefono numero={telefono} />
                    ) : (
                      <p className="flex items-center gap-2 text-slate-500">
                        <IconoTelefono className="size-4 shrink-0" />
                        Sin teléfono
                      </p>
                    )}

                    {evento.telefono_alterno && (
                      <FilaTelefono numero={evento.telefono_alterno} etiqueta={evento.nombre_telefono_alterno} />
                    )}

                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-400">Sin cliente asignado</p>
              )}
            </Bloque>
          </div>

          <Bloque titulo="Paquete">
            {paquete ? (
              <>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                      <IconoCubo className="size-5" />
                    </span>
                    <div>
                      <p className="font-semibold text-white">{paquete.nombre}</p>
                      {paquete.descripcion && <p className="text-xs text-slate-400">{paquete.descripcion}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                    <Dato etiqueta="Precio base">{formatearPrecio(paquete.precio)}</Dato>
                    <Dato etiqueta="Duración">{formatearDuracion(paquete.duracion_horas) ?? 'Sin definir'}</Dato>
                  </div>
                </div>

                {items.length > 0 && (
                  <ul className="mt-4 grid gap-1.5 border-t border-white/5 pt-4 sm:grid-cols-2">
                    {items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                        <IconoCheck className="mt-0.5 size-4 shrink-0 text-emerald-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <p className="text-sm text-slate-400">Este evento no tiene un paquete asignado</p>
            )}
          </Bloque>

          <Bloque titulo="Cobro">
            <div className="grid gap-4 text-sm sm:grid-cols-3">
              <Dato etiqueta="Total a cobrar">
                <span className="text-lg font-semibold text-white">{formatearPrecio(total)}</span>
                {ajustado && <span className="block text-xs text-slate-500">Ajustado · base {formatearPrecio(paquete.precio)}</span>}
              </Dato>
              <Dato etiqueta="Abonado">
                <span className="text-lg font-semibold text-white">{formatearPrecio(abonado)}</span>
              </Dato>
              <Dato etiqueta={falta > 0 ? 'Falta por cobrar' : 'Estado del pago'}>
                <span className={`text-lg font-semibold ${falta > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {falta > 0 ? formatearPrecio(falta) : 'Pagado completo'}
                </span>
              </Dato>
            </div>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${total > 0 ? Math.min(100, (abonado / total) * 100) : 0}%` }}
              />
            </div>
          </Bloque>

          <Bloque titulo="Notas">
            {evento.notas ? (
              <p className="whitespace-pre-line text-sm text-slate-300">{evento.notas}</p>
            ) : (
              <p className="flex items-center gap-2 text-sm text-slate-400">
                <IconoNota className="size-4" />
                Sin notas para este evento
              </p>
            )}
          </Bloque>

          <div className="flex flex-wrap justify-end gap-3 border-t border-white/5 pt-5">
            <button
              type="button"
              onClick={copiarResumen}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-slate-400 ring-1 ring-white/10 transition hover:bg-white/5 hover:text-amber-400"
            >
              <IconoCopiar className="size-4" />
              Copiar resumen
            </button>
            {esAdmin && (
              <button
                type="button"
                onClick={() => setPidiendoEliminar(true)}
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-slate-400 ring-1 ring-white/10 transition hover:bg-red-500/10 hover:text-red-400"
              >
                <IconoBasura className="size-4" />
                Eliminar
              </button>
            )}
            {esAdmin && onEditar && (
              <button
                type="button"
                onClick={() => onEditar(evento.id)}
                className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-400"
              >
                <IconoLapiz className="size-4" />
                Editar evento
              </button>
            )}
          </div>
        </div>
      )}
    </Modal>

    <ConfirmarEliminacion
      abierto={pidiendoEliminar}
      titulo="Eliminar evento"
      nombre={evento ? `el evento de ${cliente?.nombre ?? 'sin cliente'} del ${formatearFechaHora(evento.fecha)}` : 'este evento'}
      onCerrar={() => setPidiendoEliminar(false)}
      onConfirmar={confirmarEliminar}
      cargando={eliminando}
    />
    </>
  )
}
