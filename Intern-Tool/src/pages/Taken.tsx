// Taken pagina: overzicht van alle taken
// Admin kan alle taken zien en nieuwe aanmaken
// Medewerker ziet alleen zijn/haar eigen taken

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api/client'

type Taak = {
  id: number
  titel: string
  omschrijving: string
  status: 'open' | 'bezig' | 'klaar'
  prioriteit: 'laag' | 'normaal' | 'hoog'
  deadline: string | null
  aangemaakt_door_naam: string
  toegewezen_aan_naam: string | null
}

type NieuweTaakFormulier = {
  titel: string
  omschrijving: string
  prioriteit: string
  deadline: string
  toegewezen_aan: string
}

export default function Taken() {
  const { isAdmin } = useAuth()
  const [taken, setTaken] = useState<Taak[]>([])
  const [gebruikers, setGebruikers] = useState<{ id: number; naam: string }[]>([])
  const [isLaden, setIsLaden] = useState(true)
  const [toonFormulier, setToonFormulier] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('alle')

  // Formulier staat
  const [formulier, setFormulier] = useState<NieuweTaakFormulier>({
    titel: '',
    omschrijving: '',
    prioriteit: 'normaal',
    deadline: '',
    toegewezen_aan: '',
  })

  // Data laden bij het openen van de pagina
  useEffect(() => {
    laadTaken()
    if (isAdmin) {
      // Admin heeft de gebruikerslijst nodig om taken toe te wijzen
      api.get('/users').then(setGebruikers).catch(console.error)
    }
  }, [isAdmin])

  async function laadTaken() {
    try {
      const data = await api.get('/tasks')
      setTaken(data)
    } catch (fout) {
      console.error('Fout bij ophalen taken:', fout)
    } finally {
      setIsLaden(false)
    }
  }

  // Nieuwe taak opslaan
  async function handleNieuweTaak(e: React.FormEvent) {
    e.preventDefault()
    try {
      await api.post('/tasks', {
        ...formulier,
        toegewezen_aan: formulier.toegewezen_aan ? Number(formulier.toegewezen_aan) : null,
        deadline: formulier.deadline || null,
      })

      // Formulier resetten en de lijst verversen
      setFormulier({ titel: '', omschrijving: '', prioriteit: 'normaal', deadline: '', toegewezen_aan: '' })
      setToonFormulier(false)
      laadTaken()
    } catch (fout: any) {
      alert(fout.message)
    }
  }

  // Taakstatus snel aanpassen (zonder naar de detailpagina te gaan)
  async function wijzigStatus(taakId: number, nieuweStatus: string) {
    try {
      await api.put(`/tasks/${taakId}`, { status: nieuweStatus })
      laadTaken()
    } catch (fout: any) {
      alert(fout.message)
    }
  }

  // Taak verwijderen na bevestiging
  async function verwijderTaak(taakId: number) {
    if (!confirm('Weet je zeker dat je deze taak wilt verwijderen?')) return
    try {
      await api.delete(`/tasks/${taakId}`)
      laadTaken()
    } catch (fout: any) {
      alert(fout.message)
    }
  }

  // Filter de taken op basis van de geselecteerde status
  const gefilterdeTaken = filterStatus === 'alle'
    ? taken
    : taken.filter((t) => t.status === filterStatus)

  if (isLaden) return <div className="laden">Laden...</div>

  return (
    <div className="pagina">
      <div className="pagina-header">
        <div>
          <h1 className="pagina-titel">Taken</h1>
          <p className="pagina-subtitel">{taken.length} taken in totaal</p>
        </div>

        {/* Alleen admins kunnen nieuwe taken aanmaken */}
        {isAdmin && (
          <button className="btn-primair" onClick={() => setToonFormulier(!toonFormulier)}>
            {toonFormulier ? 'Annuleren' : '+ Nieuwe taak'}
          </button>
        )}
      </div>

      {/* Formulier voor nieuwe taak */}
      {toonFormulier && isAdmin && (
        <div className="formulier-kaart">
          <h2>Nieuwe taak aanmaken</h2>
          <form onSubmit={handleNieuweTaak} className="taak-formulier">
            <div className="veld-groep">
              <label>Titel *</label>
              <input
                type="text"
                value={formulier.titel}
                onChange={(e) => setFormulier({ ...formulier, titel: e.target.value })}
                required
                placeholder="Korte beschrijving van de taak"
              />
            </div>

            <div className="veld-groep">
              <label>Omschrijving</label>
              <textarea
                value={formulier.omschrijving}
                onChange={(e) => setFormulier({ ...formulier, omschrijving: e.target.value })}
                placeholder="Meer details over de taak..."
                rows={3}
              />
            </div>

            <div className="veld-rij">
              <div className="veld-groep">
                <label>Prioriteit</label>
                <select
                  value={formulier.prioriteit}
                  onChange={(e) => setFormulier({ ...formulier, prioriteit: e.target.value })}
                >
                  <option value="laag">Laag</option>
                  <option value="normaal">Normaal</option>
                  <option value="hoog">Hoog</option>
                </select>
              </div>

              <div className="veld-groep">
                <label>Deadline</label>
                <input
                  type="date"
                  value={formulier.deadline}
                  onChange={(e) => setFormulier({ ...formulier, deadline: e.target.value })}
                />
              </div>

              <div className="veld-groep">
                <label>Toewijzen aan</label>
                <select
                  value={formulier.toegewezen_aan}
                  onChange={(e) => setFormulier({ ...formulier, toegewezen_aan: e.target.value })}
                >
                  <option value="">— Niemand —</option>
                  {gebruikers.map((g) => (
                    <option key={g.id} value={g.id}>{g.naam}</option>
                  ))}
                </select>
              </div>
            </div>

            <button type="submit" className="btn-primair">Taak aanmaken</button>
          </form>
        </div>
      )}

      {/* Filter knoppen */}
      <div className="filter-rij">
        {['alle', 'open', 'bezig', 'klaar'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={filterStatus === status ? 'filter-knop actief' : 'filter-knop'}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Takenlijst */}
      {gefilterdeTaken.length === 0 ? (
        <p className="leeg-tekst">Geen taken gevonden.</p>
      ) : (
        <div className="taken-lijst">
          {gefilterdeTaken.map((taak) => (
            <div key={taak.id} className={`taak-rij prioriteit-rand-${taak.prioriteit}`}>
              <div className="taak-info">
                <Link to={`/taken/${taak.id}`} className="taak-titel-link">
                  {taak.titel}
                </Link>
                {taak.toegewezen_aan_naam && (
                  <span className="taak-medewerker">👤 {taak.toegewezen_aan_naam}</span>
                )}
                {taak.deadline && (
                  <span className="taak-deadline">
                    📅 {new Date(taak.deadline).toLocaleDateString('nl-NL')}
                  </span>
                )}
              </div>

              <div className="taak-acties">
                {/* Status direct aanpassen via dropdown */}
                <select
                  value={taak.status}
                  onChange={(e) => wijzigStatus(taak.id, e.target.value)}
                  className="status-select"
                >
                  <option value="open">Open</option>
                  <option value="bezig">Bezig</option>
                  <option value="klaar">Klaar</option>
                </select>

                <Link to={`/taken/${taak.id}`} className="btn-klein">Detail</Link>

                {isAdmin && (
                  <button
                    onClick={() => verwijderTaak(taak.id)}
                    className="btn-klein btn-gevaarlijk"
                  >
                    Verwijderen
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
