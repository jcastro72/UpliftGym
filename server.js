// Import the Express framework to create backend server and handle requests
const express = require('express');

// Import the CORS middleware to allow frontend to call your backend API
const cors = require('cors');

// Import dotenv to load variables from .env file into process.env
require('dotenv').config();

// Node.js path module to handle file paths
const path = require('path');

// Import route handlers for users, bookings, and classes
const usersRoutes = require('./routes/usersRoutes');
const bookingsRoutes = require('./routes/bookingsRoutes');
const classRoutes = require('./routes/classRoutes');

// Import the database connection from db.js
// This is required if you want to keep routes like /test-db and /db-health
const db = require('./db'); // <--- Make sure db.js exports the connection

// Create an instance of the Express application
const app = express();

// Simple test route to confirm the server is running
app.get('/server-test', (req, res) => {
  res.send('Server is working');
});

// Serve the HTML files from the public folder
app.use(express.static(path.join(__dirname, "public")));

// Default route to serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Use CORS middleware to enable cross-origin requests
const corsOrigin = process.env.CORS_ORIGIN;
if (corsOrigin) {
  // If CORS origins are specified in .env, only allow those
  const origins = corsOrigin.split(',').map((value) => value.trim()).filter(Boolean);
  app.use(cors({ origin: origins }));
} else {
  // If not specified, allow all origins (not recommended for production)
  app.use(cors());
}

// Use built-in middleware to parse JSON request bodies
app.use(express.json());

// Mount route handlers for their respective endpoints
app.use('/users', usersRoutes);
app.use('/bookings', bookingsRoutes);
app.use('/class', classRoutes);

// Optional test route to check database connection
// Only works if you import `db` from db.js
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

// Optional route to verify database health
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

// Simple route to check server health
app.get('/health', (req, res) => {
  res.json({
    ok: true,
    message: 'Backend is running',
    uptimeSeconds: Math.round(process.uptime())
  });
});

// Start the server and listen on the port defined in .env or default to 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});

