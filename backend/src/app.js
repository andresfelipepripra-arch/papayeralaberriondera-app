import express from 'express'
import cors from 'cors'
import eventosRoutes from './routes/eventosRoutes.js'
import paquetesRoutes from './routes/paquetesRoutes.js'
import clientesRoutes from './routes/clientesRoutes.js'
import usuariosRoutes from './routes/usuariosRoutes.js'
import jobsRoutes from './routes/jobsRoutes.js'
import { verificarAuth } from './middleware/verificarAuth.js'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/eventos', verificarAuth, eventosRoutes)
app.use('/paquetes', verificarAuth, paquetesRoutes)
app.use('/clientes', verificarAuth, clientesRoutes)
app.use('/usuarios', verificarAuth, usuariosRoutes)
app.use('/jobs', jobsRoutes)

export default app