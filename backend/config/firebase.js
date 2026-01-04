const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');
require('dotenv').config();

// Detect environment
const isAppHosting = process.env.K_SERVICE !== undefined || process.env.FIREBASE_CONFIG !== undefined;
const isProduction = process.env.NODE_ENV === 'production' || isAppHosting;

// Initialize Firebase Admin
if (!admin.apps.length) {
  if (isProduction) {
    // Production: Use Application Default Credentials (Firebase App Hosting)
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
    logger.info("Firebase Connected (Production - Application Default Credentials)");
  } else {
    // Development: Use service account file
    const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
    
    if (!fs.existsSync(serviceAccountPath)) {
      logger.error('Service account key not found. Please add serviceAccountKey.json to backend/config/');
      process.exit(1);
    }
    
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    logger.info("Firebase Connected ")
  }
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };