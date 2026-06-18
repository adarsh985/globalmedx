const mongoose = require('mongoose');

const LaboratorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  testsConducted: {
    type: Number,
    required: true,
    default: 0
  },
  positiveResults: {
    type: Number,
    required: true,
    default: 0
  },
  negativeResults: {
    type: Number,
    required: true,
    default: 0
  },
  primaryFocus: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Laboratory', LaboratorySchema);
