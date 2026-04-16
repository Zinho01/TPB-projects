// Databaseverbinding instellen
// We gebruiken mysql2 met promises zodat we async/await kunnen gebruiken

import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

// Laad de .env variabelen in zodat we de inloggegevens niet hardcoden
dotenv.config()

// Een pool is een set van herbruikbare verbindingen
// Zo hoeft de app niet elke keer opnieuw te verbinden met MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'pixeldam020',
  database: process.env.DB_NAME || 'taskmanager',
  waitForConnections: true,
  connectionLimit: 10,
})

export default pool
