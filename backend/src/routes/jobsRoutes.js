import { Router } from 'express'
import { ejecutarRecordatorios } from '../jobs/recordatorioJob.js'

const router = Router()

router.post('/recordatorios', async (req, res) => {
  const secret = req.get('x-cron-key')
  if (!secret || secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'No autorizado' })
  }

  try {
    const { enviados } = await ejecutarRecordatorios()
    res.json({ enviados })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router