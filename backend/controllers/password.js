const UserService = require('../services/User');
const bcrypt = require('bcryptjs');

// Admin: Change own password with old password verification
exports.adminChangeOwnPassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const adminUserId = req.user.userId; // From auth middleware

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        message: 'Old password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters long'
      });
    }

    // Get admin user
    const admin = await UserService.findByUserId(adminUserId);
    if (!admin) {
      return res.status(404).json({ message: 'Admin user not found' });
    }

    // Check if password field exists
    if (!admin.password) {
      return res.status(400).json({ 
        message: 'User password not found in database. Please contact system administrator.' 
      });
    }

    // Verify old password
    const isPasswordValid = await bcrypt.compare(oldPassword, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Change password
    await UserService.changePassword(adminUserId, newPassword);

    res.status(200).json({
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Admin Change Own Password Error:', error);
    res.status(500).json({ error: error.message });
  }
};

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
