import { supabase } from './supabaseClient'

export const paquetesService = {
  async listar() {
    const { data, error } = await supabase.from('paquetes').select('*')
    if (error) throw error
    return data
  },

  async obtenerPorId(id) {
    const { data, error } = await supabase.from('paquetes').select('*').eq('id', id).single()
    if (error) throw error
    return data
  },

  async crear(paquete) {
    const { data, error } = await supabase.from('paquetes').insert(paquete).select().single()
    if (error) throw error
    return data
  },

  async actualizar(id, updates) {
    const { data, error } = await supabase.from('paquetes').update(updates).eq('id', id).select().single()
    if (error) throw error
    return data
  },

  async eliminar(id) {
    const { error } = await supabase.from('paquetes').delete().eq('id', id)
    if (error) throw error
  },
}
