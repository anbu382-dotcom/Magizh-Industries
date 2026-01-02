// Defines routes for user management operations (admin only)

const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const userController = require('../controllers/user');
const passwordController = require('../controllers/password');

// Admin routes - User management
router.get('/users', authenticate, adminOnly, userController.getAllUsers);
router.get('/user/:userId', authenticate, adminOnly, userController.getUserById);
router.put('/user/:userId', authenticate, adminOnly, userController.updateUser);
router.delete('/user/:userId', authenticate, adminOnly, userController.deleteUser);

// Admin route - Password management
router.post('/admin/change-own-password', authenticate, adminOnly, passwordController.adminChangeOwnPassword);
router.post('/admin/change-password', authenticate, adminOnly, passwordController.adminChangePassword);

module.exports = router;
