import { supabase } from './supabaseClient'

export const clientesService = {
  async listar() {
    const { data, error } = await supabase.from('clientes').select('*')
    if (error) throw error
    return data
  },

  async obtenerPorId(id) {
    const { data, error } = await supabase.from('clientes').select('*').eq('id', id).single()
    if (error) throw error
    return data
  },

  async crear(cliente) {
    const { data, error } = await supabase.from('clientes').insert(cliente).select().single()
    if (error) throw error
    return data
  },

  async actualizar(id, updates) {
    const { data, error } = await supabase.from('clientes').update(updates).eq('id', id).select().single()
    if (error) throw error
    return data
  },

  async eliminar(id) {
    const { error } = await supabase.from('clientes').delete().eq('id', id)
    if (error) throw error
  },
}
