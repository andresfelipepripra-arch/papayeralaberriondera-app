import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { actualizarEvento, crearEvento, getEventoPorId } from '../../services/eventosService'
import { paquetesService } from '../../services/paquetesService'
import {
  decimalADuracion,
  duracionADecimal,
  formatearDuracion,
  formatearFechaHora,
  formatearPrecio,
} from '../../utils/formatters'
import { ESTADOS, ORDEN_ESTADOS } from '../../utils/estados'
import Modal from '../../components/ui/Modal'
import BotonPrimario from '../../components/ui/BotonPrimario'
import { IconoCalendario, IconoCheck, IconoX } from '../../components/ui/Iconos'
import { useConfiguracion } from '../../context/ConfiguracionContext'

const PASOS = [
  { etiqueta: 'Cliente', titulo: '¿Quién es el cliente?', subtitulo: 'Datos de la persona que contrata el evento.' },
  { etiqueta: 'Paquete y cobro', titulo: '¿Qué paquete se contrata?', subtitulo: 'Elige el paquete y ajusta el valor si cambió.' },
  { etiqueta: 'Fecha y lugar', titulo: '¿Cuándo y dónde?', subtitulo: 'Fecha, hora y dirección del evento.' },
  { etiqueta: 'Resumen', titulo: 'Revisa antes de guardar', subtitulo: 'Así quedará el evento.' },
]

const vacio = {
  nombre_cliente: '',
  telefono_contacto: '',
  nombre_contacto: '',
  nombre_telefono_alterno: '',
  telefono_alterno: '',
  paquete_id: '',
  duracionHoras: '',
  duracionMinutos: '',
  tipo_evento: '',
  precio: '',
  abonado: '',
  ganancia_evento: '',
  fecha: '',
  ciudad: '',
  barrio: '',
  ubicacion: '',
  estado: 'confirmado',
  notas: '',
}

const estiloCampo =
  'w-full rounded-lg border border-white/5 bg-slate-800/60 px-4 py-3.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-500/60 focus:outline-none focus:ring-2 focus:ring-amber-500/30'
const estiloLabel = 'mb-2 block text-sm font-semibold text-slate-100'

function errorDelPaso(paso, form) {
  if (paso === 1 && !form.nombre_cliente.trim()) return 'Escribe el nombre del cliente'

  if (paso === 2) {
    if (!form.paquete_id) return 'Selecciona un paquete'
    const total = Number(form.precio) || 0
    const abonado = Number(form.abonado) || 0
    if (abonado < 0) return 'El abonado no puede ser negativo'
    if (abonado > total) return 'El abonado no puede ser mayor al total a cobrar'
    if (form.ganancia_evento !== '' && Number(form.ganancia_evento) < 0) return 'La ganancia no puede ser negativa'
  }

  if (paso === 3) {
    if (!form.fecha) return 'Indica la fecha y hora'
    if (!form.ciudad.trim()) return 'La ciudad es obligatoria'
    if (!form.ubicacion.trim()) return 'La dirección es obligatoria'
  }

  return null
}

