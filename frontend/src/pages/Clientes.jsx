import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { clientesService } from '../services/clientesService'
import { getEventos } from '../services/eventosService'
import { paquetesService } from '../services/paquetesService'
import { formatearFechaHora, formatearPrecio, precioEfectivo } from '../utils/formatters'
import { colorAvatar, inicialesDe } from '../utils/avatar'
import Modal from '../components/ui/Modal'
import EstadoBadge from '../components/ui/EstadoBadge'
import BotonPrimario from '../components/ui/BotonPrimario'
import InputField from '../components/ui/InputField'
import { IconoBasura, IconoBusqueda, IconoLapiz, IconoMas, IconoOjo, IconoUsuarios } from '../components/ui/Iconos'

const vacio = { nombre: '', telefono: '', ciudad: '' }

export default function Clientes() {
  const [clientes, setClientes] = useState([])
  const [eventos, setEventos] = useState([])
  const [paquetes, setPaquetes] = useState([])
  const [form, setForm] = useState(vacio)
  const [editandoId, setEditandoId] = useState(null)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [verEventosId, setVerEventosId] = useState(null)
  const navigate = useNavigate()

  const cargar = async () => {
    setLoading(true)
    try {
      const [clientesData, eventosData, paquetesData] = await Promise.all([
        clientesService.getTodos(),
        getEventos(),
        paquetesService.getTodos(),
      ])
      setClientes(clientesData)
      setEventos(eventosData)
      setPaquetes(paquetesData)
    } catch (err) {
      console.error(err)
      toast.error('Error al cargar los clientes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const abrirCreacion = () => {
    setEditandoId(null)
    setForm(vacio)
    setMostrarFormulario(true)
  }

  const cerrarFormulario = () => {
    setMostrarFormulario(false)
    setEditandoId(null)
    setForm(vacio)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (guardando) return

    setGuardando(true)
    try {
      const payload = {
        nombre: form.nombre,
        telefono: form.telefono || null,
        ciudad: form.ciudad || null,
      }
      if (editandoId) {
        await clientesService.actualizar(editandoId, payload)
        toast.success('Cliente actualizado')
      } else {
        await clientesService.crear(payload)
        toast.success('Cliente creado')
      }
      cerrarFormulario()
      await cargar()
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.error || 'Error al guardar el cliente')
    } finally {
      setGuardando(false)
    }
  }

  const handleEditar = (cliente) => {
    setEditandoId(cliente.id)
    setForm({
      nombre: cliente.nombre,
      telefono: cliente.telefono ?? '',
      ciudad: cliente.ciudad ?? '',
    })
    setMostrarFormulario(true)
  }

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar este cliente?')) return
    try {
      await clientesService.eliminar(id)
      setClientes((prev) => prev.filter((c) => c.id !== id))
      toast.success('Cliente eliminado')
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.error || 'Error al eliminar el cliente')
    }
  }

  if (loading) return <p className="text-slate-400">Cargando clientes...</p>

  const paquetesPorId = Object.fromEntries(paquetes.map((p) => [p.id, p]))
  const eventosPorCliente = eventos.reduce((acc, evento) => {
    if (!evento.cliente_id) return acc
    acc[evento.cliente_id] ??= []
    acc[evento.cliente_id].push(evento)
    return acc
  }, {})

  const textoBusqueda = busqueda.trim().toLowerCase()
  const clientesFiltrados = clientes.filter((cliente) => {
    if (!textoBusqueda) return true
    return (
      cliente.nombre?.toLowerCase().includes(textoBusqueda) ||
      cliente.ciudad?.toLowerCase().includes(textoBusqueda) ||
      cliente.correo?.toLowerCase().includes(textoBusqueda)
    )
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-white">Clientes</h1>
          <p className="mt-1 text-sm text-slate-400">
            {clientes.length} {clientes.length === 1 ? 'cliente registrado' : 'clientes registrados'}
          </p>
        </div>
        <BotonPrimario onClick={abrirCreacion}>
          <IconoMas className="size-4" />
          Nuevo cliente
        </BotonPrimario>
      </div>

      <Modal
        abierto={mostrarFormulario}
        onCerrar={cerrarFormulario}
        titulo={editandoId ? 'Editar cliente' : 'Nuevo cliente'}
        icono={IconoUsuarios}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <InputField id="nombre" label="Nombre" name="nombre" value={form.nombre} onChange={handleChange} required />
            <InputField id="ciudad" label="Ciudad" name="ciudad" value={form.ciudad} onChange={handleChange} />
            <InputField id="telefono" label="Teléfono" name="telefono" value={form.telefono} onChange={handleChange} />
          </div>

          <div className="flex gap-3 pt-2">
            <BotonPrimario type="submit" disabled={guardando}>
              {guardando ? 'Guardando...' : editandoId ? 'Actualizar' : 'Crear'}
            </BotonPrimario>
            <button
              type="button"
              onClick={cerrarFormulario}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-300 ring-1 ring-white/10 transition hover:bg-white/5"
            >
              Cancelar
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        abierto={Boolean(verEventosId)}
        onCerrar={() => setVerEventosId(null)}
        titulo={`Eventos de ${clientes.find((c) => c.id === verEventosId)?.nombre ?? ''}`}
        subtitulo={`${(eventosPorCliente[verEventosId] ?? []).length} eventos registrados`}
        icono={IconoUsuarios}
      >
        {(eventosPorCliente[verEventosId] ?? []).length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">Este cliente no tiene eventos registrados</p>
        ) : (
          <ul className="divide-y divide-white/5">
            {[...(eventosPorCliente[verEventosId] ?? [])]
              .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
              .map((evento) => (
                <li key={evento.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{formatearFechaHora(evento.fecha)}</p>
                    <p className="truncate text-xs text-slate-400">
                      {evento.ubicacion ?? 'Sin ubicación'} · {paquetesPorId[evento.paquete_id]?.nombre ?? 'Sin paquete'}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-sm font-medium text-amber-400">
                      {formatearPrecio(precioEfectivo(evento, paquetesPorId[evento.paquete_id]))}
                    </span>
                    <EstadoBadge estado={evento.estado ?? 'pendiente'} />
                    <button
                      type="button"
                      onClick={() => {
                        setVerEventosId(null)
                        navigate(`/eventos?evento=${evento.id}`)
                      }}
                      aria-label="Ver detalle del evento"
                      title="Ver detalle del evento"
                      className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/5 hover:text-white"
                    >
                      <IconoOjo className="size-4" />
                    </button>
                  </div>
                </li>
              ))}
          </ul>
        )}
      </Modal>

      <div className="relative">
        <IconoBusqueda className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="Buscar por nombre, ciudad o correo..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full rounded-lg border border-white/5 bg-slate-900/60 py-3 pl-11 pr-4 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-500/60 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
        />
      </div>

      {clientes.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-400">No hay clientes registrados</p>
      ) : clientesFiltrados.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-400">No hay clientes que coincidan con la búsqueda</p>
      ) : (
        <div className="divide-y divide-white/5 overflow-hidden rounded-xl border border-white/5 bg-slate-900/60">
          {clientesFiltrados.map((cliente) => {
            const eventosCliente = eventosPorCliente[cliente.id] ?? []
            const totalFacturado = eventosCliente.reduce(
              (suma, e) => suma + precioEfectivo(e, paquetesPorId[e.paquete_id]),
              0,
            )
            return (
              <div key={cliente.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                <span className={`flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${colorAvatar(cliente.nombre)}`}>
                  {inicialesDe(cliente.nombre)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-white">{cliente.nombre}</p>
                  <p className="truncate text-xs text-slate-400">
                    {cliente.telefono ?? '—'}
                    {cliente.correo && <span> · {cliente.correo}</span>}
                  </p>
                </div>

                <div className="hidden text-right sm:block">
                  <p className="text-[11px] uppercase tracking-wide text-slate-500">Ciudad</p>
                  <p className="text-sm text-slate-200">{cliente.ciudad ?? '—'}</p>
                </div>
                <div className="hidden text-right sm:block">
                  <p className="text-[11px] uppercase tracking-wide text-slate-500">Eventos</p>
                  <p className="text-sm text-slate-200">{eventosCliente.length}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] uppercase tracking-wide text-slate-500">Total facturado</p>
                  <p className="text-sm font-semibold text-amber-400">{formatearPrecio(totalFacturado)}</p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setVerEventosId(cliente.id)}
                    aria-label="Ver eventos anteriores"
                    title="Ver eventos anteriores"
                    className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/5 hover:text-white"
                  >
                    <IconoOjo className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEditar(cliente)}
                    aria-label="Editar cliente"
                    className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/5 hover:text-white"
                  >
                    <IconoLapiz className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEliminar(cliente.id)}
                    aria-label="Eliminar cliente"
                    className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
                  >
                    <IconoBasura className="size-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
