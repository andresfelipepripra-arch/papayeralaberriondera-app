import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { paquetesService } from '../services/paquetesService'
import { getEventos } from '../services/eventosService'
import { formatearDuracion, formatearPrecio, itemsDeIncluye } from '../utils/formatters'
import Modal from '../components/ui/Modal'
import BotonPrimario from '../components/ui/BotonPrimario'
import InputField from '../components/ui/InputField'
import PaqueteDetalleModal from './PaqueteDetalleModal'
import { IconoBasura, IconoCheck, IconoCubo, IconoEstrella, IconoLapiz, IconoMas, IconoOjo } from '../components/ui/Iconos'

const vacio = { nombre: '', descripcion: '', precio: '', duracionHoras: '', duracionMinutos: '', incluye: '' }

function duracionADecimal(horas, minutos) {
  const h = Number(horas) || 0
  const min = Number(minutos) || 0
  const total = h + min / 60
  return total > 0 ? total : null
}

function decimalADuracion(duracionHorasDecimal) {
  const totalMinutos = duracionHorasDecimal ? Math.round(Number(duracionHorasDecimal) * 60) : 0
  const minutosParte = totalMinutos % 60
  return {
    duracionHoras: totalMinutos >= 60 ? String(Math.floor(totalMinutos / 60)) : '',
    duracionMinutos: minutosParte > 0 ? String(minutosParte) : '',
  }
}

