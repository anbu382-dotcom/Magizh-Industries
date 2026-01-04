// Handles user and admin login: verifies credentials with Firebase, generates JWT tokens, and tracks login activity.

const { auth } = require('../config/firebase');
const { generateToken } = require('../utils/jwt');
const UserService = require('../services/User');
const loginActivityService = require('../services/loginActivityService');
const logger = require('../utils/logger');

/**
 * Login user with Firebase Authentication
 */
exports.login = async (req, res) => {
  try {
    const { userId, password } = req.body;

    // Validate required fields
    if (!userId || !password) {
      return res.status(400).json({
        message: 'User ID and password are required'
      });
    }

    // Step 1: Find user by userId
    const user = await UserService.findByUserId(userId);

    if (!user) {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    // Step 2: Verify user exists in Firebase Auth
    try {
      await auth.getUserByEmail(user.email);
    } catch (authError) {
      console.error('Firebase Auth user not found:', authError);
      return res.status(401).json({
        message: 'Invalid credentials - user not found in authentication system'
      });
    }

    // Step 3: Verify password using Firebase REST API
    const firebaseApiKey = process.env.FIREBASE_API_KEY || process.env.REACT_APP_FIREBASE_API_KEY;

    if (!firebaseApiKey) {
      logger.error('Firebase API key not configured. Please set FIREBASE_API_KEY environment variable.');
      return res.status(500).json({
        message: 'Server configuration error. Please contact administrator.',
        error: 'Firebase API key not configured'
      });
    }

    const signInResponse = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          password: password,
          returnSecureToken: true,
        }),
      }
    );

    const signInData = await signInResponse.json();

    if (!signInResponse.ok) {
      console.error('Firebase sign-in failed:', signInData);
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    // Step 4: Generate JWT token
    const token = generateToken(
      user.userId,
      user.email,
      user.role || 'employee'
    );

    // Step 5: Record login activity
    await loginActivityService.recordLogin(user.userId);

    // Step 6: Return success response
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        userId: user.userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role || 'employee'
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      message: 'Login failed. Please try again.',
      error: error.message
    });
  }
};

/**
 * Get user login sessions (activities)
 */
exports.getUserSessions = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const activities = await loginActivityService.getUserActivities(userId, 5);

    res.status(200).json({
      userId,
      sessions: activities
    });

  } catch (error) {
    console.error('Get User Sessions Error:', error);
    res.status(500).json({ error: error.message });
  }
};
