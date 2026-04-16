// API client: alle communicatie met de backend gaat via dit bestand
// Zo hoef je niet overal de URL en token te herhalen

const API_URL = 'http://localhost:3001/api'

// Haal het opgeslagen token op uit localStorage
function getToken(): string | null {
  return localStorage.getItem('token')
}

// Basis fetch functie met automatisch token in de header
async function apiRequest(pad: string, opties: RequestInit = {}) {
  const token = getToken()

  const response = await fetch(`${API_URL}${pad}`, {
    ...opties,
    headers: {
      'Content-Type': 'application/json',
      // Voeg het token toe als de gebruiker ingelogd is
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opties.headers,
    },
  })

  // Als de server een fout teruggeeft, gooi dan een error
  if (!response.ok) {
    const fout = await response.json().catch(() => ({ bericht: 'Onbekende fout' }))
    throw new Error(fout.bericht || 'Er ging iets mis')
  }

  return response.json()
}

// Geëxporteerde functies voor GET, POST, PUT, DELETE
export const api = {
  get: (pad: string) => apiRequest(pad),
  post: (pad: string, data: unknown) => apiRequest(pad, { method: 'POST', body: JSON.stringify(data) }),
  put: (pad: string, data: unknown) => apiRequest(pad, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (pad: string) => apiRequest(pad, { method: 'DELETE' }),
}
