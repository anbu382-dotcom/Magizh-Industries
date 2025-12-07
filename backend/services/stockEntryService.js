const { db } = require('../config/firebase');

class StockEntryService {
  constructor() {
    this.collection = db.collection('Stock_Entry');
  }

  async create(entryData) {
    const entryRef = this.collection.doc();
    const entry = {
      ...entryData,
      createdAt: new Date().toISOString(),
      id: entryRef.id
    };
    await entryRef.set(entry);
    return entry;
  }

  async getAll() {
    const snapshot = await this.collection.orderBy('createdAt', 'desc').get();
    const entries = [];
    snapshot.forEach(doc => {
      entries.push({ id: doc.id, ...doc.data() });
    });
    return entries;
  }

  async getById(id) {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  async getByMaterialCode(materialCode) {
    const snapshot = await this.collection
      .where('materialCode', '==', materialCode)
      .orderBy('createdAt', 'desc')
      .get();

    const entries = [];
    snapshot.forEach(doc => {
      entries.push({ id: doc.id, ...doc.data() });
    });
    return entries;
  }

  async getByEntryType(entryType) {
    const snapshot = await this.collection
      .where('entryType', '==', entryType)
      .orderBy('createdAt', 'desc')
      .get();

    const entries = [];
    snapshot.forEach(doc => {
      entries.push({ id: doc.id, ...doc.data() });
    });
    return entries;
  }

  async search(filters) {
    let query = this.collection;

    if (filters.materialCode) {
      query = query.where('materialCode', '==', filters.materialCode);
    }
    if (filters.materialFlow) {
      query = query.where('materialFlow', '==', filters.materialFlow);
    }
    if (filters.entryType) {
      query = query.where('entryType', '==', filters.entryType);
    }
    if (filters.unit) {
      query = query.where('unit', '==', filters.unit);
    }

    const snapshot = await query.orderBy('createdAt', 'desc').get();
    const entries = [];
    snapshot.forEach(doc => {
      entries.push({ id: doc.id, ...doc.data() });
    });
    return entries;
  }

  async update(id, updateData) {
    const entryRef = this.collection.doc(id);
    const doc = await entryRef.get();

    if (!doc.exists) {
      throw new Error('Stock entry not found');
    }

    await entryRef.update({
      ...updateData,
      updatedAt: new Date().toISOString()
    });
  }

  async delete(id) {
    const entryRef = this.collection.doc(id);
    const doc = await entryRef.get();

    if (!doc.exists) {
      throw new Error('Stock entry not found');
    }

    await entryRef.delete();
  }

  async getStockBalance(materialCode) {
    const entries = await this.getByMaterialCode(materialCode);

    let totalCredit = 0;
    let totalDebit = 0;

    entries.forEach(entry => {
      const quantity = parseFloat(entry.quantity) || 0;
      if (entry.entryType === 'Credit') {
        totalCredit += quantity;
      } else if (entry.entryType === 'Debit') {
        totalDebit += quantity;
      }
    });

    return {
      materialCode,
      totalCredit,
      totalDebit,
      balance: totalCredit - totalDebit,
      lastEntry: entries[0] || null
    };
  }
}

module.exports = new StockEntryService();
