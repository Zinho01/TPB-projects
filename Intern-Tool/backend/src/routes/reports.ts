// Routes voor rapportages
// Hier zit de analyse logica: hoeveel tijd is er per gebruiker/taak gespendeerd?
//
// GET /api/reports/overzicht         → totale statistieken
// GET /api/reports/per-gebruiker     → uren per medewerker
// GET /api/reports/per-taak          → uren per taak
// GET /api/reports/week              → uren per dag van de afgelopen week

import { Router, Response } from 'express'
import pool from '../db'
import { controleerToken, AuthRequest } from '../middleware/auth'

const router = Router()

router.use(controleerToken)

// Algemeen overzicht: totale uren, taken per status, actieve gebruikers
router.get('/overzicht', async (req: AuthRequest, res: Response) => {
  try {
    // Totaal gewerkte uren (alleen voltooide registraties)
    const [urenRows] = await pool.query(`
      SELECT ROUND(SUM(TIMESTAMPDIFF(MINUTE, start_tijd, eind_tijd)) / 60, 1) AS totale_uren
      FROM time_entries
      WHERE eind_tijd IS NOT NULL
    `) as any[]

    // Taken per status tellen
    const [statusRows] = await pool.query(`
      SELECT status, COUNT(*) AS aantal
      FROM tasks
      GROUP BY status
    `) as any[]

    // Hoeveel gebruikers zijn er actief (hebben taken toegewezen gekregen)
    const [gebruikerRows] = await pool.query(`
      SELECT COUNT(DISTINCT toegewezen_aan) AS actieve_gebruikers
      FROM tasks
      WHERE toegewezen_aan IS NOT NULL
    `) as any[]

    res.json({
      totale_uren: (urenRows as any[])[0]?.totale_uren || 0,
      taken_per_status: statusRows,
      actieve_gebruikers: (gebruikerRows as any[])[0]?.actieve_gebruikers || 0,
    })
  } catch (fout) {
    console.error('Fout bij ophalen overzicht:', fout)
    res.status(500).json({ bericht: 'Kon overzicht niet ophalen' })
  }
})

// Gewerkte uren per medewerker
router.get('/per-gebruiker', async (req: AuthRequest, res: Response) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        u.naam,
        u.email,
        COUNT(te.id) AS aantal_registraties,
        ROUND(SUM(TIMESTAMPDIFF(MINUTE, te.start_tijd, te.eind_tijd)) / 60, 1) AS totale_uren
      FROM users u
      LEFT JOIN time_entries te ON u.id = te.gebruiker_id AND te.eind_tijd IS NOT NULL
      GROUP BY u.id, u.naam, u.email
      ORDER BY totale_uren DESC
    `) as any[]

    res.json(rows)
  } catch (fout) {
    console.error('Fout bij ophalen rapport per gebruiker:', fout)
    res.status(500).json({ bericht: 'Kon rapport niet ophalen' })
  }
})

// Gewerkte uren per taak
router.get('/per-taak', async (req: AuthRequest, res: Response) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        t.id,
        t.titel,
        t.status,
        t.prioriteit,
        COUNT(te.id) AS aantal_registraties,
        ROUND(SUM(TIMESTAMPDIFF(MINUTE, te.start_tijd, te.eind_tijd)) / 60, 1) AS totale_uren
      FROM tasks t
      LEFT JOIN time_entries te ON t.id = te.taak_id AND te.eind_tijd IS NOT NULL
      GROUP BY t.id, t.titel, t.status, t.prioriteit
      ORDER BY totale_uren DESC
    `) as any[]

    res.json(rows)
  } catch (fout) {
    console.error('Fout bij ophalen rapport per taak:', fout)
    res.status(500).json({ bericht: 'Kon rapport niet ophalen' })
  }
})

// Uren per dag van de afgelopen 7 dagen
// Handig voor een lijndiagram in het dashboard
router.get('/week', async (req: AuthRequest, res: Response) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        DATE(start_tijd) AS datum,
        ROUND(SUM(TIMESTAMPDIFF(MINUTE, start_tijd, eind_tijd)) / 60, 1) AS uren
      FROM time_entries
      WHERE eind_tijd IS NOT NULL
        AND start_tijd >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(start_tijd)
      ORDER BY datum ASC
    `) as any[]

    res.json(rows)
  } catch (fout) {
    console.error('Fout bij ophalen weekrapport:', fout)
    res.status(500).json({ bericht: 'Kon weekrapport niet ophalen' })
  }
})

export default router
