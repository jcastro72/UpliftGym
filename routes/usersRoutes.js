const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');

router.get('/', usersController.getAllUsers);
router.post('/', usersController.createUser);
router.post('/login', usersController.loginUser);
router.get('/me', usersController.getCurrentUser);
router.put('/profile', usersController.updateProfile);
router.put('/membership', usersController.updateMembership);

module.exports = router;
