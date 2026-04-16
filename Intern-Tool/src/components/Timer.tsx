// Timer component: laat een live lopende teller zien
// Dit is een voorbeeld van non-CRUD logica: de timer telt elke seconde op
// en communiceert met de backend om te starten/stoppen

import { useState, useEffect, useRef } from 'react'
import { api } from '../api/client'

type TimerProps = {
  taakId: number
  taakTitel: string
  onGestopt: () => void  // callback als de timer stopt (bijv. lijst verversen)
}

export default function Timer({ taakId, taakTitel, onGestopt }: TimerProps) {
  const [isActief, setIsActief] = useState(false)
  const [seconden, setSeconden] = useState(0)
  const [registratieId, setRegistratieId] = useState<number | null>(null)
  const [notitie, setNotitie] = useState('')
  const [foutmelding, setFoutmelding] = useState('')
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Bij het laden: controleer of er al een actieve timer is voor deze taak
  useEffect(() => {
    api.get('/time/lopend').then((data) => {
      if (data.actief && data.actief.taak_id === taakId) {
        // Bereken hoeveel seconden er al verstreken zijn
        const startTijd = new Date(data.actief.start_tijd).getTime()
        const nu = Date.now()
        const verstreken = Math.floor((nu - startTijd) / 1000)

        setSeconden(verstreken)
        setRegistratieId(data.actief.id)
        setIsActief(true)
      }
    }).catch(() => {})
  }, [taakId])

  // Start of stop het interval als isActief verandert
  useEffect(() => {
    if (isActief) {
      // Elke seconde de teller ophogen
      intervalRef.current = setInterval(() => {
        setSeconden((s) => s + 1)
      }, 1000)
    } else {
      // Stop het interval als de timer niet meer actief is
      if (intervalRef.current) clearInterval(intervalRef.current)
    }

    // Cleanup bij unmount: altijd het interval stoppen
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isActief])

  // Timer starten
  async function startTimer() {
    setFoutmelding('')
    try {
      const data = await api.post(`/time/start/${taakId}`, {})
      setRegistratieId(data.registratie_id)
      setSeconden(0)
      setIsActief(true)
    } catch (err: any) {
      setFoutmelding(err.message)
    }
  }

  // Timer stoppen en de notitie opslaan
  async function stopTimer() {
    if (!registratieId) return

    try {
      await api.post(`/time/stop/${registratieId}`, { notitie })
      setIsActief(false)
      setSeconden(0)
      setRegistratieId(null)
      setNotitie('')
      onGestopt() // vertel de parent dat de timer gestopt is
    } catch (err: any) {
      setFoutmelding(err.message)
    }
  }

  // Seconden omzetten naar leesbaar formaat: 3661 → "01:01:01"
  function formatteerTijd(totaalSeconden: number): string {
    const uren = Math.floor(totaalSeconden / 3600)
    const minuten = Math.floor((totaalSeconden % 3600) / 60)
    const sec = totaalSeconden % 60
    return [uren, minuten, sec].map((v) => String(v).padStart(2, '0')).join(':')
  }

  return (
    <div className="timer-container">
      <p className="timer-taak-naam">{taakTitel}</p>

      {/* Live klok */}
      <div className={`timer-klok ${isActief ? 'actief' : ''}`}>
        {formatteerTijd(seconden)}
      </div>

      {foutmelding && <p className="fout-tekst">{foutmelding}</p>}

      {/* Notitieveld: alleen zichtbaar als de timer loopt */}
      {isActief && (
        <input
          type="text"
          placeholder="Optionele notitie (wat heb je gedaan?)"
          value={notitie}
          onChange={(e) => setNotitie(e.target.value)}
          className="timer-notitie"
        />
      )}

      <div className="timer-knoppen">
        {!isActief ? (
          <button onClick={startTimer} className="btn-start">Start timer</button>
        ) : (
          <button onClick={stopTimer} className="btn-stop">Stop timer</button>
        )}
      </div>
    </div>
  )
}
