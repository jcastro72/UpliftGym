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
  const {
    first_name,
    last_name,
    email,
    password,
    dob,
    street,
    city,
    state,
    zip,
    phone
  } = req.body;

  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({ error: "All required fields must be filled" });
  }

  const sql = `
    INSERT INTO users (
      first_name,
      last_name,
      email,
      password,
      dob,
      street,
      city,
      state,
      zip,
      phone,
      membershipActive,
      selectedPlan
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      first_name,
      last_name,
      email,
      password,
      dob,
      street,
      city,
      state,
      zip,
      phone,
      false,
      null
    ],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({
        ok: true,
        user: {
          user_ID: result.insertId,
          firstName: first_name,
          lastName: last_name,
          email,
          dob,
          street,
          city,
          state,
          zip,
          phone,
          membershipActive: false,
          selectedPlan: null,
          isAdmin: false
        }
      });
    }
  );
}

// LOGIN user
function loginUser(req, res) {
  const { email, password } = req.body;

  const sql = 'SELECT * FROM users WHERE email = ?';

  db.query(sql, [email], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (results.length === 0) {
      return res.status(400).json({ error: "User not found" });
    }

    const user = results[0];

    if (user.password !== password) {
      return res.status(401).json({ error: "Invalid password" });
    }

    res.json({
      ok: true,
      message: "Login successful",
      user: {
        user_ID: user.user_ID,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        street: user.street,
        city: user.city,
        state: user.state,
        zip: user.zip,
        membershipActive: !!user.membershipActive,
        selectedPlan: user.selectedPlan,
        isAdmin: !!user.isAdmin
      }
    });
  });
}

// GET current user
function getCurrentUser(req, res) {
  const user_ID = req.query.user_ID;

  if (!user_ID) {
    return res.json({ ok: false, user: null });
  }

  const sql = 'SELECT * FROM users WHERE user_ID = ?';

  db.query(sql, [user_ID], (err, results) => {
    if (err) {
      return res.status(500).json({ ok: false, user: null });
    }

    if (results.length === 0) {
      return res.json({ ok: false, user: null });
    }

    const dbUser = results[0];

    res.json({
      ok: true,
      user: {
        user_ID: dbUser.user_ID,
        firstName: dbUser.first_name,
        lastName: dbUser.last_name,
        email: dbUser.email,
        phone: dbUser.phone || null,
        dob: dbUser.dob ? dbUser.dob.toISOString().split("T")[0] : null,
        street: dbUser.street,
        city: dbUser.city,
        state: dbUser.state,
        zip: dbUser.zip,
        membershipActive: !!dbUser.membershipActive,
        selectedPlan: dbUser.selectedPlan,
        isAdmin: !!dbUser.isAdmin
      }
    });
  });
}

// UPDATE user profile
function updateProfile(req, res) {
  const { user_ID, first_name, last_name, phone, dob, street, city, state, zip } = req.body;

  if (!user_ID) {
    return res.status(400).json({ ok: false, message: "user_ID is required" });
  }

  const sql = `
    UPDATE users
    SET first_name = ?, last_name = ?, phone = ?, dob = ?, street = ?, city = ?, state = ?, zip = ?
    WHERE user_ID = ?
  `;

  db.query(sql, [first_name, last_name, phone, dob, street, city, state, zip, user_ID], (err, result) => {
    if (err) {
      return res.status(500).json({ ok: false, message: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ ok: false, message: "User not found" });
    }

    res.json({ ok: true, message: "Profile updated successfully" });
  });
}

// UPDATE membership
function updateMembership(req, res) {
  const { user_ID, membershipActive, selectedPlan } = req.body;

  if (!user_ID) {
    return res.status(400).json({ ok: false, message: "user_ID is required" });
  }

  const sql = `
    UPDATE users
    SET membershipActive = ?, selectedPlan = ?
    WHERE user_ID = ?
  `;

  db.query(sql, [membershipActive, selectedPlan, user_ID], (err, result) => {
    if (err) {
      return res.status(500).json({ ok: false, message: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ ok: false, message: "User not found" });
    }

    res.json({
      ok: true,
      message: "Membership updated successfully"
    });
  });
}

module.exports = {
  getAllUsers,
  createUser,
  loginUser,
  getCurrentUser,
  updateProfile,
  updateMembership
};