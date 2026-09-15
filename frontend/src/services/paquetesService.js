import api from './api'

export const paquetesService = {
  async getTodos() {
    try {
      const { data } = await api.get('/paquetes')
      return data
    } catch (error) {
      throw error
    }
  },

  async getPorId(id) {
    try {
      const { data } = await api.get(`/paquetes/${id}`)
      return data
    } catch (error) {
      throw error
    }
  },

  async crear(datos) {
    try {
      const { data } = await api.post('/paquetes', datos)
      return data
    } catch (error) {
      throw error
    }
  },

  async actualizar(id, datos) {
    try {
      const { data } = await api.put(`/paquetes/${id}`, datos)
      return data
    } catch (error) {
      throw error
    }
  },

  async eliminar(id) {
    try {
      await api.delete(`/paquetes/${id}`)
    } catch (error) {
      throw error
    }
  },
}