// Routes voor inloggen en registreren
// POST /api/auth/login    → inloggen
// POST /api/auth/register → nieuw account aanmaken

import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pool from '../db'
import { controleerToken, AuthRequest } from '../middleware/auth'

const router = Router()

// Inloggen
// Controleer email + wachtwoord en stuur een JWT token terug
router.post('/login', async (req: Request, res: Response) => {
  const { email, wachtwoord } = req.body

  if (!email || !wachtwoord) {
    res.status(400).json({ bericht: 'Email en wachtwoord zijn verplicht' })
    return
  }

  try {
    // Zoek de gebruiker op in de database
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]) as any[]
    const gebruikers = rows as any[]

    if (gebruikers.length === 0) {
      res.status(401).json({ bericht: 'Email of wachtwoord klopt niet' })
      return
    }

    const gebruiker = gebruikers[0]

    // Vergelijk het ingevoerde wachtwoord met de opgeslagen hash
    const wachtwoordKlopt = await bcrypt.compare(wachtwoord, gebruiker.wachtwoord)

    if (!wachtwoordKlopt) {
      res.status(401).json({ bericht: 'Email of wachtwoord klopt niet' })
      return
    }

    // Maak een JWT token aan met de gebruikersgegevens
    // Dit token verloopt na 8 uur (een werkdag)
    const token = jwt.sign(
      { id: gebruiker.id, email: gebruiker.email, rol: gebruiker.rol },
      process.env.JWT_SECRET || 'geheim',
      { expiresIn: '8h' }
    )

    res.json({
      token,
      gebruiker: {
        id: gebruiker.id,
        naam: gebruiker.naam,
        email: gebruiker.email,
        rol: gebruiker.rol,
      },
    })
  } catch (fout) {
    console.error('Fout bij inloggen:', fout)
    res.status(500).json({ bericht: 'Er ging iets mis, probeer het opnieuw' })
  }
})

// Nieuw account registreren (alleen voor admins of eerste setup)
router.post('/register', async (req: Request, res: Response) => {
  const { naam, email, wachtwoord, rol } = req.body

  if (!naam || !email || !wachtwoord) {
    res.status(400).json({ bericht: 'Naam, email en wachtwoord zijn verplicht' })
    return
  }

  try {
    // Controleer of het emailadres al in gebruik is
    const [bestaand] = await pool.query('SELECT id FROM users WHERE email = ?', [email]) as any[]
    if ((bestaand as any[]).length > 0) {
      res.status(409).json({ bericht: 'Dit emailadres is al in gebruik' })
      return
    }

    // Versleutel het wachtwoord voordat het opgeslagen wordt
    // getal 10 = sterkte van de versleuteling (hogere waarde = veiliger maar trager)
    const versleuteldWachtwoord = await bcrypt.hash(wachtwoord, 10)

    await pool.query(
      'INSERT INTO users (naam, email, wachtwoord, rol) VALUES (?, ?, ?, ?)',
      [naam, email, versleuteldWachtwoord, rol || 'user']
    )

    res.status(201).json({ bericht: 'Account succesvol aangemaakt' })
  } catch (fout) {
    console.error('Fout bij registreren:', fout)
    res.status(500).json({ bericht: 'Er ging iets mis, probeer het opnieuw' })
  }
})

// Huidige ingelogde gebruiker ophalen
// Handig om na een pagina refresh te controleren of je nog ingelogd bent
router.get('/mij', controleerToken, async (req: AuthRequest, res: Response) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, naam, email, rol FROM users WHERE id = ?',
      [req.gebruiker!.id]
    ) as any[]

    const gebruikers = rows as any[]
    if (gebruikers.length === 0) {
      res.status(404).json({ bericht: 'Gebruiker niet gevonden' })
      return
    }

    res.json(gebruikers[0])
  } catch (fout) {
    console.error('Fout bij ophalen gebruiker:', fout)
    res.status(500).json({ bericht: 'Er ging iets mis' })
  }
})

export default router
