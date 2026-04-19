const express = require('express');
const router = express.Router();
const db = require('../db');
const bookingsController = require('../controllers/bookingsController');

// Get all bookings (admin)
router.get('/', bookingsController.getAllBookings);

// Route for user to book classes
router.post('/', bookingsController.bookClass);

// Get bookings for a specific user (profile page)
router.get('/user/:userID', (req, res) => {
  const userID = req.params.userID;
  const query = `
    SELECT 
      b.booking_ID,
      b.class_ID,
      c.class_name,
      c.instructor_name,
      c.class_date,
      c.start_time,
      c.end_time
    FROM bookings b
    JOIN classes c ON b.class_ID = c.class_ID
    WHERE b.user_ID = ?
    ORDER BY c.class_date ASC, c.start_time ASC
  `;

  db.query(query, [userID], (err, results) => {
    if (err) {
      return res.status(500).json({ ok: false, message: 'DB error' });
    }
    res.json({ ok: true, bookings: results });
  });
});

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
