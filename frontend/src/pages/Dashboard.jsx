import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  addDays,
  addMonths,
  endOfDay,
  endOfMonth,
  endOfYear,
  format,
  startOfDay,
  startOfMonth,
  startOfYear,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { getEventos } from '../services/eventosService'
import { paquetesService } from '../services/paquetesService'
import { useAuth } from '../context/AuthContext'
import {
  formatearDia,
  formatearFechaConDia,
  formatearFechaCorta,
  formatearFechaHora,
  formatearHora,
  formatearMesCorto,
  formatearPrecio,
  formatearPrecioCorto,
  precioEfectivo,
} from '../utils/formatters'
import { ESTADOS, ORDEN_ESTADOS } from '../utils/estados'
import BotonPrimario from '../components/ui/BotonPrimario'
import Panel from '../components/ui/Panel'
import TarjetaEstadistica from '../components/ui/TarjetaEstadistica'
import EstadoBadge from '../components/ui/EstadoBadge'
import Donut from '../components/ui/Donut'
import EventoModal from './Eventos/EventoModal'
import {
  IconoCalendario,
  IconoCheckCirculo,
  IconoChevron,
  IconoDinero,
  IconoMas,
  IconoReloj,
} from '../components/ui/Iconos'

const PALETA_DONUT = [
  { trazo: 'stroke-amber-500', punto: 'bg-amber-500' },
  { trazo: 'stroke-indigo-400', punto: 'bg-indigo-400' },
  { trazo: 'stroke-emerald-400', punto: 'bg-emerald-400' },
  { trazo: 'stroke-sky-400', punto: 'bg-sky-400' },
  { trazo: 'stroke-slate-500', punto: 'bg-slate-500' },
]

const estadoDe = (evento) => evento.estado ?? 'pendiente'

function rangoPeriodo(modo, valor, ahora) {
  if (modo === 'dia') {
    const dia = valor ? new Date(`${valor}T00:00:00`) : ahora
    return { inicio: startOfDay(dia), fin: endOfDay(dia), etiqueta: formatearFechaConDia(dia) }
  }
  if (modo === 'anio') {
    const anio = Number(valor) || ahora.getFullYear()
    const dia = new Date(anio, 0, 1)
    return { inicio: startOfYear(dia), fin: endOfYear(dia), etiqueta: String(anio) }
  }
  const [anio, mes] = (valor || format(ahora, 'yyyy-MM')).split('-').map(Number)
  const dia = new Date(anio, mes - 1, 1)
  return { inicio: startOfMonth(dia), fin: endOfMonth(dia), etiqueta: format(dia, 'MMMM yyyy', { locale: es }) }
}

function rangoFinDeSemana(ahora) {
  const dia = ahora.getDay()

  if (dia === 0) return { inicio: startOfDay(ahora), fin: endOfDay(ahora) }
  if (dia === 6) return { inicio: startOfDay(ahora), fin: endOfDay(addDays(ahora, 1)) }

  const sabado = addDays(startOfDay(ahora), 6 - dia)
  return { inicio: sabado, fin: endOfDay(addDays(sabado, 1)) }
}

