# The Pixel Bakery — Task Manager v1.0

Dit is versie 1.0 van de interne task manager tool van The Pixel Bakery. Gebouwd met React + TypeScript (Vite) aan de frontend en een Express/Node.js backend met MySQL. De bedoeling is dat dit op termijn uitgroeit tot een volwaardig intern dashboard voor taakbeheer, tijdregistratie en teamoverzicht.

---

## Vereisten

- [Node.js](https://nodejs.org/) v18 of hoger
- MySQL via **XAMPP** (Windows/Mac) of **LAMPP** (Linux)

---

## 1. MySQL starten

**XAMPP:** start de Apache en MySQL module via het XAMPP Control Panel.

**Linux (LAMPP):** controleer of MySQL draait en start hem indien nodig:

```bash
sudo systemctl status mysql
sudo systemctl start mysql
```

---

## 2. Database importeren

Importeer het schema in MySQL. Dit maakt de database aan en voegt een standaard admin-account toe.

**Via de terminal:**
```bash
mysql -u root -p < Intern-Tool/backend/schema.sql
```

**Via phpMyAdmin (XAMPP/LAMPP):**
Ga naar `http://localhost/phpmyadmin`, maak een database `taskmanager` aan en importeer `Intern-Tool/backend/schema.sql`.

Standaard inloggegevens:
- **E-mail:** `admin@taskmanager.nl`
- **Wachtwoord:** `admin123`

---

## 3. Backend instellen

Maak een `.env` bestand aan op basis van het voorbeeld:

```bash
cd Intern-Tool/backend
cp .env.example .env
```

Pas `.env` aan met jouw gegevens. Hieronder staan de fallback gegevens die gebruikt worden voor het portfolio-examen — dit is mock data en niet bedoeld voor productie:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=pixeldam020
DB_NAME=taskmanager
JWT_SECRET=verander_dit_naar_iets_veiligs
PORT=3001
```

Installeer de dependencies:

```bash
npm install
```

---

## 4. Opstarten — split terminal

Je hebt twee terminalvensters nodig: één voor de backend, één voor de frontend.

**Terminal 1 — backend:**
```bash
cd Intern-Tool/backend
npm run dev
```

**Terminal 2 — frontend:**
```bash
cd Intern-Tool
npm install
npm run dev
```

Ga daarna naar `http://localhost:5173` in je browser.
