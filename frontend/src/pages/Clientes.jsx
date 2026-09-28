import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { clientesService } from '../services/clientesService'
import { getEventos } from '../services/eventosService'
import { paquetesService } from '../services/paquetesService'
import { formatearFechaHora, formatearPrecio } from '../utils/formatters'
import { colorAvatar, inicialesDe } from '../utils/avatar'
import Panel from '../components/ui/Panel'
import EstadoBadge from '../components/ui/EstadoBadge'
import BotonPrimario from '../components/ui/BotonPrimario'
import InputField from '../components/ui/InputField'
import { IconoBasura, IconoBusqueda, IconoChevron, IconoLapiz, IconoMas } from '../components/ui/Iconos'

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
  const [expandidoId, setExpandidoId] = useState(null)

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
        <BotonPrimario onClick={abrirCreacion} className="px-5">
          <IconoMas className="size-4" />
          Nuevo cliente
        </BotonPrimario>
      </div>

      {mostrarFormulario && (
        <Panel titulo={editandoId ? 'Editar cliente' : 'Nuevo cliente'}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <InputField id="nombre" label="Nombre" name="nombre" value={form.nombre} onChange={handleChange} required />
              <InputField id="ciudad" label="Ciudad" name="ciudad" value={form.ciudad} onChange={handleChange} />
              <InputField id="telefono" label="Teléfono" name="telefono" value={form.telefono} onChange={handleChange} />
            </div>

            <div className="flex gap-3">
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
        </Panel>
      )}

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
              (suma, e) => suma + (Number(paquetesPorId[e.paquete_id]?.precio) || 0),
              0,
            )
            const expandido = expandidoId === cliente.id

            return (
              <div key={cliente.id}>
                <button
                  type="button"
                  onClick={() => setExpandidoId(expandido ? null : cliente.id)}
                  className="flex w-full flex-wrap items-center gap-4 px-5 py-4 text-left transition hover:bg-white/5"
                >
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
                  <IconoChevron className={`size-4 shrink-0 text-slate-400 transition ${expandido ? 'rotate-90' : ''}`} />
                </button>

                {expandido && (
                  <div className="border-t border-white/5 bg-slate-950/40 px-5 py-4">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2 sm:hidden">
                      <p className="text-xs text-slate-400">
                        Ciudad: <span className="text-slate-200">{cliente.ciudad ?? '—'}</span>
                      </p>
                    </div>

                    {eventosCliente.length === 0 ? (
                      <p className="text-sm text-slate-400">Sin eventos registrados</p>
                    ) : (
                      <ul className="space-y-2">
                        {eventosCliente.map((evento) => (
                          <li key={evento.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                            <span className="text-slate-300">
                              {formatearFechaHora(evento.fecha)} · {evento.ubicacion ?? 'Sin ubicación'}
                            </span>
                            <div className="flex items-center gap-3">
                              <span className="text-slate-400">{paquetesPorId[evento.paquete_id]?.nombre ?? 'Sin paquete'}</span>
                              <EstadoBadge estado={evento.estado ?? 'pendiente'} />
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditar(cliente)}
                        className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-200 ring-1 ring-white/10 transition hover:bg-white/5"
                      >
                        <IconoLapiz className="size-3.5" />
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEliminar(cliente.id)}
                        className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-400 ring-1 ring-white/10 transition hover:bg-red-500/10 hover:text-red-400"
                      >
                        <IconoBasura className="size-3.5" />
                        Eliminar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
