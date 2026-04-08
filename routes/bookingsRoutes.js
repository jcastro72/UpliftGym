const express = require('express');
const router = express.Router();

// Import the whole controller so you can use all its methods
const bookingsController = require('../controllers/bookingsController');

// Route for user to book classes
router.post('/', bookingsController.bookClass);

// (add more routes later, e.g., cancelBooking, getBookings, etc.)
// router.delete('/:id', bookingsController.cancelBooking);
// router.get('/', bookingsController.getBookings);

module.exports = router;
