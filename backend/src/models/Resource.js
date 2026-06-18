const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
  item: {
    type: String,
    enum: ['Vaccines', 'Ventilators', 'PPE Kits', 'ICU Beds'],
    required: true
  },
  totalQuantity: {
    type: Number,
    required: true,
    default: 0
  },
  allocatedQuantity: {
    type: Number,
    required: true,
    default: 0
  },
  region: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Resource', ResourceSchema);
