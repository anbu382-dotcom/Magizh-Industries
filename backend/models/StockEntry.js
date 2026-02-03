const StockEntrySchema = {
  materialCode: '',
  materialName: '',
  supplierCode: '',
  materialFlow: '',
  quantity: 0,
  unit: '',
  entryType: '',
  createdBy: '',
  userFirstName: '',
  createdAt: new Date().toISOString(),
  updatedAt: null
};

module.exports = StockEntrySchema;
