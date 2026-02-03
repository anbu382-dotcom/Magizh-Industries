const emailPasswordUtil = require('../utils/emailpassword');
const logger = require('../utils/logger');
const crypto = require('crypto');
const OtpController = require('./otp');
const { sendOtpEmail } = require('../utils/mailer');

// OTP configuration from environment variables (in seconds)
const OTP_VALID_TIME = parseInt(process.env.OTP_VALID_TIME) || 120; // Default 2 minutes
const OTP_RESEND_TIME = parseInt(process.env.OTP_RESEND_TIME) || 60; // Default 1 minute

/**
 * Generate 6-digit OTP using crypto
 */
const generateOtp = () => {
  return crypto.randomInt(100000, 999999).toString();
};

exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Check if email exists in database
    const user = await emailPasswordUtil.checkEmailExists(email);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Email not found in the system'
      });
    }

    // Check cooldown using most recent OTP (even if expired)
    const recentOtp = await OtpController.findMostRecentOtp(email);
    
    if (recentOtp) {
      // Check if user can resend OTP based on creation time
      const createdAt = recentOtp.createdAt.toDate();
      const now = new Date();
      
      // Calculate time elapsed since OTP was created
      const timeElapsed = Math.floor((now - createdAt) / 1000); // in seconds
      const timeRemaining = OTP_RESEND_TIME - timeElapsed;
      
      // If RESEND_TIME has not passed, enforce cooldown
      if (timeRemaining > 0) {
        logger.info(`User must wait ${timeRemaining} seconds before resending OTP for ${email}`);
        
        return res.status(429).json({
          success: false,
          message: `Please wait ${timeRemaining}s before requesting another OTP`,
          timeRemaining: `${timeRemaining}s`,
          otpExpirationSeconds: OTP_VALID_TIME,
          resendOtpSeconds: OTP_RESEND_TIME
        });
      }
    }

    // Generate OTP using crypto
    const otp = generateOtp();
    
    // Store OTP in database (will auto-delete after 2 minutes)
    await OtpController.create(email, otp);
    
    logger.info(`OTP generated and stored for ${email}`);
    
    // Send OTP via email
    try {
      await sendOtpEmail({
        email: email,
        firstName: user.firstName || '',
        otp: otp
      });
      logger.info(`OTP email sent successfully to ${email}`);
    } catch (emailError) {
      logger.error('Failed to send OTP email:', emailError);
      // Continue even if email fails - user can still use OTP from database
    }
    
    // Email found - return success to show OTP field
    logger.info(`Forgot password: Email verified for ${email}`);
    
    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully. Please check your email.',
      showOtpField: true,
      email: email,
      otpExpirationSeconds: OTP_VALID_TIME,
      resendOtpSeconds: OTP_RESEND_TIME
    });

  } catch (error) {
    logger.error('Forgot password error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred. Please try again.'
    });
  }
};

/**
 * Resend OTP
 */
exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Check if email exists
    const user = await emailPasswordUtil.checkEmailExists(email);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Email not found in the system'
      });
    }

    // Check cooldown using most recent OTP (even if expired)
    const recentOtp = await OtpController.findMostRecentOtp(email);
    
    if (recentOtp) {
      const createdAt = recentOtp.createdAt.toDate();
      const now = new Date();
      
      // Calculate time elapsed since OTP was created
      const timeElapsed = Math.floor((now - createdAt) / 1000); // in seconds
      const timeRemaining = OTP_RESEND_TIME - timeElapsed;
      
      // If RESEND_TIME has not passed, enforce cooldown
      if (timeRemaining > 0) {
        logger.info(`User must wait ${timeRemaining} seconds before resending OTP for ${email}`);
        
        return res.status(429).json({
          success: false,
          message: `Please wait ${timeRemaining}s before requesting another OTP`,
          timeRemaining: `${timeRemaining}s`,
          otpExpirationSeconds: OTP_VALID_TIME,
          resendOtpSeconds: OTP_RESEND_TIME
        });
      }
    }

    // Delete old OTPs (resend cooldown has passed)
    await OtpController.deleteOtp(email);

    // Generate new OTP
    const otp = generateOtp();
    
    // Store new OTP
    await OtpController.create(email, otp);
    
    // Send OTP via email
    try {
      await sendOtpEmail({
        email: email,
        firstName: user.firstName || '',
        otp: otp
      });
      logger.info(`Resend OTP email sent successfully to ${email}`);
    } catch (emailError) {
      logger.error('Failed to send resend OTP email:', emailError);
    }
    
    logger.info(`OTP resent for ${email}`);
    
    return res.status(200).json({
      success: true,
      message: 'OTP resent successfully.',
      otpExpirationSeconds: OTP_VALID_TIME,
      resendOtpSeconds: OTP_RESEND_TIME
    });

  } catch (error) {
    logger.error('Resend OTP error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to resend OTP. Please try again.'
    });
  }
};

/**
 * Verify OTP
 */
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }

    // Verify OTP
    const isValid = await OtpController.verifyOtp(email, otp);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    logger.info(`OTP verified successfully for ${email}`);

    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully'
    });

  } catch (error) {
    logger.error('Verify OTP error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify OTP. Please try again.'
    });
  }
};
