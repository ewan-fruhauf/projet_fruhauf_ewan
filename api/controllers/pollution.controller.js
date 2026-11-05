const Pollution = require('../models/pollution.model');

// Données initiales pour peupler automatiquement la table si elle est vide
const initialPollutions = [
  {
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
    titre: 'Bidons de solvants abandonnés en zone agricole',
    type: 'Chimique',
    description: "Trois fûts métalliques de 50L corrodés avec étiquetage de risque chimique laissés près d'un fossé de drainage.",
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

// GET /api/pollutions
exports.getAllPollutions = async (req, res) => {
  try {
    const pollutions = await Pollution.findAll({
      order: [['id', 'DESC']]
    });
    res.json(pollutions);
  } catch (error) {
    console.error('Erreur getAllPollutions:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des pollutions', error: error.message });
  }
};

// GET /api/pollutions/:id
exports.getPollutionById = async (req, res) => {
  try {
    const pollution = await Pollution.findByPk(req.params.id);
    if (!pollution) {
      return res.status(404).json({ message: `Pollution #${req.params.id} introuvable` });
    }
    res.json(pollution);
  } catch (error) {
    console.error('Erreur getPollutionById:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// POST /api/pollutions
exports.createPollution = async (req, res) => {
  try {
    const body = req.body;
    const newPollution = await Pollution.create({
      titre: body.titre || 'Signalement sans titre',
      type: body.type || 'Autre',
      description: body.description || '',
      lieu: body.lieu || 'Non précisé',
      dateObservation: body.dateObservation || new Date().toISOString().split('T')[0],
      latitude: Number(body.latitude) || 0,
      longitude: Number(body.longitude) || 0,
      photoUrl: body.photoUrl || null,
      auteur: body.auteur || 'Agent Anonyme',
      gravite: body.gravite || 'Moyenne',
      statut: body.statut || 'En attente',
      dateCreation: new Date().toISOString()
    });
    res.status(201).json(newPollution);
  } catch (error) {
    console.error('Erreur createPollution:', error);
    res.status(400).json({ message: 'Erreur lors de la création de la pollution', error: error.message });
  }
};

// PUT /api/pollutions/:id
exports.updatePollution = async (req, res) => {
  try {
    const pollution = await Pollution.findByPk(req.params.id);
    if (!pollution) {
      return res.status(404).json({ message: `Impossible de modifier : Pollution #${req.params.id} introuvable` });
    }
    await pollution.update(req.body);
    res.json(pollution);
  } catch (error) {
    console.error('Erreur updatePollution:', error);
    res.status(400).json({ message: 'Erreur lors de la mise à jour', error: error.message });
  }
};

// DELETE /api/pollutions/:id
exports.deletePollution = async (req, res) => {
  try {
    const pollution = await Pollution.findByPk(req.params.id);
    if (!pollution) {
      return res.status(404).json({ message: `Impossible de supprimer : Pollution #${req.params.id} introuvable` });
    }
    await pollution.destroy();
    res.json({ success: true, message: `Pollution #${req.params.id} supprimée avec succès`, id: req.params.id });
  } catch (error) {
    console.error('Erreur deletePollution:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression', error: error.message });
  }
};

// Fonction de seed initiale (pour ne pas démarrer avec une table vide)
exports.seedIfEmpty = async () => {
  try {
    const count = await Pollution.count();
    if (count === 0) {
      console.log('🌱 Base de données vide : insertion des pollutions initiales...');
      await Pollution.bulkCreate(initialPollutions);
      console.log('✅ Pollutions initiales créées avec succès !');
    }
  } catch (error) {
    console.error('Avertissement seed initial:', error.message);
  }
};

