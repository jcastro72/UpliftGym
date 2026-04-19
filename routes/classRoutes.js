const express = require('express');
const router = express.Router();
const classesController = require('../controllers/classController');

router.get('/', classesController.getAllClasses);
router.get('/by-name/:className', classesController.getClassesByName);
router.post('/', classesController.createClass);
router.put('/:id', classesController.updateClass);
router.delete('/:id', classesController.deleteClass);

module.exports = router;