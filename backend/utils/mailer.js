// backend/utils/mailer.js
const nodemailer = require('nodemailer');
const functions = require('firebase-functions');
require('dotenv').config();

// Create transporter for sending emails
const createTransporter = () => {
  const config = functions.config();
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || (config.email && config.email.service) || 'gmail',
    auth: {
      user: process.env.EMAIL_USER || (config.email && config.email.user),
      pass: process.env.EMAIL_PASSWORD || (config.email && config.email.password)
    }
  });
};

// Send email notification to admin when new registration request is submitted
const sendEmailToAdmin = async ({ requestId, firstName, lastName, email }) => {
  try {
    const config = functions.config();
    const emailUser = process.env.EMAIL_USER || (config.email && config.email.user);
    const emailPassword = process.env.EMAIL_PASSWORD || (config.email && config.email.password);
    const adminEmail = process.env.ADMIN_EMAIL || (config.email && config.email.admin);
    
    // Skip if email is not configured
    if (!emailUser || !emailPassword) {
      console.log('Email not configured. Skipping email notification.');
      return;
    }

    const transporter = createTransporter();

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
      from: emailUser,
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
    console.error('Failed to send admin email:', error.message);
    throw error;
  }
};

// Send credentials email to user after approval
const sendCredentialsEmail = async ({ email, firstName, userId, password }) => {
  try {
    const config = functions.config();
    const emailUser = process.env.EMAIL_USER || (config.email && config.email.user);
    const emailPassword = process.env.EMAIL_PASSWORD || (config.email && config.email.password);
    
    // Skip if email is not configured
    if (!emailUser || !emailPassword) {
      console.log('Email not configured. Skipping credentials email.');
      return;
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: emailUser,
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
    console.error('Failed to send credentials email:', error.message);
    throw error;
  }
};

module.exports = {
  sendEmailToAdmin,
  sendCredentialsEmail
};
