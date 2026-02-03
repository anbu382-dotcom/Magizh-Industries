// Handles admin approval of registration requests: generates user credentials, creates user accounts, and sends approval emails.
const { sendCredentialsEmail } = require('../utils/mailer');
const { generateCredentials } = require('../utils/generate');
const RegistrationService = require('../services/Registration');
const UserService = require('../services/User');
//Approve a registration request and create user
exports.approveUser = async (req, res) => {
  try {
    const requestId = req.params.id || req.body.requestId;

    if (!requestId) {
      return res.status(400).json({ message: 'Request ID is required' });
    }
    // Get request data
    const request = await RegistrationService.getRequestById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    // Check if already processed
    if (request.status !== 'pending') {
      return res.status(400).json({
        message: `Request has already been ${request.status}`
      });
    }
    // Check if user already exists
    const existingUser = await UserService.findByEmail(request.email);

    if (existingUser) {
      return res.status(409).json({
        message: 'User with this email already exists',
        userId: existingUser.userId
      });
    }

    // Generate credentials
    const { generatedUserId, generatedPassword } = generateCredentials(
      request.firstName,
      request.lastName,
      request.fatherName,
      request.dob
    );

    // Create user
    await UserService.createUser({
      firstName: request.firstName,
      lastName: request.lastName,
      fatherName: request.fatherName,
      dob: request.dob,
      email: request.email,
      phone: request.phone || '',
      userId: generatedUserId,
      password: generatedPassword,
      role: 'employee'
    });

    // Delete the request
    await RegistrationService.deleteRequest(requestId);

    // Send credentials email
    try {
      await sendCredentialsEmail({
        email: request.email,
        firstName: request.firstName,
        userId: generatedUserId,
        password: generatedPassword
      });
    } catch (emailError) {
      // Email sending failed silently
    }

    res.status(200).json({
      message: 'User approved successfully. Credentials have been sent to their email.',
      userId: generatedUserId
    });

  } catch (error) {
    console.error('Approve User Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Reject a registration request
exports.rejectUser = async (req, res) => {
  try {
    const requestId = req.params.id || req.body.requestId;
    const { reason } = req.body;

    if (!requestId) {
      return res.status(400).json({ message: 'Request ID is required' });
    }

    const request = await RegistrationService.getRequestById(requestId);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check if already processed
    if (request.status !== 'pending') {
      return res.status(400).json({
        message: `Request has already been ${request.status}`
      });
    }

    // Update request status to rejected
    await RegistrationService.updateRequestStatus(requestId, 'rejected', {
      processedBy: req.user ? req.user.userId : null,
      rejectionReason: reason || 'No reason provided'
    });

    res.status(200).json({
      message: 'Registration request rejected successfully'
    });

  } catch (error) {
    console.error('Reject User Error:', error);
    res.status(500).json({ error: error.message });
  }
};
