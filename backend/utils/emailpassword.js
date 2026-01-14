const { db } = require('../config/firebase');
const logger = require('./logger');
// Check if email exists 
class EmailPasswordUtil {
  constructor() {
    this.collection = db.collection('users');
  }
  async checkEmailExists(email) {
    try {
      if (!email || typeof email !== 'string') {
        logger.warn('Invalid email provided for password reset check');
        return null;
      }

      // Normalize email to lowercase for case-insensitive search
      const normalizedEmail = email.toLowerCase().trim();

      const snapshot = await this.collection
        .where('email', '==', normalizedEmail)
        .limit(1)
        .get();

      if (snapshot.empty) {
        logger.info(`Email not found in users collection: ${normalizedEmail}`);
        return null;
      }

      let user = null;
      snapshot.forEach(doc => {
        user = { 
          id: doc.id, 
          ...doc.data() 
        };
      });

      logger.info(`Email found in users collection: ${normalizedEmail}`);
      return user;
    } catch (error) {
      logger.error('Error checking email existence:', error);
      throw error;
    }
  }
}

// Export singleton instance
module.exports = new EmailPasswordUtil();
