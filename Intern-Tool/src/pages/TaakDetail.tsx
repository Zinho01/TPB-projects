// Taak detail pagina: alle info van één taak + tijdregistratie timer
// Hier kun je de timer starten/stoppen en alle registraties bekijken

import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import Timer from '../components/Timer'

type TijdRegistratie = {
  id: number
  start_tijd: string
  eind_tijd: string | null
  gewerkte_minuten: number | null
  notitie: string | null
  gebruiker_naam: string
}

type TaakDetail = {
  id: number
  titel: string
  omschrijving: string
  status: 'open' | 'bezig' | 'klaar'
  prioriteit: 'laag' | 'normaal' | 'hoog'
  deadline: string | null
  aangemaakt_door_naam: string
  toegewezen_aan_naam: string | null
  tijdregistraties: TijdRegistratie[]
}

export default function TaakDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const [taak, setTaak] = useState<TaakDetail | null>(null)
  const [isLaden, setIsLaden] = useState(true)

  // Taak laden als de pagina opent of als het ID verandert
  useEffect(() => {
    laadTaak()
  }, [id])

  async function laadTaak() {
    try {
      const data = await api.get(`/tasks/${id}`)
      setTaak(data)
    } catch (fout) {
      console.error('Fout bij ophalen taak:', fout)
    } finally {
      setIsLaden(false)
    }
  }

  // Bereken het totaal aantal gewerkte minuten voor deze taak
  function berekenTotaalMinuten(registraties: TijdRegistratie[]): string {
    const totaal = registraties
      .filter((r) => r.gewerkte_minuten !== null)
      .reduce((som, r) => som + (r.gewerkte_minuten || 0), 0)

    const uren = Math.floor(totaal / 60)
    const minuten = totaal % 60
    return `${uren}u ${minuten}m`
  }

  // Datum en tijd netjes weergeven
  function formatteerDatumTijd(datumStr: string): string {
    return new Date(datumStr).toLocaleString('nl-NL', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  if (isLaden) return <div className="laden">Laden...</div>
  if (!taak) return <div className="fout">Taak niet gevonden</div>

  return (
    <div className="pagina">
      <button onClick={() => navigate(-1)} className="btn-terug">← Terug</button>

      <div className="detail-header">
        <div>
          <h1 className="pagina-titel">{taak.titel}</h1>
          <div className="detail-meta">
            <span className={`status-badge status-${taak.status}`}>{taak.status}</span>
            <span className={`prioriteit-badge prioriteit-${taak.prioriteit}`}>{taak.prioriteit}</span>
            {taak.deadline && (
              <span>Deadline: {new Date(taak.deadline).toLocaleDateString('nl-NL')}</span>
            )}
          </div>
        </div>
      </div>

      {/* Omschrijving */}
      {taak.omschrijving && (
        <div className="detail-sectie">
          <h2>Omschrijving</h2>
          <p>{taak.omschrijving}</p>
        </div>
      )}

      {/* Toewijzing info */}
      <div className="detail-sectie">
        <h2>Details</h2>
        <div className="detail-grid">
          <div>
            <span className="detail-label">Aangemaakt door</span>
            <span>{taak.aangemaakt_door_naam}</span>
          </div>
          <div>
            <span className="detail-label">Toegewezen aan</span>
            <span>{taak.toegewezen_aan_naam || '— Niemand —'}</span>
          </div>
        </div>
      </div>

      {/* Timer sectie */}
      <div className="detail-sectie">
        <h2>Tijdregistratie</h2>
        <Timer
          taakId={taak.id}
          taakTitel={taak.titel}
          onGestopt={laadTaak}  // ververs de pagina als de timer stopt
        />
      </div>

      {/* Overzicht van alle tijdregistraties */}
      <div className="detail-sectie">
        <div className="sectie-header">
          <h2>Registraties</h2>
          {taak.tijdregistraties.length > 0 && (
            <span className="totaal-uren">
              Totaal: {berekenTotaalMinuten(taak.tijdregistraties)}
            </span>
          )}
        </div>

        {taak.tijdregistraties.length === 0 ? (
          <p className="leeg-tekst">Nog geen tijdregistraties voor deze taak.</p>
        ) : (
          <table className="registraties-tabel">
            <thead>
              <tr>
                <th>Medewerker</th>
                <th>Gestart</th>
                <th>Gestopt</th>
                <th>Duur</th>
                <th>Notitie</th>
              </tr>
            </thead>
            <tbody>
              {taak.tijdregistraties.map((reg) => (
                <tr key={reg.id}>
                  <td>{reg.gebruiker_naam}</td>
                  <td>{formatteerDatumTijd(reg.start_tijd)}</td>
                  <td>{reg.eind_tijd ? formatteerDatumTijd(reg.eind_tijd) : <span className="lopend">Loopt nog</span>}</td>
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
