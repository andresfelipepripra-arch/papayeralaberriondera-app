import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useConfiguracion } from '../context/ConfiguracionContext'
import { actualizarConfiguracion, getConfiguracion } from '../services/configuracionService'
import Panel from '../components/ui/Panel'
import BotonPrimario from '../components/ui/BotonPrimario'
import { IconoCorreo, IconoNotaMusical, IconoTelefono } from '../components/ui/Iconos'
import { formatearPrecio } from '../utils/formatters'

const vacio = { nombre_negocio: '', telefono: '', correo_contacto: '', logo_url: '', ganancia_por_evento: '' }

const estiloCampo =
  'w-full rounded-lg border border-white/5 bg-slate-800/60 px-4 py-3.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-500/60 focus:outline-none focus:ring-2 focus:ring-amber-500/30'
const estiloLabel = 'mb-2 block text-sm font-semibold text-slate-100'

function aFormulario(configuracion) {
  return {
    nombre_negocio: configuracion.nombre_negocio ?? '',
    telefono: configuracion.telefono ?? '',
    correo_contacto: configuracion.correo_contacto ?? '',
    logo_url: configuracion.logo_url ?? '',
    ganancia_por_evento: String(configuracion.ganancia_por_evento ?? 70000),
  }
}

export default function Configuracion() {
  const { setConfiguracion } = useConfiguracion()
  const [form, setForm] = useState(vacio)
  const [loading, setLoading] = useState(true)
  const [errorCarga, setErrorCarga] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [logoRoto, setLogoRoto] = useState('')

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
      const data = await actualizarConfiguracion({ ...form, ganancia_por_evento: ganancia })
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

  const mostrarLogo = form.logo_url && logoRoto !== form.logo_url

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
            subtitulo="Monto fijo que se queda la papayera en cada evento realizado, sin importar el valor final."
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

          <Panel titulo="Contacto" subtitulo="Cómo te pueden contactar tus clientes">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="telefono" className={estiloLabel}>
                  Teléfono
                </label>
                <input
                  id="telefono"
                  name="telefono"
                  type="tel"
                  value={form.telefono}
                  onChange={handleChange}
                  placeholder="300 000 0000"
                  className={estiloCampo}
                />
              </div>

              <div>
                <label htmlFor="correo_contacto" className={estiloLabel}>
                  Correo de contacto
                </label>
                <input
                  id="correo_contacto"
                  name="correo_contacto"
                  type="email"
                  value={form.correo_contacto}
                  onChange={handleChange}
                  placeholder="contacto@negocio.com"
                  className={estiloCampo}
                />
              </div>
            </div>
          </Panel>

          <Panel titulo="Identidad visual" subtitulo="Logo que se muestra en el sistema">
            <div>
              <label htmlFor="logo_url" className={estiloLabel}>
                URL del logo
              </label>
              <input
                id="logo_url"
                name="logo_url"
                type="url"
                value={form.logo_url}
                onChange={handleChange}
                placeholder="https://..."
                className={estiloCampo}
              />
              <p className="mt-1 text-xs text-slate-400">Pega el enlace de una imagen pública (PNG, JPG o SVG).</p>
            </div>
          </Panel>

          <div className="flex justify-end">
            <BotonPrimario type="submit" disabled={guardando}>
              {guardando ? 'Guardando...' : 'Guardar cambios'}
            </BotonPrimario>
          </div>
        </div>

        <Panel titulo="Vista previa" subtitulo="Así se verá la información del negocio">
          <div className="flex flex-col items-center text-center">
            {mostrarLogo ? (
              <img
                src={form.logo_url}
                alt=""
                onError={() => setLogoRoto(form.logo_url)}
                className="size-24 rounded-2xl border border-white/10 bg-slate-950 object-contain p-2"
              />
            ) : (
              <span className="flex size-24 items-center justify-center rounded-2xl border border-white/10 bg-slate-950 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                <IconoNotaMusical className="size-10 text-amber-500" />
              </span>
            )}

            <p className="mt-5 font-serif text-xl font-bold text-white">
              {form.nombre_negocio.trim() || 'Nombre del negocio'}
            </p>
          </div>

          <ul className="mt-6 space-y-3 border-t border-white/5 pt-5 text-sm">
            <li className="flex items-center gap-3 text-slate-300">
              <IconoTelefono className="size-4 shrink-0 text-slate-500" />
              {form.telefono.trim() || <span className="text-slate-500">Sin teléfono</span>}
            </li>
            <li className="flex items-center gap-3 text-slate-300">
              <IconoCorreo className="size-4 shrink-0 text-slate-500" />
              {form.correo_contacto.trim() || <span className="text-slate-500">Sin correo</span>}
            </li>
          </ul>
        </Panel>
      </form>
    </div>
  )
}
