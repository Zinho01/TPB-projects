// Middleware om te controleren of iemand ingelogd is
// Dit wordt gebruikt op routes die alleen voor ingelogde gebruikers zijn

import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

// We voegen 'gebruiker' toe aan het Request object zodat TypeScript het herkent
export type AuthRequest = Request & {
  gebruiker?: {
    id: number
    email: string
    rol: string
  }
}

// Controleer of het JWT token geldig is
// Als er geen token is of het klopt niet, stuur je een 401 (niet toegestaan) terug
export function controleerToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization']

  // Token zit in de header als: "Bearer tokenwaarde"
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    res.status(401).json({ bericht: 'Geen token gevonden, je bent niet ingelogd' })
    return
  }

  try {
    // Verificeer het token met de geheime sleutel uit .env
    const gedecodeerd = jwt.verify(token, process.env.JWT_SECRET || 'geheim') as {
      id: number
      email: string
      rol: string
    }

    // Sla de gebruikersgegevens op in het request object
    req.gebruiker = gedecodeerd
    next() // ga verder naar de volgende stap (de eigenlijke route)
  } catch {
    res.status(403).json({ bericht: 'Token is ongeldig of verlopen' })
  }
}

// Extra controle: alleen admins mogen deze route gebruiken
export function alleenAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.gebruiker?.rol !== 'admin') {
    res.status(403).json({ bericht: 'Alleen admins hebben toegang tot deze pagina' })
    return
  }
  next()
}
