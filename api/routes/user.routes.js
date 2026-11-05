const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

// CRUD & Opérations Utilisateur (Consignes TP 04)
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);
router.delete('/:id', userController.deleteUser);
router.post('/login', userController.login);

module.exports = router;

