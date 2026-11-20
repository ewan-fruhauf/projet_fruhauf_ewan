const express = require('express');
const router = express.Router();
const pollutionController = require('../controllers/pollution.controller');

// CRUD complet /api/pollutions
router.get('/', pollutionController.getAllPollutions);
router.get('/:id', pollutionController.getPollutionById);
router.post('/', pollutionController.createPollution);
router.put('/:id', pollutionController.updatePollution);
router.delete('/:id', pollutionController.deletePollution);

module.exports = router;

