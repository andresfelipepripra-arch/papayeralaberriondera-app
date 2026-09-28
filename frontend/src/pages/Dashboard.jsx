import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { addDays, endOfDay, endOfMonth, startOfDay, startOfMonth } from 'date-fns'
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
} from '../utils/formatters'
import { ESTADOS, ORDEN_ESTADOS } from '../utils/estados'
import BotonPrimario from '../components/ui/BotonPrimario'
import Panel from '../components/ui/Panel'
import TarjetaEstadistica from '../components/ui/TarjetaEstadistica'
import EstadoBadge from '../components/ui/EstadoBadge'
import Donut from '../components/ui/Donut'
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
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const cargar = async () => {
      try {
        const [eventosData, paquetesData] = await Promise.all([
          getEventos(),
          paquetesService.getTodos(),
        ])
        setEventos(eventosData)
        setPaquetes(paquetesData)
      } catch (err) {
        console.error(err)
        setError('Error al cargar el resumen')
      } finally {
        setLoading(false)
      }
    }

    cargar()
  }, [])

  if (loading) return <p className="text-slate-400">Cargando resumen...</p>
  if (error) return <p className="text-red-400">{error}</p>

  const ahora = new Date()
  const preciosPorId = Object.fromEntries(paquetes.map((p) => [p.id, Number(p.precio) || 0]))
  const precioDe = (evento) => preciosPorId[evento.paquete_id] ?? 0

  const proximos = eventos
    .filter((e) => new Date(e.fecha) >= ahora && ['pendiente', 'confirmado'].includes(estadoDe(e)))
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
  const proximos5 = proximos.slice(0, 5)
  const porConfirmar = proximos.filter((e) => estadoDe(e) === 'pendiente')

  const en7Dias = proximos.filter((e) => new Date(e.fecha) <= addDays(ahora, 7)).length
  const eventosDelMes = eventos.filter((e) => {
    const fecha = new Date(e.fecha)
    return estadoDe(e) !== 'cancelado' && fecha >= startOfMonth(ahora) && fecha <= endOfMonth(ahora)
  })
  const realizadosDelMes = eventosDelMes.filter((e) => estadoDe(e) === 'realizado').length

  const ingresosEstimados = proximos.reduce((suma, e) => suma + precioDe(e), 0)
  const ingresosPotenciales = porConfirmar.reduce((suma, e) => suma + precioDe(e), 0)

  const conteoPorEstado = Object.fromEntries(
    ORDEN_ESTADOS.map((estado) => [estado, eventos.filter((e) => estadoDe(e) === estado).length]),
  )
  const totalEventos = eventos.length

  const ingresosPorPaquete = Object.values(
    proximos.reduce((acc, e) => {
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

  const { inicio, fin } = rangoFinDeSemana(ahora)
  const eventosFinDeSemana = proximos.filter((e) => {
    const fecha = new Date(e.fecha)
    return fecha >= inicio && fecha <= fin
  }).length

  const usuario = (user?.email ?? '').split('@')[0]
  const nombre = usuario.charAt(0).toUpperCase() + usuario.slice(1)
  const siguiente = proximos[0]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-sky-300/80">{formatearFechaConDia(ahora)}</p>
        </div>
        <BotonPrimario onClick={() => navigate('/eventos/nuevo')} className="px-5">
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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <TarjetaEstadistica
          titulo="Próximos eventos"
          valor={proximos.length}
          detalle={`${en7Dias} en los próximos 7 días`}
          icono={IconoCalendario}
        />
        <TarjetaEstadistica
          titulo="Eventos este mes"
          valor={eventosDelMes.length}
          detalle={`${realizadosDelMes} realizados`}
          icono={IconoCheckCirculo}
        />
        <TarjetaEstadistica
          titulo="Ingresos estimados"
          valor={formatearPrecio(ingresosEstimados)}
          detalle="Próximos confirmados + pendientes"
          icono={IconoDinero}
          destacada
        />
        <TarjetaEstadistica
          titulo="Por confirmar"
          valor={porConfirmar.length}
          detalle={`${formatearPrecioCorto(ingresosPotenciales)} potenciales por cerrar`}
          icono={IconoReloj}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Panel
          titulo="Próximos eventos"
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
          {proximos5.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">No hay eventos programados</p>
          ) : (
            <ul className="divide-y divide-white/5">
              {proximos5.map((evento) => (
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
        </Panel>

        <div className="space-y-6">
          <Panel titulo="Estado de eventos">
            <ul className="space-y-4">
              {ORDEN_ESTADOS.map((estado) => (
                <li key={estado}>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="text-slate-300">{ESTADOS[estado].etiqueta}</span>
                    <span className="font-semibold text-white">{conteoPorEstado[estado]}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                    <div
                      className={`h-full rounded-full ${ESTADOS[estado].barra}`}
                      style={{ width: `${totalEventos ? (conteoPorEstado[estado] / totalEventos) * 100 : 0}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel titulo="Ingresos por paquete" subtitulo="Próximos confirmados + pendientes">
            {segmentosDonut.length === 0 ? (
              <p className="py-4 text-center text-sm text-slate-400">Sin ingresos estimados</p>
            ) : (
              <div className="flex flex-wrap items-center gap-6">
                <Donut
                  segmentos={segmentosDonut}
                  centro={
                    <>
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Total</span>
                      <span className="text-lg font-bold text-white">{formatearPrecioCorto(ingresosEstimados)}</span>
                    </>
                  }
                />
                <ul className="min-w-0 flex-1 space-y-2 text-xs">
                  {segmentosDonut.map((segmento) => (
                    <li key={segmento.id} className="flex items-center gap-2">
                      <span className={`size-2 shrink-0 rounded-full ${segmento.punto}`} />
                      <span className="min-w-0 flex-1 truncate text-slate-300">{segmento.nombre}</span>
                      <span className="font-semibold text-white">
                        {Math.round((segmento.valor / ingresosEstimados) * 100)}%
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Panel>

          <Panel titulo="Pendientes de confirmar" subtitulo="Requieren seguimiento">
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
    </div>
  )
}
