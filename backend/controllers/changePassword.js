const { admin } = require('../config/firebase');
const logger = require('../utils/logger');
const OtpController = require('./otp');
const emailPasswordUtil = require('../utils/emailpassword');
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    // Validate inputs
    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, OTP, and new password are required'
      });
    }

    // Validate password strength
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Verify OTP
    const isValidOtp = await OtpController.verifyOtp(email, otp);
    
    if (!isValidOtp) {
      logger.warn(`Invalid or expired OTP attempt for ${email}`);
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Check if user exists in Firebase Auth
    const user = await emailPasswordUtil.checkEmailExists(email);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update password in Firebase Auth
    try {
      await admin.auth().updateUser(user.id, {
        password: newPassword
      });
      
      logger.info(`Password reset successful for ${email}`);
    } catch (authError) {
      logger.error(`Firebase Auth password update failed for ${email}:`, authError);
      return res.status(500).json({
        success: false,
        message: 'Failed to update password. Please try again.'
      });
    }

    // Delete all OTPs for this email after successful password reset
    await OtpController.deleteOtp(email);
    logger.info(`OTPs deleted for ${email} after password reset`);

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now login with your new password.'
    });

  } catch (error) {
    logger.error('Password reset error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while resetting password'
    });
  }
};
