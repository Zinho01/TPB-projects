// Navigatiebalk bovenaan de pagina
// Toont andere links afhankelijk van of je admin bent of niet

import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { gebruiker, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Uitloggen en terugsturen naar de loginpagina
  function handleLogout() {
    logout()
    navigate('/login')
  }

  // Geeft een actieve stijl aan de huidige paginalink
  function isActief(pad: string) {
    return location.pathname === pad ? 'nav-link actief' : 'nav-link'
  }

  return (
    <nav className="navbar">
      <div className="navbar-merk">
        <span className="merk-naam">TaskManager</span>
      </div>

      <div className="navbar-links">
        <Link to="/dashboard" className={isActief('/dashboard')}>Dashboard</Link>
        <Link to="/taken" className={isActief('/taken')}>Taken</Link>
        <Link to="/tijdregistratie" className={isActief('/tijdregistratie')}>Tijdregistratie</Link>
        <Link to="/rapportages" className={isActief('/rapportages')}>Rapportages</Link>

        {/* Admin ziet ook de gebruikersbeheer pagina */}
        {isAdmin && (
          <Link to="/admin" className={isActief('/admin')}>Admin</Link>
        )}
      </div>

      <div className="navbar-gebruiker">
        <span className="gebruiker-naam">{gebruiker?.naam}</span>
        <span className="gebruiker-rol">{gebruiker?.rol === 'admin' ? 'Beheerder' : 'Medewerker'}</span>
        <button onClick={handleLogout} className="btn-uitloggen">Uitloggen</button>
      </div>
    </nav>
  )
}
