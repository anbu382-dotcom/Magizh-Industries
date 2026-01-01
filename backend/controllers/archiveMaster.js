const archiveMasterService = require('../services/archiveMasterService');

exports.getAllArchived = async (req, res) => {
  try {
    const archives = await archiveMasterService.getAll();
    res.status(200).json({
      message: 'Archived materials retrieved successfully',
      archives
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getArchivedById = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ message: 'Archive ID is required' });
    }

    const archive = await archiveMasterService.getById(req.params.id);

    if (!archive) {
      return res.status(404).json({ message: 'Archived material not found' });
    }

    res.status(200).json({
      message: 'Archived material retrieved successfully',
      archive
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.restoreMaterial = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ message: 'Archive ID is required' });
    }

    const material = await archiveMasterService.restore(req.params.id);

    res.status(200).json({
      message: 'Material restored successfully',
      material
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.permanentDelete = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ message: 'Archive ID is required' });
    }

    await archiveMasterService.permanentDelete(req.params.id);

    res.status(200).json({
      message: 'Material permanently deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.searchArchived = async (req, res) => {
  try {
    const filters = {};
    if (req.query.materialFlow) filters.materialFlow = req.query.materialFlow;
    if (req.query.class) filters.class = req.query.class;
    if (req.query.category) filters.category = req.query.category;

    const archives = await archiveMasterService.search(filters);

    res.status(200).json({
      message: 'Archived materials retrieved successfully',
      archives
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
