// Hoofdbestand van de frontend
// Hier worden alle pagina's gekoppeld aan een URL (routing)
// en wordt de AuthProvider om de hele app heen gezet

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'

// Pagina's importeren
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Taken from './pages/Taken'
import TaakDetail from './pages/TaakDetail'
import Tijdregistratie from './pages/Tijdregistratie'
import Rapportages from './pages/Rapportages'
import Admin from './pages/Admin'

// Beschermde route: als je niet ingelogd bent ga je naar de loginpagina
function BeschermdeRoute({ children }: { children: React.ReactNode }) {
  const { gebruiker, isLaden } = useAuth()

  // Wacht totdat we weten of iemand ingelogd is
  if (isLaden) return <div className="laden">Laden...</div>

  // Niet ingelogd? Stuur naar login
  if (!gebruiker) return <Navigate to="/login" replace />

  return (
    <>
      <Navbar />
      <main className="hoofd-inhoud">
        {children}
      </main>
    </>
  )
}

function App() {
  return (
    // AuthProvider zorgt dat de hele app toegang heeft tot de inlogstatus
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Openbare pagina: inloggen */}
          <Route path="/login" element={<Login />} />

          {/* Beschermde pagina's: alleen toegankelijk als je ingelogd bent */}
          <Route path="/dashboard" element={
            <BeschermdeRoute><Dashboard /></BeschermdeRoute>
          } />
          <Route path="/taken" element={
            <BeschermdeRoute><Taken /></BeschermdeRoute>
          } />
          <Route path="/taken/:id" element={
            <BeschermdeRoute><TaakDetail /></BeschermdeRoute>
          } />
          <Route path="/tijdregistratie" element={
            <BeschermdeRoute><Tijdregistratie /></BeschermdeRoute>
          } />
          <Route path="/rapportages" element={
            <BeschermdeRoute><Rapportages /></BeschermdeRoute>
          } />
          <Route path="/admin" element={
            <BeschermdeRoute><Admin /></BeschermdeRoute>
          } />

          {/* Standaard: ga naar het dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
