import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth'
import turnosRoutes from './routes/turnos'
import { sseHandler } from './sse'
import { poolPromise } from './db'

dotenv.config()
const app = express()
app.use(cors())
app.use(express.json())

app.use('/auth', authRoutes)
app.use('/api', turnosRoutes)

// SSE endpoint for display or other subscribers
app.get('/events', sseHandler)

const PORT = process.env.PORT || 4000

// simple health
app.get('/health', (req,res)=>res.json({ok:true}))

app.listen(PORT, async ()=>{
  // Try connect to DB to warn early
  try{
    await poolPromise
    console.log('DB connected')
  }catch(err){
    console.warn('DB connection failed, check env vars')
  }
  console.log(`Server running on http://localhost:${PORT}`)
})
