const { Sequelize } = require('sequelize');
require('dotenv').config();

// Récupération de l'URL de connexion fournie par Render ou en local
const databaseUrl = process.env.DATABASE_URL;

let sequelize;

if (databaseUrl) {
  // Configuration pour Render PostgreSQL (SSL requis) ou URL directe
  const isInternal = databaseUrl.includes('render.com') || process.env.NODE_ENV === 'production';
  
  sequelize = new Sequelize(databaseUrl, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: isInternal ? {
      ssl: {
        require: true,
        rejectUnauthorized: false // Indispensable pour les connexions SSL managées sur Render
      }
    } : {}
  });
} else {
  // Configuration locale avec variables séparées (fallback)
  sequelize = new Sequelize(
    process.env.DB_NAME || 'pollutions_db',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASS || 'postgres',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: false
    }
  );
}

module.exports = sequelize;

