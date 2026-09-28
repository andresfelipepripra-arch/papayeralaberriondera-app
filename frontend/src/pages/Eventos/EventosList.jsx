import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { eliminarEvento, getEventos } from '../../services/eventosService'
import { paquetesService } from '../../services/paquetesService'
import { formatearDia, formatearDuracion, formatearHora, formatearMesCorto, formatearPrecio } from '../../utils/formatters'
import { ESTADOS, ORDEN_ESTADOS } from '../../utils/estados'
import Panel from '../../components/ui/Panel'
import EstadoBadge from '../../components/ui/EstadoBadge'
import TarjetaEstadistica from '../../components/ui/TarjetaEstadistica'
import BotonPrimario from '../../components/ui/BotonPrimario'
import { IconoBasura, IconoBusqueda, IconoCalendario, IconoDinero, IconoLapiz, IconoMas, IconoOjo, IconoReloj } from '../../components/ui/Iconos'
import { colorAvatar, inicialesDe } from '../../utils/avatar'

const POR_PAGINA = 10

export default function EventosList() {
  const [eventos, setEventos] = useState([])
  const [paquetes, setPaquetes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [filtroCliente, setFiltroCliente] = useState('todos')
  const [busqueda, setBusqueda] = useState('')
  const [pagina, setPagina] = useState(1)
  const navigate = useNavigate()

  useEffect(() => {
    const cargar = async () => {
      try {
        const [eventosData, paquetesData] = await Promise.all([getEventos(), paquetesService.getTodos()])
        setEventos(eventosData)
        setPaquetes(paquetesData)
      } catch (err) {
        console.error(err)
        setError('Error al cargar los eventos')
      } finally {
        setLoading(false)
      }
    }

    cargar()
  }, [])

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar este evento?')) return
    try {
      await eliminarEvento(id)
      setEventos((prev) => prev.filter((e) => e.id !== id))
      toast.success('Evento eliminado')
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.error || 'Error al eliminar el evento')
    }
  }

  if (loading) return <p className="text-slate-400">Cargando eventos...</p>
  if (error) return <p className="text-red-400">{error}</p>

  const paquetesPorId = Object.fromEntries(paquetes.map((p) => [p.id, p]))
  const paqueteDe = (evento) => paquetesPorId[evento.paquete_id]

  const conteoPorEstado = Object.fromEntries(
    ORDEN_ESTADOS.map((estado) => [estado, eventos.filter((e) => (e.estado ?? 'pendiente') === estado).length]),
  )
  const clientes = [...new Set(eventos.map((e) => e.clientes?.nombre).filter(Boolean))].sort()

  const ahora = new Date()
  const eventosDelMes = eventos.filter((e) => {
    const fecha = new Date(e.fecha)
    return (
      (e.estado ?? 'pendiente') !== 'cancelado' &&
      fecha.getMonth() === ahora.getMonth() &&
      fecha.getFullYear() === ahora.getFullYear()
    )
  })
  const porConfirmar = eventos.filter((e) => new Date(e.fecha) >= ahora && (e.estado ?? 'pendiente') === 'pendiente')
  const ingresosEstimados = eventos
    .filter((e) => new Date(e.fecha) >= ahora && ['pendiente', 'confirmado'].includes(e.estado ?? 'pendiente'))
    .reduce((suma, e) => suma + (Number(paqueteDe(e)?.precio) || 0), 0)

  const textoBusqueda = busqueda.trim().toLowerCase()
  const eventosFiltrados = eventos.filter((evento) => {
    const coincideEstado = filtroEstado === 'todos' || (evento.estado ?? 'pendiente') === filtroEstado
    const coincideCliente = filtroCliente === 'todos' || evento.clientes?.nombre === filtroCliente
    const coincideBusqueda =
      !textoBusqueda ||
      evento.clientes?.nombre?.toLowerCase().includes(textoBusqueda) ||
      evento.ubicacion?.toLowerCase().includes(textoBusqueda)
    return coincideEstado && coincideCliente && coincideBusqueda
  })

  const totalPaginas = Math.max(1, Math.ceil(eventosFiltrados.length / POR_PAGINA))
  const paginaActual = Math.min(pagina, totalPaginas)
  const eventosPagina = eventosFiltrados.slice((paginaActual - 1) * POR_PAGINA, paginaActual * POR_PAGINA)

  const actualizarFiltro = (setter) => (valor) => {
    setter(valor)
    setPagina(1)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-white">Eventos</h1>
          <p className="mt-1 text-sm text-slate-400">Registro de toques y contrataciones</p>
        </div>
        <BotonPrimario onClick={() => navigate('/eventos/nuevo')} className="px-5">
          <IconoMas className="size-4" />
          Nuevo evento
        </BotonPrimario>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <TarjetaEstadistica titulo="Eventos este mes" valor={eventosDelMes.length} icono={IconoCalendario} />
        <TarjetaEstadistica
          titulo="Ingresos estimados"
          valor={formatearPrecio(ingresosEstimados)}
          detalle="Próximos confirmados + pendientes"
          icono={IconoDinero}
          destacada
        />
        <TarjetaEstadistica titulo="Por confirmar" valor={porConfirmar.length} icono={IconoReloj} />
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => actualizarFiltro(setFiltroEstado)('todos')}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
            filtroEstado === 'todos'
              ? 'bg-amber-500 text-slate-950'
              : 'bg-slate-900/60 text-slate-300 ring-1 ring-white/5 hover:bg-white/5'
          }`}
        >
          Todos · {eventos.length}
        </button>
        {ORDEN_ESTADOS.map((estado) => (
          <button
            key={estado}
            type="button"
            onClick={() => actualizarFiltro(setFiltroEstado)(estado)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              filtroEstado === estado
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-900/60 text-slate-300 ring-1 ring-white/5 hover:bg-white/5'
            }`}
          >
            <span className={`size-1.5 rounded-full ${ESTADOS[estado].punto}`} />
            {ESTADOS[estado].etiqueta} · {conteoPorEstado[estado]}
          </button>
        ))}
      </div>

      <Panel>
        <div className="mb-4 flex flex-wrap gap-3">
          <div className="relative min-w-[220px] flex-1">
            <IconoBusqueda className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por cliente o ubicación"
              value={busqueda}
              onChange={(e) => actualizarFiltro(setBusqueda)(e.target.value)}
              className="w-full rounded-lg border border-white/5 bg-slate-800/60 py-2 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-500/60 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            />
          </div>
          <select
            value={filtroCliente}
            onChange={(e) => actualizarFiltro(setFiltroCliente)(e.target.value)}
            className="rounded-lg border border-white/5 bg-slate-800/60 px-3 py-2 text-sm text-slate-100 focus:border-amber-500/60 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
          >
            <option value="todos">Todos los clientes</option>
            {clientes.map((nombre) => (
              <option key={nombre} value={nombre}>
                {nombre}
              </option>
            ))}
          </select>
        </div>

        {eventos.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">No hay eventos programados</p>
        ) : eventosFiltrados.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">No hay eventos que coincidan con el filtro</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-xs uppercase tracking-wide text-slate-400">
                    <th className="px-2 py-2 font-medium">Cliente</th>
                    <th className="px-2 py-2 font-medium">Fecha</th>
                    <th className="px-2 py-2 font-medium">Paquete</th>
                    <th className="px-2 py-2 font-medium">Precio</th>
                    <th className="px-2 py-2 font-medium">Estado</th>
                    <th className="px-2 py-2 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {eventosPagina.map((evento) => {
                    const paquete = paqueteDe(evento)
                    return (
                      <tr key={evento.id} className="transition hover:bg-white/5">
                        <td className="px-2 py-3">
                          <div className="flex items-center gap-3">
                            <span
                              className={`flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${colorAvatar(evento.clientes?.nombre)}`}
                            >
                              {inicialesDe(evento.clientes?.nombre)}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-white">{evento.clientes?.nombre ?? 'Sin cliente'}</p>
                              <p className="truncate text-xs text-slate-400">{evento.ubicacion ?? 'Sin ubicación'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-2 py-3 text-slate-300">
                          {formatearDia(evento.fecha)} {formatearMesCorto(evento.fecha)} · {formatearHora(evento.fecha)}
                        </td>
                        <td className="whitespace-nowrap px-2 py-3 text-slate-300">
                          {paquete?.nombre ?? evento.paquetes?.nombre ?? 'Sin paquete'}
                          {formatearDuracion(paquete?.duracion_horas) && (
                            <span className="text-xs text-slate-500"> · {formatearDuracion(paquete.duracion_horas)}</span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-2 py-3 font-medium text-white">
                          {formatearPrecio(paquete?.precio)}
                        </td>
                        <td className="whitespace-nowrap px-2 py-3">
                          <EstadoBadge estado={evento.estado ?? 'pendiente'} />
                        </td>
                        <td className="whitespace-nowrap px-2 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => navigate(`/eventos/${evento.id}`)}
                              aria-label="Ver detalle"
                              className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/5 hover:text-white"
                            >
                              <IconoOjo className="size-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => navigate(`/eventos/${evento.id}/editar`)}
                              aria-label="Editar evento"
                              className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/5 hover:text-white"
                            >
                              <IconoLapiz className="size-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEliminar(evento.id)}
                              aria-label="Eliminar evento"
                              className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
                            >
                              <IconoBasura className="size-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {totalPaginas > 1 && (
              <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                <span>
                  Mostrando {(paginaActual - 1) * POR_PAGINA + 1}–{Math.min(paginaActual * POR_PAGINA, eventosFiltrados.length)}{' '}
                  de {eventosFiltrados.length}
                </span>
                <div className="flex gap-1">
                  {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setPagina(n)}
                      className={`flex size-7 items-center justify-center rounded-lg font-semibold transition ${
                        n === paginaActual
                          ? 'bg-amber-500 text-slate-950'
                          : 'text-slate-300 ring-1 ring-white/5 hover:bg-white/5'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </Panel>
    </div>
  )
}
