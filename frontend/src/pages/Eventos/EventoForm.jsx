import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  actualizarEvento,
  crearEvento,
  getEventoPorId,
} from '../../services/eventosService'
import { clientesService } from '../../services/clientesService'
import { paquetesService } from '../../services/paquetesService'
import { formatearDuracion, formatearPrecio } from '../../utils/formatters'
import { ESTADOS, ORDEN_ESTADOS } from '../../utils/estados'
import Panel from '../../components/ui/Panel'
import BotonPrimario from '../../components/ui/BotonPrimario'
import { IconoChevron } from '../../components/ui/Iconos'

export default function EventoForm() {
  const { id } = useParams()
  const esEdicion = Boolean(id)
  const navigate = useNavigate()

  const [clientes, setClientes] = useState([])
  const [paquetes, setPaquetes] = useState([])
  const [form, setForm] = useState({
    cliente_id: '',
    paquete_id: '',
    fecha: '',
    ubicacion: '',
    estado: 'confirmado',
    notas: '',
  })
  const [cargandoForm, setCargandoForm] = useState(esEdicion)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const inicializar = async () => {
      try {
        const [clientesData, paquetesData, evento] = await Promise.all([
          clientesService.getTodos(),
          paquetesService.getTodos(),
          esEdicion ? getEventoPorId(id) : Promise.resolve(null),
        ])

        setClientes(clientesData)
        setPaquetes(paquetesData)

        if (evento) {
          setForm({
            cliente_id: evento.cliente_id ?? '',
            paquete_id: evento.paquete_id ?? '',
            fecha: evento.fecha ? aInputDatetimeLocal(evento.fecha) : '',
            ubicacion: evento.ubicacion ?? '',
            estado: evento.estado ?? 'confirmado',
            notas: evento.notas ?? '',
          })
        }
      } catch (err) {
        console.error(err)
        toast.error('Error al cargar los datos del formulario')
      } finally {
        setCargandoForm(false)
      }
    }

    inicializar()
  }, [id, esEdicion])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

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
      fecha: new Date(form.fecha).toISOString(),
      ubicacion: form.ubicacion || null,
      estado: form.estado,
      notas: form.notas || null,
    }

    try {
      if (esEdicion) {
        await actualizarEvento(id, payload)
        toast.success('Evento actualizado')
      } else {
        await crearEvento(payload)
        toast.success('Evento creado')
      }
      navigate('/eventos')
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.error || 'Error al guardar el evento')
      setLoading(false)
    }
  }

  if (cargandoForm) return <p className="text-slate-400">Cargando formulario...</p>

  const estiloCampo =
    'w-full rounded-lg border border-white/5 bg-slate-800/60 px-4 py-2.5 text-sm text-slate-100 focus:border-amber-500/60 focus:outline-none focus:ring-2 focus:ring-amber-500/30'
  const estiloLabel = 'mb-2 block text-sm font-semibold text-slate-100'

  return (
    <div className="max-w-3xl space-y-6">
      <Link
        to="/eventos"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 transition hover:text-white"
      >
        <IconoChevron className="size-4 rotate-180" />
        Volver a eventos
      </Link>

      <h1 className="font-serif text-3xl font-bold text-white">{esEdicion ? 'Editar evento' : 'Nuevo evento'}</h1>

      <Panel>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
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
              <select id="paquete_id" name="paquete_id" value={form.paquete_id} onChange={handleChange} className={estiloCampo}>
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

          <div className="grid gap-4 sm:grid-cols-2">
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
            <textarea
              id="notas"
              name="notas"
              rows={4}
              value={form.notas}
              onChange={handleChange}
              className={estiloCampo}
            />
          </div>

          <div className="flex gap-3">
            <BotonPrimario type="submit" disabled={loading}>
              {loading ? 'Guardando...' : esEdicion ? 'Actualizar' : 'Crear evento'}
            </BotonPrimario>
            <button
              type="button"
              onClick={() => navigate('/eventos')}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-300 ring-1 ring-white/10 transition hover:bg-white/5"
            >
              Cancelar
            </button>
          </div>
        </form>
      </Panel>
    </div>
  )
}

function aInputDatetimeLocal(iso) {
  const fecha = new Date(iso)
  const local = new Date(fecha.getTime() - fecha.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 16)
}
