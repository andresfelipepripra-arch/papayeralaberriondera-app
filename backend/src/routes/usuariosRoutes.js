import { Router } from 'express'
import { supabase } from '../config/supabaseClient.js'
import { requiereAdmin } from '../middleware/requiereAdmin.js'

const router = Router()
const ROLES_VALIDOS = ['admin', 'musico']
const MODULOS_VALIDOS = ['dashboard', 'calendario', 'eventos', 'paquetes']

function modulosValidos(modulos) {
  return Array.isArray(modulos) && modulos.every((m) => MODULOS_VALIDOS.includes(m))
}

router.post('/', requiereAdmin, async (req, res) => {
  const { email, password, rol, modulos } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'email y password son requeridos' })
  }
  if (rol && !ROLES_VALIDOS.includes(rol)) {
    return res.status(400).json({ error: 'rol inválido' })
  }
  if (modulos !== undefined && !modulosValidos(modulos)) {
    return res.status(400).json({ error: 'modulos inválidos' })
  }

  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (error) throw new Error(error.message)

    const { error: errorPerfil } = await supabase
      .from('perfiles')
      .insert({ id: data.user.id, ...(rol && { rol }), ...(modulos !== undefined && { modulos }) })

    if (errorPerfil) throw new Error(errorPerfil.message)

    res.status(201).json({ ...data.user, rol: rol ?? 'musico', modulos: modulos ?? MODULOS_VALIDOS })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get('/', async (_req, res) => {
  try {
    const [{ data, error }, { data: perfiles, error: errorPerfiles }] = await Promise.all([
      supabase.auth.admin.listUsers(),
      supabase.from('perfiles').select('id, rol, modulos'),
    ])

    if (error) throw new Error(error.message)
    if (errorPerfiles) throw new Error(errorPerfiles.message)

    const perfilPorId = Object.fromEntries((perfiles ?? []).map((p) => [p.id, p]))
    const usuarios = data.users.map(({ id, email, created_at }) => ({
      id,
      email,
      created_at,
      rol: perfilPorId[id]?.rol ?? 'musico',
      modulos: perfilPorId[id]?.modulos ?? MODULOS_VALIDOS,
    }))
    res.json(usuarios)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.put('/:id/rol', requiereAdmin, async (req, res) => {
  const { rol } = req.body

  if (!ROLES_VALIDOS.includes(rol)) {
    return res.status(400).json({ error: 'rol inválido' })
  }
  if (req.params.id === req.usuario.id && rol !== 'admin') {
    return res.status(400).json({ error: 'No puedes quitarte tu propio rol de administrador' })
  }

  try {
    const { data, error } = await supabase
      .from('perfiles')
      .update({ rol })
      .eq('id', req.params.id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.put('/:id/modulos', requiereAdmin, async (req, res) => {
  const { modulos } = req.body

  if (!modulosValidos(modulos)) {
    return res.status(400).json({ error: 'modulos inválidos' })
  }

  try {
    const { data, error } = await supabase
      .from('perfiles')
      .update({ modulos })
      .eq('id', req.params.id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.delete('/:id', requiereAdmin, async (req, res) => {
  if (req.params.id === req.usuario.id) {
    return res.status(400).json({ error: 'No puedes eliminar tu propio usuario' })
  }

  try {
    const { error } = await supabase.auth.admin.deleteUser(req.params.id)

    if (error) throw new Error(error.message)
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
