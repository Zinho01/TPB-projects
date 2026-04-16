// Hoofdbestand van de backend server
// Hier worden alle routes samengebracht en de server gestart

import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

// Routes importeren
import authRoutes from './routes/auth'
import taskRoutes from './routes/tasks'
import timeRoutes from './routes/time'
import userRoutes from './routes/users'
import reportRoutes from './routes/reports'

// Laad .env variabelen (poort, database gegevens etc.)
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// CORS toestaan zodat de React frontend (op poort 5173) de backend kan bereiken
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}))

// Zorg dat Express JSON begrijpt in de request body
app.use(express.json())

// Alle routes koppelen aan hun pad
app.use('/api/auth', authRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/time', timeRoutes)
app.use('/api/users', userRoutes)
app.use('/api/reports', reportRoutes)

// Simpele health check: controleer of de server draait
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', bericht: 'Server draait correct' })
})

// Start de server
app.listen(PORT, () => {
  console.log(`Server draait op http://localhost:${PORT}`)
})
