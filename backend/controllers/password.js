const UserService = require('../services/User');

// Admin: Change user password without requiring old password

exports.adminChangePassword = async (req, res) => {
  try {
    const { userId, newPassword } = req.body;

    if (!userId || !newPassword) {
      return res.status(400).json({
        message: 'User ID and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters long'
      });
    }

    await UserService.changePassword(userId, newPassword);

    res.status(200).json({
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Admin Change Password Error:', error);
    res.status(500).json({ error: error.message });
  }
};
