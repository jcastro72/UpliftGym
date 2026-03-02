const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');

// Route to get all classes using the classController's getAllClasses method
router.get('/', classController.getAllClasses);



module.exports = router;