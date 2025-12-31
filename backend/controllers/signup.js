// Handles user signup: validates input, stores user as pending, and notifies admin via email.

const { sendEmailToAdmin } = require('../utils/mailer');
const RegistrationService = require('../services/Registration');
const UserService = require('../services/User');

/**
 * Submit a new registration request
 */
exports.registerRequest = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      fatherName,
      dob,
      email,
      phone
    } = req.body;

    console.log('Registration request received:', { firstName, lastName, email, dob, fatherName });

    // Validate required fields
    if (!firstName || !lastName || !email || !dob || !fatherName) {
      console.error('Missing required fields');
      return res.status(400).json({
        message: 'Missing required fields: firstName, lastName, email, dob, and fatherName are required'
      });
    }

    // Check if email already exists in pending requests
    const existingPendingRequest = await RegistrationService.findByEmailAndStatus(email, 'pending');

    if (existingPendingRequest && existingPendingRequest.length > 0) {
      console.log('Duplicate pending request found for email:', email);
      return res.status(409).json({
        status: 'already_requested',
        message: 'A registration request with this email is already pending approval. Please wait for admin approval or contact the administrator.',
        email: email
      });
    }

    // Check if email exists in any requests
    const anyExistingRequest = await RegistrationService.findByEmail(email);

    if (anyExistingRequest && anyExistingRequest.length > 0) {
      const requestStatus = anyExistingRequest[0].status;

      if (requestStatus === 'approved') {
        const existingUser = await UserService.findByEmail(email);

        if (existingUser) {
          return res.status(409).json({
            status: 'already_exists',
            message: `An account with this email already exists and is active. Your User ID is ${existingUser.userId}.`,
            email: email,
            userId: existingUser.userId
          });
        }
      }

      if (requestStatus === 'rejected') {
        return res.status(409).json({
          status: 'rejected',
          message: 'Your previous registration request was rejected.',
          email: email
        });
      }
    }

    // Create new registration request
    const newRequest = await RegistrationService.createRequest({
      firstName,
      lastName,
      fatherName,
      dob,
      email,
      phone: phone || ''
    });

    console.log('Registration request created successfully:', newRequest.id);

    // Send notification email to admin
    try {
      await sendEmailToAdmin({
        requestId: newRequest.id,
        firstName,
        lastName,
        email,
        dob,
        fatherName
      });
    } catch (emailError) {
      console.error('Failed to send email to admin:', emailError);
    }

    res.status(201).json({
      message: 'Registration request submitted successfully.',
      requestId: newRequest.id
    });

  } catch (error) {
    console.error('Register Request Error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get all pending registration requests
 */
exports.getPendingRequests = async (req, res) => {
  try {
    const requests = await RegistrationService.getPendingRequests();

    res.status(200).json({ requests });

  } catch (error) {
    console.error('Get Pending Requests Error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get all registration requests (for admin dashboard)
 */
exports.getAllRequests = async (req, res) => {
  try {
    const requests = await RegistrationService.getAllRequests();

    res.status(200).json({ requests });

  } catch (error) {
    console.error('Get All Requests Error:', error);
    res.status(500).json({ error: error.message });
  }
};
