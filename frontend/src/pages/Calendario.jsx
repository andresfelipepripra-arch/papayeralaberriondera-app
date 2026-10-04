import { useEffect, useMemo, useState } from 'react'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { getEventos } from '../services/eventosService'
import { formatearHora } from '../utils/formatters'
import { ESTADOS, ORDEN_ESTADOS } from '../utils/estados'
import Panel from '../components/ui/Panel'
import { IconoChevron } from '../components/ui/Iconos'
import EventoModal from './Eventos/EventoModal'
import EventoDetalleModal from './Eventos/EventoDetalleModal'

const DIAS_SEMANA = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM']
const opcionesSemana = { weekStartsOn: 1 }
const claveDia = (fecha) => format(fecha, 'yyyy-MM-dd')

export default function Calendario() {
  const [eventos, setEventos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [mesActual, setMesActual] = useState(() => startOfMonth(new Date()))
  const [verDetalleId, setVerDetalleId] = useState(null)
  const [editandoId, setEditandoId] = useState(null)
  const [modalAbierto, setModalAbierto] = useState(false)

  const cargar = async () => {
    try {
      const data = await getEventos()
      setEventos(data)
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

  const abrirEdicion = (id) => {
    setEditandoId(id)
    setModalAbierto(true)
  }

  const alGuardar = () => {
    setModalAbierto(false)
    setEditandoId(null)
    cargar()
  }

  const conteoPorEstado = useMemo(
    () =>
      Object.fromEntries(ORDEN_ESTADOS.map((estado) => [estado, eventos.filter((e) => (e.estado ?? 'pendiente') === estado).length])),
    [eventos],
  )

  const eventosFiltrados = eventos.filter(
    (evento) => filtroEstado === 'todos' || (evento.estado ?? 'pendiente') === filtroEstado,
  )

  const eventosPorDia = eventosFiltrados.reduce((acc, evento) => {
    const clave = claveDia(new Date(evento.fecha))
    acc[clave] ??= []
    acc[clave].push(evento)
    return acc
  }, {})

  const dias = eachDayOfInterval({
    start: startOfWeek(startOfMonth(mesActual), opcionesSemana),
    end: endOfWeek(endOfMonth(mesActual), opcionesSemana),
  })

  if (loading) return <p className="text-slate-400">Cargando calendario...</p>
  if (error) return <p className="text-red-400">{error}</p>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-white">Calendario</h1>
        <p className="mt-1 text-sm text-slate-400">Vista mensual de eventos</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFiltroEstado('todos')}
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
            onClick={() => setFiltroEstado(estado)}
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

      <Panel
        accion={
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMesActual(startOfMonth(new Date()))}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-300 ring-1 ring-white/5 transition hover:bg-white/5"
            >
              Hoy
            </button>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setMesActual((mes) => subMonths(mes, 1))}
                aria-label="Mes anterior"
                className="flex size-8 items-center justify-center rounded-lg text-slate-300 transition hover:bg-white/5 hover:text-white"
              >
                <IconoChevron className="size-4 rotate-180" />
              </button>
              <button
                type="button"
                onClick={() => setMesActual((mes) => addMonths(mes, 1))}
                aria-label="Mes siguiente"
                className="flex size-8 items-center justify-center rounded-lg text-slate-300 transition hover:bg-white/5 hover:text-white"
              >
                <IconoChevron className="size-4" />
              </button>
            </div>
          </div>
        }
      >
        <h2 className="mb-4 font-serif text-xl font-bold capitalize text-white">
          {format(mesActual, 'MMMM yyyy', { locale: es })}
        </h2>

        <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg bg-white/5">
          {DIAS_SEMANA.map((dia) => (
            <div key={dia} className="bg-slate-900/80 py-2 text-center text-[11px] font-semibold text-slate-400">
              {dia}
            </div>
          ))}

          {dias.map((dia) => {
            const eventosDelDia = eventosPorDia[claveDia(dia)] ?? []
            const enMes = isSameMonth(dia, mesActual)
            const hoy = isToday(dia)

            return (
              <div
                key={dia.toISOString()}
                className={`min-h-24 bg-slate-900/40 p-1.5 sm:min-h-28 ${!enMes ? 'opacity-40' : ''}`}
              >
                <span
                  className={`inline-flex size-6 items-center justify-center rounded-full text-xs font-semibold ${
                    hoy ? 'bg-amber-500 text-slate-950' : 'text-slate-300'
                  }`}
                >
                  {format(dia, 'd')}
                </span>

                <div className="mt-1 space-y-1">
                  {eventosDelDia.slice(0, 3).map((evento) => (
                    <button
                      key={evento.id}
                      type="button"
                      onClick={() => setVerDetalleId(evento.id)}
                      title={`${formatearHora(evento.fecha)} · ${evento.clientes?.nombre ?? 'Evento'}`}
                      className={`block w-full truncate rounded px-1.5 py-0.5 text-left text-[11px] font-medium transition hover:opacity-80 ${ESTADOS[evento.estado ?? 'pendiente'].badge}`}
                    >
                      {evento.clientes?.nombre ?? evento.ubicacion ?? 'Evento'}
                    </button>
                  ))}
                  {eventosDelDia.length > 3 && (
                    <p className="px-1.5 text-[11px] text-slate-400">+{eventosDelDia.length - 3} más</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </Panel>

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

      <EventoModal
        abierto={modalAbierto}
        eventoId={editandoId}
        onCerrar={() => {
          setModalAbierto(false)
          setEditandoId(null)
        }}
        onGuardado={alGuardar}
      />
    </div>
  )
}
