const admin = require('firebase-admin');
const path = require('path');
const logger = require('../utils/logger');
require('dotenv').config();

// Detect environment
const isCloudRun = process.env.K_SERVICE !== undefined;
const isAppHosting = process.env.FIREBASE_CONFIG !== undefined;
const isProduction = process.env.NODE_ENV === 'production' || isCloudRun || isAppHosting;

// Initialize Firebase Admin
if (isProduction) {
  // Production: Use Application Default Credentials
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
  logger.info("Firebase Connected (Production - Application Default Credentials)");
} else {
  // Development: Use service account file
  const serviceAccount = require(path.join(__dirname, 'serviceAccountKey.json'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  logger.info("Firebase Connected (Development - Service Account)");
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };