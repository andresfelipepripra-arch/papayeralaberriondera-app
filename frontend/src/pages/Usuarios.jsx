import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import {
  actualizarModulosUsuario,
  cambiarRolUsuario,
  crearUsuario,
  eliminarUsuario,
  getUsuarios,
} from '../services/usuariosService'
import { useAuth } from '../context/AuthContext'
import { formatearFechaHora } from '../utils/formatters'
import { colorAvatar, inicialesDe } from '../utils/avatar'
import { MODULOS_DISPONIBLES, TODOS_LOS_MODULOS } from '../utils/modulos'
import Modal from '../components/ui/Modal'
import ConfirmarEliminacion from '../components/ui/ConfirmarEliminacion'
import InputField from '../components/ui/InputField'
import BotonPrimario from '../components/ui/BotonPrimario'
import { IconoBasura, IconoCuadricula, IconoEscudo, IconoMas } from '../components/ui/Iconos'

const vacio = { email: '', password: '', rol: 'musico', modulos: TODOS_LOS_MODULOS }

function alternarModulo(modulos, clave) {
  return modulos.includes(clave) ? modulos.filter((m) => m !== clave) : [...modulos, clave]
}

function SelectorModulos({ modulos, onCambiar }) {
  return (
    <div className="flex flex-wrap gap-2">
      {MODULOS_DISPONIBLES.map(({ clave, etiqueta }) => {
        const activo = modulos.includes(clave)
        return (
          <button
            key={clave}
            type="button"
            onClick={() => onCambiar(alternarModulo(modulos, clave))}
            className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
              activo
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-800/60 text-slate-300 ring-1 ring-white/10 hover:bg-white/5'
            }`}
          >
            {etiqueta}
          </button>
        )
      })}
    </div>
  )
}

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [form, setForm] = useState(vacio)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [aEliminar, setAEliminar] = useState(null)
  const [eliminando, setEliminando] = useState(false)
  const [editandoModulos, setEditandoModulos] = useState(null)
  const [guardandoModulos, setGuardandoModulos] = useState(false)
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
      await crearUsuario({
        email: form.email,
        password: form.password,
        rol: form.rol,
        modulos: form.rol === 'admin' ? TODOS_LOS_MODULOS : form.modulos,
      })
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

  const guardarModulos = async () => {
    setGuardandoModulos(true)
    try {
      await actualizarModulosUsuario(editandoModulos.id, editandoModulos.modulos)
      setUsuarios((prev) => prev.map((u) => (u.id === editandoModulos.id ? { ...u, modulos: editandoModulos.modulos } : u)))
      toast.success('Módulos actualizados')
      setEditandoModulos(null)
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.error || 'Error al actualizar los módulos')
    } finally {
      setGuardandoModulos(false)
    }
  }

  const confirmarEliminar = async () => {
    const { id } = aEliminar
    setEliminando(true)
    try {
      await eliminarUsuario(id)
      setUsuarios((prev) => prev.filter((u) => u.id !== id))
      toast.success('Usuario eliminado')
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.error || 'Error al eliminar el usuario')
    } finally {
      setEliminando(false)
      setAEliminar(null)
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
                {[
                  { valor: 'musico', etiqueta: 'Músico' },
                  { valor: 'admin', etiqueta: 'Administrador' },
                ].map(({ valor, etiqueta }) => (
                  <button
                    key={valor}
                    type="button"
                    onClick={() => setForm({ ...form, rol: valor })}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                      form.rol === valor
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-800/60 text-slate-300 ring-1 ring-white/10 hover:bg-white/5'
                    }`}
                  >
                    {etiqueta}
                  </button>
                ))}
              </div>
            </div>

            {form.rol === 'admin' ? (
              <p className="text-xs text-slate-400">Un administrador ve todos los módulos del sistema.</p>
            ) : (
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-100">Módulos que puede ver</label>
                <SelectorModulos modulos={form.modulos} onCambiar={(modulos) => setForm({ ...form, modulos })} />
              </div>
            )}

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

                {usuario.rol !== 'admin' && (
                  <button
                    type="button"
                    onClick={() => setEditandoModulos(usuario)}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-300 ring-1 ring-white/10 transition hover:bg-white/5"
                  >
                    <IconoCuadricula className="size-3.5" />
                    Módulos ({usuario.modulos?.length ?? 0}/{TODOS_LOS_MODULOS.length})
                  </button>
                )}

                {esAdmin && !esTuPropioUsuario ? (
                  <select
                    value={usuario.rol}
                    onChange={(e) => handleCambiarRol(usuario, e.target.value)}
                    className="rounded-lg border border-white/5 bg-slate-800/60 px-3 py-1.5 text-xs font-semibold text-slate-100 focus:border-amber-500/60 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  >
                    <option value="musico">Músico</option>
                    <option value="admin">Administrador</option>
                  </select>
                ) : (
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      usuario.rol === 'admin' ? 'bg-amber-500/15 text-amber-400' : 'bg-slate-500/15 text-slate-300'
                    }`}
                  >
                    <IconoEscudo className="size-3.5" />
                    {usuario.rol === 'admin' ? 'Administrador' : 'Músico'}
                  </span>
                )}

                {esAdmin && (
                  <button
                    type="button"
                    onClick={() => setAEliminar(usuario)}
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

      <Modal
        abierto={Boolean(editandoModulos)}
        onCerrar={() => setEditandoModulos(null)}
        titulo="Módulos del usuario"
        subtitulo={editandoModulos?.email}
        icono={IconoCuadricula}
      >
        {editandoModulos && (
          <div className="space-y-6">
            <SelectorModulos
              modulos={editandoModulos.modulos ?? []}
              onCambiar={(modulos) => setEditandoModulos({ ...editandoModulos, modulos })}
            />
            <div className="flex gap-3 pt-2">
              <BotonPrimario type="button" onClick={guardarModulos} disabled={guardandoModulos}>
                {guardandoModulos ? 'Guardando...' : 'Guardar'}
              </BotonPrimario>
              <button
                type="button"
                onClick={() => setEditandoModulos(null)}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-300 ring-1 ring-white/10 transition hover:bg-white/5"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmarEliminacion
        abierto={Boolean(aEliminar)}
        titulo="Eliminar usuario"
        nombre={aEliminar?.email ?? ''}
        consecuencia="Esta persona perderá el acceso al panel de inmediato."
        onCerrar={() => setAEliminar(null)}
        onConfirmar={confirmarEliminar}
        cargando={eliminando}
      />
    </div>
  )
}
