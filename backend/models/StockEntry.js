const StockEntrySchema = {
  materialCode: '',
  materialName: '',
  supplierCode: '',
  materialFlow: '',
  quantity: 0,
  unit: '',
  entryType: '',
  createdBy: '',
  createdAt: new Date().toISOString(),
  updatedAt: null
};

module.exports = StockEntrySchema;
