const { db, auth } = require('../config/firebase');
const bcrypt = require('bcryptjs');

class UserService {
  constructor() {
    this.collection = db.collection('users');
  }

  /**
   * Find user by userId
   */
  async findByUserId(userId) {
    try {
      const snapshot = await this.collection
        .where('userId', '==', userId)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      let user = null;
      snapshot.forEach(doc => {
        user = { id: doc.id, ...doc.data() };
      });

      return user;
    } catch (error) {
      console.error('Error finding user by userId:', error);
      throw error;
    }
  }

  /**
   * Find user by email
   */
  async findByEmail(email) {
    try {
      const snapshot = await this.collection
        .where('email', '==', email)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      let user = null;
      snapshot.forEach(doc => {
        user = { id: doc.id, ...doc.data() };
      });

      return user;
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  /**
   * Get all users
   */
  async getAllUsers() {
    try {
      const snapshot = await this.collection.get();

      const users = [];
      snapshot.forEach(doc => {
        users.push({
          id: doc.id,
          ...doc.data()
        });
      });

      // Sort by createdAt descending
      users.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
        return dateB - dateA;
      });

      return users;
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }

  /**
   * Create a new user
   */
  async createUser(userData) {
    try {
      // Create user in Firebase Auth
      const userRecord = await auth.createUser({
        email: userData.email,
        password: userData.password,
        displayName: `${userData.firstName} ${userData.lastName}`
      });

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Save to Firestore
      await this.collection.doc(userRecord.uid).set({
        ...userData,
        password: hashedPassword,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      return { uid: userRecord.uid, ...userData };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Update user
   */
  async updateUser(userId, updateData) {
    try {
      const user = await this.findByUserId(userId);

      if (!user) {
        throw new Error('User not found');
      }

      await this.collection.doc(user.id).update({
        ...updateData,
        updatedAt: new Date().toISOString()
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Change user password
   */
  async changePassword(userId, newPassword) {
    try {
      const user = await this.findByUserId(userId);

      if (!user) {
        throw new Error('User not found');
      }

      // Update in Firebase Auth
      const authUser = await auth.getUserByEmail(user.email);
      await auth.updateUser(authUser.uid, {
        password: newPassword
      });

      // Hash and update in Firestore
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await this.collection.doc(user.id).update({
        password: hashedPassword,
        updatedAt: new Date().toISOString()
      });

      return { success: true };
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }

  /**
   * Update last login time
   */
  async updateLastLogin(userId, loginTime) {
    try {
      const user = await this.findByUserId(userId);

      if (!user) {
        return;
      }

      await this.collection.doc(user.id).update({
        lastLogin: loginTime,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating last login:', error);
      // Don't throw - this is not critical
    }
  }

  /**
   * Delete user
   */
  async deleteUser(userId) {
    try {
      const user = await this.findByUserId(userId);

      if (!user) {
        throw new Error('User not found');
      }

      // Delete from Firebase Auth
      const authUser = await auth.getUserByEmail(user.email);
      await auth.deleteUser(authUser.uid);

      // Delete from Firestore
      await this.collection.doc(user.id).delete();

      return { success: true };
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
}

module.exports = new UserService();
