// backend/utils/mailer.js
const nodemailer = require('nodemailer');
require('dotenv').config();

// Create transporter for sending emails
const createTransporter = () => {
  // Log environment check (mask password)
  console.log('Email Configuration Check:', {
    EMAIL_USER: process.env.EMAIL_USER ? `${process.env.EMAIL_USER.substring(0, 3)}***` : 'NOT SET',
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? '***SET***' : 'NOT SET',
    EMAIL_HOST: process.env.EMAIL_HOST || 'NOT SET',
    EMAIL_PORT: process.env.EMAIL_PORT || 'NOT SET',
    EMAIL_SECURE: process.env.EMAIL_SECURE || 'NOT SET',
    NODE_ENV: process.env.NODE_ENV
  });

  const config = {
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  };

  // Use custom SMTP settings for Zoho or other services
  if (process.env.EMAIL_HOST) {
    config.host = process.env.EMAIL_HOST;
    config.port = parseInt(process.env.EMAIL_PORT || '465');
    config.secure = process.env.EMAIL_SECURE === 'true';
    
    // Simplified TLS configuration for better Zoho compatibility
    config.tls = {
      ciphers: 'SSLv3',
      rejectUnauthorized: false  // Allow self-signed certificates in production
    };
    
    // Connection timeout settings
    config.connectionTimeout = 10000; // 10 seconds
    config.greetingTimeout = 5000; // 5 seconds
    config.socketTimeout = 10000; // 10 seconds
    
    // Enable debug logging in production to diagnose issues
    config.logger = process.env.NODE_ENV === 'production';
    config.debug = process.env.NODE_ENV === 'production';
  } else {
    // Fallback to service name (gmail, etc.)
    config.service = process.env.EMAIL_SERVICE || 'gmail';
  }

  console.log('Creating SMTP transporter with config:', {
    host: config.host,
    port: config.port,
    secure: config.secure,
    user: config.auth.user
  });

  const transporter = nodemailer.createTransport(config);
  
  // Verify connection configuration
  transporter.verify(function(error, success) {
    if (error) {
      console.error('SMTP Connection Error Details:', {
        message: error.message,
        code: error.code,
        command: error.command,
        stack: error.stack
      });
    } else {
      console.log('SMTP Server is ready to send emails');
    }
  });

  return transporter;
};

// Send email notification to admin when new registration request is submitted
const sendEmailToAdmin = async ({ requestId, firstName, lastName, email }) => {
  try {
    // Skip if email is not configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.error('Email credentials not configured. EMAIL_USER and EMAIL_PASSWORD must be set.');
      return;
    }

    if (!process.env.ADMIN_EMAIL) {
      console.error('ADMIN_EMAIL not configured. Cannot send notification - no recipient address.');
      return;
    }

    const transporter = createTransporter();
    const adminEmail = process.env.ADMIN_EMAIL;

    // Get current date and time
    const now = new Date();
    const requestDate = now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const requestTime = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: adminEmail,
      subject: 'New Registration Request - Magizh Industries',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Magizh Industries</h1>
            <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 14px;">Employee Management System</p>
          </div>

          <!-- Content -->
          <div style="padding: 40px 30px; background-color: #f8f9fa;">
            <h2 style="color: #1e3a5f; margin: 0 0 10px 0; font-size: 24px;">New Registration Request</h2>
            <p style="color: #6c757d; margin: 0 0 30px 0; font-size: 15px;">A new user has submitted a registration request and is awaiting approval.</p>

            <!-- Request Details Card -->
            <div style="background-color: #ffffff; padding: 25px; border-radius: 8px; border-left: 4px solid #2c5282; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 25px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef;">
                    <strong style="color: #495057; font-size: 14px;">Name:</strong>
                  </td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; text-align: right;">
                    <span style="color: #212529; font-size: 15px; font-weight: 600;">${firstName} ${lastName}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef;">
                    <strong style="color: #495057; font-size: 14px;">Email:</strong>
                  </td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; text-align: right;">
                    <a href="mailto:${email}" style="color: #2c5282; text-decoration: none; font-size: 14px;">${email}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef;">
                    <strong style="color: #495057; font-size: 14px;">Request Date:</strong>
                  </td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; text-align: right;">
                    <span style="color: #212529; font-size: 14px;">${requestDate}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0;">
                    <strong style="color: #495057; font-size: 14px;">Request Time:</strong>
                  </td>
                  <td style="padding: 12px 0; text-align: right;">
                    <span style="color: #212529; font-size: 14px;">${requestTime}</span>
                  </td>
                </tr>
              </table>
            </div>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Admin notification email sent successfully');

  } catch (error) {
    console.error('Failed to send admin email - Detailed Error:', {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
      stack: error.stack
    });
    throw error;
  }
};

