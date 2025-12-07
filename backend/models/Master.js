const MasterSchema = {
  materialCode: '',
  materialFlow: '',
  class: '',
  category: '',
  materialName: '',
  hsnCode: '',
  supplierName: '',
  supplierCode: '',
  cgst: '',
  igst: '',
  sgst: '',
  costPerItem: '',
  status: 'active',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: null
};

module.exports = MasterSchema;
