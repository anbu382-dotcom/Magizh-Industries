const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');

// Import routes
const authRoutes = require('../backend/routes/login');
const signupRoutes = require('../backend/routes/signup');
const userRoutes = require('../backend/routes/user');
const masterRoutes = require('../backend/routes/master');
const stockEntryRoutes = require('../backend/routes/stockEntry');
const approvalRoutes = require('../backend/routes/approval');
const archiveRoutes = require('../backend/routes/archive');

const app = express();

// Middleware
app.use(cors({ origin: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', signupRoutes);
app.use('/api/users', userRoutes);
app.use('/api/master', masterRoutes);
app.use('/api/stock-entry', stockEntryRoutes);
app.use('/api/approval', approvalRoutes);
app.use('/api/archive', archiveRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Export the Express app as a Cloud Function
exports.api = functions.https.onRequest(app);
