const { db } = require('../config/firebase');

class LoginActivityService {
  constructor() {
    this.collection = db.collection('loginActivities');
  }

  async recordLogin(userId) {
    const now = new Date();
    const loginData = {
      userId,
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().split(' ')[0],
      timestamp: now.toISOString()
    };

    await this.collection.add(loginData);
    await this.cleanupOldActivities(userId);
  }

  async cleanupOldActivities(userId) {
    try {
      // Get all activities for this user
      const snapshot = await this.collection
        .where('userId', '==', userId)
        .get();

      if (snapshot.size <= 2) {
        return; // No cleanup needed
      }

      // Convert to array and sort by timestamp (newest first)
      const activities = [];
      snapshot.forEach(doc => {
        activities.push({
          id: doc.id,
          ref: doc.ref,
          timestamp: doc.data().timestamp || ''
        });
      });

      // Sort by timestamp descending (newest first)
      activities.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

      // Keep only the first 2 (most recent), delete the rest
      const docsToDelete = activities.slice(2).map(activity => activity.ref.delete());
      
      await Promise.all(docsToDelete);
      console.log(`Cleaned up ${docsToDelete.length} old login activities for user ${userId}`);
    } catch (error) {
      console.error('Error cleaning up old activities:', error);
      // Don't throw - cleanup failure shouldn't prevent login
    }
  }
// declare user login limit retrieval
  async getUserActivities(userId, limit = 2) {
    const snapshot = await this.collection
      .where('userId', '==', userId)
      .get();

    const activities = [];
    snapshot.forEach(doc => {
      activities.push({ id: doc.id, ...doc.data() });
    });

    activities.sort((a, b) => {
      const timeA = a.timestamp || '';
      const timeB = b.timestamp || '';
      return timeB.localeCompare(timeA);
    });

    return activities.slice(0, limit);
  }

  async getLastLogin(userId) {
    const snapshot = await this.collection
      .where('userId', '==', userId)
      .get();

    if (snapshot.empty) return null;

    const activities = [];
    snapshot.forEach(doc => {
      activities.push({ id: doc.id, ...doc.data() });
    });

    activities.sort((a, b) => {
      const timeA = a.timestamp || '';
      const timeB = b.timestamp || '';
      return timeB.localeCompare(timeA);
    });

    return activities[0] || null;
  }

  async deleteUserActivities(userId) {
    const snapshot = await this.collection
      .where('userId', '==', userId)
      .get();

    const deletePromises = [];
    snapshot.forEach(doc => {
      deletePromises.push(doc.ref.delete());
    });

    await Promise.all(deletePromises);
    return deletePromises.length;
  }
}

module.exports = new LoginActivityService();
