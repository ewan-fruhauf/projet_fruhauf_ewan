const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Pollution = sequelize.define('Pollution', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  titre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Autre'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  lieu: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Non précisé'
  },
  dateObservation: {
    type: DataTypes.STRING,
    allowNull: true
  },
  latitude: {
    type: DataTypes.DOUBLE,
    allowNull: true,
    defaultValue: 0
  },
  longitude: {
    type: DataTypes.DOUBLE,
    allowNull: true,
    defaultValue: 0
  },
  photoUrl: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  auteur: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'Anonyme'
  },
  gravite: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'Moyenne'
  },
  statut: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'En attente'
  },
  dateCreation: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'pollution',
  timestamps: false
});

module.exports = Pollution;
