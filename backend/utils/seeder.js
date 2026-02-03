// backend/utils/seeder.js
// npm run seed
const { db, auth } = require('../config/firebase');
const { generateCredentials } = require('./generate');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const seedAdmin = async () => {
  const email = process.env.ADMIN_EMAIL;
  
  // Get raw details from .env
  const firstName = process.env.ADMIN_FIRSTNAME;
  const lastName = process.env.ADMIN_LASTNAME;
  const fatherName = process.env.ADMIN_FATHERNAME;
  const dob = process.env.ADMIN_DOB;

  // Generate the Custom UserID and Password using your logic
  const { generatedUserId, generatedPassword } = generateCredentials(
    firstName, 
    lastName, 
    fatherName, 
    dob
  );

  console.log(`--- Seeding Admin ---`);
  console.log(`Generated Admin UserID: ${generatedUserId}`);
  console.log(`Generated Admin Password: ${generatedPassword}`);

  try {
    // 1. Check if admin exists in Firestore
    const usersSnapshot = await db.collection('users')
      .where('email', '==', email)
      .where('role', '==', 'admin')
      .get();

    if (!usersSnapshot.empty) {
      console.log('Admin already exists in Firestore. Skipping creation.');
      return;
    }

    // 2. Check if admin exists in Auth
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(email);
      console.log('Admin exists in Firebase Auth but not in Firestore. Creating Firestore document...');
    } catch (e) {
      if (e.code === 'auth/user-not-found') {
        // 3. Create Admin in Firebase Authentication
        console.log('Creating admin in Firebase Auth...');
        userRecord = await auth.createUser({
          email: email,
          password: generatedPassword, 
          displayName: `${firstName} ${lastName}`
        });
        console.log('Admin created in Firebase Auth.');
      } else {
        throw e;
      }
    }

    // 4. Hash the password for Firestore
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    // 5. Create Admin Profile in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      firstName,
      lastName,
      fatherName,
      dob,
      email,
      userId: generatedUserId,
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date().toISOString()
    });

    console.log('Admin Seeded Successfully!');
  } catch (error) {
    console.error('Seeding Error:', error);
    throw error;
  }
};

// Run the seeder if this file is executed directly
if (require.main === module) {
  seedAdmin()
    .then(() => {
      console.log('Seeding completed.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = seedAdmin;