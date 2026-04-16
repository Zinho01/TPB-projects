// Routes voor tijdregistratie
// Dit is de kern non-CRUD logica: een timer starten en stoppen
//
// POST /api/time/start/:taakId  → start de timer voor een taak
// POST /api/time/stop/:id       → stop de timer (sla eindtijd op)
// GET  /api/time/lopend         → controleer of er een timer actief is
// GET  /api/time/taak/:taakId   → alle registraties van een taak

import { Router, Response } from 'express'
import pool from '../db'
import { controleerToken, AuthRequest } from '../middleware/auth'

const router = Router()

// Alle routes vereisen een geldig token
router.use(controleerToken)

// Timer starten voor een taak
// Je kunt maar één timer tegelijk actief hebben
router.post('/start/:taakId', async (req: AuthRequest, res: Response) => {
  const taakId = req.params.taakId
  const gebruikerId = req.gebruiker!.id

  try {
    // Controleer of de gebruiker al een actieve timer heeft
    const [actief] = await pool.query(
      'SELECT id FROM time_entries WHERE gebruiker_id = ? AND eind_tijd IS NULL',
      [gebruikerId]
    ) as any[]

    if ((actief as any[]).length > 0) {
      res.status(400).json({ bericht: 'Je hebt al een actieve timer. Stop die eerst.' })
      return
    }

    // Sla de starttijd op (huidige datum en tijd)
    const [result] = await pool.query(
      'INSERT INTO time_entries (taak_id, gebruiker_id, start_tijd) VALUES (?, ?, NOW())',
      [taakId, gebruikerId]
    ) as any[]

    // Zet ook de taakstatus op 'bezig' als die nog 'open' is
    await pool.query(
      "UPDATE tasks SET status = 'bezig' WHERE id = ? AND status = 'open'",
      [taakId]
    )

    res.status(201).json({
      bericht: 'Timer gestart',
      registratie_id: result.insertId,
    })
  } catch (fout) {
    console.error('Fout bij starten timer:', fout)
    res.status(500).json({ bericht: 'Kon timer niet starten' })
  }
})

// Timer stoppen
// Vul de eind_tijd in voor de actieve registratie
router.post('/stop/:id', async (req: AuthRequest, res: Response) => {
  const registratieId = req.params.id
  const gebruikerId = req.gebruiker!.id
  const { notitie } = req.body

  try {
    // Controleer of deze registratie van de ingelogde gebruiker is
    const [rows] = await pool.query(
      'SELECT * FROM time_entries WHERE id = ? AND gebruiker_id = ? AND eind_tijd IS NULL',
      [registratieId, gebruikerId]
    ) as any[]

    if ((rows as any[]).length === 0) {
      res.status(404).json({ bericht: 'Geen actieve timer gevonden met dit ID' })
      return
    }

    const registratie = (rows as any[])[0]

    // Sla de eindtijd op
    await pool.query(
      'UPDATE time_entries SET eind_tijd = NOW(), notitie = ? WHERE id = ?',
      [notitie || null, registratieId]
    )

    // Bereken hoelang er gewerkt is (in minuten)
    const [updatedRows] = await pool.query(
      'SELECT TIMESTAMPDIFF(MINUTE, start_tijd, eind_tijd) AS minuten FROM time_entries WHERE id = ?',
      [registratieId]
    ) as any[]

    const minuten = (updatedRows as any[])[0]?.minuten || 0

    res.json({
      bericht: 'Timer gestopt',
      gewerkte_minuten: minuten,
    })
  } catch (fout) {
    console.error('Fout bij stoppen timer:', fout)
    res.status(500).json({ bericht: 'Kon timer niet stoppen' })
  }
})

// Controleer of de gebruiker een actieve timer heeft
// De frontend gebruikt dit om de juiste knop te tonen (Start of Stop)
router.get('/lopend', async (req: AuthRequest, res: Response) => {
  try {
    const [rows] = await pool.query(`
      SELECT te.*, t.titel AS taak_titel
      FROM time_entries te
      JOIN tasks t ON te.taak_id = t.id
      WHERE te.gebruiker_id = ? AND te.eind_tijd IS NULL
    `, [req.gebruiker!.id]) as any[]

    const actief = (rows as any[])[0] || null
    res.json({ actief })
  } catch (fout) {
    console.error('Fout bij ophalen actieve timer:', fout)
    res.status(500).json({ bericht: 'Kon actieve timer niet ophalen' })
  }
})

// Alle tijdregistraties van een specifieke taak ophalen
router.get('/taak/:taakId', async (req: AuthRequest, res: Response) => {
  const taakId = req.params.taakId

  try {
    const [rows] = await pool.query(`
      SELECT te.*,
        u.naam AS gebruiker_naam,
        TIMESTAMPDIFF(MINUTE, te.start_tijd, te.eind_tijd) AS gewerkte_minuten
      FROM time_entries te
      JOIN users u ON te.gebruiker_id = u.id
      WHERE te.taak_id = ?
      ORDER BY te.start_tijd DESC
    `, [taakId]) as any[]

    res.json(rows)
  } catch (fout) {
    console.error('Fout bij ophalen tijdregistraties:', fout)
    res.status(500).json({ bericht: 'Kon tijdregistraties niet ophalen' })
  }
})

export default router
