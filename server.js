// Import the Express framework to create backend server and handle requests
const express = require('express');
// Import the CORS middleware to allow frontend to call your backend API
const cors = require('cors');
// Import dotenv to load variables from .env file into process.env
require('dotenv').config();
const mysql = require('mysql2');
const path = require('path');

// Create an instance of the Express application
const app = express();

// Serve the HTML files from the public folder
app.use(express.static(path.join(__dirname, "public")));

// Use CORS middleware to enable cross-origin requests
const corsOrigin = process.env.CORS_ORIGIN;
if (corsOrigin) {
  const origins = corsOrigin.split(',').map((value) => value.trim()).filter(Boolean);
  app.use(cors({ origin: origins }));
} else {
  app.use(cors());
}
// Use built-in middleware to parse JSON request bodies
app.use(express.json());

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'appuser',
  password: process.env.DB_PASSWORD || 'AppPassword123!',
  database: process.env.DB_NAME || 'mydb'
};

const db = mysql.createConnection(dbConfig);

db.connect(err => {
  if (err) {
    console.error('Database connection failed:', err);
  } else {
    console.log(`Connected to MariaDB (${dbConfig.host}:${dbConfig.port}/${dbConfig.database})`);
  }
});

app.get('/test-db', (req, res) => {
  db.query('SELECT 1 + 1 AS result', (err, results) => {
    if (err) {
      res.status(500).json({
        ok: false,
        message: 'Database query failed'
      });
    } else {
      res.json(results);
    }
  });
});

// Define a simple route to test the server
app.get('/health', (req, res) => {
  res.json({
    ok: true,
    message: 'Backend is running',
    uptimeSeconds: Math.round(process.uptime())
  });
});

app.get('/db-health', (req, res) => {
  db.query('SELECT 1 AS ok', (err) => {
    if (err) {
      res.status(500).json({
        ok: false,
        message: 'Database is not reachable'
      });
      return;
    }

    res.json({
      ok: true,
      message: 'Database connection is healthy'
    });
  });
});

// Start the server and listen on the specified port
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});

