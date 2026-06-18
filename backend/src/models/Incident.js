const mongoose = require('mongoose');

const IncidentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  region: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Open', 'Investigating', 'Resolved'],
    default: 'Open'
  },
  reportedBy: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Incident', IncidentSchema);
