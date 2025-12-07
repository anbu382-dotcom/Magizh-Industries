// Handles user management operations: retrieve, update, and delete user records (admin only).

const UserService = require('../services/User');

/**
 * Get all users
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await UserService.getAllUsers();

    res.status(200).json({ users });

  } catch (error) {
    console.error('Get All Users Error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get user by userId
 */
exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const user = await UserService.findByUserId(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove sensitive fields
    delete user.password;

    res.status(200).json({ user });

  } catch (error) {
    console.error('Get User By ID Error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update user
 */
exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Remove fields that shouldn't be updated directly
    delete updateData.userId;
    delete updateData.password;
    delete updateData.email;

    await UserService.updateUser(userId, updateData);

    res.status(200).json({
      message: 'User updated successfully'
    });

  } catch (error) {
    console.error('Update User Error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Delete user
 */
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    await UserService.deleteUser(userId);

    res.status(200).json({
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete User Error:', error);
    res.status(500).json({ error: error.message });
  }
};
