const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  if (process.env.NODE_ENV === 'production') {
    admin.initializeApp();
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