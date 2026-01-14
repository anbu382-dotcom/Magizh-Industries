const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const userController = require('../controllers/user');

// Admin routes - User management
router.get('/users', authenticate, adminOnly, userController.getAllUsers);
router.get('/user/:userId', authenticate, adminOnly, userController.getUserById);
router.delete('/user/:userId', authenticate, adminOnly, userController.deleteUser);

module.exports = router;
