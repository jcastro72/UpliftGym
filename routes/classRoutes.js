const express = require('express');
const router = express.Router();
const classesController = require('../controllers/classController');

// Route to get all classes
router.get('/', classesController.getAllClasses);
router.get('/by-name/:className', classesController.getClassesByName);

module.exports = router;