export default function EventoModal({ abierto, eventoId, onCerrar, onGuardado }) {
  const esEdicion = Boolean(eventoId)
  const { configuracion } = useConfiguracion() ?? {}

  const [paquetes, setPaquetes] = useState([])
  const [form, setForm] = useState(vacio)
  const [paso, setPaso] = useState(1)
  const [cargandoForm, setCargandoForm] = useState(true)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!abierto) return
    let cancelado = false
    setPaso(1)

    const inicializar = async () => {
      setCargandoForm(true)
      try {
        const [paquetesData, evento] = await Promise.all([
          paquetesService.getTodos(),
          esEdicion ? getEventoPorId(eventoId) : Promise.resolve(null),
        ])

        if (cancelado) return
        setPaquetes(paquetesData)

        if (evento) {
          const paqueteActual = paquetesData.find((p) => p.id === evento.paquete_id)
          setForm({
            nombre_cliente: evento.nombre_cliente ?? '',
            telefono_contacto: evento.telefono_contacto ?? '',
            nombre_contacto: evento.nombre_contacto ?? '',
            nombre_telefono_alterno: evento.nombre_telefono_alterno ?? '',
            telefono_alterno: evento.telefono_alterno ?? '',
            paquete_id: evento.paquete_id ?? '',
            ...decimalADuracion(evento.duracion_horas ?? paqueteActual?.duracion_horas),
            tipo_evento: evento.tipo_evento ?? '',
            precio: evento.precio ?? paqueteActual?.precio ?? '',
            abonado: evento.abonado ?? 0,
            ganancia_evento: String(evento.ganancia_evento ?? configuracion?.ganancia_por_evento ?? 70000),
            fecha: evento.fecha ? aInputDatetimeLocal(evento.fecha) : '',
            ciudad: evento.ciudad ?? '',
            barrio: evento.barrio ?? '',
            ubicacion: evento.ubicacion ?? '',
            estado: evento.estado ?? 'confirmado',
            notas: evento.notas ?? '',
          })
        } else {
          setForm({ ...vacio, ganancia_evento: String(configuracion?.ganancia_por_evento ?? 70000) })
        }
      } catch (err) {
        console.error(err)
        toast.error('Error al cargar los datos del formulario')
      } finally {
        if (!cancelado) setCargandoForm(false)
      }
    }

    inicializar()
    return () => {
      cancelado = true
    }
  }, [abierto, eventoId, esEdicion])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handlePaqueteChange = (e) => {
    const paqueteId = e.target.value
    const paquete = paquetes.find((p) => p.id === paqueteId)
    setForm({ ...form, paquete_id: paqueteId, precio: paquete?.precio ?? '', ...decimalADuracion(paquete?.duracion_horas) })
  }

  const siguiente = () => {
    const error = errorDelPaso(paso, form)
    if (error) {
      toast.error(error)
      return
    }
    setPaso((p) => Math.min(p + 1, PASOS.length))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (paso < PASOS.length) return siguiente()
    if (loading) return

    for (let p = 1; p < PASOS.length; p++) {
      const error = errorDelPaso(p, form)
      if (error) {
        toast.error(error)
        setPaso(p)
        return
      }
    }

    setLoading(true)

    const payload = {
      nombre_cliente: form.nombre_cliente.trim(),
      telefono_contacto: form.telefono_contacto || null,
      nombre_contacto: form.nombre_contacto.trim() || null,
      nombre_telefono_alterno: form.nombre_telefono_alterno.trim() || null,
      telefono_alterno: form.telefono_alterno || null,
      paquete_id: form.paquete_id,
      duracion_horas: duracionADecimal(form.duracionHoras, form.duracionMinutos),
      tipo_evento: form.tipo_evento.trim() || null,
      precio: form.precio !== '' ? Number(form.precio) : null,
      abonado: Number(form.abonado) || 0,
      ganancia_evento: form.ganancia_evento !== '' ? Number(form.ganancia_evento) : null,
      fecha: new Date(form.fecha).toISOString(),
      ciudad: form.ciudad.trim(),
      barrio: form.barrio.trim() || null,
      ubicacion: form.ubicacion.trim(),
      estado: form.estado,
      notas: form.notas || null,
    }

    try {
      if (esEdicion) {
        await actualizarEvento(eventoId, payload)
        toast.success('Evento actualizado')
      } else {
        await crearEvento(payload)
        toast.success('Evento creado')
      }
      onGuardado()
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.error || 'Error al guardar el evento')
    } finally {
      setLoading(false)
    }
  }

  const total = Number(form.precio) || 0
  const abonado = Number(form.abonado) || 0
  const falta = total - abonado
  const paqueteSeleccionado = paquetes.find((p) => p.id === form.paquete_id)

  const cabecera = (
    <div className="flex shrink-0 items-center justify-between gap-3 bg-linear-to-r from-slate-900 via-amber-900/80 to-amber-600 px-5 py-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white/15 text-white">
          <IconoCalendario className="size-5" />
        </span>
        <h2 className="truncate text-lg font-bold text-white">{esEdicion ? 'Editar evento' : 'Registrar nuevo evento'}</h2>
      </div>
      <button
        type="button"
        onClick={onCerrar}
        aria-label="Cerrar"
        className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white transition hover:bg-white/20"
      >
        <IconoX className="size-5" />
      </button>
    </div>
  )

  return (
    <Modal abierto={abierto} onCerrar={onCerrar} cabecera={cabecera} ancho="max-w-2xl">
      {cargandoForm ? (
        <p className="text-slate-400">Cargando formulario...</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <ol className="flex items-center gap-2 overflow-x-auto pb-1">
            {PASOS.map((item, i) => {
              const numero = i + 1
              const activo = paso === numero
              const completado = paso > numero
              return (
                <li key={item.etiqueta} className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => (numero <= paso ? setPaso(numero) : undefined)}
                    className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      activo
                        ? 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/60'
                        : completado
                          ? 'text-slate-200 hover:bg-white/5'
                          : 'text-slate-500'
                    }`}
                  >
                    <span
                      className={`flex size-5 items-center justify-center rounded-full text-[11px] font-bold ${
                        activo
                          ? 'bg-amber-500 text-slate-950'
                          : completado
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {completado ? <IconoCheck className="size-3" /> : numero}
                    </span>
                    <span className={activo ? '' : 'hidden sm:inline'}>{item.etiqueta}</span>
                  </button>
                  {i < PASOS.length - 1 && <span className="h-px w-4 shrink-0 bg-white/10 sm:w-6" />}
                </li>
              )
            })}
          </ol>

          <div>
            <h3 className="text-base font-semibold text-white">{PASOS[paso - 1].titulo}</h3>
            <p className="mt-1 text-sm text-slate-400">{PASOS[paso - 1].subtitulo}</p>
          </div>

          {paso === 1 && (
            <div className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="nombre_cliente" className={estiloLabel}>
                    Nombre completo <span className="text-amber-400">*</span>
                  </label>
                  <input id="nombre_cliente" name="nombre_cliente" type="text" value={form.nombre_cliente} onChange={handleChange} className={estiloCampo} />
                </div>
                <div>
                  <label htmlFor="telefono_contacto" className={estiloLabel}>
                    Teléfono
                  </label>
                  <input id="telefono_contacto" name="telefono_contacto" type="tel" value={form.telefono_contacto} onChange={handleChange} className={estiloCampo} />
                </div>
              </div>

              <div>
                <label htmlFor="nombre_contacto" className={estiloLabel}>
                  Persona de contacto <span className="font-normal text-slate-500">(opcional)</span>
                </label>
                <input
                  id="nombre_contacto"
                  name="nombre_contacto"
                  type="text"
                  value={form.nombre_contacto}
                  onChange={handleChange}
                  placeholder="Útil si es una empresa"
                  className={estiloCampo}
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="nombre_telefono_alterno" className={estiloLabel}>
                    Nombre del otro teléfono <span className="font-normal text-slate-500">(opcional)</span>
                  </label>
                  <input
                    id="nombre_telefono_alterno"
                    name="nombre_telefono_alterno"
                    type="text"
                    value={form.nombre_telefono_alterno}
                    onChange={handleChange}
                    placeholder="Ej. Mamá, asistente"
                    className={estiloCampo}
                  />
                </div>
                <div>
                  <label htmlFor="telefono_alterno" className={estiloLabel}>
                    Otro teléfono <span className="font-normal text-slate-500">(opcional)</span>
                  </label>
                  <input id="telefono_alterno" name="telefono_alterno" type="tel" value={form.telefono_alterno} onChange={handleChange} className={estiloCampo} />
                </div>
              </div>
            </div>
          )}

          {paso === 2 && (
            <div className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="paquete_id" className={estiloLabel}>
                    Paquete <span className="text-amber-400">*</span>
                  </label>
                  <select id="paquete_id" name="paquete_id" value={form.paquete_id} onChange={handlePaqueteChange} className={estiloCampo}>
                    <option value="">Selecciona un paquete</option>
                    {paquetes.map((paquete) => (
                      <option key={paquete.id} value={paquete.id}>
                        {paquete.nombre} - {formatearPrecio(paquete.precio)}
                        {formatearDuracion(paquete.duracion_horas) ? ` - ${formatearDuracion(paquete.duracion_horas)}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="tipo_evento" className={estiloLabel}>
                    Tipo de evento
                  </label>
                  <input id="tipo_evento" name="tipo_evento" type="text" value={form.tipo_evento} onChange={handleChange} placeholder="Ej. Cumpleaños" className={estiloCampo} />
                </div>
              </div>

              <div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="duracionMinutos" className={estiloLabel}>
                      Duración: minutos
                    </label>
                    <input
                      id="duracionMinutos"
                      name="duracionMinutos"
                      type="number"
                      step="5"
                      min="0"
                      placeholder="45"
                      value={form.duracionMinutos}
                      onChange={handleChange}
                      className={estiloCampo}
                    />
                  </div>
                  <div>
                    <label htmlFor="duracionHoras" className={estiloLabel}>
                      + horas <span className="font-normal text-slate-500">(opcional)</span>
                    </label>
                    <input
                      id="duracionHoras"
                      name="duracionHoras"
                      type="number"
                      step="1"
                      min="0"
                      placeholder="0"
                      value={form.duracionHoras}
                      onChange={handleChange}
                      className={estiloCampo}
                    />
                  </div>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  {formatearDuracion(duracionADecimal(form.duracionHoras, form.duracionMinutos))
                    ? `Se llena con la del paquete (${formatearDuracion(duracionADecimal(form.duracionHoras, form.duracionMinutos))}), pero puedes ajustarla si el evento se extiende, ej. a 2 horas.`
                    : 'Se llena con la duración del paquete al seleccionarlo.'}
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-3">
                <div>
                  <label htmlFor="precio" className={estiloLabel}>
                    Total a cobrar
                  </label>
                  <input id="precio" name="precio" type="number" step="1000" min="0" placeholder="300000" value={form.precio} onChange={handleChange} className={estiloCampo} />
                  <p className="mt-1 text-xs text-slate-400">Se llena con el precio del paquete, pero puedes ajustarlo.</p>
                </div>
                <div>
                  <label htmlFor="abonado" className={estiloLabel}>
                    Abonado
                  </label>
                  <input id="abonado" name="abonado" type="number" step="1000" min="0" placeholder="0" value={form.abonado} onChange={handleChange} className={estiloCampo} />
                </div>
                <div>
                  <label htmlFor="ganancia_evento" className={estiloLabel}>
                    Ganancia por toque
                  </label>
                  <input id="ganancia_evento" name="ganancia_evento" type="number" step="1000" min="0" placeholder="70000" value={form.ganancia_evento} onChange={handleChange} className={estiloCampo} />
                  <p className="mt-1 text-xs text-slate-400">Lo que se queda la papayera en este evento.</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/5 bg-slate-950/60 px-4 py-3.5 text-sm">
                <span className="text-slate-300">
                  Abonado <span className="font-semibold text-white">{formatearPrecio(abonado)}</span> de{' '}
                  <span className="font-semibold text-white">{formatearPrecio(total)}</span>
                </span>
                {falta < 0 ? (
                  <span className="font-bold text-red-400">El abonado supera el total</span>
                ) : falta === 0 ? (
                  <span className="font-bold text-emerald-400">Pagado completo</span>
                ) : (
                  <span className="font-bold text-amber-400">Falta {formatearPrecio(falta)}</span>
                )}
              </div>
            </div>
          )}

          {paso === 3 && (
            <div className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="fecha" className={estiloLabel}>
                    Fecha y hora <span className="text-amber-400">*</span>
                  </label>
                  <input id="fecha" name="fecha" type="datetime-local" value={form.fecha} onChange={handleChange} className={estiloCampo} />
                </div>
                <div>
                  <label htmlFor="ciudad" className={estiloLabel}>
                    Ciudad <span className="text-amber-400">*</span>
                  </label>
                  <input id="ciudad" name="ciudad" type="text" value={form.ciudad} onChange={handleChange} className={estiloCampo} />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="barrio" className={estiloLabel}>
                    Barrio <span className="font-normal text-slate-500">(opcional)</span>
                  </label>
                  <input id="barrio" name="barrio" type="text" value={form.barrio} onChange={handleChange} placeholder="Ej. Santa Elena" className={estiloCampo} />
                </div>
                <div>
                  <label htmlFor="ubicacion" className={estiloLabel}>
                    Dirección <span className="text-amber-400">*</span>
                  </label>
                  <input id="ubicacion" name="ubicacion" type="text" value={form.ubicacion} onChange={handleChange} className={estiloCampo} />
                </div>
              </div>

              <div>
                <span className={estiloLabel}>Estado</span>
                <div className="flex flex-wrap gap-2">
                  {ORDEN_ESTADOS.map((estado) => (
                    <button
                      key={estado}
                      type="button"
                      onClick={() => setForm({ ...form, estado })}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
                        form.estado === estado
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-800/60 text-slate-300 ring-1 ring-white/10 hover:bg-white/5'
                      }`}
                    >
                      <span className={`size-1.5 rounded-full ${form.estado === estado ? 'bg-slate-950' : ESTADOS[estado].punto}`} />
                      {ESTADOS[estado].etiqueta}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="notas" className={estiloLabel}>
                  Notas
                </label>
                <textarea id="notas" name="notas" rows={3} value={form.notas} onChange={handleChange} className={estiloCampo} />
              </div>
            </div>
          )}

          {paso === 4 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <TarjetaResumen titulo="Cliente">
                <p className="font-semibold text-white">{form.nombre_cliente}</p>
                {form.telefono_contacto && <p>{form.telefono_contacto}</p>}
                {form.nombre_contacto && <p className="text-slate-400">Contacto: {form.nombre_contacto}</p>}
                {form.telefono_alterno && (
                  <p>
                    {form.telefono_alterno}
                    {form.nombre_telefono_alterno && <span className="text-slate-400"> · {form.nombre_telefono_alterno}</span>}
                  </p>
                )}
              </TarjetaResumen>

              <TarjetaResumen titulo="Paquete y cobro">
                <p className="font-semibold text-white">{paqueteSeleccionado?.nombre ?? 'Sin paquete'}</p>
                {form.tipo_evento && <p className="text-slate-400">{form.tipo_evento}</p>}
                {formatearDuracion(duracionADecimal(form.duracionHoras, form.duracionMinutos)) && (
                  <p className="text-slate-400">{formatearDuracion(duracionADecimal(form.duracionHoras, form.duracionMinutos))}</p>
                )}
                <p>
                  Ganancia papayera <span className="font-semibold text-white">{formatearPrecio(Number(form.ganancia_evento) || 0)}</span>
                </p>
                <p>
                  Total <span className="font-semibold text-white">{formatearPrecio(total)}</span> · Abonado{' '}
                  <span className="font-semibold text-white">{formatearPrecio(abonado)}</span>
                </p>
                <p className={falta > 0 ? 'font-semibold text-amber-400' : 'font-semibold text-emerald-400'}>
                  {falta > 0 ? `Falta ${formatearPrecio(falta)}` : 'Pagado completo'}
                </p>
              </TarjetaResumen>

              <TarjetaResumen titulo="Fecha y lugar">
                <p className="font-semibold capitalize text-white">{form.fecha ? formatearFechaHora(new Date(form.fecha)) : 'Sin fecha'}</p>
                <p>{[form.ciudad, form.barrio].filter(Boolean).join(' · ')}</p>
                <p className="text-slate-400">{form.ubicacion}</p>
              </TarjetaResumen>

              <TarjetaResumen titulo="Estado">
                <p className="font-semibold text-white">{ESTADOS[form.estado]?.etiqueta ?? form.estado}</p>
                {form.notas && <p className="whitespace-pre-line text-slate-400">{form.notas}</p>}
              </TarjetaResumen>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-5">
            <button
              type="button"
              onClick={onCerrar}
              className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-300 ring-1 ring-white/10 transition hover:bg-white/5"
            >
              Cancelar
            </button>
            <div className="flex gap-3">
              {paso > 1 && (
                <button
                  type="button"
                  onClick={() => setPaso((p) => p - 1)}
                  className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-300 ring-1 ring-white/10 transition hover:bg-white/5"
                >
                  Atrás
                </button>
              )}
              {paso < PASOS.length ? (
                <BotonPrimario type="button" onClick={siguiente}>
                  Siguiente
                </BotonPrimario>
              ) : (
                <BotonPrimario type="submit" disabled={loading}>
                  {loading ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear evento'}
                </BotonPrimario>
              )}
            </div>
          </div>
        </form>
      )}
    </Modal>
  )
}

function TarjetaResumen({ titulo, children }) {
  return (
    <div className="space-y-1.5 rounded-lg border border-white/5 bg-slate-950/60 p-4 text-sm text-slate-300">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{titulo}</p>
      {children}
    </div>
  )
}

function aInputDatetimeLocal(iso) {
  const fecha = new Date(iso)
  const local = new Date(fecha.getTime() - fecha.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 16)
}
