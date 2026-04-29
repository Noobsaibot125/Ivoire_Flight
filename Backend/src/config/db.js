const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false, // Disable logging or set to console.log to see SQL queries
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connexion à la base de données MySQL réussie.');
    // Synchronize models (in dev environment)
    // await sequelize.sync({ alter: true });
  } catch (error) {
    console.error('Erreur de connexion à la base de données :', error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
