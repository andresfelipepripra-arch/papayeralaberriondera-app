import api from './api'

export async function getConfiguracion() {
  const { data } = await api.get('/configuracion')
  return data
}

export async function actualizarConfiguracion(datos) {
  const { data } = await api.put('/configuracion', datos)
  return data
}

export async function getVistaPreviaCorreo(tipo) {
  const { data } = await api.get('/configuracion/vista-previa', { params: { tipo } })
  return data
}

export async function getHistorialCorreos() {
  const { data } = await api.get('/configuracion/historial-correos')
  return data
}
