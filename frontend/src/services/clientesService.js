import api from './api'

export const clientesService = {
  async getTodos() {
    try {
      const { data } = await api.get('/clientes')
      return data
    } catch (error) {
      throw error
    }
  },

  async getPorId(id) {
    try {
      const { data } = await api.get(`/clientes/${id}`)
      return data
    } catch (error) {
      throw error
    }
  },

  async crear(datos) {
    try {
      const { data } = await api.post('/clientes', datos)
      return data
    } catch (error) {
      throw error
    }
  },

  async actualizar(id, datos) {
    try {
      const { data } = await api.put(`/clientes/${id}`, datos)
      return data
    } catch (error) {
      throw error
    }
  },

  async eliminar(id) {
    try {
      await api.delete(`/clientes/${id}`)
    } catch (error) {
      throw error
    }
  },
}