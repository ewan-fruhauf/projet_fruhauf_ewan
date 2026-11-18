require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');

const pollutionRoutes = require('./routes/pollution.routes');
const userRoutes = require('./routes/user.routes');
const { seedIfEmpty } = require('./controllers/pollution.controller');
const { seedUsersIfEmpty } = require('./controllers/user.controller');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes principales de l'API REST
app.use('/api/pollutions', pollutionRoutes);
app.use('/api/users', userRoutes);

// Route d'accueil (vérification de l'état de l'API)
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'API REST Node.js / Sequelize (Pollutions & Utilisateurs)',
    endpoints: ['/api/pollutions', '/api/users']
  });
});

// Connexion à PostgreSQL, synchronisation des tables et lancement du serveur
async function startServer() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    await seedIfEmpty();
    await seedUsersIfEmpty();
    console.log('✅ Base PostgreSQL connectée et synchronisée.');
  } catch (error) {
    console.error('⚠️ Base PostgreSQL non disponible :', error.message);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Serveur API démarré sur le port ${PORT}`);
  });
}

startServer();
