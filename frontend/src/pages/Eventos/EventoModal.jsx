import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { actualizarEvento, crearEvento, getEventoPorId } from '../../services/eventosService'
import { clientesService } from '../../services/clientesService'
import { paquetesService } from '../../services/paquetesService'
import { formatearDuracion, formatearPrecio } from '../../utils/formatters'
import { ESTADOS, ORDEN_ESTADOS } from '../../utils/estados'
import Modal from '../../components/ui/Modal'
import BotonPrimario from '../../components/ui/BotonPrimario'
import { IconoCalendario } from '../../components/ui/Iconos'

const vacio = {
  cliente_id: '',
  paquete_id: '',
  nombre_contacto: '',
  telefono_contacto: '',
  nombre_telefono_alterno: '',
  telefono_alterno: '',
  tipo_evento: '',
  fecha: '',
  ciudad: '',
  barrio: '',
  ubicacion: '',
  precio: '',
  abonado: '',
  estado: 'confirmado',
  notas: '',
}

export default function EventoModal({ abierto, eventoId, onCerrar, onGuardado }) {
  const esEdicion = Boolean(eventoId)

  const [clientes, setClientes] = useState([])
  const [paquetes, setPaquetes] = useState([])
  const [form, setForm] = useState(vacio)
  const [cargandoForm, setCargandoForm] = useState(true)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!abierto) return
    let cancelado = false

    const inicializar = async () => {
      setCargandoForm(true)
      try {
        const [clientesData, paquetesData, evento] = await Promise.all([
          clientesService.getTodos(),
          paquetesService.getTodos(),
          esEdicion ? getEventoPorId(eventoId) : Promise.resolve(null),
        ])

        if (cancelado) return
        setClientes(clientesData)
        setPaquetes(paquetesData)

        if (evento) {
          const paqueteActual = paquetesData.find((p) => p.id === evento.paquete_id)
          const clienteActual = clientesData.find((c) => c.id === evento.cliente_id)
          setForm({
            cliente_id: evento.cliente_id ?? '',
            paquete_id: evento.paquete_id ?? '',
            nombre_contacto: evento.nombre_contacto ?? '',
            telefono_contacto: evento.telefono_contacto ?? clienteActual?.telefono ?? '',
            nombre_telefono_alterno: evento.nombre_telefono_alterno ?? '',
            telefono_alterno: evento.telefono_alterno ?? '',
            tipo_evento: evento.tipo_evento ?? '',
            fecha: evento.fecha ? aInputDatetimeLocal(evento.fecha) : '',
            ciudad: evento.ciudad ?? '',
            barrio: evento.barrio ?? '',
            ubicacion: evento.ubicacion ?? '',
            precio: evento.precio ?? paqueteActual?.precio ?? '',
            abonado: evento.abonado ?? 0,
            estado: evento.estado ?? 'confirmado',
            notas: evento.notas ?? '',
          })
        } else {
          setForm(vacio)
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

  const handleClienteChange = (e) => {
    const clienteId = e.target.value
    const cliente = clientes.find((c) => c.id === clienteId)
    setForm({ ...form, cliente_id: clienteId, telefono_contacto: cliente?.telefono ?? '' })
  }

  const handlePaqueteChange = (e) => {
    const paqueteId = e.target.value
    const paquete = paquetes.find((p) => p.id === paqueteId)
    setForm({ ...form, paquete_id: paqueteId, precio: paquete?.precio ?? '' })
  }

  const total = Number(form.precio) || 0
  const abonado = Number(form.abonado) || 0
  const falta = total - abonado

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (loading) return

    if (!form.cliente_id) {
      toast.error('Selecciona un cliente')
      return
    }

    if (!form.paquete_id) {
      toast.error('Selecciona un paquete')
      return
    }

    if (!esEdicion && !form.ciudad.trim()) {
      toast.error('La ciudad es obligatoria')
      return
    }

    if (!esEdicion && !form.ubicacion.trim()) {
      toast.error('La dirección es obligatoria')
      return
    }

    if (abonado < 0) {
      toast.error('El abonado no puede ser negativo')
      return
    }

    if (abonado > total) {
      toast.error('El abonado no puede ser mayor al total a cobrar')
      return
    }

    if (!esEdicion) {
      const hoy = new Date()
      hoy.setHours(0, 0, 0, 0)
      const fechaSeleccionada = new Date(form.fecha)
      fechaSeleccionada.setHours(0, 0, 0, 0)

      if (fechaSeleccionada < hoy) {
        toast.error('La fecha no puede ser anterior a hoy')
        return
      }
    }

    setLoading(true)

    const payload = {
      cliente_id: form.cliente_id,
      paquete_id: form.paquete_id,
      nombre_contacto: form.nombre_contacto.trim() || null,
      telefono_contacto: form.telefono_contacto || null,
      nombre_telefono_alterno: form.nombre_telefono_alterno.trim() || null,
      telefono_alterno: form.telefono_alterno || null,
      tipo_evento: form.tipo_evento.trim() || null,
      fecha: new Date(form.fecha).toISOString(),
      ciudad: form.ciudad || null,
      barrio: form.barrio.trim() || null,
      ubicacion: form.ubicacion || null,
      precio: form.precio !== '' ? Number(form.precio) : null,
      abonado,
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

  const estiloCampo =
    'w-full rounded-lg border border-white/5 bg-slate-800/60 px-4 py-3.5 text-sm text-slate-100 focus:border-amber-500/60 focus:outline-none focus:ring-2 focus:ring-amber-500/30'
  const estiloLabel = 'mb-2 block text-sm font-semibold text-slate-100'
  const marcaObligatorio = esEdicion ? null : <span className="text-amber-400">*</span>

  return (
    <Modal
      abierto={abierto}
      onCerrar={onCerrar}
      titulo={esEdicion ? 'Editar evento' : 'Nuevo evento'}
      icono={IconoCalendario}
    >
      {cargandoForm ? (
        <p className="text-slate-400">Cargando formulario...</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="cliente_id" className={estiloLabel}>
                Cliente {marcaObligatorio}
              </label>
              <select
                id="cliente_id"
                name="cliente_id"
                value={form.cliente_id}
                onChange={handleClienteChange}
                required={!esEdicion}
                className={estiloCampo}
              >
                <option value="">Selecciona un cliente</option>
                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="paquete_id" className={estiloLabel}>
                Paquete {marcaObligatorio}
              </label>
              <select
                id="paquete_id"
                name="paquete_id"
                value={form.paquete_id}
                onChange={handlePaqueteChange}
                required={!esEdicion}
                className={estiloCampo}
              >
                <option value="">Selecciona un paquete</option>
                {paquetes.map((paquete) => (
                  <option key={paquete.id} value={paquete.id}>
                    {paquete.nombre} - {formatearPrecio(paquete.precio)}
                    {formatearDuracion(paquete.duracion_horas) ? ` - ${formatearDuracion(paquete.duracion_horas)}` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="nombre_contacto" className={estiloLabel}>
                Nombre del contacto <span className="font-normal text-slate-500">(opcional)</span>
              </label>
              <input
                id="nombre_contacto"
                name="nombre_contacto"
                type="text"
                value={form.nombre_contacto}
                onChange={handleChange}
                placeholder="Ej. María Pérez, encargada de eventos"
                className={estiloCampo}
              />
              <p className="mt-1 text-xs text-slate-400">Útil cuando el cliente es una empresa.</p>
            </div>

            <div>
              <label htmlFor="telefono_contacto" className={estiloLabel}>
                Teléfono del cliente
              </label>
              <input
                id="telefono_contacto"
                name="telefono_contacto"
                type="tel"
                value={form.telefono_contacto}
                onChange={handleChange}
                placeholder="Sin teléfono registrado"
                className={estiloCampo}
              />
              <p className="mt-1 text-xs text-slate-400">Viene del cliente, pero puedes cambiarlo solo para este evento.</p>
            </div>
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
              <input
                id="telefono_alterno"
                name="telefono_alterno"
                type="tel"
                value={form.telefono_alterno}
                onChange={handleChange}
                className={estiloCampo}
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="tipo_evento" className={estiloLabel}>
                Tipo de evento
              </label>
              <input
                id="tipo_evento"
                name="tipo_evento"
                type="text"
                value={form.tipo_evento}
                onChange={handleChange}
                placeholder="Ej. Cumpleaños"
                className={estiloCampo}
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="fecha" className={estiloLabel}>
                Fecha y hora {marcaObligatorio}
              </label>
              <input
                id="fecha"
                name="fecha"
                type="datetime-local"
                value={form.fecha}
                onChange={handleChange}
                required
                className={estiloCampo}
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="ciudad" className={estiloLabel}>
                Ciudad {marcaObligatorio}
              </label>
              <input
                id="ciudad"
                name="ciudad"
                type="text"
                value={form.ciudad}
                onChange={handleChange}
                required={!esEdicion}
                className={estiloCampo}
              />
            </div>

            <div>
              <label htmlFor="barrio" className={estiloLabel}>
                Barrio <span className="font-normal text-slate-500">(opcional)</span>
              </label>
              <input
                id="barrio"
                name="barrio"
                type="text"
                value={form.barrio}
                onChange={handleChange}
                placeholder="Ej. Santa Elena"
                className={estiloCampo}
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="ubicacion" className={estiloLabel}>
                Dirección {marcaObligatorio}
              </label>
              <input
                id="ubicacion"
                name="ubicacion"
                type="text"
                value={form.ubicacion}
                onChange={handleChange}
                required={!esEdicion}
                className={estiloCampo}
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="precio" className={estiloLabel}>
                Total a cobrar
              </label>
              <input
                id="precio"
                name="precio"
                type="number"
                step="1000"
                min="0"
                placeholder="300000"
                value={form.precio}
                onChange={handleChange}
                className={estiloCampo}
              />
              <p className="mt-1 text-xs text-slate-400">
                Se llena con el precio del paquete, pero puedes ajustarlo (ej. por distancia).
              </p>
            </div>

            <div>
              <label htmlFor="abonado" className={estiloLabel}>
                Abonado
              </label>
              <input
                id="abonado"
                name="abonado"
                type="number"
                step="1000"
                min="0"
                placeholder="0"
                value={form.abonado}
                onChange={handleChange}
                className={estiloCampo}
              />
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

          <div>
            <label className={estiloLabel}>Estado</label>
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
            <textarea id="notas" name="notas" rows={4} value={form.notas} onChange={handleChange} className={estiloCampo} />
          </div>

          <div className="flex gap-3 pt-2">
            <BotonPrimario type="submit" disabled={loading}>
              {loading ? 'Guardando...' : esEdicion ? 'Actualizar' : 'Crear evento'}
            </BotonPrimario>
            <button
              type="button"
              onClick={onCerrar}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-300 ring-1 ring-white/10 transition hover:bg-white/5"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </Modal>
  )
}

function aInputDatetimeLocal(iso) {
  const fecha = new Date(iso)
  const local = new Date(fecha.getTime() - fecha.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 16)
}
