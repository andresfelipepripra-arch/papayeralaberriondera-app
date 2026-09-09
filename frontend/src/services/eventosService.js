import api from './api'

export async function getEventos() {
  try {
    const { data } = await api.get('/eventos')
    return data
  } catch (error) {
    throw error
  }
}

export async function getEventoPorId(id) {
  try {
    const { data } = await api.get(`/eventos/${id}`)
    return data
  } catch (error) {
    throw error
  }
}

export async function crearEvento(datos) {
  try {
    const { data } = await api.post('/eventos', datos)
    return data
  } catch (error) {
    throw error
  }
}

export async function actualizarEvento(id, datos) {
  try {
    const { data } = await api.put(`/eventos/${id}`, datos)
    return data
  } catch (error) {
    throw error
  }
}

export async function eliminarEvento(id) {
  try {
    await api.delete(`/eventos/${id}`)
  } catch (error) {
    throw error
  }
}