# TaskManager – Intern tijdregistratie systeem

Een intern tool voor het bijhouden van taken en gewerkte uren per medewerker.

## Functionaliteiten

- **Inloggen** met email en wachtwoord (JWT authenticatie)
- **Taken beheren** – aanmaken, toewijzen, status bijwerken, verwijderen
- **Timer** – start/stop tijdregistratie per taak
- **Tijdregistratie overzicht** – bekijk al je geregistreerde uren
- **Rapportages** – grafieken van uren per medewerker, per taak en per dag
- **Admin dashboard** – gebruikers aanmaken, rollen beheren

## Technische stack

| Onderdeel  | Technologie                     |
|------------|---------------------------------|
| Frontend   | React 19 + TypeScript + Vite    |
| Backend    | Node.js + Express + TypeScript  |
| Database   | MySQL                           |
| Auth       | JWT (JSON Web Token)            |

## Project opstarten

### Stap 1 – Database instellen

Zorg dat MySQL draait en voer het schema uit:

```bash
mysql -u root -p < backend/schema.sql
```

Of open `backend/schema.sql` in MySQL Workbench en voer het uit.

### Stap 2 – Backend instellen

```bash
cd backend

# Maak een .env bestand aan op basis van het voorbeeld
cp .env.example .env

# Open .env en vul je eigen MySQL gegevens in:
# DB_PASSWORD=jouw_wachtwoord
# JWT_SECRET=een_lange_geheime_string

# Dependencies installeren
npm install

# Backend starten (op poort 3001)
npm run dev
```

### Stap 3 – Frontend starten

Open een nieuw terminal venster:

```bash
# Terug naar de Intern-Tool hoofdmap
cd ..

# Dependencies installeren (als dat nog niet gedaan is)
npm install

# Frontend starten (op poort 5173)
npm run dev
```

### Stap 4 – Inloggen

Open de browser en ga naar: `http://localhost:5173`

Standaard inloggegevens:
- **Email:** admin@taskmanager.nl
- **Wachtwoord:** admin123

> Verander het wachtwoord na de eerste keer inloggen!

## Mapstructuur

```
Intern-Tool/
├── src/                      # React frontend
│   ├── api/
│   │   └── client.ts         # Alle communicatie met de backend
│   ├── context/
│   │   └── AuthContext.tsx   # Inlogstatus bijhouden
│   ├── components/
│   │   ├── Navbar.tsx        # Navigatiebalk
│   │   └── Timer.tsx         # Live timer component
│   ├── pages/
│   │   ├── Login.tsx         # Inlogpagina
│   │   ├── Dashboard.tsx     # Hoofdpagina na inloggen
│   │   ├── Taken.tsx         # Takenlijst
│   │   ├── TaakDetail.tsx    # Detail + tijdregistratie per taak
│   │   ├── Tijdregistratie.tsx # Overzicht van uren
│   │   ├── Rapportages.tsx   # Grafieken en statistieken
│   │   └── Admin.tsx         # Gebruikersbeheer (alleen admin)
│   ├── App.tsx               # Routing
│   └── index.css             # Alle styling
│
└── backend/                  # Express backend
    ├── src/
    │   ├── server.ts         # Hoofdserver
    │   ├── db.ts             # Database verbinding
    │   ├── middleware/
    │   │   └── auth.ts       # JWT controle
    │   └── routes/
    │       ├── auth.ts       # Login en registratie
    │       ├── tasks.ts      # Taken beheren
    │       ├── time.ts       # Tijdregistratie (start/stop timer)
    │       ├── users.ts      # Gebruikersbeheer
    │       └── reports.ts    # Rapportages genereren
    ├── schema.sql            # Database structuur
    └── .env.example          # Voorbeeld configuratie
```

## API endpoints

| Methode | Pad                        | Beschrijving                     |
|---------|----------------------------|----------------------------------|
| POST    | /api/auth/login            | Inloggen                         |
| POST    | /api/auth/register         | Nieuw account aanmaken           |
| GET     | /api/auth/mij              | Ingelogde gebruiker ophalen      |
| GET     | /api/tasks                 | Alle taken ophalen               |
| POST    | /api/tasks                 | Nieuwe taak aanmaken             |
| PUT     | /api/tasks/:id             | Taak bijwerken                   |
| DELETE  | /api/tasks/:id             | Taak verwijderen                 |
| POST    | /api/time/start/:taakId    | Timer starten                    |
| POST    | /api/time/stop/:id         | Timer stoppen                    |
| GET     | /api/time/lopend           | Actieve timer ophalen            |
| GET     | /api/reports/overzicht     | Algemene statistieken            |
| GET     | /api/reports/per-gebruiker | Uren per medewerker              |
| GET     | /api/reports/per-taak      | Uren per taak                    |
| GET     | /api/reports/week          | Uren per dag (afgelopen week)    |
| GET     | /api/users                 | Alle gebruikers (alleen admin)   |
| PUT     | /api/users/:id             | Gebruiker aanpassen (admin)      |
| DELETE  | /api/users/:id             | Gebruiker verwijderen (admin)    |
