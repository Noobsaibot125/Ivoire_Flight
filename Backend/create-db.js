const mysql = require('mysql2/promise');
require('dotenv').config();

async function createDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
    });
    
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
    console.log(`Base de données '${process.env.DB_NAME}' créée ou déjà existante.`);
    
    await connection.end();
  } catch (error) {
    console.error('Erreur lors de la création de la base de données:', error);
  }
}

createDatabase();
