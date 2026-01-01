const { db } = require('../config/firebase');

class MasterService {
  constructor() {
    this.collection = db.collection('Master_material');
    this.archiveCollection = db.collection('Material_Archive');
  }

  async generateMaterialCode(materialClass) {
    const classPrefixes = {
      'A': '1',
      'B': '2',
      'C': '3',
      'D': '4',
      'F': '5'
    };

    const prefix = classPrefixes[materialClass];
    if (!prefix) {
      throw new Error('Invalid material class');
    }

    const activeSnapshot = await this.collection
      .where('class', '==', materialClass)
      .get();

    const archiveSnapshot = await this.archiveCollection
      .where('class', '==', materialClass)
      .get();

    let maxCode = 0;

    activeSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.materialCode) {
        const code = parseInt(data.materialCode);
        if (!isNaN(code) && code > maxCode) {
          maxCode = code;
        }
      }
    });

    archiveSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.materialCode) {
        const code = parseInt(data.materialCode);
        if (!isNaN(code) && code > maxCode) {
          maxCode = code;
        }
      }
    });

    const newCode = maxCode === 0 ? parseInt(prefix + '0001') : maxCode + 1;
    return newCode.toString();
  }

  async create(materialData) {
    const materialCode = await this.generateMaterialCode(materialData.class);

    const masterDoc = {
      materialCode,
      materialFlow: materialData.materialFlow,
      class: materialData.class,
      category: materialData.category,
      materialName: materialData.materialName,
      hsnCode: materialData.hsnCode || '',
      supplierName: materialData.supplierName || '',
      supplierCode: materialData.supplierCode || '',
      cgst: materialData.cgst || '',
      igst: materialData.igst || '',
      sgst: materialData.sgst || '',
      costPerItem: materialData.costPerItem || '',
      unit: materialData.unit || 'EA',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: materialData.createdBy || null,
      status: 'active'
    };

    const docRef = await this.collection.add(masterDoc);
    return { id: docRef.id, ...masterDoc };
  }

  async getAll() {
    const snapshot = await this.collection
      .where('status', '==', 'active')
      .get();

    const masters = [];
    snapshot.forEach(doc => {
      masters.push({ id: doc.id, ...doc.data() });
    });

    masters.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateB - dateA;
    });

    return masters;
  }

  async getById(masterId) {
    const doc = await this.collection.doc(masterId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  async update(masterId, updateData) {
    const master = await this.getById(masterId);
    if (!master) {
      throw new Error('Material master not found');
    }

    await this.collection.doc(masterId).update({
      ...updateData,
      updatedAt: new Date().toISOString()
    });
  }

  async delete(masterId) {
    const master = await this.getById(masterId);
    if (!master) {
      throw new Error('Material master not found');
    }

    await this.collection.doc(masterId).update({
      status: 'deleted',
      deletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  async archive(masterId) {
    const master = await this.getById(masterId);
    if (!master) {
      throw new Error('Material master not found');
    }

    await this.archiveCollection.doc(masterId).set({
      ...master,
      archivedAt: new Date().toISOString(),
      originalId: masterId
    });

    await this.collection.doc(masterId).delete();
  }

  async search(filters) {
    let query = this.collection.where('status', '==', 'active');

    if (filters.materialFlow) {
      query = query.where('materialFlow', '==', filters.materialFlow);
    }
    if (filters.class) {
      query = query.where('class', '==', filters.class);
    }
    if (filters.category) {
      query = query.where('category', '==', filters.category);
    }

    const snapshot = await query.get();
    const masters = [];
    snapshot.forEach(doc => {
      masters.push({ id: doc.id, ...doc.data() });
    });
    return masters;
  }
}

module.exports = new MasterService();
