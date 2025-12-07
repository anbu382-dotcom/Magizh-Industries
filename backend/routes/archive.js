const express = require('express');
const router = express.Router();
const archiveMasterController = require('../controllers/archiveMaster');
const authenticate = require('../middleware/auth');

// Get all archived materials
router.get('/', authenticate, archiveMasterController.getAllArchived);

// Search archived materials (must come before /:id to avoid conflicts)
router.get('/search', authenticate, archiveMasterController.searchArchived);

// Get archived material by ID
router.get('/:id', authenticate, archiveMasterController.getArchivedById);

// Restore archived material to active collection
router.post('/:id/restore', authenticate, archiveMasterController.restoreMaterial);

// Permanently delete archived material
router.delete('/:id/permanent', authenticate, archiveMasterController.permanentDelete);

module.exports = router;
