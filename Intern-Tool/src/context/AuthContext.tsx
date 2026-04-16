// AuthContext: beheert de inlogstatus in de hele applicatie
// Door dit als context te gebruiken hoef je de gebruikersdata niet door elk component door te geven

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { api } from '../api/client'

// Type definities: wat een gebruiker is
type Gebruiker = {
  id: number
  naam: string
  email: string
  rol: 'admin' | 'user'
}

// Alles wat je via de context kunt opvragen of aanroepen
type AuthContextType = {
  gebruiker: Gebruiker | null
  isLaden: boolean
  login: (email: string, wachtwoord: string) => Promise<void>
  logout: () => void
  isAdmin: boolean
}

// Maak de context aan
const AuthContext = createContext<AuthContextType | null>(null)

// Provider component: wikel dit om de hele app heen in main.tsx
export function AuthProvider({ children }: { children: ReactNode }) {
  const [gebruiker, setGebruiker] = useState<Gebruiker | null>(null)
  const [isLaden, setIsLaden] = useState(true)

  // Bij het opstarten: controleer of er nog een geldig token is opgeslagen
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setIsLaden(false)
      return
    }

    // Haal de gebruikersgegevens op van de server om te controleren of het token nog geldig is
    api.get('/auth/mij')
      .then((data) => setGebruiker(data))
      .catch(() => {
        // Token is verlopen of ongeldig: verwijder het
        localStorage.removeItem('token')
      })
      .finally(() => setIsLaden(false))
  }, [])

  // Inloggen: sla het token op en zet de gebruiker in de state
  async function login(email: string, wachtwoord: string) {
    const data = await api.post('/auth/login', { email, wachtwoord })
    localStorage.setItem('token', data.token)
    setGebruiker(data.gebruiker)
  }

  // Uitloggen: verwijder het token en reset de staat
  function logout() {
    localStorage.removeItem('token')
    setGebruiker(null)
  }

  const isAdmin = gebruiker?.rol === 'admin'

  return (
    <AuthContext.Provider value={{ gebruiker, isLaden, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook zodat je makkelijk de context kunt gebruiken in andere componenten
// Gebruik: const { gebruiker, login, logout } = useAuth()
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth moet binnen een AuthProvider gebruikt worden')
  }
  return context
}
