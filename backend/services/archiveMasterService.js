const { db } = require('../config/firebase');

class ArchiveMasterService {
  constructor() {
    this.collection = db.collection('Material_Archive');
    this.activeCollection = db.collection('Master_material');
  }

  async getAll() {
    const snapshot = await this.collection.get();
    const archives = [];
    snapshot.forEach(doc => {
      archives.push({ id: doc.id, ...doc.data() });
    });

    archives.sort((a, b) => {
      const dateA = new Date(a.archivedAt || 0);
      const dateB = new Date(b.archivedAt || 0);
      return dateB - dateA;
    });

    return archives;
  }

  async getById(archiveId) {
    const doc = await this.collection.doc(archiveId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  async restore(archiveId) {
    const archivedMaterial = await this.getById(archiveId);
    if (!archivedMaterial) {
      throw new Error('Archived material not found');
    }

    const { archivedAt, originalId, ...materialData } = archivedMaterial;
    const restoredMaterial = {
      ...materialData,
      status: 'active',
      restoredAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await this.activeCollection.doc(archiveId).set(restoredMaterial);
    await this.collection.doc(archiveId).delete();

    return { id: archiveId, ...restoredMaterial };
  }

  async permanentDelete(archiveId) {
    const archivedMaterial = await this.getById(archiveId);
    if (!archivedMaterial) {
      throw new Error('Archived material not found');
    }

    await this.collection.doc(archiveId).delete();
  }

  async search(filters) {
    let query = this.collection;

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
    const archives = [];
    snapshot.forEach(doc => {
      archives.push({ id: doc.id, ...doc.data() });
    });
    return archives;
  }
}

module.exports = new ArchiveMasterService();
