// Defines routes for user registration/signup

const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const signupController = require('../controllers/signup');

// Public route - Submit new registration request
router.post('/register-request', signupController.registerRequest);

// Admin routes - View registration requests
router.get('/pending-requests', authenticate, adminOnly, signupController.getPendingRequests);
router.get('/requests', authenticate, adminOnly, signupController.getAllRequests);

module.exports = router;
