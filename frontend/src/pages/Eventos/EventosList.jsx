import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { actualizarEvento, eliminarEvento, getEventos } from '../../services/eventosService'
import { paquetesService } from '../../services/paquetesService'
import {
  formatearDia,
  formatearDuracion,
  formatearHora,
  formatearMesCorto,
  formatearPrecio,
  precioEfectivo,
} from '../../utils/formatters'
import { ESTADOS, ORDEN_ESTADOS } from '../../utils/estados'
import Panel from '../../components/ui/Panel'
import TarjetaEstadistica from '../../components/ui/TarjetaEstadistica'
import BotonPrimario from '../../components/ui/BotonPrimario'
import { IconoBasura, IconoBusqueda, IconoCalendario, IconoChevron, IconoCopiar, IconoDinero, IconoLapiz, IconoLista, IconoMas, IconoOjo, IconoReloj } from '../../components/ui/Iconos'
import { colorAvatar, inicialesDe } from '../../utils/avatar'
import { construirResumenEvento } from '../../utils/resumenEvento'
import { useConfiguracion } from '../../context/ConfiguracionContext'
import EventoModal from './EventoModal'
import EventoDetalleModal from './EventoDetalleModal'
import ConfirmarEliminacion from '../../components/ui/ConfirmarEliminacion'

const POR_PAGINA = 8
const ALTURA_MENU_ESTADOS = 150
const ANCHO_MENU_ESTADOS = 160

