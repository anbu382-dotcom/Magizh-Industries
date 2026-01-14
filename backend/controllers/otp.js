const { db } = require('../config/firebase');
const OtpModel = require('../models/Otp');
const logger = require('../utils/logger');

// Get OTP validity time from environment variable (in seconds)
const OTP_VALID_TIME = parseInt(process.env.OTP_VALID_TIME) || 120; // Default 2 minutes

class OtpController {
  constructor() {
    this.collection = OtpModel.getCollection();
  }

  async create(email, otp) {
    const normalizedEmail = email.toLowerCase().trim();
    
    // First, delete any expired OTPs for this email
    await this.deleteExpiredOtpsForEmail(normalizedEmail);
    
    // Then delete any remaining OTPs for this email (old valid ones)
    await this.deleteOtp(normalizedEmail);
    
    // Create new OTP with validity time from environment
    const docRef = await this.collection.add({
      email: normalizedEmail,
      otp: otp,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + OTP_VALID_TIME * 1000) // Convert seconds to milliseconds
    });
    return docRef.id;
  }

  async deleteExpiredOtpsForEmail(email) {
    const normalizedEmail = email.toLowerCase().trim();
    const now = new Date();
    
    // Query only by email to avoid composite index requirement
    const snapshot = await this.collection
      .where('email', '==', normalizedEmail)
      .get();

    if (snapshot.empty) {
      return 0;
    }

    // Filter expired OTPs in memory
    const expiredDocs = [];
    snapshot.forEach(doc => {
      if (doc.data().expiresAt <= now) {
        expiredDocs.push(doc);
      }
    });

    if (expiredDocs.length === 0) {
      return 0;
    }

    const batch = db.batch();
    expiredDocs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    return expiredDocs.length;
  }

  async findValidOtp(email) {
    const normalizedEmail = email.toLowerCase().trim();
    const now = new Date();

    logger.info(`Finding valid OTP for ${normalizedEmail}, current time: ${now.toISOString()}`);

    // Query only by email to avoid composite index requirement
    const snapshot = await this.collection
      .where('email', '==', normalizedEmail)
      .get();

    if (snapshot.empty) {
      logger.info(`No OTP records found in database for ${normalizedEmail}`);
      return null;
    }

    logger.info(`Found ${snapshot.size} OTP records for ${normalizedEmail}`);

    // Filter valid OTPs in memory and sort by expiresAt descending
    const validOtps = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      logger.info(`OTP record: email=${data.email}, otp=${data.otp}, expiresAt=${data.expiresAt.toDate().toISOString()}, valid=${data.expiresAt.toDate() > now}`);
      if (data.expiresAt.toDate() > now) {
        validOtps.push({ id: doc.id, ...data, expiresAt: data.expiresAt.toDate() });
      }
    });

    if (validOtps.length === 0) {
      return null;
    }

    // Sort by expiresAt descending and return the most recent
    validOtps.sort((a, b) => b.expiresAt.getTime() - a.expiresAt.getTime());
    return validOtps[0];
  }

  async findMostRecentOtp(email) {
    const normalizedEmail = email.toLowerCase().trim();

    // Query only by email to avoid composite index requirement
    const snapshot = await this.collection
      .where('email', '==', normalizedEmail)
      .get();

    if (snapshot.empty) {
      return null;
    }

    // Get all OTPs (regardless of expiration) and sort by createdAt descending
    const allOtps = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      allOtps.push({ id: doc.id, ...data });
    });

    // Sort by createdAt descending and return the most recent
    allOtps.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return allOtps[0];
  }

  async verifyOtp(email, otp) {
    const otpRecord = await this.findValidOtp(email);
    
    if (!otpRecord) {
      logger.info(`No valid OTP found for email: ${email}`);
      return false;
    }

    // Ensure both OTPs are strings for comparison
    const storedOtp = String(otpRecord.otp);
    const providedOtp = String(otp);
    
    logger.info(`Verifying OTP for ${email} - Stored: ${storedOtp}, Provided: ${providedOtp}, Match: ${storedOtp === providedOtp}`);
    
    return storedOtp === providedOtp;
  }

  async deleteOtp(email) {
    const normalizedEmail = email.toLowerCase().trim();
    
    const snapshot = await this.collection
      .where('email', '==', normalizedEmail)
      .get();

    const batch = db.batch();
    snapshot.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
  }

  async cleanupExpired() {
    const now = new Date();
    
    const snapshot = await this.collection
      .where('expiresAt', '<=', now)
      .get();

    const batch = db.batch();
    snapshot.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    return snapshot.size;
  }
}

module.exports = new OtpController();
