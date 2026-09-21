import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'

const AuthContext = createContext(null)

export function useAuth() {
  return useContext(AuthContext)
}

async function obtenerRol(userId) {
  if (!userId) return null

  const { data } = await supabase
    .from('perfiles')
    .select('rol')
    .eq('id', userId)
    .single()

  return data?.rol ?? 'operador'
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [rol, setRol] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null)
      setRol(await obtenerRol(session?.user?.id))
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      setRol(await obtenerRol(session?.user?.id))
    })

    return () => subscription.unsubscribe()
  }, [])

  const value = {
    user,
    rol,
    loading,
    signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
    signOut: () => supabase.auth.signOut(),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
