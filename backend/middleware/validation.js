const validateStockEntry = (req, res, next) => {
  const { materialCode, materialName, supplierCode, materialFlow, quantity, unit, entryType } = req.body;

  if (!materialCode || !materialName || !supplierCode || !materialFlow || !quantity || !unit || !entryType) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required'
    });
  }

  if (isNaN(quantity) || quantity <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Quantity must be a positive number'
    });
  }

  const validUnits = ['EA', 'KG', 'M'];
  if (!validUnits.includes(unit)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid unit. Must be EA, KG, or M'
    });
  }

  const validEntryTypes = ['Credit', 'Debit'];
  if (!validEntryTypes.includes(entryType)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid entry type. Must be Credit or Debit'
    });
  }

  next();
};

const validateStockEntryUpdate = (req, res, next) => {
  const { quantity, unit, entryType } = req.body;

  if (quantity !== undefined) {
    if (isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a positive number'
      });
    }
  }

  if (unit) {
    const validUnits = ['EA', 'KG', 'M'];
    if (!validUnits.includes(unit)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid unit. Must be EA, KG, or M'
      });
    }
  }

  if (entryType) {
    const validEntryTypes = ['Credit', 'Debit'];
    if (!validEntryTypes.includes(entryType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid entry type. Must be Credit or Debit'
      });
    }
  }

  next();
};

const validateMaster = (req, res, next) => {
  const { materialFlow, class: materialClass, category, materialName } = req.body;

  if (!materialFlow || !materialClass || !category || !materialName) {
    return res.status(400).json({
      message: 'Missing required fields: materialFlow, class, category, and materialName are required'
    });
  }

  if (!['BOM', 'FIN'].includes(materialFlow)) {
    return res.status(400).json({
      message: 'Invalid materialFlow. Must be either BOM or FIN'
    });
  }

  if (!['A', 'B', 'C', 'D', 'F'].includes(materialClass)) {
    return res.status(400).json({
      message: 'Invalid class. Must be A, B, C, D, or F'
    });
  }

  if (materialClass === 'F' && materialFlow !== 'FIN') {
    return res.status(400).json({
      message: 'Class F can only be used with FIN material flow'
    });
  }

  if (materialFlow === 'FIN' && materialClass !== 'F') {
    return res.status(400).json({
      message: 'FIN material flow must use class F'
    });
  }

  next();
};

const validateMasterUpdate = (req, res, next) => {
  const { materialFlow, class: materialClass } = req.body;

  if (materialFlow && !['BOM', 'FIN'].includes(materialFlow)) {
    return res.status(400).json({
      message: 'Invalid materialFlow. Must be either BOM or FIN'
    });
  }

  if (materialClass && !['A', 'B', 'C', 'D', 'F'].includes(materialClass)) {
    return res.status(400).json({
      message: 'Invalid class. Must be A, B, C, D, or F'
    });
  }

  if (materialClass === 'F' && materialFlow && materialFlow !== 'FIN') {
    return res.status(400).json({
      message: 'Class F can only be used with FIN material flow'
    });
  }

  if (materialFlow === 'FIN' && materialClass && materialClass !== 'F') {
    return res.status(400).json({
      message: 'FIN material flow must use class F'
    });
  }

  next();
};

module.exports = {
  validateStockEntry,
  validateStockEntryUpdate,
  validateMaster,
  validateMasterUpdate
};
