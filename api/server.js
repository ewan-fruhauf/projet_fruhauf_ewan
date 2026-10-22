const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Base de données en mémoire
let pollutions = [
  {
    id: 1,
    titre: 'Décharge sauvage en bordure de forêt',
    type: 'Dépôt sauvage',
    description: "Accumulation d'encombrants, vieux pneus et gravats de chantier abandonnés le long du chemin forestier.",
    lieu: 'Forêt de Fontainebleau, Seine-et-Marne',
    dateObservation: '2026-10-18',
    latitude: 48.4047,
    longitude: 2.7016,
    photoUrl: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=800&q=80',
    auteur: 'Garde Forestier',
    gravite: 'Critique',
    statut: 'En attente',
    dateCreation: '2026-10-18T14:32:00.000Z'
  },
  {
    id: 2,
    titre: "Nappe d'hydrocarbures sur berge fluviale",
    type: 'Eau',
    description: "Nappe irisée avec forte odeur de carburant observée sur la berge suite à un dégazage ou fuite de cuve suspectée.",
    lieu: 'Quai fluvial, Rouen (Seine-Maritime)',
    dateObservation: '2026-10-19',
    latitude: 49.4432,
    longitude: 1.0999,
    photoUrl: 'https://images.unsplash.com/photo-1527525443983-6e60c75fff46?auto=format&fit=crop&w=800&q=80',
    auteur: 'Sarah Connor',
    gravite: 'Critique',
    statut: 'En cours',
    dateCreation: '2026-10-19T09:15:00.000Z'
  },
  {
    id: 3,
    titre: 'Amas de microplastiques et emballages sur plage',
    type: 'Plastique',
    description: 'Grande quantité de bouteilles, filets de pêche et microparticules plastiques échoués après la dernière marée haute.',
    lieu: 'Plage de la Côte des Basques, Biarritz',
    dateObservation: '2026-10-20',
    latitude: 43.4795,
    longitude: -1.5647,
    photoUrl: 'https://images.unsplash.com/photo-1621451537084-482c73073a0f?auto=format&fit=crop&w=800&q=80',
    auteur: 'Alexandre Dumas',
    gravite: 'Moyenne',
    statut: 'En attente',
    dateCreation: '2026-10-20T16:45:00.000Z'
  },
  {
    id: 4,
    titre: "Fumées âcres et épaisses d'origine industrielle",
    type: 'Air',
    description: 'Émanations de fumées noires et odeurs soufrées intenses signalées par les riverains aux abords de la zone artisanale.',
    lieu: 'Zone industrielle Nord, Feyzin (Lyon)',
    dateObservation: '2026-10-21',
    latitude: 45.6719,
    longitude: 4.8589,
    photoUrl: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?auto=format&fit=crop&w=800&q=80',
    auteur: 'Thomas Pesquet',
    gravite: 'Critique',
    statut: 'En cours',
    dateCreation: '2026-10-21T11:20:00.000Z'
  },
  {
    id: 5,
    titre: 'Bidons de solvants abandonnés en zone agricole',
    type: 'Chimique',
    description: 'Trois fûts métalliques de 50L corrodés avec étiquetage de risque chimique laissés près d\'un fossé de drainage.',
    lieu: 'Bordure de champ, Beauce (Chartres)',
    dateObservation: '2026-10-22',
    latitude: 48.4561,
    longitude: 1.4841,
    photoUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80',
    auteur: 'Camille Claudel',
    gravite: 'Critique',
    statut: 'Traité',
    dateCreation: '2026-10-22T08:10:00.000Z'
  }
];

// --- 1. ROUTE D'INSCRIPTION : POST /api/signup ---
app.post('/api/signup', (req, res) => {
  const { login, email, nom, prenom, password } = req.body;

  if (login === 'error' || email === 'error@test.com') {
    return res.status(409).json({ message: "Cet identifiant est déjà utilisé (Code 409 Conflict)" });
  }

  return res.status(201).json({
    success: true,
    message: 'Inscription enregistrée avec succès',
    user: {
      id: Math.floor(Math.random() * 9000) + 1000,
      login,
      email,
      nom,
      prenom,
      createdAt: new Date().toISOString()
    }
  });
});

// --- 2. GESTION DES POLLUTIONS (CRUD) ---

// 2.A : READ ALL -> GET /api/pollutions
app.get('/api/pollutions', (req, res) => {
  res.json(pollutions);
});

// 2.B : READ ONE -> GET /api/pollutions/:id
app.get('/api/pollutions/:id', (req, res) => {
  const id = req.params.id;
  const found = pollutions.find(p => String(p.id) === String(id));
  if (!found) {
    return res.status(404).json({ message: `Pollution #${id} introuvable` });
  }
  res.json(found);
});

// 2.C : CREATE -> POST /api/pollutions
app.post('/api/pollutions', (req, res) => {
  const body = req.body;
  const maxId = pollutions.reduce((max, p) => (Number(p.id) > max ? Number(p.id) : max), 0);
  const newPollution = {
    id: maxId + 1,
    titre: body.titre || 'Signalement sans titre',
    type: body.type || 'Autre',
    description: body.description || '',
    lieu: body.lieu || 'Non précisé',
    dateObservation: body.dateObservation || new Date().toISOString().split('T')[0],
    latitude: Number(body.latitude) || 0,
    longitude: Number(body.longitude) || 0,
    photoUrl: body.photoUrl || undefined,
    auteur: body.auteur || 'Agent Anonyme',
    gravite: body.gravite || 'Moyenne',
    statut: body.statut || 'En attente',
    dateCreation: new Date().toISOString()
  };

  pollutions.unshift(newPollution);
  res.status(201).json(newPollution);
});

// 2.D : UPDATE -> PUT /api/pollutions/:id
app.put('/api/pollutions/:id', (req, res) => {
  const id = req.params.id;
  const index = pollutions.findIndex(p => String(p.id) === String(id));
  if (index === -1) {
    return res.status(404).json({ message: `Impossible de modifier : Pollution #${id} introuvable` });
  }

  pollutions[index] = {
    ...pollutions[index],
    ...req.body,
    id: pollutions[index].id
  };

  res.json(pollutions[index]);
});

// 2.E : DELETE -> DELETE /api/pollutions/:id
app.delete('/api/pollutions/:id', (req, res) => {
  const id = req.params.id;
  const initialLength = pollutions.length;
  pollutions = pollutions.filter(p => String(p.id) !== String(id));

  if (pollutions.length < initialLength) {
    res.json({ success: true, message: `Pollution #${id} supprimée avec succès`, id });
  } else {
    res.status(404).json({ message: `Impossible de supprimer : Pollution #${id} introuvable` });
  }
});

app.listen(PORT, () => {
  console.log(`API REST Pollution active sur le port ${PORT}`);
});
