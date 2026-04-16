// Rapportages pagina: analyse van productiviteit en tijdsbesteding
// Hier zie je grafieken en tabellen van gewerkte uren per persoon en per taak

import { useEffect, useState } from 'react'
import { api } from '../api/client'

type GebruikerRapport = {
  naam: string
  email: string
  aantal_registraties: number
  totale_uren: number
}

type TaakRapport = {
  id: number
  titel: string
  status: string
  prioriteit: string
  aantal_registraties: number
  totale_uren: number
}

type WeekData = {
  datum: string
  uren: number
}

export default function Rapportages() {
  const [gebruikerData, setGebruikerData] = useState<GebruikerRapport[]>([])
  const [taakData, setTaakData] = useState<TaakRapport[]>([])
  const [weekData, setWeekData] = useState<WeekData[]>([])
  const [isLaden, setIsLaden] = useState(true)
  const [actieveTab, setActieveTab] = useState<'gebruikers' | 'taken' | 'week'>('gebruikers')

  useEffect(() => {
    async function laadRapportages() {
      try {
        // Alle rapport data tegelijk ophalen
        const [perGebruiker, perTaak, perWeek] = await Promise.all([
          api.get('/reports/per-gebruiker'),
          api.get('/reports/per-taak'),
          api.get('/reports/week'),
        ])
        setGebruikerData(perGebruiker)
        setTaakData(perTaak)
        setWeekData(perWeek)
      } catch (fout) {
        console.error('Fout bij laden rapportages:', fout)
      } finally {
        setIsLaden(false)
      }
    }

    laadRapportages()
  }, [])

  // Bereken het maximale uren voor de breedte van de balk
  function berekenBalkBreedte(uren: number, max: number): string {
    if (max === 0) return '0%'
    return `${Math.round((uren / max) * 100)}%`
  }

  // Datum mooi weergeven
  function formatteerDatum(datumStr: string): string {
    return new Date(datumStr).toLocaleDateString('nl-NL', {
      weekday: 'short', day: 'numeric', month: 'short',
    })
  }

  if (isLaden) return <div className="laden">Laden...</div>

  // Maximale uren voor schalen van balkdiagrammen
  const maxGebruikerUren = Math.max(...gebruikerData.map((g) => g.totale_uren || 0), 1)
  const maxTaakUren = Math.max(...taakData.map((t) => t.totale_uren || 0), 1)
  const maxWeekUren = Math.max(...weekData.map((w) => w.uren || 0), 1)

  return (
    <div className="pagina">
      <h1 className="pagina-titel">Rapportages</h1>
      <p className="pagina-subtitel">Analyse van tijdsbesteding en productiviteit</p>

      {/* Tab navigatie */}
      <div className="tab-rij">
        <button
          className={actieveTab === 'gebruikers' ? 'tab actief' : 'tab'}
          onClick={() => setActieveTab('gebruikers')}
        >
          Per medewerker
        </button>
        <button
          className={actieveTab === 'taken' ? 'tab actief' : 'tab'}
          onClick={() => setActieveTab('taken')}
        >
          Per taak
        </button>
        <button
          className={actieveTab === 'week' ? 'tab actief' : 'tab'}
          onClick={() => setActieveTab('week')}
        >
          Afgelopen week
        </button>
      </div>

      {/* Rapport per medewerker */}
      {actieveTab === 'gebruikers' && (
        <div className="rapport-sectie">
          <h2>Gewerkte uren per medewerker</h2>

          {gebruikerData.length === 0 ? (
            <p className="leeg-tekst">Nog geen gegevens beschikbaar.</p>
          ) : (
            <div className="rapport-lijst">
              {gebruikerData.map((gebruiker) => (
                <div key={gebruiker.email} className="rapport-rij">
                  <div className="rapport-naam">
                    <strong>{gebruiker.naam}</strong>
                    <span className="rapport-email">{gebruiker.email}</span>
                  </div>
                  <div className="rapport-balk-container">
                    {/* Visuele balk die de verhouding laat zien */}
                    <div
                      className="rapport-balk"
                      style={{ width: berekenBalkBreedte(gebruiker.totale_uren || 0, maxGebruikerUren) }}
                    />
                  </div>
                  <div className="rapport-getal">
                    <strong>{gebruiker.totale_uren || 0}u</strong>
                    <span>{gebruiker.aantal_registraties} registraties</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Rapport per taak */}
      {actieveTab === 'taken' && (
        <div className="rapport-sectie">
          <h2>Gewerkte uren per taak</h2>

          {taakData.length === 0 ? (
            <p className="leeg-tekst">Nog geen gegevens beschikbaar.</p>
          ) : (
            <table className="rapport-tabel">
              <thead>
                <tr>
                  <th>Taak</th>
                  <th>Status</th>
                  <th>Gewerkte uren</th>
                  <th>Registraties</th>
                  <th>Tijdsbesteding</th>
                </tr>
              </thead>
              <tbody>
                {taakData.map((taak) => (
                  <tr key={taak.id}>
                    <td>{taak.titel}</td>
                    <td>
                      <span className={`status-badge status-${taak.status}`}>{taak.status}</span>
                    </td>
                    <td>{taak.totale_uren || 0}u</td>
                    <td>{taak.aantal_registraties}</td>
                    <td>
                      <div className="mini-balk-container">
                        <div
                          className="mini-balk"
                          style={{ width: berekenBalkBreedte(taak.totale_uren || 0, maxTaakUren) }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Weekoverzicht als lijndiagram (nep, maar visueel met CSS) */}
      {actieveTab === 'week' && (
        <div className="rapport-sectie">
          <h2>Uren per dag – afgelopen 7 dagen</h2>

          {weekData.length === 0 ? (
            <p className="leeg-tekst">Geen registraties in de afgelopen 7 dagen.</p>
          ) : (
            <div className="week-grafiek">
              {weekData.map((dag) => (
                <div key={dag.datum} className="week-dag">
                  {/* De hoogte van de balk is proportioneel aan het aantal uren */}
                  <div className="week-balk-wrapper">
                    <span className="week-uren-label">{dag.uren}u</span>
                    <div
                      className="week-balk"
                      style={{ height: berekenBalkBreedte(dag.uren, maxWeekUren) }}
                    />
                  </div>
                  <span className="week-datum">{formatteerDatum(dag.datum)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
