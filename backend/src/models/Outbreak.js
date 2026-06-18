const mongoose = require('mongoose');

const OutbreakSchema = new mongoose.Schema({
  disease: {
    type: String,
    required: true
  },
  region: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Active', 'Contained', 'Monitoring'],
    default: 'Active'
  },
  caseCount: {
    type: Number,
    required: true,
    default: 0
  },
  startDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Outbreak', OutbreakSchema);
