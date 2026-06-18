const mongoose = require('mongoose');

const HospitalSchema = new mongoose.Schema({
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
  totalBeds: {
    type: Number,
    required: true,
    default: 0
  },
  availableBeds: {
    type: Number,
    required: true,
    default: 0
  },
  activeCases: {
    type: Number,
    required: true,
    default: 0
  },
  contactNumber: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Hospital', HospitalSchema);
