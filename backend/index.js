import 'dotenv/config'
import app from './src/app.js'
import { iniciarRecordatorioJob } from './src/jobs/recordatorioJob.js'

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`)
})

iniciarRecordatorioJob()