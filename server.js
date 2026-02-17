// Import the Express framework to create backend server and handle requests
const express = require('express');
// Import the CORS middleware to allow frontend to call your backend API
const cors = require('cors');
// Import dotenv to load variables from .env file into process.env
require('dotenv').config();

// Create an instance of the Express application
const app = express();
// Use CORS middleware to enable cross-origin requests
app.use(cors());
// Use built-in middleware to parse JSON request bodies
app.use(express.json());

// Define a simple route to test the server
app.get('/', (req, res) => {
  res.send('Hello from the backend server!');
});

// Start the server and listen on the specified port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

