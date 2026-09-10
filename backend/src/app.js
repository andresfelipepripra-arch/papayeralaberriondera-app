import express from 'express'
import cors from 'cors'
import eventosRoutes from './routes/eventosRoutes.js'
import jobsRoutes from './routes/jobsRoutes.js'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/eventos', eventosRoutes)
app.use('/jobs', jobsRoutes)

export default app