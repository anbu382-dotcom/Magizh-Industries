const LoginActivity = require('../models/LoginActivity');

/**
 * Service wrapper for LoginActivity model
 * Provides a consistent service layer interface
 */
class LoginActivityService {
  /**
   * Record login activity
   */
  async recordLogin(userId) {
    return await LoginActivity.recordLogin(userId);
  }

  /**
   * Get user's login activities
   */
  async getUserActivities(userId, limit = 5) {
    return await LoginActivity.getUserActivities(userId, limit);
  }

  /**
   * Get last login for a user
   */
  async getLastLogin(userId) {
    return await LoginActivity.getLastLogin(userId);
  }

  /**
   * Delete all activities for a user
   */
  async deleteUserActivities(userId) {
    return await LoginActivity.deleteUserActivities(userId);
  }
}

module.exports = new LoginActivityService();
