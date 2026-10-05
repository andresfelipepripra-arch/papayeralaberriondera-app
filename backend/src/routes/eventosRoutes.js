import { Router } from 'express'
import { supabase } from '../config/supabaseClient.js'

const router = Router()

router.get('/', async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from('eventos')
      .select('*, paquetes(nombre, precio, duracion_horas)')
      .order('fecha', { ascending: true })

    if (error) throw new Error(error.message)
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('eventos')
      .select('*, paquetes(nombre, descripcion, precio, duracion_horas, incluye)')
      .eq('id', req.params.id)
      .single()

    if (error) throw new Error(error.message)
    if (!data) return res.status(404).json({ error: 'Evento no encontrado' })
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.post('/', async (req, res) => {
  if (typeof req.body.nombre_cliente !== 'string' || !req.body.nombre_cliente.trim()) {
    return res.status(400).json({ error: 'El nombre del cliente es obligatorio' })
  }

  try {
    const { data, error } = await supabase
      .from('eventos')
      .insert(req.body)
      .select()
      .single()

    if (error) throw new Error(error.message)
    res.status(201).json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('eventos')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('eventos')
      .delete()
      .eq('id', req.params.id)

    if (error) throw new Error(error.message)
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router