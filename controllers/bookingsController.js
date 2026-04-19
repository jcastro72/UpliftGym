// bookingsController.js
const db = require('../db');

// Book a class
const bookClass = (req, res) => {
  const { user_ID, class_ID } = req.body;

  if (!user_ID || !class_ID) {
    return res.status(400).json({
      ok: false,
      message: 'user_ID and class_ID are required'
    });
  }

  // Step 0: Check user
  const checkUserQuery = 'SELECT * FROM users WHERE user_ID = ?';

  db.query(checkUserQuery, [user_ID], (err, userResults) => {
    if (err) {
      return res.status(500).json({ ok: false, message: 'Database error' });
    }

    if (userResults.length === 0) {
      return res.status(404).json({ ok: false, message: 'User not found' });
    }

    const user = userResults[0];

    if (!user.membershipActive) {
      return res.status(400).json({
        ok: false,
        message: 'Membership is not active'
      });
    }

    // Step 1: Check class exists
    const checkClassQuery = 'SELECT * FROM classes WHERE class_ID = ?';

    db.query(checkClassQuery, [class_ID], (err, classResults) => {
      if (err) {
        return res.status(500).json({ ok: false, message: 'Database error' });
      }

      if (classResults.length === 0) {
        return res.status(404).json({ ok: false, message: 'Class not found' });
      }

      const selectedClass = classResults[0];

      // Step 2: Check capacity
      const countBookingsQuery = 'SELECT COUNT(*) AS current FROM bookings WHERE class_ID = ?';

      db.query(countBookingsQuery, [class_ID], (err, countResults) => {
        if (err) {
          return res.status(500).json({ ok: false, message: 'Database error' });
        }

        if (countResults[0].current >= selectedClass.max_capacity) {
          return res.status(400).json({ ok: false, message: 'Class is full' });
        }

        // Step 3: Prevent duplicate booking
        const checkUserBookingQuery = 'SELECT * FROM bookings WHERE user_ID = ? AND class_ID = ?';

        db.query(checkUserBookingQuery, [user_ID, class_ID], (err, userBookingResults) => {
          if (err) {
            return res.status(500).json({ ok: false, message: 'Database error' });
          }

          if (userBookingResults.length > 0) {
            return res.status(400).json({
              ok: false,
              message: 'You already booked this class'
            });
          }

          // Step 4: Insert booking
          const insertBookingQuery = 'INSERT INTO bookings (user_ID, class_ID) VALUES (?, ?)';

          db.query(insertBookingQuery, [user_ID, class_ID], (err) => {
            if (err) {
              return res.status(500).json({ ok: false, message: 'Booking failed' });
            }

            // Step 5: If single-class plan, deactivate after booking
            if (user.selectedPlan === 'single-class') {
              const updateUserQuery = `
                UPDATE users
                SET membershipActive = FALSE, selectedPlan = NULL
                WHERE user_ID = ?
              `;

              db.query(updateUserQuery, [user_ID], (updateErr) => {
                if (updateErr) {
                  return res.status(500).json({
                    ok: false,
                    message: 'Booking saved, but failed to update membership'
                  });
                }

                return res.json({
                  ok: true,
                  message: 'Class booked successfully. Single-class pass has now been used.',
                  membershipConsumed: true
                });
              });
            } else {
              return res.json({
                ok: true,
                message: 'Class booked successfully',
                membershipConsumed: false
              });
            }
          });
        });
      });
    });
  });
};

// Get all bookings for admin dashboard
const getAllBookings = (req, res) => {
  const query = `
    SELECT 
      b.booking_ID,
      b.user_ID,
      b.class_ID,
      u.first_name,
      u.last_name,
      u.email,
      c.class_name,
      c.class_date,
      c.start_time
    FROM bookings b
    JOIN users u ON b.user_ID = u.user_ID
    JOIN classes c ON b.class_ID = c.class_ID
    ORDER BY b.booking_ID DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        ok: false,
        message: 'Database error'
      });
    }

    res.json(results);
  });
};

module.exports = {
  bookClass,
  getAllBookings
};