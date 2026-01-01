// Defines routes for admin approval/rejection of registration requests

const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const approvalController = require('../controllers/approval');

// Admin routes - Approve or reject user registration requests
router.post('/approve/:id', authenticate, adminOnly, approvalController.approveUser);
router.post('/decline/:id', authenticate, adminOnly, approvalController.rejectUser);

module.exports = router;
