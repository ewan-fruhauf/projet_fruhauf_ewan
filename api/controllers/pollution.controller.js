const Pollution = require('../models/pollution.model');
const { initialPollutions } = require('../config/seed-data');

// GET /api/pollutions : Lister toutes les pollutions
exports.getAllPollutions = async (req, res) => {
  try {
    const pollutions = await Pollution.findAll({ order: [['id', 'DESC']] });
    res.json(pollutions);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des pollutions', error: error.message });
  }
};

// GET /api/pollutions/:id : Détails d'une pollution
exports.getPollutionById = async (req, res) => {
  try {
    const pollution = await Pollution.findByPk(req.params.id);
    if (!pollution) {
      return res.status(404).json({ message: `Pollution #${req.params.id} introuvable` });
    }
    res.json(pollution);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// POST /api/pollutions : Ajouter une pollution
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
    res.status(400).json({ message: 'Erreur lors de la création de la pollution', error: error.message });
  }
};

// PUT /api/pollutions/:id : Modifier une pollution
exports.updatePollution = async (req, res) => {
  try {
    const pollution = await Pollution.findByPk(req.params.id);
    if (!pollution) {
      return res.status(404).json({ message: `Pollution #${req.params.id} introuvable` });
    }
    await pollution.update(req.body);
    res.json(pollution);
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la mise à jour', error: error.message });
  }
};

// DELETE /api/pollutions/:id : Supprimer une pollution
exports.deletePollution = async (req, res) => {
  try {
    const pollution = await Pollution.findByPk(req.params.id);
    if (!pollution) {
      return res.status(404).json({ message: `Pollution #${req.params.id} introuvable` });
    }
    await pollution.destroy();
    res.json({ success: true, message: `Pollution #${req.params.id} supprimée`, id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression', error: error.message });
  }
};

// Remplit la table avec les données par défaut si elle est vide
exports.seedIfEmpty = async () => {
  const count = await Pollution.count();
  if (count === 0) {
    await Pollution.bulkCreate(initialPollutions);
    console.log('✅ Pollutions initiales insérées.');
  }
};
