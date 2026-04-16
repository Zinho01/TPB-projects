-- Database schema voor de Task Manager tool
-- Voer dit bestand uit in MySQL Workbench of via de terminal:
-- mysql -u root -p < schema.sql

CREATE DATABASE IF NOT EXISTS taskmanager;
USE taskmanager;

-- Gebruikers tabel
-- Hierin worden alle accounts opgeslagen
-- De rol bepaalt wat iemand mag zien en doen
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  naam VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  wachtwoord VARCHAR(255) NOT NULL,       -- altijd bcrypt hash, nooit plaintext
  rol ENUM('admin', 'user') DEFAULT 'user',
  aangemaakt_op TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Taken tabel
-- Elke taak heeft een status, prioriteit en kan aan een gebruiker worden toegewezen
CREATE TABLE IF NOT EXISTS tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titel VARCHAR(200) NOT NULL,
  omschrijving TEXT,
  status ENUM('open', 'bezig', 'klaar') DEFAULT 'open',
  prioriteit ENUM('laag', 'normaal', 'hoog') DEFAULT 'normaal',
  deadline DATE,
  aangemaakt_door INT NOT NULL,           -- de gebruiker die de taak aanmaakte
  toegewezen_aan INT,                     -- de gebruiker die de taak moet uitvoeren
  aangemaakt_op TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (aangemaakt_door) REFERENCES users(id),
  FOREIGN KEY (toegewezen_aan) REFERENCES users(id) ON DELETE SET NULL
);

-- Tijdregistraties tabel
-- Hier worden start- en eindtijden per taak bijgehouden
-- Als eind_tijd leeg is, loopt de timer nog
CREATE TABLE IF NOT EXISTS time_entries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  taak_id INT NOT NULL,
  gebruiker_id INT NOT NULL,
  start_tijd DATETIME NOT NULL,
  eind_tijd DATETIME,                     -- null = timer loopt nog
  notitie TEXT,
  aangemaakt_op TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (taak_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (gebruiker_id) REFERENCES users(id)
);

-- Standaard admin account
-- Wachtwoord: admin123
-- Verander dit direct na de eerste keer inloggen!
INSERT INTO users (naam, email, wachtwoord, rol) VALUES (
  'Admin',
  'admin@taskmanager.nl',
  '$2a$10$4CcWBhbbN4zs9UXVyKn4..vS1efgLUEVtn7yPSSIBDgzypvZ.dWz.',
  'admin'
) ON DUPLICATE KEY UPDATE id=id;
