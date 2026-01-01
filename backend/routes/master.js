const express = require('express');
const router = express.Router();
const masterController = require('../controllers/master');
const authenticate = require('../middleware/auth');

// Create material master
router.post('/create', authenticate, masterController.createMaster);

// Get all material masters
router.get('/', authenticate, masterController.getAllMasters);

// Generate material code for a class
router.get('/generate-code/:class', authenticate, masterController.generateMaterialCode);

// Search material masters (must come before /:id to avoid conflicts)
router.get('/search', authenticate, masterController.searchMasters);

// Get material master by ID
router.get('/:id', authenticate, masterController.getMasterById);

// Update material master
router.put('/:id', authenticate, masterController.updateMaster);

// Archive material (move to Material_Archive)
router.post('/archive/:id', authenticate, masterController.archiveMaster);

// Delete material master
router.delete('/:id', authenticate, masterController.deleteMaster);

module.exports = router;
