import { supabase } from './supabaseClient'

export const eventosService = {
  async listar() {
    const { data, error } = await supabase.from('eventos').select('*')
    if (error) throw error
    return data
  },

  async obtenerPorId(id) {
    const { data, error } = await supabase.from('eventos').select('*').eq('id', id).single()
    if (error) throw error
    return data
  },

  async crear(evento) {
    const { data, error } = await supabase.from('eventos').insert(evento).select().single()
    if (error) throw error
    return data
  },

  async actualizar(id, updates) {
    const { data, error } = await supabase.from('eventos').update(updates).eq('id', id).select().single()
    if (error) throw error
    return data
  },

  async eliminar(id) {
    const { error } = await supabase.from('eventos').delete().eq('id', id)
    if (error) throw error
  },
}
