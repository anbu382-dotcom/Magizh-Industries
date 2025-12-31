const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  if (process.env.NODE_ENV === 'production') {
    // Production: Use default credentials with explicit project ID
    console.log('Initializing Firebase Admin for PRODUCTION with projectId: magizh-industries-d36e0');
    admin.initializeApp({
      projectId: 'magizh-industries-d36e0'
    });
    console.log('Firebase Admin initialized. App count:', admin.apps.length);
  } else {
    // Development: Use service account key
    const serviceAccount = require(path.join(__dirname, 'serviceAccountKey.json'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
}

const db = admin.firestore();
const auth = admin.auth();

console.log(`Firebase Connected Successfully`);

module.exports = { admin, db, auth };