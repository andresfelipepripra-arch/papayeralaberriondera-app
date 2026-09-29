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
  precio: '',
  fecha: '',
  ubicacion: '',
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
          setForm({
            cliente_id: evento.cliente_id ?? '',
            paquete_id: evento.paquete_id ?? '',
            precio: evento.precio ?? paqueteActual?.precio ?? '',
            fecha: evento.fecha ? aInputDatetimeLocal(evento.fecha) : '',
            ubicacion: evento.ubicacion ?? '',
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

  const handlePaqueteChange = (e) => {
    const paqueteId = e.target.value
    const paquete = paquetes.find((p) => p.id === paqueteId)
    setForm({ ...form, paquete_id: paqueteId, precio: paquete?.precio ?? '' })
  }

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
      precio: form.precio !== '' ? Number(form.precio) : null,
      fecha: new Date(form.fecha).toISOString(),
      ubicacion: form.ubicacion || null,
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
                Cliente
              </label>
              <select id="cliente_id" name="cliente_id" value={form.cliente_id} onChange={handleChange} className={estiloCampo}>
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
                Paquete
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
          </div>

          <div className="sm:w-1/2 sm:pr-2.5">
            <label htmlFor="precio" className={estiloLabel}>
              Precio
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
              Se llena con el precio del paquete al seleccionarlo, pero puedes ajustarlo (ej. por distancia).
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="fecha" className={estiloLabel}>
                Fecha y hora
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

            <div>
              <label htmlFor="ubicacion" className={estiloLabel}>
                Ubicación
              </label>
              <input
                id="ubicacion"
                name="ubicacion"
                type="text"
                value={form.ubicacion}
                onChange={handleChange}
                className={estiloCampo}
              />
            </div>
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
