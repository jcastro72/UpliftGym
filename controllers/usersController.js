const db = require('../db');

// GET all users
function getAllUsers(req, res) {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
}

// CREATE user
function createUser(req, res) {
  const { first_name, last_name, email, password } = req.body;

  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({ error: "All fields required" });
  }

  const sql = `
    INSERT INTO users (first_name, last_name, email, password)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [first_name, last_name, email, password], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json({
      user_ID: result.insertId,
      first_name,
      last_name,
      email
    });
  });
}

// LOGIN user
function loginUser(req, res) {
  const { email, password } = req.body;

  const sql = 'SELECT * FROM users WHERE email = ?';

  db.query(sql, [email], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    if (results.length === 0) {
      return res.status(400).json({ error: "User not found" });
    }

    const user = results[0];

    if (user.password !== password) {
      return res.status(401).json({ error: "Invalid password" });
    }

    res.json({
      message: "Login successful",
      user
    });
  });
}

module.exports = { getAllUsers, createUser, loginUser };
