import express from 'express'
import cors from 'cors'
import eventosRoutes from './routes/eventosRoutes.js'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/eventos', eventosRoutes)

export default app