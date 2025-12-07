const ArchiveMasterSchema = {
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
  archivedAt: new Date().toISOString(),
  originalId: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: null
};

module.exports = ArchiveMasterSchema;
