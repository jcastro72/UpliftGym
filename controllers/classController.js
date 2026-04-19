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

// Create a new class
const createClass = (req, res) => {
  const { name, instructor, date, time, max_capacity } = req.body;

  if (!name || !instructor || !date || !time || !max_capacity) {
    return res.status(400).json({
      ok: false,
      message: 'Missing required class fields'
    });
  }

  const [hours, minutes] = time.split(':').map(Number);
  const endDate = new Date();
  endDate.setHours(hours + 1, minutes, 0, 0);
  const end_time = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}:00`;

  const query = `
    INSERT INTO classes (
      class_name,
      instructor_name,
      max_capacity,
      class_date,
      start_time,
      end_time
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [name, instructor, max_capacity, date, `${time}:00`, end_time],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          ok: false,
          message: 'Failed to create class'
        });
      }

      res.json({
        ok: true,
        message: 'Class created successfully',
        class_ID: result.insertId
      });
    }
  );
};

// Update a class
const updateClass = (req, res) => {
  const { id } = req.params;
  const { name, instructor, date, time, max_capacity } = req.body;

  if (!name || !instructor || !date || !time || !max_capacity) {
    return res.status(400).json({
      ok: false,
      message: 'Missing required class fields'
    });
  }

  const [hours, minutes] = time.split(':').map(Number);
  const endDate = new Date();
  endDate.setHours(hours + 1, minutes, 0, 0);
  const end_time = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}:00`;

  const query = `
    UPDATE classes
    SET
      class_name = ?,
      instructor_name = ?,
      max_capacity = ?,
      class_date = ?,
      start_time = ?,
      end_time = ?
    WHERE class_ID = ?
  `;

  db.query(
    query,
    [name, instructor, max_capacity, date, `${time}:00`, end_time, id],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          ok: false,
          message: 'Failed to update class'
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          ok: false,
          message: 'Class not found'
        });
      }

      res.json({
        ok: true,
        message: 'Class updated successfully'
      });
    }
  );
};

// Delete a class
const deleteClass = (req, res) => {
  const { id } = req.params;

  const query = 'DELETE FROM classes WHERE class_ID = ?';

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        ok: false,
        message: 'Failed to delete class'
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        ok: false,
        message: 'Class not found'
      });
    }

    res.json({
      ok: true,
      message: 'Class deleted successfully'
    });
  });
};

module.exports = {
  getAllClasses,
  getClassesByName,
  createClass,
  updateClass,
  deleteClass
};