import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { cambiarRolUsuario, crearUsuario, eliminarUsuario, getUsuarios } from '../services/usuariosService'
import { useAuth } from '../context/AuthContext'
import { formatearFechaHora } from '../utils/formatters'
import { colorAvatar, inicialesDe } from '../utils/avatar'
import Modal from '../components/ui/Modal'
import InputField from '../components/ui/InputField'
import BotonPrimario from '../components/ui/BotonPrimario'
import { IconoBasura, IconoEscudo, IconoMas } from '../components/ui/Iconos'

const vacio = { email: '', password: '', rol: 'operador' }

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [form, setForm] = useState(vacio)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const { user, rol: rolPropio } = useAuth()
  const esAdmin = rolPropio === 'admin'

  const cargar = async () => {
    setLoading(true)
    try {
      const data = await getUsuarios()
      setUsuarios(data)
    } catch (err) {
      console.error(err)
      toast.error('Error al cargar los usuarios')
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

  const handleCrear = async (e) => {
    e.preventDefault()
    if (guardando) return

    setGuardando(true)
    try {
      await crearUsuario(form)
      toast.success(`Usuario creado: ${form.email}`)
      setForm(vacio)
      setMostrarFormulario(false)
      await cargar()
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.error || 'Error al crear el usuario')
    } finally {
      setGuardando(false)
    }
  }

  const handleCambiarRol = async (usuario, nuevoRol) => {
    if (nuevoRol === usuario.rol) return
    try {
      await cambiarRolUsuario(usuario.id, nuevoRol)
      setUsuarios((prev) => prev.map((u) => (u.id === usuario.id ? { ...u, rol: nuevoRol } : u)))
      toast.success('Rol actualizado')
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.error || 'Error al cambiar el rol')
    }
  }

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar este usuario?')) return
    try {
      await eliminarUsuario(id)
      setUsuarios((prev) => prev.filter((u) => u.id !== id))
      toast.success('Usuario eliminado')
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.error || 'Error al eliminar el usuario')
    }
  }

  if (loading) return <p className="text-slate-400">Cargando usuarios...</p>

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-white">Usuarios</h1>
          <p className="mt-1 text-sm text-slate-400">
            {usuarios.length} {usuarios.length === 1 ? 'usuario con acceso' : 'usuarios con acceso'} al panel
          </p>
        </div>
        {esAdmin && (
          <BotonPrimario onClick={() => setMostrarFormulario(true)}>
            <IconoMas className="size-4" />
            Nuevo usuario
          </BotonPrimario>
        )}
      </div>

      {esAdmin && (
        <Modal
          abierto={mostrarFormulario}
          onCerrar={() => {
            setMostrarFormulario(false)
            setForm(vacio)
          }}
          titulo="Nuevo usuario"
          subtitulo="Se crea directamente activo, sin registro público"
          icono={IconoEscudo}
        >
          <form onSubmit={handleCrear} className="space-y-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <InputField
                id="email"
                label="Correo"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
              />
              <InputField
                id="password"
                label="Contraseña"
                name="password"
                type="password"
                minLength={6}
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-100">Rol</label>
              <div className="flex gap-2">
                {['operador', 'admin'].map((opcion) => (
                  <button
                    key={opcion}
                    type="button"
                    onClick={() => setForm({ ...form, rol: opcion })}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold capitalize transition ${
                      form.rol === opcion
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-800/60 text-slate-300 ring-1 ring-white/10 hover:bg-white/5'
                    }`}
                  >
                    {opcion}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <BotonPrimario type="submit" disabled={guardando}>
                {guardando ? 'Creando...' : 'Crear usuario'}
              </BotonPrimario>
              <button
                type="button"
                onClick={() => {
                  setMostrarFormulario(false)
                  setForm(vacio)
                }}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-300 ring-1 ring-white/10 transition hover:bg-white/5"
              >
                Cancelar
              </button>
            </div>
          </form>
        </Modal>
      )}

      {usuarios.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-400">No hay usuarios registrados</p>
      ) : (
        <div className="divide-y divide-white/5 overflow-hidden rounded-xl border border-white/5 bg-slate-900/60">
          {usuarios.map((usuario) => {
            const esTuPropioUsuario = usuario.id === user?.id
            return (
              <div key={usuario.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                <span
                  className={`flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${colorAvatar(usuario.email)}`}
                >
                  {inicialesDe(usuario.email.split('@')[0].replace(/[._]/g, ' '))}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-white">
                    {usuario.email}
                    {esTuPropioUsuario && <span className="ml-2 text-xs font-normal text-slate-500">(tú)</span>}
                  </p>
                  <p className="text-xs text-slate-400">Creado {formatearFechaHora(usuario.created_at)}</p>
                </div>

                {esAdmin && !esTuPropioUsuario ? (
                  <select
                    value={usuario.rol}
                    onChange={(e) => handleCambiarRol(usuario, e.target.value)}
                    className="rounded-lg border border-white/5 bg-slate-800/60 px-3 py-1.5 text-xs font-semibold capitalize text-slate-100 focus:border-amber-500/60 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  >
                    <option value="operador">Operador</option>
                    <option value="admin">Admin</option>
                  </select>
                ) : (
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                      usuario.rol === 'admin' ? 'bg-amber-500/15 text-amber-400' : 'bg-slate-500/15 text-slate-300'
                    }`}
                  >
                    <IconoEscudo className="size-3.5" />
                    {usuario.rol}
                  </span>
                )}

                {esAdmin && (
                  <button
                    type="button"
                    onClick={() => handleEliminar(usuario.id)}
                    disabled={esTuPropioUsuario}
                    aria-label="Eliminar usuario"
                    className="flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-400 ring-1 ring-white/10 transition hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                  >
                    <IconoBasura className="size-4" />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
