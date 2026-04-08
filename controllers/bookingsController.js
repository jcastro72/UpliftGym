// bookingsController.js
// Handles booking classes for users

const db = require('../db'); // Import the database connection

/**
 * Middleware: Book a class
 * @param req.body.class_ID - The ID of the class the user wants to book
 * @param req.user.id - The logged-in user's ID (from session or JWT)
 */
const bookClass = (req, res) => {
  const { user_ID, class_ID } = req.body; // ✅ get both from frontend

  if (!user_ID || !class_ID) {
    return res.status(400).json({
      ok: false,
      message: 'user_ID and class_ID are required'
    });
  }

  // Step 1: Check if class exists
  const checkClassQuery = 'SELECT * FROM classes WHERE class_ID = ?';
  db.query(checkClassQuery, [class_ID], (err, classResults) => {
    if (err) return res.status(500).json({ ok: false, message: 'Database error' });
    if (classResults.length === 0) {
      return res.status(404).json({ ok: false, message: 'Class not found' });
    }

    const selectedClass = classResults[0];

    // Step 2: Check capacity
    const countBookingsQuery = 'SELECT COUNT(*) AS current FROM bookings WHERE class_ID = ?';
    db.query(countBookingsQuery, [class_ID], (err, countResults) => {
      if (err) return res.status(500).json({ ok: false, message: 'Database error' });

      if (countResults[0].current >= selectedClass.max_capacity) {
        return res.status(400).json({ ok: false, message: 'Class is full' });
      }

      // Step 3: Prevent duplicate booking
      const checkUserBookingQuery = 'SELECT * FROM bookings WHERE user_ID = ? AND class_ID = ?';
      db.query(checkUserBookingQuery, [user_ID, class_ID], (err, userBookingResults) => {
        if (err) return res.status(500).json({ ok: false, message: 'Database error' });

        if (userBookingResults.length > 0) {
          return res.status(400).json({
            ok: false,
            message: 'You already booked this class'
          });
        }

        // Step 4: Insert booking
        const insertBookingQuery = 'INSERT INTO bookings (user_ID, class_ID) VALUES (?, ?)';
        db.query(insertBookingQuery, [user_ID, class_ID], (err) => {
          if (err) return res.status(500).json({ ok: false, message: 'Booking failed' });

          res.json({ ok: true, message: 'Class booked successfully' });
        });
      });
    });
  });
};


module.exports = {
  bookClass,
};