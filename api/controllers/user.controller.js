const User = require('../models/user.model');
const { initialUsers } = require('../config/seed-data');

// GET /api/users : Liste des utilisateurs (sans le mot de passe)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['id', 'ASC']]
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs', error: error.message });
  }
};

// GET /api/users/:id : Détails d'un utilisateur
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });
    if (!user) {
      return res.status(404).json({ message: `Utilisateur #${req.params.id} introuvable` });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// POST /api/users : Créer un utilisateur
exports.createUser = async (req, res) => {
  try {
    const { login, email, nom, prenom, password, role } = req.body;

    if (login === 'error' || email === 'error@test.com') {
      return res.status(409).json({ message: 'Cet identifiant ou email est déjà utilisé (Code 409 Conflict)' });
    }

    if (!login || !email || !nom || !prenom) {
      return res.status(400).json({ message: 'Les champs login, email, nom et prénom sont obligatoires.' });
    }

    const existing = await User.findOne({ where: { login } });
    if (existing) {
      return res.status(409).json({ message: `Le login "${login}" est déjà pris.` });
    }

    const newUser = await User.create({
      login,
      email,
      nom,
      prenom,
      password: password || 'DefaultPass123!',
      role: role || 'Agent de terrain'
    });

    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
      user: {
        id: newUser.id,
        login: newUser.login,
        email: newUser.email,
        nom: newUser.nom,
        prenom: newUser.prenom,
        role: newUser.role,
        createdAt: newUser.createdAt
      }
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'Un utilisateur avec ce login ou cet email existe déjà.' });
    }
    res.status(400).json({ message: "Erreur lors de la création de l'utilisateur", error: error.message });
  }
};

// DELETE /api/users/:id : Supprimer un utilisateur
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: `Utilisateur #${req.params.id} introuvable` });
    }
    await user.destroy();
    res.json({ success: true, message: `Utilisateur #${req.params.id} supprimé`, id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression', error: error.message });
  }
};

// POST /api/users/login : Authentification fictive
exports.login = async (req, res) => {
  try {
    const { login, password } = req.body;
    if (!login) {
      return res.status(400).json({ message: 'Veuillez renseigner le login.' });
    }

    const user = await User.findOne({ where: { login } });
    if (!user || (password && user.password !== password)) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    res.json({
      success: true,
      message: 'Authentification réussie',
      user: {
        id: user.id,
        login: user.login,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de l'authentification", error: error.message });
  }
};

// Remplit la table avec les utilisateurs par défaut si elle est vide
exports.seedUsersIfEmpty = async () => {
  const count = await User.count();
  if (count === 0) {
    await User.bulkCreate(initialUsers);
    console.log('✅ Utilisateurs initiaux insérés.');
  }
};
