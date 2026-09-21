export function requiereAdmin(req, res, next) {
  if (req.usuario?.rol !== 'admin') {
    return res.status(403).json({ error: 'Requiere rol de administrador' })
  }

  next()
}
