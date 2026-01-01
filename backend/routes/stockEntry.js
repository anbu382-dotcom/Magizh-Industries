// Routes for Stock Entry operations

const express = require('express');
const router = express.Router();
const {
  createStockEntry,
  getAllStockEntries,
  getStockEntryById,
  getStockEntriesByMaterialCode,
  getStockEntriesByEntryType,
  searchStockEntries,
  updateStockEntry,
  deleteStockEntry,
  getStockBalance
} = require('../controllers/stockEntry');
const authenticate = require('../middleware/auth');

// Create new stock entry
router.post('/entry', authenticate, createStockEntry);

// Get all stock entries
router.get('/entries', authenticate, getAllStockEntries);

// Search stock entries with filters
router.get('/search', authenticate, searchStockEntries);

// Get stock entry by ID
router.get('/entry/:id', authenticate, getStockEntryById);

// Get stock entries by material code
router.get('/entries/material/:materialCode', authenticate, getStockEntriesByMaterialCode);

// Get stock entries by entry type (Credit/Debit)
router.get('/entries/type/:entryType', authenticate, getStockEntriesByEntryType);

// Get stock balance for a material
router.get('/balance/:materialCode', authenticate, getStockBalance);

// Update stock entry
router.put('/entry/:id', authenticate, updateStockEntry);

// Delete stock entry
router.delete('/entry/:id', authenticate, deleteStockEntry);

module.exports = router;
