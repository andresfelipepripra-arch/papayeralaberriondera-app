import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useConfiguracion } from '../context/ConfiguracionContext'
import { actualizarConfiguracion, getConfiguracion } from '../services/configuracionService'
import { formatearPrecio } from '../utils/formatters'
import Panel from '../components/ui/Panel'
import BotonPrimario from '../components/ui/BotonPrimario'
import logo from '../assets/logo-papayera.png'

const vacio = { nombre_negocio: '', ganancia_por_evento: '' }

const estiloCampo =
  'w-full rounded-lg border border-white/5 bg-slate-800/60 px-4 py-3.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-500/60 focus:outline-none focus:ring-2 focus:ring-amber-500/30'
const estiloLabel = 'mb-2 block text-sm font-semibold text-slate-100'

function aFormulario(configuracion) {
  return {
    nombre_negocio: configuracion.nombre_negocio ?? '',
    ganancia_por_evento: String(configuracion.ganancia_por_evento ?? 70000),
  }
}

export default function Configuracion() {
  const { setConfiguracion } = useConfiguracion()
  const [form, setForm] = useState(vacio)
  const [loading, setLoading] = useState(true)
  const [errorCarga, setErrorCarga] = useState(false)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await getConfiguracion()
        setForm(aFormulario(data))
      } catch (err) {
        console.error(err)
        toast.error('Error al cargar la configuración')
        setErrorCarga(true)
      } finally {
        setLoading(false)
      }
    }

    cargar()
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.nombre_negocio.trim()) {
      toast.error('El nombre del negocio es obligatorio')
      return
    }

    const ganancia = Number(form.ganancia_por_evento)
    if (form.ganancia_por_evento === '' || !Number.isFinite(ganancia) || ganancia < 0) {
      toast.error('La ganancia por evento debe ser un número mayor o igual a 0')
      return
    }

    setGuardando(true)
    try {
      const data = await actualizarConfiguracion({
        nombre_negocio: form.nombre_negocio,
        ganancia_por_evento: ganancia,
      })
      setConfiguracion(data)
      setForm(aFormulario(data))
      toast.success('Configuración actualizada')
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.error || 'Error al guardar la configuración')
    } finally {
      setGuardando(false)
    }
  }

  if (loading) return <p className="text-slate-400">Cargando configuración...</p>
  if (errorCarga) return <p className="text-red-400">No se pudo cargar la configuración</p>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-white">Configuración</h1>
        <p className="mt-1 text-sm text-slate-400">Datos del negocio que aparecen en el sistema</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Panel titulo="Datos del negocio" subtitulo="Nombre principal con el que se identifica el negocio">
            <div>
              <label htmlFor="nombre_negocio" className={estiloLabel}>
                Nombre del negocio
              </label>
              <input
                id="nombre_negocio"
                name="nombre_negocio"
                type="text"
                value={form.nombre_negocio}
                onChange={handleChange}
                required
                placeholder="Papayera La Berriondera"
                className={estiloCampo}
              />
            </div>
          </Panel>

          <Panel
            titulo="Ganancia por evento"
            subtitulo="Ganancia por defecto de la papayera en cada evento. Cada evento puede tener su propio valor al crearlo o editarlo."
          >
            <div className="max-w-sm">
              <label htmlFor="ganancia_por_evento" className={estiloLabel}>
                Ganancia por evento (COP)
              </label>
              <input
                id="ganancia_por_evento"
                name="ganancia_por_evento"
                type="number"
                step="1000"
                min="0"
                value={form.ganancia_por_evento}
                onChange={handleChange}
                placeholder="70000"
                className={estiloCampo}
              />
              <p className="mt-1 text-xs text-slate-400">
                Se aplica igual sin importar si el evento termina costando más. Vista: {formatearPrecio(form.ganancia_por_evento)}
              </p>
            </div>
          </Panel>

          <div className="flex justify-end">
            <BotonPrimario type="submit" disabled={guardando}>
              {guardando ? 'Guardando...' : 'Guardar cambios'}
            </BotonPrimario>
          </div>
        </div>

        <Panel titulo="Vista previa" subtitulo="Así se verá el negocio en el sistema">
          <div className="flex flex-col items-center text-center">
            <img src={logo} alt="Logo de Papayera La Berriondera" className="size-40 rounded-full object-cover" />
            <p className="mt-5 font-serif text-xl font-bold text-white">
              {form.nombre_negocio.trim() || 'Nombre del negocio'}
            </p>
          </div>
        </Panel>
      </form>
    </div>
  )
}
