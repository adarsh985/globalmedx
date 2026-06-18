const mongoose = require('mongoose');

const AirportSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  passengersScreened: {
    type: Number,
    required: true,
    default: 0
  },
  highRiskFlagged: {
    type: Number,
    required: true,
    default: 0
  },
  quarantined: {
    type: Number,
    required: true,
    default: 0
  },
  screeningDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Airport', AirportSchema);
