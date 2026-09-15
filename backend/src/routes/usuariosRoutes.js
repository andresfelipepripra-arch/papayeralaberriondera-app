import { Router } from 'express'
import { supabase } from '../config/supabaseClient.js'

const router = Router()

router.post('/', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'email y password son requeridos' })
  }

  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (error) throw new Error(error.message)
    res.status(201).json(data.user)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get('/', async (_req, res) => {
  try {
    const { data, error } = await supabase.auth.admin.listUsers()

    if (error) throw new Error(error.message)

    const usuarios = data.users.map(({ id, email, created_at }) => ({ id, email, created_at }))
    res.json(usuarios)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase.auth.admin.deleteUser(req.params.id)

    if (error) throw new Error(error.message)
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router