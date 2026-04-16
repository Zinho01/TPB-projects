// Routes voor gebruikersbeheer (alleen voor admins)
// GET    /api/users        → alle gebruikers ophalen
// PUT    /api/users/:id    → gebruiker bijwerken (rol, naam)
// DELETE /api/users/:id    → gebruiker verwijderen

import { Router, Response } from 'express'
import bcrypt from 'bcryptjs'
import pool from '../db'
import { controleerToken, alleenAdmin, AuthRequest } from '../middleware/auth'

const router = Router()

// Alle routes hieronder vereisen: ingelogd + admin rol
router.use(controleerToken)
router.use(alleenAdmin)

// Alle gebruikers ophalen (wachtwoord wordt niet meegestuurd!)
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, naam, email, rol, aangemaakt_op FROM users ORDER BY aangemaakt_op DESC'
    ) as any[]

    res.json(rows)
  } catch (fout) {
    console.error('Fout bij ophalen gebruikers:', fout)
    res.status(500).json({ bericht: 'Kon gebruikers niet ophalen' })
  }
})

// Gebruiker aanpassen (naam, email, rol of wachtwoord)
router.put('/:id', async (req: AuthRequest, res: Response) => {
  const gebruikerId = req.params.id
  const { naam, email, rol, nieuwWachtwoord } = req.body

  try {
    // Als er een nieuw wachtwoord is, versleutel het eerst
    if (nieuwWachtwoord) {
      const versleuteld = await bcrypt.hash(nieuwWachtwoord, 10)
      await pool.query(
        'UPDATE users SET naam = COALESCE(?, naam), email = COALESCE(?, email), rol = COALESCE(?, rol), wachtwoord = ? WHERE id = ?',
        [naam, email, rol, versleuteld, gebruikerId]
      )
    } else {
      await pool.query(
        'UPDATE users SET naam = COALESCE(?, naam), email = COALESCE(?, email), rol = COALESCE(?, rol) WHERE id = ?',
        [naam, email, rol, gebruikerId]
      )
    }

    res.json({ bericht: 'Gebruiker bijgewerkt' })
  } catch (fout) {
    console.error('Fout bij bijwerken gebruiker:', fout)
    res.status(500).json({ bericht: 'Kon gebruiker niet bijwerken' })
  }
})

// Gebruiker verwijderen
// Je kunt jezelf niet verwijderen
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  const gebruikerId = Number(req.params.id)

  if (gebruikerId === req.gebruiker!.id) {
    res.status(400).json({ bericht: 'Je kunt je eigen account niet verwijderen' })
    return
  }

  try {
    await pool.query('DELETE FROM users WHERE id = ?', [gebruikerId])
    res.json({ bericht: 'Gebruiker verwijderd' })
  } catch (fout) {
    console.error('Fout bij verwijderen gebruiker:', fout)
    res.status(500).json({ bericht: 'Kon gebruiker niet verwijderen' })
  }
})

export default router
