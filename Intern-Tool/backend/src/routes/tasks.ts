// Routes voor het beheren van taken
// GET    /api/tasks         → alle taken ophalen
// POST   /api/tasks         → nieuwe taak aanmaken
// PUT    /api/tasks/:id     → taak bijwerken (status, prioriteit etc.)
// DELETE /api/tasks/:id     → taak verwijderen

import { Router, Response } from 'express'
import pool from '../db'
import { controleerToken, AuthRequest } from '../middleware/auth'

const router = Router()

// Alle routes hieronder vereisen dat je ingelogd bent
router.use(controleerToken)

// Alle taken ophalen
// Gebruikers zien alleen hun eigen taken, admins zien alles
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    let taken: any[]

    if (req.gebruiker!.rol === 'admin') {
      // Admin ziet alle taken inclusief naam van wie ze aanmaakte en wie ze uitvoert
      const [rows] = await pool.query(`
        SELECT t.*,
          u1.naam AS aangemaakt_door_naam,
          u2.naam AS toegewezen_aan_naam
        FROM tasks t
        LEFT JOIN users u1 ON t.aangemaakt_door = u1.id
        LEFT JOIN users u2 ON t.toegewezen_aan = u2.id
        ORDER BY t.aangemaakt_op DESC
      `) as any[]
      taken = rows as any[]
    } else {
      // Normale gebruiker ziet alleen taken die aan hem/haar zijn toegewezen
      const [rows] = await pool.query(`
        SELECT t.*,
          u1.naam AS aangemaakt_door_naam,
          u2.naam AS toegewezen_aan_naam
        FROM tasks t
        LEFT JOIN users u1 ON t.aangemaakt_door = u1.id
        LEFT JOIN users u2 ON t.toegewezen_aan = u2.id
        WHERE t.toegewezen_aan = ?
        ORDER BY t.aangemaakt_op DESC
      `, [req.gebruiker!.id]) as any[]
      taken = rows as any[]
    }

    res.json(taken)
  } catch (fout) {
    console.error('Fout bij ophalen taken:', fout)
    res.status(500).json({ bericht: 'Kon taken niet ophalen' })
  }
})

// Één specifieke taak ophalen met alle tijdregistraties
router.get('/:id', async (req: AuthRequest, res: Response) => {
  const taakId = req.params.id

  try {
    const [taakRows] = await pool.query(`
      SELECT t.*,
        u1.naam AS aangemaakt_door_naam,
        u2.naam AS toegewezen_aan_naam
      FROM tasks t
      LEFT JOIN users u1 ON t.aangemaakt_door = u1.id
      LEFT JOIN users u2 ON t.toegewezen_aan = u2.id
      WHERE t.id = ?
    `, [taakId]) as any[]

    const taken = taakRows as any[]
    if (taken.length === 0) {
      res.status(404).json({ bericht: 'Taak niet gevonden' })
      return
    }

    // Haal ook alle tijdregistraties op voor deze taak
    const [tijdRows] = await pool.query(`
      SELECT te.*, u.naam AS gebruiker_naam
      FROM time_entries te
      JOIN users u ON te.gebruiker_id = u.id
      WHERE te.taak_id = ?
      ORDER BY te.start_tijd DESC
    `, [taakId]) as any[]

    res.json({
      ...taken[0],
      tijdregistraties: tijdRows,
    })
  } catch (fout) {
    console.error('Fout bij ophalen taak:', fout)
    res.status(500).json({ bericht: 'Kon taak niet ophalen' })
  }
})

// Nieuwe taak aanmaken
router.post('/', async (req: AuthRequest, res: Response) => {
  const { titel, omschrijving, prioriteit, deadline, toegewezen_aan } = req.body

  if (!titel) {
    res.status(400).json({ bericht: 'Titel is verplicht' })
    return
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO tasks (titel, omschrijving, prioriteit, deadline, aangemaakt_door, toegewezen_aan)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [titel, omschrijving || null, prioriteit || 'normaal', deadline || null, req.gebruiker!.id, toegewezen_aan || null]
    ) as any[]

    res.status(201).json({ bericht: 'Taak aangemaakt', id: result.insertId })
  } catch (fout) {
    console.error('Fout bij aanmaken taak:', fout)
    res.status(500).json({ bericht: 'Kon taak niet aanmaken' })
  }
})

// Taak bijwerken (bijv. status veranderen van 'open' naar 'bezig')
router.put('/:id', async (req: AuthRequest, res: Response) => {
  const taakId = req.params.id
  const { titel, omschrijving, status, prioriteit, deadline, toegewezen_aan } = req.body

  try {
    await pool.query(
      `UPDATE tasks
       SET titel = COALESCE(?, titel),
           omschrijving = COALESCE(?, omschrijving),
           status = COALESCE(?, status),
           prioriteit = COALESCE(?, prioriteit),
           deadline = COALESCE(?, deadline),
           toegewezen_aan = COALESCE(?, toegewezen_aan)
       WHERE id = ?`,
      [titel, omschrijving, status, prioriteit, deadline, toegewezen_aan, taakId]
    )

    res.json({ bericht: 'Taak bijgewerkt' })
  } catch (fout) {
    console.error('Fout bij bijwerken taak:', fout)
    res.status(500).json({ bericht: 'Kon taak niet bijwerken' })
  }
})

// Taak verwijderen
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  const taakId = req.params.id

  try {
    await pool.query('DELETE FROM tasks WHERE id = ?', [taakId])
    res.json({ bericht: 'Taak verwijderd' })
  } catch (fout) {
    console.error('Fout bij verwijderen taak:', fout)
    res.status(500).json({ bericht: 'Kon taak niet verwijderen' })
  }
})

export default router
