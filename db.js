// db.js
// Handles database connection using MySQL2

const mysql = require('mysql2');

// Load environment variables from .env
require('dotenv').config();

// Create a database configuration object
// You can switch between local and Raspberry Pi just by updating your .env
const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1', // local or Raspberry Pi IP
  port: Number(process.env.DB_PORT || 3306), // default MySQL port
  user: process.env.DB_USER || 'root',       // DB username
  password: process.env.DB_PASSWORD || '',   // DB password
  database: process.env.DB_NAME || 'uplift_gym', // database name
};

// Create a connection to the database
const db = mysql.createConnection(dbConfig);

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
  } else {
    console.log(`Connected to MySQL (${dbConfig.host}:${dbConfig.port}/${dbConfig.database})`);
  }
});

// Export the connection so other files (like server.js or controllers) can use it
module.exports = db;