const express = require('express');
const authController = require('../controllers/authController');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

router.post('/register', validateRequest('register'), authController.register);
router.post('/login', validateRequest('login'), authController.login);
router.post('/logout', authController.logout);
router.get('/me', authController.getCurrentUser);

module.exports = router;

