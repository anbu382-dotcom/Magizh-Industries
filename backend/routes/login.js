// Defines routes for user and admin login

const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const loginController = require('../controllers/login');

// Public route - User/Admin login
router.post('/login', loginController.login);

// Admin route - Get user login sessions/activities
router.get('/sessions/:userId', authenticate, adminOnly, loginController.getUserSessions);

module.exports = router;
