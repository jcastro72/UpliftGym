const express = require('express');
const router = express.Router();
const { bookClass } = require('../controllers/bookingsController');

// Rout for user to book classes using the bookingsController's bookClass method
router.post('/', bookingsController.bookClass);


module.exports = router;
