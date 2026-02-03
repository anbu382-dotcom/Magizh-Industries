const express = require('express');
const router = express.Router();
const forgotPasswordController = require('../controllers/forgotPassword');
const changePasswordController = require('../controllers/changePassword');

// Send OTP - Check if email exists and generate OTP
router.post('/send-otp', forgotPasswordController.sendOtp);

// Resend OTP
router.post('/resend-otp', forgotPasswordController.resendOtp);

// Verify OTP
router.post('/verify-otp', forgotPasswordController.verifyOtp);

// Reset password after OTP verification
router.post('/reset-password', changePasswordController.resetPassword);

module.exports = router;
