// controllers/classController.js
const db = require('../db');

// Get all classes
const getAllClasses = (req, res) => {
  const query = 'SELECT * FROM classes ORDER BY class_date, start_time';
  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ ok: false, message: 'Database error' });
    }
    res.json({ ok: true, classes: results });
  });
};

// Get all sessions for one class name
const getClassesByName = (req, res) => {
  const className = req.params.className;

  const query = `
    SELECT *
    FROM classes
    WHERE class_name = ?
    ORDER BY class_date, start_time
  `;

  db.query(query, [className], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ ok: false, message: 'Database error' });
    }

    res.json({ ok: true, classes: results });
  });
};



module.exports = {
  getAllClasses,
  getClassesByName
};
