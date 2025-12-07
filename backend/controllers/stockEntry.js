const stockEntryService = require('../services/stockEntryService');

const createStockEntry = async (req, res) => {
  try {
    const entryData = {
      materialCode: req.body.materialCode,
      materialName: req.body.materialName,
      supplierCode: req.body.supplierCode,
      materialFlow: req.body.materialFlow,
      quantity: parseFloat(req.body.quantity),
      unit: req.body.unit,
      entryType: req.body.entryType,
      createdBy: req.user?.email || 'system'
    };

    const newEntry = await stockEntryService.create(entryData);

    res.status(201).json({
      success: true,
      message: 'Stock entry created successfully',
      data: newEntry
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create stock entry',
      error: error.message
    });
  }
};

const getAllStockEntries = async (req, res) => {
  try {
    const entries = await stockEntryService.getAll();
    res.status(200).json({
      success: true,
      count: entries.length,
      data: entries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve stock entries',
      error: error.message
    });
  }
};

const getStockEntryById = async (req, res) => {
  try {
    const entry = await stockEntryService.getById(req.params.id);

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Stock entry not found'
      });
    }

    res.status(200).json({
      success: true,
      data: entry
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve stock entry',
      error: error.message
    });
  }
};

const getStockEntriesByMaterialCode = async (req, res) => {
  try {
    const entries = await stockEntryService.getByMaterialCode(req.params.materialCode);
    res.status(200).json({
      success: true,
      count: entries.length,
      data: entries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve stock entries',
      error: error.message
    });
  }
};

const getStockEntriesByEntryType = async (req, res) => {
  try {
    const { entryType } = req.params;

    if (entryType !== 'Credit' && entryType !== 'Debit') {
      return res.status(400).json({
        success: false,
        message: 'Invalid entry type. Must be Credit or Debit'
      });
    }

    const entries = await stockEntryService.getByEntryType(entryType);
    res.status(200).json({
      success: true,
      count: entries.length,
      data: entries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve stock entries',
      error: error.message
    });
  }
};

const searchStockEntries = async (req, res) => {
  try {
    const filters = {};
    if (req.query.materialCode) filters.materialCode = req.query.materialCode;
    if (req.query.materialFlow) filters.materialFlow = req.query.materialFlow;
    if (req.query.entryType) filters.entryType = req.query.entryType;
    if (req.query.unit) filters.unit = req.query.unit;

    const entries = await stockEntryService.search(filters);
    res.status(200).json({
      success: true,
      count: entries.length,
      data: entries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to search stock entries',
      error: error.message
    });
  }
};

const updateStockEntry = async (req, res) => {
  try {
    const updateData = { ...req.body };
    delete updateData.id;
    delete updateData.createdAt;

    if (updateData.quantity !== undefined) {
      updateData.quantity = parseFloat(updateData.quantity);
    }

    await stockEntryService.update(req.params.id, updateData);
    res.status(200).json({
      success: true,
      message: 'Stock entry updated successfully'
    });
  } catch (error) {
    if (error.message === 'Stock entry not found') {
      return res.status(404).json({
        success: false,
        message: 'Stock entry not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to update stock entry',
      error: error.message
    });
  }
};

const deleteStockEntry = async (req, res) => {
  try {
    await stockEntryService.delete(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Stock entry deleted successfully'
    });
  } catch (error) {
    if (error.message === 'Stock entry not found') {
      return res.status(404).json({
        success: false,
        message: 'Stock entry not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to delete stock entry',
      error: error.message
    });
  }
};

const getStockBalance = async (req, res) => {
  try {
    const balance = await stockEntryService.getStockBalance(req.params.materialCode);
    res.status(200).json({
      success: true,
      data: balance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to calculate stock balance',
      error: error.message
    });
  }
};

module.exports = {
  createStockEntry,
  getAllStockEntries,
  getStockEntryById,
  getStockEntriesByMaterialCode,
  getStockEntriesByEntryType,
  searchStockEntries,
  updateStockEntry,
  deleteStockEntry,
  getStockBalance
};
