const express = require('express');
const router = express.Router();
const db = require('../db');
const bookingsController = require('../controllers/bookingsController');

// Get all bookings (admin)
router.get('/', bookingsController.getAllBookings);

// Route for user to book classes
router.post('/', bookingsController.bookClass);

// Route to get spots booked for a class
router.get('/spots/:classID', (req, res) => {
  const classID = req.params.classID;
  const query = 'SELECT COUNT(*) AS booked FROM bookings WHERE class_ID = ?';

  db.query(query, [classID], (err, results) => {
    if (err) {
      return res.status(500).json({ ok: false, message: 'DB error' });
    }

    res.json({ ok: true, booked: results[0].booked });
  });
});

module.exports = router;
