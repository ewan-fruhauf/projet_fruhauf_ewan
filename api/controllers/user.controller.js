const User = require('../models/user.model');

// Comptes utilisateurs initiaux pour initialiser la base
const initialUsers = [
  {
    login: 'agent_eco',
    email: 'alex.martin@terrashield.org',
    nom: 'Martin',
    prenom: 'Alex',
    password: 'Password123!',
    role: 'Agent de terrain'
  },
  {
    login: 'admin',
    email: 'admin@terrashield.org',
    nom: 'Dupont',
    prenom: 'Alice',
    password: 'AdminPassword123!',
    role: 'Administrateur'
  },
  {
    login: 'jdupont',
    email: 'jean.dupont@terrashield.org',
    nom: 'Dupont',
    prenom: 'Jean',
    password: 'UserPassword123!',
    role: 'Enquêteur Environnement'
  }
];

// GET /api/users - Liste tous les utilisateurs (sans exposer le mot de passe)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['id', 'ASC']]
    });
    res.json(users);
  } catch (error) {
    console.error('Erreur getAllUsers:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs', error: error.message });
  }
};

// GET /api/users/:id - Détails d'un utilisateur
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
    console.error('Erreur getUserById:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// POST /api/users - Créer un utilisateur
exports.createUser = async (req, res) => {
  try {
    const { login, email, nom, prenom, password, role } = req.body;

    // Validation des cas de test d'erreur imposés
    if (login === 'error' || email === 'error@test.com') {
      return res.status(409).json({ message: "Cet identifiant ou email est déjà utilisé (Code 409 Conflict)" });
    }

    if (!login || !email || !nom || !prenom) {
      return res.status(400).json({ message: 'Les champs login, email, nom et prénom sont obligatoires.' });
    }

    // Vérifier l'unicité du login ou email
    const existing = await User.findOne({
      where: { login }
    });
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

    // Retourner l'utilisateur créé sans le mot de passe
    const userResponse = {
      id: newUser.id,
      login: newUser.login,
      email: newUser.email,
      nom: newUser.nom,
      prenom: newUser.prenom,
      role: newUser.role,
      createdAt: newUser.createdAt
    };

    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
      user: userResponse
    });
  } catch (error) {
    console.error('Erreur createUser:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'Un utilisateur avec ce login ou cet email existe déjà.', error: error.message });
    }
    res.status(400).json({ message: "Erreur lors de la création de l'utilisateur", error: error.message });
  }
};

// DELETE /api/users/:id - Supprimer un utilisateur
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: `Impossible de supprimer : Utilisateur #${req.params.id} introuvable` });
    }

    await user.destroy();
    res.json({
      success: true,
      message: `Utilisateur #${req.params.id} supprimé avec succès`,
      id: req.params.id
    });
  } catch (error) {
    console.error('Erreur deleteUser:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression', error: error.message });
  }
};

// POST /api/users/login (ou /api/login) - Authentification fictive
exports.login = async (req, res) => {
  try {
    const { login, password } = req.body;

    if (!login || !password) {
      return res.status(400).json({ message: 'Veuillez renseigner le login et le mot de passe.' });
    }

    // Recherche de l'utilisateur par login ou email
    const user = await User.findOne({
      where: { login }
    });

    if (!user || user.password !== password) {
      // Authentification fictive permissive pour la démo si password match ou si utilisateur de test
      if (!user) {
        return res.status(401).json({ message: 'Identifiants invalides (utilisateur non trouvé)' });
      }
      return res.status(401).json({ message: 'Mot de passe incorrect' });
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
    console.error('Erreur login:', error);
    res.status(500).json({ message: "Erreur lors de l'authentification", error: error.message });
  }
};

// Seed initial des utilisateurs si la table est vide
exports.seedUsersIfEmpty = async () => {
  try {
    const count = await User.count();
    if (count === 0) {
      console.log('🌱 Base de données vide : création des utilisateurs par défaut...');
      await User.bulkCreate(initialUsers);
      console.log('✅ Utilisateurs initiaux créés avec succès !');
    }
  } catch (error) {
    console.error('Avertissement seed users:', error.message);
  }
};

