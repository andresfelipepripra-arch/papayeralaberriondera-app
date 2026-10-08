import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'
import { TODOS_LOS_MODULOS } from '../utils/modulos'

const AuthContext = createContext(null)

export function useAuth() {
  return useContext(AuthContext)
}

async function obtenerPerfil(userId) {
  if (!userId) return { rol: null, modulos: TODOS_LOS_MODULOS }

  const { data } = await supabase
    .from('perfiles')
    .select('rol, modulos')
    .eq('id', userId)
    .single()

  return { rol: data?.rol ?? 'musico', modulos: data?.modulos ?? TODOS_LOS_MODULOS }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [rol, setRol] = useState(null)
  const [modulos, setModulos] = useState(TODOS_LOS_MODULOS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const aplicarPerfil = async (session) => {
      setUser(session?.user ?? null)
      const perfil = await obtenerPerfil(session?.user?.id)
      setRol(perfil.rol)
      setModulos(perfil.modulos)
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      await aplicarPerfil(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      await aplicarPerfil(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const value = {
    user,
    rol,
    modulos,
    loading,
    signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
    signOut: () => supabase.auth.signOut(),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