export default function Paquetes() {
  const [paquetes, setPaquetes] = useState([])
  const [eventos, setEventos] = useState([])
  const [form, setForm] = useState(vacio)
  const [editandoId, setEditandoId] = useState(null)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [verDetalleId, setVerDetalleId] = useState(null)

  const cargar = async () => {
    setLoading(true)
    try {
      const [paquetesData, eventosData] = await Promise.all([paquetesService.getTodos(), getEventos()])
      setPaquetes(paquetesData)
      setEventos(eventosData)
    } catch (err) {
      console.error(err)
      toast.error('Error al cargar los paquetes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  const conteoPorPaquete = eventos.reduce((acc, e) => {
    if (!e.paquete_id) return acc
    acc[e.paquete_id] = (acc[e.paquete_id] ?? 0) + 1
    return acc
  }, {})
  const idPopular = Object.entries(conteoPorPaquete).sort((a, b) => b[1] - a[1])[0]?.[0]

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
        descripcion: form.descripcion || null,
        precio: Number(form.precio),
        duracion_horas: duracionADecimal(form.duracionHoras, form.duracionMinutos),
        incluye: form.incluye || null,
      }
      if (editandoId) {
        await paquetesService.actualizar(editandoId, payload)
        toast.success('Paquete actualizado')
      } else {
        await paquetesService.crear(payload)
        toast.success('Paquete creado')
      }
      cerrarFormulario()
      await cargar()
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.error || 'Error al guardar el paquete')
    } finally {
      setGuardando(false)
    }
  }

  const handleEditar = (paquete) => {
    setEditandoId(paquete.id)
    setForm({
      nombre: paquete.nombre,
      descripcion: paquete.descripcion ?? '',
      precio: paquete.precio,
      ...decimalADuracion(paquete.duracion_horas),
      incluye: paquete.incluye ?? '',
    })
    setMostrarFormulario(true)
  }

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar este paquete?')) return
    try {
      await paquetesService.eliminar(id)
      setPaquetes((prev) => prev.filter((p) => p.id !== id))
      toast.success('Paquete eliminado')
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.error || 'Error al eliminar el paquete')
    }
  }

  if (loading) return <p className="text-slate-400">Cargando paquetes...</p>

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-white">Paquetes y precios</h1>
          <p className="mt-1 text-sm text-slate-400">
            {paquetes.length} {paquetes.length === 1 ? 'paquete disponible' : 'paquetes disponibles'}
          </p>
        </div>
        <BotonPrimario onClick={abrirCreacion}>
          <IconoMas className="size-4" />
          Nuevo paquete
        </BotonPrimario>
      </div>

      <Modal
        abierto={mostrarFormulario}
        onCerrar={cerrarFormulario}
        titulo={editandoId ? 'Editar paquete' : 'Nuevo paquete'}
        icono={IconoCubo}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <InputField id="nombre" label="Nombre" name="nombre" value={form.nombre} onChange={handleChange} required />

          <div>
            <div className="grid grid-cols-2 gap-4">
              <InputField
                id="duracionMinutos"
                label="Duración: minutos"
                name="duracionMinutos"
                type="number"
                step="5"
                min="0"
                placeholder="45"
                value={form.duracionMinutos}
                onChange={handleChange}
              />
              <InputField
                id="duracionHoras"
                label="+ horas (opcional)"
                name="duracionHoras"
                type="number"
                step="1"
                min="0"
                placeholder="0"
                value={form.duracionHoras}
                onChange={handleChange}
              />
            </div>
            <p className="mt-1 text-xs text-slate-400">
              {formatearDuracion(duracionADecimal(form.duracionHoras, form.duracionMinutos))
                ? `= ${formatearDuracion(duracionADecimal(form.duracionHoras, form.duracionMinutos))}`
                : 'La mayoría de paquetes solo necesitan minutos. Usa "horas" solo si contratan por horas completas.'}
            </p>
          </div>

          <InputField
            id="precio"
            label="Precio (en pesos colombianos, sin puntos ni comas)"
            name="precio"
            type="number"
            step="1000"
            min="0"
            placeholder="300000"
            value={form.precio}
            onChange={handleChange}
            required
          />

          <InputField
            id="descripcion"
            label="Descripción"
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
          />

          <div>
            <label htmlFor="incluye" className="mb-2 block text-sm font-semibold text-slate-100">
              Qué incluye
            </label>
            <textarea
              id="incluye"
              name="incluye"
              rows={4}
              placeholder={'Un ítem por línea, por ejemplo:\n8 músicos\nSonido profesional\nMC/Animador'}
              value={form.incluye}
              onChange={handleChange}
              className="w-full rounded-lg border border-white/5 bg-slate-800/60 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-500/60 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            />
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

      {paquetes.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-400">No hay paquetes creados</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {paquetes.map((paquete) => {
            const popular = paquete.id === idPopular && conteoPorPaquete[idPopular] > 0
            return (
              <div
                key={paquete.id}
                className={`relative flex flex-col rounded-xl border p-6 ${
                  popular ? 'border-amber-500/60 bg-amber-500/5 ring-1 ring-amber-500/30' : 'border-white/5 bg-slate-900/60'
                }`}
              >
                {popular && (
                  <span className="absolute -top-3 right-6 inline-flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-950">
                    <IconoEstrella className="size-3" />
                    Popular
                  </span>
                )}

                <h3 className="text-lg font-bold text-white">{paquete.nombre}</h3>
                {paquete.descripcion && <p className="mt-1 text-sm text-slate-400">{paquete.descripcion}</p>}

                <div className="mt-4 flex items-end gap-2">
                  <span className="text-2xl font-bold text-amber-400">{formatearPrecio(paquete.precio)}</span>
                  {formatearDuracion(paquete.duracion_horas) && (
                    <span className="mb-0.5 rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
                      {formatearDuracion(paquete.duracion_horas)}
                    </span>
                  )}
                </div>

                {itemsDeIncluye(paquete.incluye).length > 0 && (
                  <div className="mt-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Incluye</p>
                    <ul className="mt-2 space-y-1.5">
                      {itemsDeIncluye(paquete.incluye).map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                          <IconoCheck className="mt-0.5 size-4 shrink-0 text-emerald-400" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-6 flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setVerDetalleId(paquete.id)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-200 ring-1 ring-white/10 transition hover:bg-white/5"
                  >
                    <IconoOjo className="size-4" />
                    Ver detalle
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEditar(paquete)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-200 ring-1 ring-white/10 transition hover:bg-white/5"
                  >
                    <IconoLapiz className="size-4" />
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEliminar(paquete.id)}
                    aria-label="Eliminar paquete"
                    className="flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-400 ring-1 ring-white/10 transition hover:bg-red-500/10 hover:text-red-400"
                  >
                    <IconoBasura className="size-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <PaqueteDetalleModal
        paquete={paquetes.find((p) => p.id === verDetalleId) ?? null}
        eventos={eventos}
        onCerrar={() => setVerDetalleId(null)}
        onEditar={(paquete) => {
          setVerDetalleId(null)
          handleEditar(paquete)
        }}
      />
    </div>
  )
}
