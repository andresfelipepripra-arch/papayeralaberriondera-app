import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const CLAVE_RECORDAR = 'papayera_recordar_sesion'

export function recordarSesionActivado() {
  return localStorage.getItem(CLAVE_RECORDAR) !== 'false'
}

export function establecerRecordarSesion(recordar) {
  localStorage.setItem(CLAVE_RECORDAR, String(recordar))
}

const almacenamientoSesion = {
  getItem: (clave) => localStorage.getItem(clave) ?? sessionStorage.getItem(clave),
  setItem: (clave, valor) => {
    const [destino, otro] = recordarSesionActivado()
      ? [localStorage, sessionStorage]
      : [sessionStorage, localStorage]
    otro.removeItem(clave)
    destino.setItem(clave, valor)
  },
  removeItem: (clave) => {
    localStorage.removeItem(clave)
    sessionStorage.removeItem(clave)
  },
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { storage: almacenamientoSesion },
})