// Send credentials email to user after approval
const sendCredentialsEmail = async ({ email, firstName, userId, password }) => {
  try {
    // Skip if email is not configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log('Email not configured. Skipping credentials email.');
      return;
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your Account Has Been Approved - Magizh Industries',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Magizh Industries</h1>
            <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 14px;">Employee Management System</p>
          </div>

          <!-- Content -->
          <div style="padding: 40px 30px; background-color: #f8f9fa;">
            <h2 style="color: #10b981; margin: 0 0 10px 0; font-size: 26px;">Welcome, ${firstName}!</h2>
            <p style="color: #6c757d; margin: 0 0 30px 0; font-size: 15px; line-height: 1.6;">
              Congratulations! Your registration request has been approved. You can now access the Magizh Industries Employee Management System using the credentials below.
            </p>

            <!-- Credentials Card -->
            <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; border-left: 4px solid #10b981; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 25px;">
              <h3 style="color: #1e3a5f; margin: 0 0 20px 0; font-size: 18px;">Your Login Credentials</h3>

              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 15px 0; border-bottom: 1px solid #e9ecef;">
                    <strong style="color: #495057; font-size: 14px;">User ID:</strong>
                  </td>
                  <td style="padding: 15px 0; border-bottom: 1px solid #e9ecef; text-align: right;">
                    <code style="background-color: #e9ecef; padding: 8px 12px; border-radius: 4px; font-size: 15px; font-weight: 600; color: #1e3a5f;">${userId}</code>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px 0;">
                    <strong style="color: #495057; font-size: 14px;">Password:</strong>
                  </td>
                  <td style="padding: 15px 0; text-align: right;">
                    <code style="background-color: #e9ecef; padding: 8px 12px; border-radius: 4px; font-size: 15px; font-weight: 600; color: #1e3a5f;">${password}</code>
                  </td>
                </tr>
              </table>
            </div>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Credentials email sent successfully to:', email);

  } catch (error) {
    console.error('Failed to send credentials email - Detailed Error:', {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
      stack: error.stack
    });
    throw error;
  }
};

// Send OTP email for forgot password
const sendOtpEmail = async ({ email, firstName, otp }) => {
  try {
    // Skip if email is not configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log('Email not configured. Skipping OTP email.');
      return;
    }

    const transporter = createTransporter();
    
    // Get OTP validity time from environment (in seconds, default 120s = 2 minutes)
    const otpValiditySeconds = parseInt(process.env.OTP_VALID_TIME);
    const otpValidityMinutes = Math.floor(otpValiditySeconds / 60);
    const otpValidityText = otpValidityMinutes >= 1 
      ? `${otpValidityMinutes} minute${otpValidityMinutes > 1 ? 's' : ''}`
      : `${otpValiditySeconds} seconds`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset OTP - Magizh Industries',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Magizh Industries</h1>
          </div>

          <!-- Content -->
          <div style="padding: 40px 30px; background-color: #f8f9fa;">
            <h2 style="color: #1e3a5f; margin: 0 0 10px 0; font-size: 24px;">Password Reset Request</h2>
            <p style="color: #6c757d; margin: 0 0 30px 0; font-size: 15px; line-height: 1.6;">
              Hello${firstName ? ` ${firstName}` : ''},<br>
              We received a request to reset your password. Use the OTP code below to complete the password reset process.
            </p>

            <!-- OTP Card -->
            <div style="background: linear-gradient(135deg, #2c5282 0%, #1e3a5f 100%); padding: 30px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); margin-bottom: 25px; text-align: center;">
              <p style="color: rgba(255, 255, 255, 0.9); margin: 0 0 15px 0; font-size: 14px;">Your verification code is</p>
              
              <div style="margin: 20px 0;">
                <span style="color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</span>
              </div>
              
              <p style="color: rgba(255, 255, 255, 0.8); margin: 15px 0 0 0; font-size: 13px;">Valid for ${otpValidityText}</p>
            </div>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('OTP email sent successfully to:', email);

  } catch (error) {
    console.error('Failed to send OTP email - Detailed Error:', {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
      stack: error.stack
    });
    throw error;
  }
};

module.exports = {
  sendEmailToAdmin,
  sendCredentialsEmail,
  sendOtpEmail
};
