const admin = require('firebase-admin');
const path = require('path');
const logger = require('../utils/logger');
require('dotenv').config();
const serviceAccount = require(path.join(__dirname, 'serviceAccountKey.json'));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();
const auth = admin.auth();

logger.info("Firebase Connected Successfully");

module.exports = { admin, db, auth };