import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import {
  actualizarConfiguracion,
  getConfiguracion,
  getHistorialCorreos,
  getVistaPreviaCorreo,
} from '../services/configuracionService'
import { formatearFechaHora } from '../utils/formatters'
import Panel from '../components/ui/Panel'
import InputField from '../components/ui/InputField'
import Toggle from '../components/ui/Toggle'
import BotonPrimario from '../components/ui/BotonPrimario'
import { IconoBasura, IconoCampana, IconoMas, IconoSobre } from '../components/ui/Iconos'

const ETIQUETAS_TIPO = {
  confirmacion: 'Solicitud de confirmación',
}

function etiquetaTipo(tipo) {
  if (ETIQUETAS_TIPO[tipo]) return ETIQUETAS_TIPO[tipo]
  const dias = tipo.match(/^recordatorio_(\d+)$/)?.[1]
  return dias ? `Recordatorio: ${dias} día${dias === '1' ? '' : 's'} antes` : tipo
}

export default function Recordatorios() {
  const [form, setForm] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [tipoPreview, setTipoPreview] = useState('recordatorio')
  const [preview, setPreview] = useState(null)
  const [cargandoPreview, setCargandoPreview] = useState(true)
  const [historial, setHistorial] = useState(null)

  const cargarConfiguracion = async () => {
    try {
      const data = await getConfiguracion()
      setForm({
        correo_remitente: data.correo_remitente ?? '',
        correo_notificaciones: data.correo_notificaciones ?? '',
        envio_automatico: data.envio_automatico,
        hora_envio: (data.hora_envio ?? '08:00').slice(0, 5),
        dias_recordatorio: [...data.dias_recordatorio].sort((a, b) => b - a),
        dias_confirmacion: data.dias_confirmacion,
      })
    } catch (err) {
      console.error(err)
      toast.error('Error al cargar la configuración de recordatorios')
    }
  }

  const cargarPreview = async (tipo) => {
    setCargandoPreview(true)
    try {
      const data = await getVistaPreviaCorreo(tipo)
      setPreview(data)
    } catch (err) {
      console.error(err)
      toast.error('Error al cargar la vista previa')
    } finally {
      setCargandoPreview(false)
    }
  }

  const cargarHistorial = async () => {
    try {
      const data = await getHistorialCorreos()
      setHistorial(data)
    } catch (err) {
      console.error(err)
      toast.error('Error al cargar el historial de correos')
    }
  }

  useEffect(() => {
    cargarConfiguracion()
    cargarHistorial()
  }, [])

  useEffect(() => {
    cargarPreview(tipoPreview)
  }, [tipoPreview])

  if (!form) return <p className="text-slate-400">Cargando recordatorios...</p>

  const handleDiaChange = (indice, valor) => {
    const copia = [...form.dias_recordatorio]
    copia[indice] = Number(valor)
    setForm({ ...form, dias_recordatorio: copia })
  }

  const agregarEtapa = () => {
    if (form.dias_recordatorio.length >= 6) {
      toast.error('Máximo 6 etapas de recordatorio')
      return
    }
    const minimo = Math.min(...form.dias_recordatorio, 1)
    setForm({ ...form, dias_recordatorio: [...form.dias_recordatorio, Math.max(0, minimo - 1)] })
  }

  const quitarEtapa = (indice) => {
    if (form.dias_recordatorio.length <= 1) {
      toast.error('Debe quedar al menos una etapa')
      return
    }
    setForm({ ...form, dias_recordatorio: form.dias_recordatorio.filter((_, i) => i !== indice) })
  }

  const handleGuardar = async (e) => {
    e.preventDefault()
    if (!form.correo_notificaciones.trim()) {
      toast.error('El correo de notificaciones es obligatorio')
      return
    }
    setGuardando(true)
    try {
      const payload = {
        correo_remitente: form.correo_remitente || null,
        correo_notificaciones: form.correo_notificaciones.trim(),
        envio_automatico: form.envio_automatico,
        hora_envio: form.hora_envio,
        dias_recordatorio: form.dias_recordatorio,
        dias_confirmacion: Number(form.dias_confirmacion),
      }
      await actualizarConfiguracion(payload)
      toast.success('Configuración de recordatorios guardada')
      await cargarPreview(tipoPreview)
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.error || 'Error al guardar la configuración')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 font-serif text-3xl font-bold text-white">
          <IconoCampana className="size-7 text-amber-400" />
          Recordatorios
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Notificaciones internas para recordarte tus eventos próximos — no se le envían al cliente
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel titulo="Configuración">
          <form onSubmit={handleGuardar} className="space-y-5">
            <InputField
              id="correo_notificaciones"
              label="Correo de notificaciones"
              type="email"
              placeholder="papayeralaberriondera@gmail.com"
              value={form.correo_notificaciones}
              onChange={(e) => setForm({ ...form, correo_notificaciones: e.target.value })}
              required
            />
            <p className="-mt-3 text-xs text-slate-400">
              A dónde te llegan los avisos de eventos próximos y pendientes por confirmar.
            </p>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-100">
                Recordatorio previo al evento (días)
              </label>
              <p className="mb-3 text-xs text-slate-400">
                Se envía un correo distinto en cada etapa, a medida que se acerca el evento.
              </p>
              <div className="space-y-2">
                {form.dias_recordatorio.map((dias, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="90"
                      value={dias}
                      onChange={(e) => handleDiaChange(i, e.target.value)}
                      className="w-24 rounded-lg border border-white/5 bg-slate-800/60 px-3 py-2 text-sm text-slate-100 focus:border-amber-500/60 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                    />
                    <span className="text-sm text-slate-400">días antes del evento</span>
                    <button
                      type="button"
                      onClick={() => quitarEtapa(i)}
                      aria-label="Quitar etapa"
                      className="ml-auto flex size-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
                    >
                      <IconoBasura className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={agregarEtapa}
                className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-amber-400 transition hover:text-amber-300"
              >
                <IconoMas className="size-3.5" />
                Agregar etapa
              </button>
            </div>

            <InputField
              id="dias_confirmacion"
              label="Solicitud de confirmación (días antes)"
              type="number"
              min="0"
              max="90"
              value={form.dias_confirmacion}
              onChange={(e) => setForm({ ...form, dias_confirmacion: e.target.value })}
            />
            <p className="-mt-3 text-xs text-slate-400">Solo para eventos con estado "Pendiente".</p>

            <InputField
              id="correo_remitente"
              label="Correo remitente"
              placeholder="Papayera La Berriondera <recordatorios@tudominio.com>"
              value={form.correo_remitente}
              onChange={(e) => setForm({ ...form, correo_remitente: e.target.value })}
            />
            <p className="-mt-3 text-xs text-slate-400">
              Debe ser un correo de un dominio verificado en Resend, o se dejará el remitente por defecto.
            </p>

            <div className="rounded-lg border border-white/5 bg-slate-800/40 p-4">
              <Toggle
                checked={form.envio_automatico}
                onChange={(valor) => setForm({ ...form, envio_automatico: valor })}
                label="Envío automático"
                descripcion={`Se revisa cada 30 min; se envía a partir de las ${form.hora_envio} (hora Colombia)`}
              />
              <div className="mt-4">
                <label htmlFor="hora_envio" className="mb-2 block text-sm font-semibold text-slate-100">
                  Hora a partir de la cual enviar
                </label>
                <input
                  id="hora_envio"
                  type="time"
                  value={form.hora_envio}
                  onChange={(e) => setForm({ ...form, hora_envio: e.target.value })}
                  className="rounded-lg border border-white/5 bg-slate-800/60 px-3 py-2 text-sm text-slate-100 focus:border-amber-500/60 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>
            </div>

            <BotonPrimario type="submit" disabled={guardando} className="w-full">
              {guardando ? 'Guardando...' : 'Guardar configuración'}
            </BotonPrimario>
          </form>
        </Panel>

        <Panel
          titulo="Vista previa del correo"
          subtitulo="Así te llegará la notificación a ti"
          accion={
            <div className="flex gap-1 rounded-lg bg-slate-800/60 p-1">
              {[
                { valor: 'recordatorio', etiqueta: 'Recordatorio' },
                { valor: 'confirmacion', etiqueta: 'Confirmación' },
              ].map((opcion) => (
                <button
                  key={opcion.valor}
                  type="button"
                  onClick={() => setTipoPreview(opcion.valor)}
                  className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
                    tipoPreview === opcion.valor ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  {opcion.etiqueta}
                </button>
              ))}
            </div>
          }
        >
          {cargandoPreview || !preview ? (
            <p className="text-sm text-slate-400">Cargando vista previa...</p>
          ) : (
            <div>
              <div className="space-y-1 border-b border-white/5 pb-3 text-xs text-slate-400">
                <p>
                  <span className="font-semibold text-slate-300">De:</span> {preview.from}
                </p>
                <p>
                  <span className="font-semibold text-slate-300">Para:</span> {preview.to}
                </p>
                <p>
                  <span className="font-semibold text-slate-300">Asunto:</span>{' '}
                  <span className="text-slate-200">{preview.subject}</span>
                </p>
                {!preview.esReal && (
                  <p className="text-amber-400/80">
                    No hay un evento real que aplique todavía — esta vista usa datos de ejemplo.
                  </p>
                )}
              </div>
              <div
                className="mt-3 max-h-96 overflow-auto rounded-lg bg-white p-4"
                dangerouslySetInnerHTML={{ __html: preview.html }}
              />
            </div>
          )}
        </Panel>
      </div>

      <Panel titulo="Historial de correos enviados" subtitulo={historial ? `${historial.length} registros` : undefined}>
        {!historial ? (
          <p className="text-sm text-slate-400">Cargando historial...</p>
        ) : historial.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">Todavía no se ha enviado ningún correo</p>
        ) : (
          <div className="divide-y divide-white/5">
            {historial.map((fila) => (
              <div key={fila.id} className="flex flex-wrap items-center gap-4 py-3">
                <IconoSobre className="size-4 shrink-0 text-slate-500" />
                <span className="w-40 shrink-0 text-xs text-slate-400">{formatearFechaHora(fila.created_at)}</span>
                <div className="min-w-[180px] flex-1">
                  <p className="truncate text-sm font-semibold text-white">{fila.clientes?.nombre ?? 'Cliente eliminado'}</p>
                  <p className="truncate text-xs text-slate-400">{etiquetaTipo(fila.tipo)}</p>
                </div>
                <div className="min-w-[160px] flex-1">
                  <p className="truncate text-sm text-slate-300">{fila.eventos?.ubicacion ?? 'Evento eliminado'}</p>
                  <p className="text-xs text-slate-500">{fila.eventos?.fecha ? formatearFechaHora(fila.eventos.fecha) : '—'}</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    fila.estado === 'enviado' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
                  }`}
                  title={fila.error ?? undefined}
                >
                  {fila.estado === 'enviado' ? 'Enviado' : 'Fallido'}
                </span>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  )
}
