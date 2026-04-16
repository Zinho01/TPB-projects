// Tijdregistratie pagina: overzicht van alle tijdregistraties van de ingelogde gebruiker
// Je kunt hier ook snel een timer starten voor een taak

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'

type Taak = {
  id: number
  titel: string
  status: string
}

type Registratie = {
  id: number
  taak_id: number
  taak_titel: string
  start_tijd: string
  eind_tijd: string | null
  gewerkte_minuten: number | null
  notitie: string | null
}

export default function Tijdregistratie() {
  const [mijnTaken, setMijnTaken] = useState<Taak[]>([])
  const [registraties, setRegistraties] = useState<Registratie[]>([])
  const [geselecteerdeTaak, setGeselecteerdeTaak] = useState<string>('')
  const [actiefTimerId, setActiefTimerId] = useState<number | null>(null)
  const [actiefTaakId, setActiefTaakId] = useState<number | null>(null)
  const [isLaden, setIsLaden] = useState(true)

  useEffect(() => {
    laadData()
  }, [])

  async function laadData() {
    try {
      // Haal taken en actieve timer op tegelijk
      const [taakData, actieveTimer] = await Promise.all([
        api.get('/tasks'),
        api.get('/time/lopend'),
      ])

      // Alleen taken die nog niet klaar zijn tonen
      setMijnTaken(taakData.filter((t: Taak) => t.status !== 'klaar'))

      // Als er al een timer actief is, sla het ID op
      if (actieveTimer.actief) {
        setActiefTimerId(actieveTimer.actief.id)
        setActiefTaakId(actieveTimer.actief.taak_id)
      }

      // Laad alle registraties per taak
      await laadRegistraties(taakData)
    } catch (fout) {
      console.error('Fout bij laden tijdregistratie pagina:', fout)
    } finally {
      setIsLaden(false)
    }
  }

  // Voor elke taak de registraties ophalen
  async function laadRegistraties(taken: Taak[]) {
    const alleRegistraties: Registratie[] = []
    for (const taak of taken) {
      try {
        const data: any[] = await api.get(`/time/taak/${taak.id}`)
        data.forEach((r) => alleRegistraties.push({ ...r, taak_titel: taak.titel }))
      } catch {
        // Sommige taken hebben misschien geen registraties, dat is ok
      }
    }

    // Sorteer op meest recente registratie eerst
    alleRegistraties.sort((a, b) =>
      new Date(b.start_tijd).getTime() - new Date(a.start_tijd).getTime()
    )
    setRegistraties(alleRegistraties)
  }

  // Timer starten voor de geselecteerde taak
  async function startTimer() {
    if (!geselecteerdeTaak) return

    try {
      const data = await api.post(`/time/start/${geselecteerdeTaak}`, {})
      setActiefTimerId(data.registratie_id)
      setActiefTaakId(Number(geselecteerdeTaak))
      alert('Timer gestart!')
    } catch (fout: any) {
      alert(fout.message)
    }
  }

  // Timer stoppen
  async function stopTimer() {
    if (!actiefTimerId) return

    try {
      const data = await api.post(`/time/stop/${actiefTimerId}`, {})
      alert(`Timer gestopt! Je hebt ${data.gewerkte_minuten} minuten gewerkt.`)
      setActiefTimerId(null)
      setActiefTaakId(null)
      laadData() // ververs de lijst
    } catch (fout: any) {
      alert(fout.message)
    }
  }

  // Datum en tijd leesbaar maken
  function formatteerDT(str: string) {
    return new Date(str).toLocaleString('nl-NL', {
      day: '2-digit', month: '2-digit',
      hour: '2-digit', minute: '2-digit',
    })
  }

  if (isLaden) return <div className="laden">Laden...</div>

  // Bereken totale gewerkte uren
  const totaalMinuten = registraties
    .filter((r) => r.gewerkte_minuten !== null)
    .reduce((som, r) => som + (r.gewerkte_minuten || 0), 0)

  return (
    <div className="pagina">
      <h1 className="pagina-titel">Tijdregistratie</h1>
      <p className="pagina-subtitel">Totaal geregistreerd: {Math.floor(totaalMinuten / 60)}u {totaalMinuten % 60}m</p>

      {/* Timer starten sectie */}
      <div className="timer-sectie">
        {actiefTimerId ? (
          // Er loopt al een timer
          <div className="actieve-timer-melding">
            <span>⏱️ Timer loopt voor: <strong>
              {mijnTaken.find((t) => t.id === actiefTaakId)?.titel || 'onbekende taak'}
            </strong></span>
            <button onClick={stopTimer} className="btn-stop-groot">Stop timer</button>
          </div>
        ) : (
          // Geen actieve timer: selecteer een taak en start
          <div className="timer-start-rij">
            <select
              value={geselecteerdeTaak}
              onChange={(e) => setGeselecteerdeTaak(e.target.value)}
              className="taak-select"
            >
              <option value="">— Selecteer een taak —</option>
              {mijnTaken.map((t) => (
                <option key={t.id} value={t.id}>{t.titel}</option>
              ))}
            </select>
            <button
              onClick={startTimer}
              disabled={!geselecteerdeTaak}
              className="btn-start-groot"
            >
              Start timer
            </button>
          </div>
        )}
      </div>

      {/* Registraties tabel */}
      <div className="sectie">
        <h2>Mijn registraties</h2>

        {registraties.length === 0 ? (
          <p className="leeg-tekst">Je hebt nog geen tijdregistraties.</p>
        ) : (
          <table className="registraties-tabel">
            <thead>
              <tr>
                <th>Taak</th>
                <th>Gestart</th>
                <th>Gestopt</th>
                <th>Duur</th>
                <th>Notitie</th>
              </tr>
            </thead>
            <tbody>
              {registraties.map((reg) => (
                <tr key={reg.id}>
                  <td>
                    <Link to={`/taken/${reg.taak_id}`} className="taak-link">
                      {reg.taak_titel}
                    </Link>
                  </td>
                  <td>{formatteerDT(reg.start_tijd)}</td>
                  <td>{reg.eind_tijd ? formatteerDT(reg.eind_tijd) : <span className="lopend">Loopt nog</span>}</td>
                  <td>{reg.gewerkte_minuten !== null ? `${reg.gewerkte_minuten} min` : '—'}</td>
                  <td>{reg.notitie || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
