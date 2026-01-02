// backend/utils/seeder.js
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
    // 1. Check if admin exists in Auth
    try {
      await auth.getUserByEmail(email);
      console.log('Admin already exists in Firebase Auth. Skipping creation.');
    } catch (e) {
      if (e.code === 'auth/user-not-found') {
        
        // 2. Create Admin in Firebase Authentication
        // Note: We use the GENERATED password here so the admin can actually login
        const userRecord = await auth.createUser({
          email: email,
          password: generatedPassword, 
          displayName: `${firstName} ${lastName}`
        });

        // Hash the password for Firestore
        const hashedPassword = await bcrypt.hash(generatedPassword, 10);

        // 3. Create Admin Profile in Firestore
        // We save the generatedUserId here so we can look it up later
        await db.collection('users').doc(userRecord.uid).set({
          firstName,
          lastName,
          fatherName,
          dob,
          email,
          userId: generatedUserId, // The custom ID
          password: hashedPassword, // Save hashed password
          role: 'admin',
          createdAt: new Date().toISOString()
        });

        console.log('Admin Seeded Successfully!');
      }
    }
  } catch (error) {
    console.error('Seeding Error:', error);
  }
};

module.exports = seedAdmin;