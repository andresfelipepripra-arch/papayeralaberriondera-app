import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import { getConfiguracion } from '../services/configuracionService'

const ConfiguracionContext = createContext(null)

export function useConfiguracion() {
  return useContext(ConfiguracionContext)
}

export function ConfiguracionProvider({ children }) {
  const { user } = useAuth()
  const userId = user?.id
  const [configuracion, setConfiguracion] = useState(null)

  useEffect(() => {
    if (!userId) {
      setConfiguracion(null)
      return
    }

    let cancelado = false

    getConfiguracion()
      .then((data) => {
        if (!cancelado) setConfiguracion(data)
      })
      .catch((err) => console.error(err))

    return () => {
      cancelado = true
    }
  }, [userId])

  return (
    <ConfiguracionContext.Provider value={{ configuracion, setConfiguracion }}>
      {children}
    </ConfiguracionContext.Provider>
  )
}
