// Admin pagina: gebruikersbeheer
// Alleen toegankelijk voor gebruikers met de rol 'admin'
// Hier kun je nieuwe medewerkers aanmaken, rollen aanpassen en accounts verwijderen

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

type Gebruiker = {
  id: number
  naam: string
  email: string
  rol: 'admin' | 'user'
  aangemaakt_op: string
}

export default function Admin() {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()
  const [gebruikers, setGebruikers] = useState<Gebruiker[]>([])
  const [isLaden, setIsLaden] = useState(true)
  const [toonFormulier, setToonFormulier] = useState(false)

  // Formulier voor nieuw account
  const [nieuwGebruiker, setNieuwGebruiker] = useState({
    naam: '', email: '', wachtwoord: '', rol: 'user',
  })

  // Als de gebruiker geen admin is, stuur terug naar het dashboard
  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard')
      return
    }
    laadGebruikers()
  }, [isAdmin])

  async function laadGebruikers() {
    try {
      const data = await api.get('/users')
      setGebruikers(data)
    } catch (fout) {
      console.error('Fout bij laden gebruikers:', fout)
    } finally {
      setIsLaden(false)
    }
  }

  // Nieuw account aanmaken
  async function handleNieuwGebruiker(e: React.FormEvent) {
    e.preventDefault()
    try {
      await api.post('/auth/register', nieuwGebruiker)
      setNieuwGebruiker({ naam: '', email: '', wachtwoord: '', rol: 'user' })
      setToonFormulier(false)
      laadGebruikers()
      alert('Account aangemaakt!')
    } catch (fout: any) {
      alert(fout.message)
    }
  }

  // Rol van een gebruiker aanpassen
  async function wijzigRol(gebruikerId: number, nieuweRol: string) {
    try {
      await api.put(`/users/${gebruikerId}`, { rol: nieuweRol })
      laadGebruikers()
    } catch (fout: any) {
      alert(fout.message)
    }
  }

  // Account verwijderen na bevestiging
  async function verwijderGebruiker(gebruikerId: number, naam: string) {
    if (!confirm(`Weet je zeker dat je het account van ${naam} wilt verwijderen?`)) return
    try {
      await api.delete(`/users/${gebruikerId}`)
      laadGebruikers()
    } catch (fout: any) {
      alert(fout.message)
    }
  }

  if (isLaden) return <div className="laden">Laden...</div>

  return (
    <div className="pagina">
      <div className="pagina-header">
        <div>
          <h1 className="pagina-titel">Gebruikersbeheer</h1>
          <p className="pagina-subtitel">{gebruikers.length} accounts in het systeem</p>
        </div>
        <button className="btn-primair" onClick={() => setToonFormulier(!toonFormulier)}>
          {toonFormulier ? 'Annuleren' : '+ Nieuw account'}
        </button>
      </div>

      {/* Formulier voor nieuw account aanmaken */}
      {toonFormulier && (
        <div className="formulier-kaart">
          <h2>Nieuw account aanmaken</h2>
          <form onSubmit={handleNieuwGebruiker} className="taak-formulier">
            <div className="veld-rij">
              <div className="veld-groep">
                <label>Naam *</label>
                <input
                  type="text"
                  value={nieuwGebruiker.naam}
                  onChange={(e) => setNieuwGebruiker({ ...nieuwGebruiker, naam: e.target.value })}
                  required
                  placeholder="Voor- en achternaam"
                />
              </div>

              <div className="veld-groep">
                <label>E-mailadres *</label>
                <input
                  type="email"
                  value={nieuwGebruiker.email}
                  onChange={(e) => setNieuwGebruiker({ ...nieuwGebruiker, email: e.target.value })}
                  required
                  placeholder="naam@bedrijf.nl"
                />
              </div>
            </div>

            <div className="veld-rij">
              <div className="veld-groep">
                <label>Wachtwoord *</label>
                <input
                  type="password"
                  value={nieuwGebruiker.wachtwoord}
                  onChange={(e) => setNieuwGebruiker({ ...nieuwGebruiker, wachtwoord: e.target.value })}
                  required
                  placeholder="Minimaal 6 tekens"
                />
              </div>

              <div className="veld-groep">
                <label>Rol</label>
                <select
                  value={nieuwGebruiker.rol}
                  onChange={(e) => setNieuwGebruiker({ ...nieuwGebruiker, rol: e.target.value })}
                >
                  <option value="user">Medewerker</option>
                  <option value="admin">Beheerder</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn-primair">Account aanmaken</button>
          </form>
        </div>
      )}

      {/* Gebruikerslijst */}
      <table className="gebruikers-tabel">
        <thead>
          <tr>
            <th>Naam</th>
            <th>E-mail</th>
            <th>Rol</th>
            <th>Aangemaakt op</th>
            <th>Acties</th>
          </tr>
        </thead>
        <tbody>
          {gebruikers.map((gebruiker) => (
            <tr key={gebruiker.id}>
              <td>{gebruiker.naam}</td>
              <td>{gebruiker.email}</td>
              <td>
                {/* Rol aanpassen via dropdown */}
                <select
                  value={gebruiker.rol}
                  onChange={(e) => wijzigRol(gebruiker.id, e.target.value)}
                  className="rol-select"
                >
                  <option value="user">Medewerker</option>
                  <option value="admin">Beheerder</option>
                </select>
              </td>
              <td>{new Date(gebruiker.aangemaakt_op).toLocaleDateString('nl-NL')}</td>
              <td>
                <button
                  onClick={() => verwijderGebruiker(gebruiker.id, gebruiker.naam)}
                  className="btn-klein btn-gevaarlijk"
                >
                  Verwijderen
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