export default function EventosList() {
  const [eventos, setEventos] = useState([])
  const [paquetes, setPaquetes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [filtroCliente, setFiltroCliente] = useState('todos')
  const [busqueda, setBusqueda] = useState('')
  const [pagina, setPagina] = useState(1)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [editandoId, setEditandoId] = useState(null)
  const [estadoAbierto, setEstadoAbierto] = useState(null)
  const [verDetalleId, setVerDetalleId] = useState(null)
  const [aEliminar, setAEliminar] = useState(null)
  const [eliminando, setEliminando] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const { configuracion } = useConfiguracion() ?? {}
  const ganancia = Number(configuracion?.ganancia_por_evento ?? 70000)

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

  useEffect(() => {
    cargar()
  }, [])

  useEffect(() => {
    const eventoId = searchParams.get('evento')
    if (!eventoId) return
    setVerDetalleId(eventoId)
    setSearchParams({}, { replace: true })
  }, [searchParams, setSearchParams])

  useEffect(() => {
    if (!estadoAbierto) return
    const cerrar = () => setEstadoAbierto(null)
    window.addEventListener('scroll', cerrar, true)
    window.addEventListener('resize', cerrar)
    return () => {
      window.removeEventListener('scroll', cerrar, true)
      window.removeEventListener('resize', cerrar)
    }
  }, [estadoAbierto])

  const abrirEstados = (e, evento) => {
    if (estadoAbierto?.id === evento.id) return setEstadoAbierto(null)
    const rect = e.currentTarget.getBoundingClientRect()
    const abreArriba = rect.bottom + ALTURA_MENU_ESTADOS > window.innerHeight
    setEstadoAbierto({
      id: evento.id,
      left: Math.min(rect.left, window.innerWidth - ANCHO_MENU_ESTADOS - 8),
      top: abreArriba ? undefined : rect.bottom + 4,
      bottom: abreArriba ? window.innerHeight - rect.top + 4 : undefined,
    })
  }

  const abrirCreacion = () => {
    setEditandoId(null)
    setModalAbierto(true)
  }

  const abrirEdicion = (id) => {
    setEditandoId(id)
    setModalAbierto(true)
  }

  const alGuardar = () => {
    setModalAbierto(false)
    setEditandoId(null)
    cargar()
  }

  const handleCambiarEstado = async (evento, nuevoEstado) => {
    setEstadoAbierto(null)
    if (nuevoEstado === (evento.estado ?? 'pendiente')) return
    try {
      await actualizarEvento(evento.id, { estado: nuevoEstado })
      setEventos((prev) => prev.map((e) => (e.id === evento.id ? { ...e, estado: nuevoEstado } : e)))
      toast.success('Estado actualizado')
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.error || 'Error al cambiar el estado')
    }
  }

  const copiarResumen = async (evento, paquete) => {
    try {
      await navigator.clipboard.writeText(construirResumenEvento(evento, paquete))
      toast.success('Resumen copiado')
    } catch (err) {
      console.error(err)
      toast.error('No se pudo copiar el resumen')
    }
  }

  const confirmarEliminar = async () => {
    const { id } = aEliminar
    setEliminando(true)
    try {
      await eliminarEvento(id)
      setEventos((prev) => prev.filter((e) => e.id !== id))
      toast.success('Evento eliminado')
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.error || 'Error al eliminar el evento')
    } finally {
      setEliminando(false)
      setAEliminar(null)
    }
  }

  if (loading) return <p className="text-slate-400">Cargando eventos...</p>
  if (error) return <p className="text-red-400">{error}</p>

  const paquetesPorId = Object.fromEntries(paquetes.map((p) => [p.id, p]))
  const paqueteDe = (evento) => paquetesPorId[evento.paquete_id]

  const conteoPorEstado = Object.fromEntries(
    ORDEN_ESTADOS.map((estado) => [estado, eventos.filter((e) => (e.estado ?? 'pendiente') === estado).length]),
  )
  const clientes = [...new Set(eventos.map((e) => e.nombre_cliente).filter(Boolean))].sort()

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
  const delMes = eventos.filter((e) => {
    const fecha = new Date(e.fecha)
    return fecha.getMonth() === ahora.getMonth() && fecha.getFullYear() === ahora.getFullYear()
  })
  const realizadosMes = delMes.filter((e) => e.estado === 'realizado')
  const noCanceladosMes = delMes.filter((e) => (e.estado ?? 'pendiente') !== 'cancelado')
  const gananciaMes = realizadosMes.length * ganancia
  const valorMes = noCanceladosMes.reduce((suma, e) => suma + precioEfectivo(e, paqueteDe(e)), 0)
  const cobradoMes = noCanceladosMes.reduce((suma, e) => suma + (Number(e.abonado) || 0), 0)
  const faltaMes = noCanceladosMes.reduce(
    (suma, e) => suma + Math.max(precioEfectivo(e, paqueteDe(e)) - (Number(e.abonado) || 0), 0),
    0,
  )

  const textoBusqueda = busqueda.trim().toLowerCase()
  const eventosFiltrados = eventos.filter((evento) => {
    const coincideEstado = filtroEstado === 'todos' || (evento.estado ?? 'pendiente') === filtroEstado
    const coincideCliente = filtroCliente === 'todos' || evento.nombre_cliente === filtroCliente
    const coincideBusqueda =
      !textoBusqueda ||
      evento.nombre_cliente?.toLowerCase().includes(textoBusqueda) ||
      evento.ubicacion?.toLowerCase().includes(textoBusqueda)
    return coincideEstado && coincideCliente && coincideBusqueda
  })

  const totalPaginas = Math.max(1, Math.ceil(eventosFiltrados.length / POR_PAGINA))
  const paginaActual = Math.min(pagina, totalPaginas)
  const eventosPagina = eventosFiltrados.slice((paginaActual - 1) * POR_PAGINA, paginaActual * POR_PAGINA)

  const renderEstado = (evento) => {
    const config = ESTADOS[evento.estado ?? 'pendiente']
    return (
      <button
        type="button"
        onClick={(e) => abrirEstados(e, evento)}
        className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold transition hover:brightness-110 ${config.badge}`}
      >
        <span className={`size-1.5 rounded-full ${config.punto}`} />
        {config.etiqueta}
        <IconoChevron className="size-3 rotate-90" />
      </button>
    )
  }

  const renderAcciones = (evento, paquete) => (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => copiarResumen(evento, paquete)}
        aria-label="Copiar resumen"
        title="Copiar resumen"
        className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/5 hover:text-amber-400"
      >
        <IconoCopiar className="size-4" />
      </button>
      <button
        type="button"
        onClick={() => setVerDetalleId(evento.id)}
        aria-label="Ver detalle"
        className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/5 hover:text-white"
      >
        <IconoOjo className="size-4" />
      </button>
      <button
        type="button"
        onClick={() => abrirEdicion(evento.id)}
        aria-label="Editar evento"
        className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/5 hover:text-white"
      >
        <IconoLapiz className="size-4" />
      </button>
      <button
        type="button"
        onClick={() => setAEliminar(evento)}
        aria-label="Eliminar evento"
        className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
      >
        <IconoBasura className="size-4" />
      </button>
    </div>
  )

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
        <BotonPrimario onClick={abrirCreacion}>
          <IconoMas className="size-4" />
          Nuevo evento
        </BotonPrimario>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <TarjetaEstadistica
          titulo="Ganancia papayera · este mes"
          valor={formatearPrecio(gananciaMes)}
          detalle={`${realizadosMes.length} ${realizadosMes.length === 1 ? 'realizado' : 'realizados'} × ${formatearPrecio(ganancia)}`}
          icono={IconoDinero}
          destacada
        />
        <TarjetaEstadistica
          titulo="Ingresos generales · este mes"
          valor={formatearPrecio(valorMes)}
          detalle={`Falta por cobrar ${formatearPrecio(faltaMes)}`}
          icono={IconoLista}
          progreso={valorMes > 0 ? (cobradoMes / valorMes) * 100 : 0}
        />
        <TarjetaEstadistica titulo="Eventos este mes" valor={eventosDelMes.length} icono={IconoCalendario} />
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
            <div className="space-y-3 md:hidden">
              {eventosPagina.map((evento) => {
                const paquete = paqueteDe(evento)
                return (
                  <article key={evento.id} className="space-y-3 rounded-lg border border-white/5 bg-slate-950/40 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          className={`flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${colorAvatar(evento.nombre_cliente)}`}
                        >
                          {inicialesDe(evento.nombre_cliente)}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-white">{evento.nombre_cliente ?? 'Sin cliente'}</p>
                          <p className="truncate text-xs text-slate-400">{evento.ubicacion ?? 'Sin ubicación'}</p>
                        </div>
                      </div>
                      {renderEstado(evento)}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                      <span className="text-slate-300">
                        {formatearDia(evento.fecha)} {formatearMesCorto(evento.fecha)} · {formatearHora(evento.fecha)}
                      </span>
                      <span className="font-semibold text-white">{formatearPrecio(precioEfectivo(evento, paquete))}</span>
                    </div>

                    <div className="flex items-center justify-between gap-2 border-t border-white/5 pt-3">
                      <span className="min-w-0 truncate text-xs text-slate-400">
                        {paquete?.nombre ?? evento.paquetes?.nombre ?? 'Sin paquete'}
                      </span>
                      {renderAcciones(evento, paquete)}
                    </div>
                  </article>
                )
              })}
            </div>

            <div className="hidden overflow-x-auto md:block">
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
                              className={`flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${colorAvatar(evento.nombre_cliente)}`}
                            >
                              {inicialesDe(evento.nombre_cliente)}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-white">{evento.nombre_cliente ?? 'Sin cliente'}</p>
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
                          {formatearPrecio(precioEfectivo(evento, paquete))}
                        </td>
                        <td className="px-2 py-3">{renderEstado(evento)}</td>
                        <td className="px-2 py-3">{renderAcciones(evento, paquete)}</td>
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

      <EventoModal
        abierto={modalAbierto}
        eventoId={editandoId}
        onCerrar={() => {
          setModalAbierto(false)
          setEditandoId(null)
        }}
        onGuardado={alGuardar}
      />

      <EventoDetalleModal
        eventoId={verDetalleId}
        onCerrar={() => setVerDetalleId(null)}
        onEditar={(id) => {
          setVerDetalleId(null)
          abrirEdicion(id)
        }}
        onEliminado={() => {
          setVerDetalleId(null)
          cargar()
        }}
      />

      <ConfirmarEliminacion
        abierto={Boolean(aEliminar)}
        titulo="Eliminar evento"
        nombre={aEliminar ? `el evento de ${aEliminar.nombre_cliente ?? 'sin cliente'}` : ''}
        onCerrar={() => setAEliminar(null)}
        onConfirmar={confirmarEliminar}
        cargando={eliminando}
      />

      {estadoAbierto &&
        eventos.some((e) => e.id === estadoAbierto.id) &&
        createPortal(
          <>
            <button
              type="button"
              aria-label="Cerrar menú de estado"
              onClick={() => setEstadoAbierto(null)}
              className="fixed inset-0 z-40 cursor-default"
            />
            <div
              style={{ left: estadoAbierto.left, top: estadoAbierto.top, bottom: estadoAbierto.bottom, width: ANCHO_MENU_ESTADOS }}
              className="fixed z-50 rounded-lg border border-white/10 bg-slate-800 p-1 shadow-xl"
            >
              {ORDEN_ESTADOS.map((estado) => (
                <button
                  key={estado}
                  type="button"
                  onClick={() => handleCambiarEstado(eventos.find((e) => e.id === estadoAbierto.id), estado)}
                  className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs font-medium text-slate-200 transition hover:bg-white/5"
                >
                  <span className={`size-1.5 rounded-full ${ESTADOS[estado].punto}`} />
                  {ESTADOS[estado].etiqueta}
                </button>
              ))}
            </div>
          </>,
          document.body,
        )}
    </div>
  )
}
