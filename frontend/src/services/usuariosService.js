import api from './api'

export async function getUsuarios() {
  try {
    const { data } = await api.get('/usuarios')
    return data
  } catch (error) {
    throw error
  }
}

export async function crearUsuario(datos) {
  try {
    const { data } = await api.post('/usuarios', datos)
    return data
  } catch (error) {
    throw error
  }
}

export async function eliminarUsuario(id) {
  try {
    await api.delete(`/usuarios/${id}`)
  } catch (error) {
    throw error
  }
}

export async function cambiarRolUsuario(id, rol) {
  try {
    const { data } = await api.put(`/usuarios/${id}/rol`, { rol })
    return data
  } catch (error) {
    throw error
  }
}

export async function actualizarModulosUsuario(id, modulos) {
  try {
    const { data } = await api.put(`/usuarios/${id}/modulos`, { modulos })
    return data
  } catch (error) {
    throw error
  }
}