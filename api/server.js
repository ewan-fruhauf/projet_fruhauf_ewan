require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');

// Import des routes
const pollutionRoutes = require('./routes/pollution.routes');
const userRoutes = require('./routes/user.routes');

// Import des graines de données (seeds)
const { seedIfEmpty } = require('./controllers/pollution.controller');
const { seedUsersIfEmpty, createUser, login } = require('./controllers/user.controller');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Routes pour la gestion des pollutions (TP 03 & TP 04)
app.use('/api/pollutions', pollutionRoutes);
app.use('/api/pollution', pollutionRoutes);

// Routes pour la gestion des utilisateurs (TP 04)
app.use('/api/users', userRoutes);
app.use('/api/user', userRoutes);

// Routes de compatibilité directe
app.post('/api/signup', createUser);
app.post('/api/login', login);

// Route racine d'accueil et documentation des endpoints REST
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    project: 'TP 04 — API REST Node.js pour la gestion des pollutions et des utilisateurs',
    orm: 'Sequelize',
    database: 'PostgreSQL',
    endpoints: {
      users: {
        list: 'GET /api/users',
        details: 'GET /api/users/:id',
        create: 'POST /api/users',
        delete: 'DELETE /api/users/:id',
        login: 'POST /api/users/login (ou /api/login)'
      },
      pollutions: {
        list: 'GET /api/pollutions (ou /api/pollution)',
        details: 'GET /api/pollutions/:id',
        create: 'POST /api/pollutions',
        update: 'PUT /api/pollutions/:id',
        delete: 'DELETE /api/pollutions/:id'
      }
    }
  });
});

// Démarrage du serveur et synchronisation avec la base PostgreSQL
async function startServer() {
  try {
    // Authentification auprès de PostgreSQL
    await sequelize.authenticate();
    console.log('✅ Connexion à PostgreSQL établie avec succès.');

    // Synchronisation automatique des modèles (tables 'pollution' et 'users')
    await sequelize.sync({ alter: true });
    console.log('✅ Tables "pollution" et "users" synchronisées avec la base de données.');

    // Remplissage des données initiales si les tables sont vides
    await seedIfEmpty();
    await seedUsersIfEmpty();

    app.listen(PORT, () => {
      console.log(`🚀 Serveur TP 04 en écoute sur le port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Erreur de connexion PostgreSQL :', error.message);
    app.listen(PORT, () => {
      console.log(`⚠️ Serveur démarré sur le port ${PORT} sans connexion PostgreSQL active.`);
    });
  }
}

startServer();
