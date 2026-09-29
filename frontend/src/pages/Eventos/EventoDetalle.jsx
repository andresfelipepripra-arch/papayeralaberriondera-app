import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { eliminarEvento, getEventoPorId } from '../../services/eventosService'
import {
  formatearDuracion,
  formatearFechaHora,
  formatearPrecio,
  itemsDeIncluye,
  precioEfectivo,
} from '../../utils/formatters'
import { colorAvatar, inicialesDe } from '../../utils/avatar'
import Panel from '../../components/ui/Panel'
import EstadoBadge from '../../components/ui/EstadoBadge'
import EventoModal from './EventoModal'
import {
  IconoBasura,
  IconoCalendario,
  IconoCampana,
  IconoCheck,
  IconoChevron,
  IconoCorreo,
  IconoCubo,
  IconoLapiz,
  IconoNota,
  IconoTelefono,
  IconoUbicacion,
} from '../../components/ui/Iconos'

export default function EventoDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [evento, setEvento] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modalAbierto, setModalAbierto] = useState(false)

  const cargar = async () => {
    try {
      const data = await getEventoPorId(id)
      setEvento(data)
    } catch (err) {
      console.error(err)
      setError('Error al cargar el evento')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargar()
  }, [id])

  const alGuardar = () => {
    setModalAbierto(false)
    cargar()
  }

  const handleEliminar = async () => {
    if (!window.confirm('¿Eliminar este evento?')) return
    try {
      await eliminarEvento(id)
      toast.success('Evento eliminado')
      navigate('/eventos')
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.error || 'Error al eliminar el evento')
    }
  }

  if (loading) return <p className="text-slate-400">Cargando evento...</p>
  if (error) return <p className="text-red-400">{error}</p>
  if (!evento) return <p className="text-slate-400">No se encontró el evento</p>

  const cliente = evento.clientes
  const paquete = evento.paquetes
  const items = itemsDeIncluye(paquete?.incluye)

  return (
    <div className="space-y-6">
      <Link
        to="/eventos"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 transition hover:text-white"
      >
        <IconoChevron className="size-4 rotate-180" />
        Volver a eventos
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-serif text-3xl font-bold text-white">{cliente?.nombre ?? 'Sin cliente'}</h1>
            <EstadoBadge estado={evento.estado ?? 'pendiente'} />
          </div>
          <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-400">
            <span className="flex items-center gap-1.5">
              <IconoCalendario className="size-4" />
              {formatearFechaHora(evento.fecha)}
            </span>
            <span className="flex items-center gap-1.5">
              <IconoUbicacion className="size-4" />
              {evento.ubicacion ?? 'Sin ubicación'}
            </span>
            <span className={`flex items-center gap-1.5 ${evento.correo_recordatorio_enviado ? 'text-emerald-400' : ''}`}>
              <IconoCampana className="size-4" />
              {evento.correo_recordatorio_enviado ? 'Recordatorio enviado' : 'Sin recordatorio enviado aún'}
            </span>
          </p>
          <p className="mt-1 text-xs text-slate-500">Registrado el {formatearFechaHora(evento.created_at)}</p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setModalAbierto(true)}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-slate-200 ring-1 ring-white/10 transition hover:bg-white/5"
          >
            <IconoLapiz className="size-4" />
            Editar
          </button>
          <button
            type="button"
            onClick={handleEliminar}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-slate-400 ring-1 ring-white/10 transition hover:bg-red-500/10 hover:text-red-400"
          >
            <IconoBasura className="size-4" />
            Eliminar
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Panel titulo="Paquete contratado">
            {paquete ? (
              <>
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                      <IconoCubo className="size-5" />
                    </span>
                    <div>
                      <p className="font-semibold text-white">{paquete.nombre}</p>
                      {formatearDuracion(paquete.duracion_horas) && (
                        <p className="text-xs text-slate-400">{formatearDuracion(paquete.duracion_horas)}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-amber-400">{formatearPrecio(precioEfectivo(evento, paquete))}</span>
                    {evento.precio != null && Number(evento.precio) !== Number(paquete.precio) && (
                      <p className="text-xs text-slate-500">Ajustado · base {formatearPrecio(paquete.precio)}</p>
                    )}
                  </div>
                </div>

                {paquete.descripcion && (
                  <p className="mt-3 text-sm text-slate-400">{paquete.descripcion}</p>
                )}

                {items.length > 0 && (
                  <div className="mt-5 border-t border-white/5 pt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Incluye</p>
                    <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
                      {items.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                          <IconoCheck className="mt-0.5 size-4 shrink-0 text-emerald-400" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-slate-400">Este evento no tiene un paquete asignado</p>
            )}
          </Panel>

          <Panel titulo="Notas">
            {evento.notas ? (
              <p className="whitespace-pre-line text-sm text-slate-300">{evento.notas}</p>
            ) : (
              <p className="flex items-center gap-2 text-sm text-slate-400">
                <IconoNota className="size-4" />
                Sin notas para este evento
              </p>
            )}
          </Panel>
        </div>

        <Panel titulo="Cliente">
          {cliente ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span
                  className={`flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-bold ${colorAvatar(cliente.nombre)}`}
                >
                  {inicialesDe(cliente.nombre)}
                </span>
                <div>
                  <p className="font-semibold text-white">{cliente.nombre}</p>
                  {cliente.ciudad && (
                    <p className="flex items-center gap-1 text-xs text-slate-400">
                      <IconoUbicacion className="size-3.5" />
                      {cliente.ciudad}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2 border-t border-white/5 pt-4 text-sm">
                {cliente.correo ? (
                  <a
                    href={`mailto:${cliente.correo}`}
                    className="flex items-center gap-2 text-slate-300 transition hover:text-amber-400"
                  >
                    <IconoCorreo className="size-4 shrink-0 text-slate-500" />
                    {cliente.correo}
                  </a>
                ) : (
                  <p className="flex items-center gap-2 text-slate-500">
                    <IconoCorreo className="size-4 shrink-0" />
                    Sin correo
                  </p>
                )}

                {cliente.telefono ? (
                  <a
                    href={`tel:${cliente.telefono}`}
                    className="flex items-center gap-2 text-slate-300 transition hover:text-amber-400"
                  >
                    <IconoTelefono className="size-4 shrink-0 text-slate-500" />
                    {cliente.telefono}
                  </a>
                ) : (
                  <p className="flex items-center gap-2 text-slate-500">
                    <IconoTelefono className="size-4 shrink-0" />
                    Sin teléfono
                  </p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400">Sin cliente asignado</p>
          )}
        </Panel>
      </div>

      <EventoModal
        abierto={modalAbierto}
        eventoId={evento.id}
        onCerrar={() => setModalAbierto(false)}
        onGuardado={alGuardar}
      />
    </div>
  )
}
