// Dashboard pagina: eerste pagina na inloggen
// Geeft een snel overzicht van taken, gewerkte uren en open items

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api/client'

// Type voor een taak zoals de backend ze teruggeeft
type Taak = {
  id: number
  titel: string
  status: 'open' | 'bezig' | 'klaar'
  prioriteit: 'laag' | 'normaal' | 'hoog'
  deadline: string | null
  toegewezen_aan_naam: string | null
}

// Type voor de rapportage statistieken
type Overzicht = {
  totale_uren: number
  taken_per_status: { status: string; aantal: number }[]
  actieve_gebruikers: number
}

export default function Dashboard() {
  const { gebruiker, isAdmin } = useAuth()
  const [taken, setTaken] = useState<Taak[]>([])
  const [overzicht, setOverzicht] = useState<Overzicht | null>(null)
  const [isLaden, setIsLaden] = useState(true)

  // Data ophalen bij het laden van de pagina
  useEffect(() => {
    async function laadData() {
      try {
        // Beide requests tegelijk doen zodat de pagina sneller laadt
        const [taakData, overzichtData] = await Promise.all([
          api.get('/tasks'),
          api.get('/reports/overzicht'),
        ])
        setTaken(taakData)
        setOverzicht(overzichtData)
      } catch (fout) {
        console.error('Fout bij laden dashboard:', fout)
      } finally {
        setIsLaden(false)
      }
    }

    laadData()
  }, [])

  // Kleur op basis van prioriteit
  function prioriteitKleur(prioriteit: string) {
    if (prioriteit === 'hoog') return 'prioriteit-hoog'
    if (prioriteit === 'normaal') return 'prioriteit-normaal'
    return 'prioriteit-laag'
  }

  // Deadline rood maken als die verstreken is
  function isVerlopen(deadline: string | null) {
    if (!deadline) return false
    return new Date(deadline) < new Date()
  }

  if (isLaden) return <div className="laden">Laden...</div>

  // Taken splitsen per status voor de kolommen
  const openTaken = taken.filter((t) => t.status === 'open')
  const bezigTaken = taken.filter((t) => t.status === 'bezig')

  return (
    <div className="pagina">
      <h1 className="pagina-titel">Welkom, {gebruiker?.naam}</h1>
      <p className="pagina-subtitel">Hier is je overzicht voor vandaag</p>

      {/* Statistieken kaarten bovenaan */}
      {overzicht && (
        <div className="stat-rij">
          <div className="stat-kaart">
            <span className="stat-getal">{overzicht.totale_uren || 0}</span>
            <span className="stat-label">Totale uren geregistreerd</span>
          </div>
          <div className="stat-kaart">
            <span className="stat-getal">{openTaken.length}</span>
            <span className="stat-label">Open taken</span>
          </div>
          <div className="stat-kaart">
            <span className="stat-getal">{bezigTaken.length}</span>
            <span className="stat-label">Taken in uitvoering</span>
          </div>
          {isAdmin && (
            <div className="stat-kaart">
              <span className="stat-getal">{overzicht.actieve_gebruikers}</span>
              <span className="stat-label">Actieve medewerkers</span>
            </div>
          )}
        </div>
      )}

      {/* Recente taken tabel */}
      <div className="sectie">
        <div className="sectie-header">
          <h2>Jouw taken</h2>
          <Link to="/taken" className="btn-link">Alle taken bekijken →</Link>
        </div>

        {taken.length === 0 ? (
          <p className="leeg-tekst">Je hebt nog geen taken toegewezen gekregen.</p>
        ) : (
          <table className="taken-tabel">
            <thead>
              <tr>
                <th>Taak</th>
                <th>Status</th>
                <th>Prioriteit</th>
                <th>Deadline</th>
              </tr>
            </thead>
            <tbody>
              {/* Toon maximaal 5 taken op het dashboard */}
              {taken.slice(0, 5).map((taak) => (
                <tr key={taak.id}>
                  <td>
                    <Link to={`/taken/${taak.id}`} className="taak-link">
                      {taak.titel}
                    </Link>
                  </td>
                  <td>
                    <span className={`status-badge status-${taak.status}`}>
                      {taak.status}
                    </span>
                  </td>
                  <td>
                    <span className={prioriteitKleur(taak.prioriteit)}>
                      {taak.prioriteit}
                    </span>
                  </td>
                  <td className={isVerlopen(taak.deadline) ? 'verlopen' : ''}>
                    {taak.deadline
                      ? new Date(taak.deadline).toLocaleDateString('nl-NL')
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
