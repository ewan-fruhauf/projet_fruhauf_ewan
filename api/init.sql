-- Script d'initialisation de la table 'pollution' dans PostgreSQL via pgAdmin
-- (Ce script est facultatif car Sequelize synchronise et crée automatiquement la table au démarrage de l'API)

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

-- Insertion de données de test initiales
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
),
(
  'Amas de microplastiques et emballages sur plage',
  'Plastique',
  'Grande quantité de bouteilles, filets de pêche et microparticules plastiques échoués après la dernière marée haute.',
  'Plage de la Côte des Basques, Biarritz',
  '2026-10-20',
  43.4795,
  -1.5647,
  'https://images.unsplash.com/photo-1621451537084-482c73073a0f?auto=format&fit=crop&w=800&q=80',
  'Alexandre Dumas',
  'Moyenne',
  'En attente',
  '2026-10-20T16:45:00.000Z'
);

-- Vérification des enregistrements
SELECT * FROM pollution;

