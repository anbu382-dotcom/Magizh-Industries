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
    const snapshot = await this.collection
      .where('userId', '==', userId)
      .get();

    if (snapshot.size > 5) {
      const docs = snapshot.docs.sort((a, b) => {
        const timeA = a.data().timestamp || '';
        const timeB = b.data().timestamp || '';
        return timeB.localeCompare(timeA);
      });

      const docsToDelete = [];
      docs.forEach((doc, index) => {
        if (index >= 5) {
          docsToDelete.push(doc.ref.delete());
        }
      });

      await Promise.all(docsToDelete);
    }
  }

  async getUserActivities(userId, limit = 5) {
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