export default function Dashboard() {
  const [eventos, setEventos] = useState([])
  const [paquetes, setPaquetes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modoPeriodo, setModoPeriodo] = useState('mes')
  const [valorPeriodo, setValorPeriodo] = useState(() => format(new Date(), 'yyyy-MM'))
  const [modalAbierto, setModalAbierto] = useState(false)
  const { user } = useAuth()

  const cargar = async () => {
    try {
      const [eventosData, paquetesData] = await Promise.all([getEventos(), paquetesService.getTodos()])
      setEventos(eventosData)
      setPaquetes(paquetesData)
    } catch (err) {
      console.error(err)
      setError('Error al cargar el resumen')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  if (loading) return <p className="text-slate-400">Cargando resumen...</p>
  if (error) return <p className="text-red-400">{error}</p>

  const ahora = new Date()
  const paquetesPorId = Object.fromEntries(paquetes.map((p) => [p.id, p]))
  const precioDe = (evento) => precioEfectivo(evento, paquetesPorId[evento.paquete_id])

  // --- Siempre "ahora": saludo y seguimiento inmediato, sin filtrar por período ---
  const proximos = eventos
    .filter((e) => new Date(e.fecha) >= ahora && ['pendiente', 'confirmado'].includes(estadoDe(e)))
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
  const porConfirmar = proximos.filter((e) => estadoDe(e) === 'pendiente')
  const { inicio: inicioFinde, fin: finFinde } = rangoFinDeSemana(ahora)
  const eventosFinDeSemana = proximos.filter((e) => {
    const fecha = new Date(e.fecha)
    return fecha >= inicioFinde && fecha <= finFinde
  }).length
  const siguiente = proximos[0]
  const usuario = (user?.email ?? '').split('@')[0]
  const nombre = usuario.charAt(0).toUpperCase() + usuario.slice(1)

  // --- Según el período seleccionado: todo lo demás ---
  const cambiarModoPeriodo = (modo) => {
    setModoPeriodo(modo)
    if (modo === 'dia') setValorPeriodo(format(ahora, 'yyyy-MM-dd'))
    else if (modo === 'anio') setValorPeriodo(String(ahora.getFullYear()))
    else setValorPeriodo(format(ahora, 'yyyy-MM'))
  }

  const moverPeriodo = (delta) => {
    if (modoPeriodo === 'dia') {
      const dia = valorPeriodo ? new Date(`${valorPeriodo}T00:00:00`) : ahora
      setValorPeriodo(format(addDays(dia, delta), 'yyyy-MM-dd'))
    } else if (modoPeriodo === 'anio') {
      setValorPeriodo(String((Number(valorPeriodo) || ahora.getFullYear()) + delta))
    } else {
      const [anio, mes] = (valorPeriodo || format(ahora, 'yyyy-MM')).split('-').map(Number)
      setValorPeriodo(format(addMonths(new Date(anio, mes - 1, 1), delta), 'yyyy-MM'))
    }
  }

  const periodo = rangoPeriodo(modoPeriodo, valorPeriodo, ahora)
  const eventosPeriodo = eventos
    .filter((e) => {
      const fecha = new Date(e.fecha)
      return fecha >= periodo.inicio && fecha <= periodo.fin
    })
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
  const eventosPeriodoVisibles = eventosPeriodo.slice(0, 8)

  const noCanceladosPeriodo = eventosPeriodo.filter((e) => estadoDe(e) !== 'cancelado')
  const realizadosPeriodo = eventosPeriodo.filter((e) => estadoDe(e) === 'realizado').length
  const pendientesPeriodo = eventosPeriodo.filter((e) => estadoDe(e) === 'pendiente').length
  const ingresosPeriodo = noCanceladosPeriodo.reduce((suma, e) => suma + precioDe(e), 0)

  const conteoPorEstadoPeriodo = Object.fromEntries(
    ORDEN_ESTADOS.map((estado) => [estado, eventosPeriodo.filter((e) => estadoDe(e) === estado).length]),
  )

  const ingresosPorPaquete = Object.values(
    noCanceladosPeriodo.reduce((acc, e) => {
      const precio = precioDe(e)
      if (!precio) return acc
      acc[e.paquete_id] ??= { id: e.paquete_id, nombre: e.paquetes?.nombre ?? 'Paquete', valor: 0 }
      acc[e.paquete_id].valor += precio
      return acc
    }, {}),
  ).sort((a, b) => b.valor - a.valor)
  const otrosPaquetes = ingresosPorPaquete.slice(4).reduce((suma, p) => suma + p.valor, 0)
  const segmentosDonut = [
    ...ingresosPorPaquete.slice(0, 4),
    ...(otrosPaquetes > 0 ? [{ id: 'otros', nombre: 'Otros', valor: otrosPaquetes }] : []),
  ].map((segmento, i) => ({ ...segmento, ...PALETA_DONUT[i] }))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-sky-300/80">{formatearFechaConDia(ahora)}</p>
        </div>
        <BotonPrimario onClick={() => setModalAbierto(true)}>
          <IconoMas className="size-4" />
          Nuevo evento
        </BotonPrimario>
      </div>

      <section className="relative overflow-hidden rounded-2xl border border-white/5 bg-linear-to-br from-slate-900 via-slate-900 to-indigo-950/70 p-6 sm:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-amber-500/10 blur-3xl"
        />
        <p className="relative flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-amber-400">
          <span className="size-1.5 rounded-full bg-amber-500" />
          Resumen operativo
        </p>
        <h2 className="relative mt-3 font-serif text-2xl font-bold text-white sm:text-3xl">
          ¡Hola{nombre ? `, ${nombre}` : ''}!{' '}
          {eventosFinDeSemana > 0 ? (
            <>
              Tienes{' '}
              <span className="text-amber-400">
                {eventosFinDeSemana} {eventosFinDeSemana === 1 ? 'evento' : 'eventos'}
              </span>{' '}
              este fin de semana
            </>
          ) : (
            'No tienes eventos este fin de semana'
          )}
        </h2>
        <p className="relative mt-2 text-sm text-slate-300">
          {siguiente
            ? `Próximo: ${formatearFechaHora(siguiente.fecha)}${siguiente.ubicacion ? ` · ${siguiente.ubicacion}` : ''}`
            : 'No hay eventos próximos programados'}
        </p>
      </section>

      <Panel titulo="Filtrar por período" subtitulo="Cambia el resto del panel a lo que pasó en un día, mes o año">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { modo: 'dia', etiqueta: 'Día' },
            { modo: 'mes', etiqueta: 'Mes' },
            { modo: 'anio', etiqueta: 'Año' },
          ].map(({ modo, etiqueta }) => (
            <button
              key={modo}
              type="button"
              onClick={() => cambiarModoPeriodo(modo)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                modoPeriodo === modo
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800/60 text-slate-300 ring-1 ring-white/10 hover:bg-white/5'
              }`}
            >
              {etiqueta}
            </button>
          ))}

          <div className="ml-1 flex items-center gap-1">
            <button
              type="button"
              onClick={() => moverPeriodo(-1)}
              aria-label="Período anterior"
              className="flex size-8 items-center justify-center rounded-lg text-slate-300 transition hover:bg-white/5 hover:text-white"
            >
              <IconoChevron className="size-4 rotate-180" />
            </button>
            <button
              type="button"
              onClick={() => moverPeriodo(1)}
              aria-label="Período siguiente"
              className="flex size-8 items-center justify-center rounded-lg text-slate-300 transition hover:bg-white/5 hover:text-white"
            >
              <IconoChevron className="size-4" />
            </button>
          </div>

          {modoPeriodo === 'dia' && (
            <input
              type="date"
              value={valorPeriodo}
              onChange={(e) => setValorPeriodo(e.target.value)}
              className="rounded-lg border border-white/5 bg-slate-800/60 px-3 py-1.5 text-xs text-slate-100 focus:border-amber-500/60 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            />
          )}
          {modoPeriodo === 'mes' && (
            <input
              type="month"
              value={valorPeriodo}
              onChange={(e) => setValorPeriodo(e.target.value)}
              className="rounded-lg border border-white/5 bg-slate-800/60 px-3 py-1.5 text-xs text-slate-100 focus:border-amber-500/60 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            />
          )}
          {modoPeriodo === 'anio' && (
            <input
              type="number"
              value={valorPeriodo}
              onChange={(e) => setValorPeriodo(e.target.value)}
              className="w-24 rounded-lg border border-white/5 bg-slate-800/60 px-3 py-1.5 text-xs text-slate-100 focus:border-amber-500/60 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            />
          )}

          <span className="ml-1 text-sm font-semibold capitalize text-white">{periodo.etiqueta}</span>
        </div>
      </Panel>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <TarjetaEstadistica
          titulo="Eventos del período"
          valor={eventosPeriodo.length}
          detalle={`${conteoPorEstadoPeriodo.cancelado} cancelados`}
          icono={IconoCalendario}
        />
        <TarjetaEstadistica
          titulo="Ingresos del período"
          valor={formatearPrecio(ingresosPeriodo)}
          detalle="Sin contar cancelados"
          icono={IconoDinero}
          destacada
        />
        <TarjetaEstadistica titulo="Realizados" valor={realizadosPeriodo} icono={IconoCheckCirculo} />
        <TarjetaEstadistica titulo="Pendientes" valor={pendientesPeriodo} icono={IconoReloj} />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Panel
          titulo={`Eventos · ${periodo.etiqueta}`}
          subtitulo={`${eventosPeriodo.length} ${eventosPeriodo.length === 1 ? 'evento' : 'eventos'}`}
          className="xl:col-span-2"
          accion={
            <Link
              to="/eventos"
              className="flex items-center gap-1 text-xs font-semibold text-amber-400 transition hover:text-amber-300"
            >
              Ver todos
              <IconoChevron className="size-3.5" />
            </Link>
          }
        >
          {eventosPeriodo.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">No hay eventos en este período</p>
          ) : (
            <ul className="divide-y divide-white/5">
              {eventosPeriodoVisibles.map((evento) => (
                <li key={evento.id}>
                  <Link
                    to={`/eventos/${evento.id}`}
                    className="flex items-center gap-4 rounded-lg px-2 py-3 transition hover:bg-white/5"
                  >
                    <div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-lg border border-white/10 bg-slate-950/60">
                      <span className="text-lg font-bold leading-none text-amber-400">
                        {formatearDia(evento.fecha)}
                      </span>
                      <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        {formatearMesCorto(evento.fecha)}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">
                        {evento.clientes?.nombre ?? 'Sin cliente'}
                      </p>
                      <p className="truncate text-xs text-slate-400">
                        {evento.ubicacion ?? 'Sin ubicación'} · {formatearHora(evento.fecha)}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <EstadoBadge estado={estadoDe(evento)} />
                      <span className="text-xs text-slate-400">
                        {evento.paquetes?.nombre ?? 'Sin paquete'}
                        {precioDe(evento) > 0 && ` · ${formatearPrecio(precioDe(evento))}`}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {eventosPeriodo.length > eventosPeriodoVisibles.length && (
            <p className="mt-3 text-center text-xs text-slate-500">
              y {eventosPeriodo.length - eventosPeriodoVisibles.length} más
            </p>
          )}
        </Panel>

        <div className="space-y-6">
          <Panel titulo="Estado de eventos" subtitulo={periodo.etiqueta}>
            {eventosPeriodo.length === 0 ? (
              <p className="py-2 text-center text-sm text-slate-400">Sin eventos en este período</p>
            ) : (
              <ul className="space-y-4">
                {ORDEN_ESTADOS.map((estado) => (
                  <li key={estado}>
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="text-slate-300">{ESTADOS[estado].etiqueta}</span>
                      <span className="font-semibold text-white">{conteoPorEstadoPeriodo[estado]}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                      <div
                        className={`h-full rounded-full ${ESTADOS[estado].barra}`}
                        style={{
                          width: `${eventosPeriodo.length ? (conteoPorEstadoPeriodo[estado] / eventosPeriodo.length) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel titulo="Ingresos por paquete" subtitulo={periodo.etiqueta}>
            {segmentosDonut.length === 0 ? (
              <p className="py-4 text-center text-sm text-slate-400">Sin ingresos en este período</p>
            ) : (
              <div className="flex flex-wrap items-center gap-6">
                <Donut
                  segmentos={segmentosDonut}
                  centro={
                    <>
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Total</span>
                      <span className="text-lg font-bold text-white">{formatearPrecioCorto(ingresosPeriodo)}</span>
                    </>
                  }
                />
                <ul className="min-w-0 flex-1 space-y-2 text-xs">
                  {segmentosDonut.map((segmento) => (
                    <li key={segmento.id} className="flex items-center gap-2">
                      <span className={`size-2 shrink-0 rounded-full ${segmento.punto}`} />
                      <span className="min-w-0 flex-1 truncate text-slate-300">{segmento.nombre}</span>
                      <span className="font-semibold text-white">
                        {Math.round((segmento.valor / ingresosPeriodo) * 100)}%
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Panel>

          <Panel titulo="Pendientes de confirmar" subtitulo="Requieren seguimiento ahora">
            {porConfirmar.length === 0 ? (
              <p className="py-2 text-center text-sm text-slate-400">No hay eventos pendientes</p>
            ) : (
              <ul className="divide-y divide-white/5">
                {porConfirmar.slice(0, 4).map((evento) => (
                  <li key={evento.id}>
                    <Link
                      to={`/eventos/${evento.id}`}
                      className="flex items-start justify-between gap-3 rounded-lg px-1 py-2.5 transition hover:bg-white/5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">
                          {evento.clientes?.nombre ?? 'Sin cliente'}
                        </p>
                        <p className="truncate text-xs text-slate-400">{evento.ubicacion ?? 'Sin ubicación'}</p>
                      </div>
                      <span className="shrink-0 text-xs text-slate-400">{formatearFechaCorta(evento.fecha)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>

      <EventoModal
        abierto={modalAbierto}
        eventoId={null}
        onCerrar={() => setModalAbierto(false)}
        onGuardado={() => {
          setModalAbierto(false)
          cargar()
        }}
      />
    </div>
  )
}
