const { db } = require('../config/firebase');

class RegistrationService {
  constructor() {
    this.collection = db.collection('requests');
  }

  /**
   * Create a new registration request
   */
  async createRequest(requestData) {
    try {
      const docRef = await this.collection.add({
        ...requestData,
        status: 'pending',
        createdAt: new Date().toISOString()
      });

      return { id: docRef.id, ...requestData };
    } catch (error) {
      console.error('Error creating registration request:', error);
      throw error;
    }
  }

  /**
   * Find request by email and status
   */
  async findByEmailAndStatus(email, status) {
    try {
      const snapshot = await this.collection
        .where('email', '==', email)
        .where('status', '==', status)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const requests = [];
      snapshot.forEach(doc => {
        requests.push({ id: doc.id, ...doc.data() });
      });

      return requests;
    } catch (error) {
      console.error('Error finding request by email and status:', error);
      throw error;
    }
  }

  /**
   * Find any request by email
   */
  async findByEmail(email) {
    try {
      const snapshot = await this.collection
        .where('email', '==', email)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const requests = [];
      snapshot.forEach(doc => {
        requests.push({ id: doc.id, ...doc.data() });
      });

      return requests;
    } catch (error) {
      console.error('Error finding request by email:', error);
      throw error;
    }
  }

  /**
   * Get pending requests
   */
  async getPendingRequests() {
    try {
      const snapshot = await this.collection
        .where('status', '==', 'pending')
        .get();

      const requests = [];
      snapshot.forEach(doc => {
        requests.push({
          id: doc.id,
          ...doc.data()
        });
      });

      // Sort by createdAt descending
      requests.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
        return dateB - dateA;
      });

      return requests;
    } catch (error) {
      console.error('Error getting pending requests:', error);
      throw error;
    }
  }

  /**
   * Get all requests
   */
  async getAllRequests() {
    try {
      const snapshot = await this.collection.get();

      const requests = [];
      snapshot.forEach(doc => {
        requests.push({
          id: doc.id,
          ...doc.data()
        });
      });

      // Sort by createdAt descending
      requests.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
        return dateB - dateA;
      });

      return requests;
    } catch (error) {
      console.error('Error getting all requests:', error);
      throw error;
    }
  }

  /**
   * Get request by ID
   */
  async getRequestById(requestId) {
    try {
      const doc = await this.collection.doc(requestId).get();

      if (!doc.exists) {
        return null;
      }

      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error('Error getting request by ID:', error);
      throw error;
    }
  }

  /**
   * Update request status
   */
  async updateRequestStatus(requestId, status, additionalData = {}) {
    try {
      await this.collection.doc(requestId).update({
        status,
        processedAt: new Date().toISOString(),
        ...additionalData
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating request status:', error);
      throw error;
    }
  }

  /**
   * Delete request
   */
  async deleteRequest(requestId) {
    try {
      await this.collection.doc(requestId).delete();
      return { success: true };
    } catch (error) {
      console.error('Error deleting request:', error);
      throw error;
    }
  }
}

module.exports = new RegistrationService();
