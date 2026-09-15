import { supabase } from '../config/supabaseClient.js'

export async function verificarAuth(req, res, next) {
  const authHeader = req.get('authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) {
    return res.status(401).json({ error: 'No autorizado' })
  }

  try {
    const { data, error } = await supabase.auth.getUser(token)

    if (error || !data.user) {
      return res.status(401).json({ error: 'No autorizado' })
    }

    req.usuario = data.user
    next()
  } catch (error) {
    return res.status(401).json({ error: 'No autorizado' })
  }
}