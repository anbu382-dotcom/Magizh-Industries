const { db } = require('../config/firebase');
class OtpModel {
  constructor() {
    this.collection = db.collection('otps');
  }

  getCollection() {
    return this.collection;
  }
}

module.exports = new OtpModel();

