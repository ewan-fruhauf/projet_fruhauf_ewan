-- ======================================================================
-- TP 04 : Script d'initialisation PostgreSQL (utilisable dans pgAdmin)
-- ======================================================================

-- 1. Table des Pollutions
CREATE TABLE IF NOT EXISTS pollution (
    id SERIAL PRIMARY KEY,
    titre VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL DEFAULT 'Autre',
    description TEXT,
    lieu VARCHAR(255) NOT NULL DEFAULT 'Non précisé',
    "dateObservation" VARCHAR(50),
    latitude DOUBLE PRECISION DEFAULT 0,
    longitude DOUBLE PRECISION DEFAULT 0,
    "photoUrl" TEXT,
    auteur VARCHAR(255) DEFAULT 'Anonyme',
    gravite VARCHAR(50) DEFAULT 'Moyenne',
    statut VARCHAR(50) DEFAULT 'En attente',
    "dateCreation" VARCHAR(100)
);

-- 2. Table des Utilisateurs (TP 04)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    login VARCHAR(150) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    nom VARCHAR(150) NOT NULL,
    prenom VARCHAR(150) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(100) NOT NULL DEFAULT 'Agent de terrain',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Données de test initiales pour les pollutions
INSERT INTO pollution (titre, type, description, lieu, "dateObservation", latitude, longitude, "photoUrl", auteur, gravite, statut, "dateCreation")
VALUES 
(
  'Décharge sauvage en bordure de forêt',
  'Dépôt sauvage',
  'Accumulation d''encombrants, vieux pneus et gravats de chantier abandonnés le long du chemin forestier.',
  'Forêt de Fontainebleau, Seine-et-Marne',
  '2026-10-18',
  48.4047,
  2.7016,
  'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=800&q=80',
  'Garde Forestier',
  'Critique',
  'En attente',
  '2026-10-18T14:32:00.000Z'
),
(
  'Nappe d''hydrocarbures sur berge fluviale',
  'Eau',
  'Nappe irisée avec forte odeur de carburant observée sur la berge suite à un dégazage ou fuite de cuve suspectée.',
  'Quai fluvial, Rouen (Seine-Maritime)',
  '2026-10-19',
  49.4432,
  1.0999,
  'https://images.unsplash.com/photo-1527525443983-6e60c75fff46?auto=format&fit=crop&w=800&q=80',
  'Sarah Connor',
  'Critique',
  'En cours',
  '2026-10-19T09:15:00.000Z'
)
ON CONFLICT DO NOTHING;

-- Données de test initiales pour les utilisateurs (TP 04)
INSERT INTO users (login, email, nom, prenom, password, role)
VALUES
('agent_eco', 'alex.martin@terrashield.org', 'Martin', 'Alex', 'Password123!', 'Agent de terrain'),
('admin', 'admin@terrashield.org', 'Dupont', 'Alice', 'AdminPassword123!', 'Administrateur'),
('jdupont', 'jean.dupont@terrashield.org', 'Dupont', 'Jean', 'UserPassword123!', 'Enquêteur Environnement')
ON CONFLICT (login) DO NOTHING;

-- Vérification
SELECT * FROM pollution;
SELECT id, login, email, nom, prenom, role, "createdAt" FROM users;
