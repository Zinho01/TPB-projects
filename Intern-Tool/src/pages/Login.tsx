// Login pagina
// De gebruiker vult email en wachtwoord in en wordt doorgestuurd naar het dashboard

import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [wachtwoord, setWachtwoord] = useState('')
  const [foutmelding, setFoutmelding] = useState('')
  const [isLaden, setIsLaden] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()  // voorkom dat de pagina herladen wordt
    setFoutmelding('')
    setIsLaden(true)

    try {
      await login(email, wachtwoord)
      navigate('/dashboard')  // naar het dashboard na succesvol inloggen
    } catch (err: any) {
      setFoutmelding(err.message || 'Inloggen mislukt, probeer opnieuw')
    } finally {
      setIsLaden(false)
    }
  }

  return (
    <div className="login-pagina">
      <div className="login-kaart">
        <h1 className="login-titel">TaskManager</h1>
        <p className="login-subtitel">Intern tijdregistratie systeem</p>

        <form onSubmit={handleSubmit} className="login-formulier">
          <div className="veld-groep">
            <label htmlFor="email">E-mailadres</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="naam@bedrijf.nl"
              required
              autoFocus
            />
          </div>

          <div className="veld-groep">
            <label htmlFor="wachtwoord">Wachtwoord</label>
            <input
              id="wachtwoord"
              type="password"
              value={wachtwoord}
              onChange={(e) => setWachtwoord(e.target.value)}
              placeholder="Jouw wachtwoord"
              required
            />
          </div>

          {/* Foutmelding tonen als het inloggen mislukt */}
          {foutmelding && (
            <p className="foutmelding">{foutmelding}</p>
          )}

          <button type="submit" className="btn-inloggen" disabled={isLaden}>
            {isLaden ? 'Bezig met inloggen...' : 'Inloggen'}
          </button>
        </form>

        <p className="login-hint">
          Standaard account: admin@taskmanager.nl / admin123
        </p>
      </div>
    </div>
  )
}
