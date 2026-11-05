require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const pollutionRoutes = require('./routes/pollution.routes');
const { seedIfEmpty } = require('./controllers/pollution.controller');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Routes de l'API (supporte /api/pollution et /api/pollutions)
app.use('/api/pollutions', pollutionRoutes);
app.use('/api/pollution', pollutionRoutes);

// Route d'inscription auth (présente dans le TP précédent)
app.post('/api/signup', (req, res) => {
  const { login, email, nom, prenom } = req.body;

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

// Route racine d'accueil et statut
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'API REST Pollution active avec PostgreSQL et Sequelize',
    endpoints: {
      pollutions: '/api/pollutions (ou /api/pollution)',
      signup: '/api/signup'
    }
  });
});

// Synchronisation avec la base de données et démarrage du serveur
async function startServer() {
  try {
    // Authentification auprès de PostgreSQL
    await sequelize.authenticate();
    console.log('✅ Connexion à PostgreSQL établie avec succès.');

    // Synchronisation des modèles (crée la table 'pollution' si elle n'existe pas)
    await sequelize.sync({ alter: true });
    console.log('✅ Table "pollution" synchronisée avec la base de données.');

    // Peuplement initial des données si la table est vide
    await seedIfEmpty();

    app.listen(PORT, () => {
      console.log(`🚀 Serveur en écoute sur le port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Impossible de se connecter à la base de données PostgreSQL :', error.message);
    app.listen(PORT, () => {
      console.log(`⚠️ Serveur démarré sur le port ${PORT} sans connexion PostgreSQL active.`);
    });
  }
}

startServer();
