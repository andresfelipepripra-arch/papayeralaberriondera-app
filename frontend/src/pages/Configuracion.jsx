import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useConfiguracion } from '../context/ConfiguracionContext'
import { actualizarConfiguracion, getConfiguracion } from '../services/configuracionService'

const vacio = { nombre_negocio: '', telefono: '', correo_contacto: '', logo_url: '' }

function aFormulario(configuracion) {
  return {
    nombre_negocio: configuracion.nombre_negocio ?? '',
    telefono: configuracion.telefono ?? '',
    correo_contacto: configuracion.correo_contacto ?? '',
    logo_url: configuracion.logo_url ?? '',
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

    setGuardando(true)
    try {
      const data = await actualizarConfiguracion(form)
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

  if (loading) return <p>Cargando configuración...</p>
  if (errorCarga) return <p>No se pudo cargar la configuración</p>

  return (
    <div style={{ maxWidth: 600 }}>
      <h2>Configuración del negocio</h2>

      <form onSubmit={handleSubmit} noValidate>
        <div style={{ marginBottom: '12px' }}>
          <label htmlFor="nombre_negocio">Nombre del negocio</label>
          <br />
          <input
            id="nombre_negocio"
            name="nombre_negocio"
            type="text"
            value={form.nombre_negocio}
            onChange={handleChange}
            style={estiloInput}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label htmlFor="telefono">Teléfono</label>
          <br />
          <input
            id="telefono"
            name="telefono"
            type="tel"
            value={form.telefono}
            onChange={handleChange}
            style={estiloInput}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label htmlFor="correo_contacto">Correo de contacto</label>
          <br />
          <input
            id="correo_contacto"
            name="correo_contacto"
            type="email"
            value={form.correo_contacto}
            onChange={handleChange}
            style={estiloInput}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label htmlFor="logo_url">URL del logo</label>
          <br />
          <input
            id="logo_url"
            name="logo_url"
            type="url"
            placeholder="https://..."
            value={form.logo_url}
            onChange={handleChange}
            style={estiloInput}
          />
        </div>

        <button type="submit" disabled={guardando}>
          {guardando ? 'Guardando...' : 'Guardar'}
        </button>
      </form>
    </div>
  )
}

const estiloInput = { width: '100%', padding: '8px', boxSizing: 'border-box' }
