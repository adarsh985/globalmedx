const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  country: {
    type: String,
    required: true
  },
  disease: {
    type: String,
    required: true
  },
  cases: {
    type: Number,
    required: true,
    default: 0
  },
  deaths: {
    type: Number,
    required: true,
    default: 0
  },
  recoveries: {
    type: Number,
    required: true,
    default: 0
  },
  reportDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Report', ReportSchema);
