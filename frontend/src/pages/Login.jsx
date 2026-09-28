import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import InputField from '../components/ui/InputField'
import BotonPrimario from '../components/ui/BotonPrimario'
import {
  IconoCandado,
  IconoCorreo,
  IconoEscudo,
  IconoFlecha,
  IconoNotaMusical,
  IconoOjo,
  IconoOjoTachado,
} from '../components/ui/Iconos'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await signIn(email, password)
      navigate('/', { replace: true })
    } catch (err) {
      toast.error(err.message || 'No se pudo iniciar sesión')
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-950 px-4 py-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(79,70,229,0.22),transparent_55%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 size-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 size-[920px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-white/5"
      />

      <div className="relative w-full max-w-[480px] overflow-hidden rounded-xl border border-white/5 bg-slate-900/80 px-10 py-10 shadow-2xl shadow-black/40 backdrop-blur">
        <div
          aria-hidden="true"
          className="absolute inset-x-12 top-0 h-px bg-linear-to-r from-transparent via-amber-500 to-transparent"
        />

        <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-xl border border-white/10 bg-slate-950 shadow-[0_0_30px_rgba(245,158,11,0.25)]">
          <IconoNotaMusical className="size-8 text-amber-500" />
        </div>

        <span className="mx-auto mb-4 flex w-fit items-center gap-2 rounded-full bg-slate-800/80 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-amber-400">
          <span className="size-1.5 rounded-full bg-amber-500" />
          Consola Central
        </span>

        <h1 className="text-center text-3xl font-bold tracking-tight text-white">Papayera Pro Admin</h1>
        <p className="mt-2 text-center text-sm text-slate-300">
          Plataforma de Gestión y Coordinación Musical
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <InputField
            id="email"
            label="Correo Electrónico"
            icono={IconoCorreo}
            type="email"
            placeholder="director@papayerapro.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <InputField
            id="password"
            label="Contraseña"
            icono={IconoCandado}
            type={mostrarPassword ? 'text' : 'password'}
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            derecha={
              <button
                type="button"
                onClick={() => setMostrarPassword((visible) => !visible)}
                aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                className="text-slate-300 transition hover:text-white"
              >
                {mostrarPassword ? <IconoOjoTachado className="size-5" /> : <IconoOjo className="size-5" />}
              </button>
            }
          />

          <div className="flex items-center justify-between text-xs font-medium">
            <label className="flex cursor-pointer items-center gap-2 text-slate-200">
              <input type="checkbox" className="size-4 rounded accent-amber-500" />
              Recordarme
            </label>
            <button type="button" className="text-amber-500 transition hover:text-amber-400">
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <BotonPrimario type="submit" disabled={loading} className="w-full">
            {loading ? (
              'Iniciando sesión...'
            ) : (
              <>
                Iniciar Sesión
                <IconoFlecha className="size-4" />
              </>
            )}
          </BotonPrimario>
        </form>
      </div>

      <p className="relative mt-8 flex items-center gap-2 text-xs font-medium text-slate-400">
        <IconoEscudo className="size-4 text-amber-500" />
        Acceso exclusivo para directores y administradores
      </p>
    </div>
  )
}
