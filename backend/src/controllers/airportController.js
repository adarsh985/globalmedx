const Airport = require('../models/Airport');
const { logger } = require('../middleware/loggingMiddleware');

// @desc    Get all airport logs
// @route   GET /api/airports
// @access  Public
const getAirports = async (req, res) => {
  try {
    const airports = await Airport.find().sort({ screeningDate: -1 });
    res.json({ success: true, count: airports.length, data: airports });
  } catch (error) {
    logger.error('Error fetching airports', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error retrieving airport screen logs' });
  }
};

// @desc    Log airport screening
// @route   POST /api/airports
// @access  Private (Officer/Admin only)
const createAirportLog = async (req, res) => {
  const { name, city, country, passengersScreened, highRiskFlagged, quarantined } = req.body;

  if (!name || !city || !country) {
    return res.status(400).json({ success: false, message: 'Please provide name, city, and country' });
  }

  try {
    const airport = await Airport.create({
      name,
      city,
      country,
      passengersScreened: passengersScreened || 0,
      highRiskFlagged: highRiskFlagged || 0,
      quarantined: quarantined || 0
    });

    logger.info('Airport screening logged', { airportId: airport._id, user: req.user.email });
    res.status(201).json({ success: true, data: airport });
  } catch (error) {
    logger.error('Error logging airport screening', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error logging airport screen' });
  }
};

// @desc    Update airport screening
// @route   PUT /api/airports/:id
// @access  Private (Officer/Admin only)
const updateAirportLog = async (req, res) => {
  const { name, city, country, passengersScreened, highRiskFlagged, quarantined } = req.body;

  try {
    let airport = await Airport.findById(req.params.id);

    if (!airport) {
      return res.status(404).json({ success: false, message: 'Airport log not found' });
    }

    airport.name = name || airport.name;
    airport.city = city || airport.city;
    airport.country = country || airport.country;
    airport.passengersScreened = passengersScreened !== undefined ? passengersScreened : airport.passengersScreened;
    airport.highRiskFlagged = highRiskFlagged !== undefined ? highRiskFlagged : airport.highRiskFlagged;
    airport.quarantined = quarantined !== undefined ? quarantined : airport.quarantined;

    await airport.save();

    logger.info('Airport screening updated', { airportId: airport._id, user: req.user.email });
    res.json({ success: true, data: airport });
  } catch (error) {
    logger.error('Error updating airport screening', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error updating airport screen' });
  }
};

// @desc    Delete airport log
// @route   DELETE /api/airports/:id
// @access  Private (Admin only)
const deleteAirportLog = async (req, res) => {
  try {
    const airport = await Airport.findById(req.params.id);

    if (!airport) {
      return res.status(404).json({ success: false, message: 'Airport log not found' });
    }

    await airport.deleteOne();
    logger.info('Airport log deleted', { airportId: req.params.id, user: req.user.email });
    res.json({ success: true, message: 'Airport log removed successfully' });
  } catch (error) {
    logger.error('Error deleting airport log', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error deleting airport log' });
  }
};

module.exports = { getAirports, createAirportLog, updateAirportLog, deleteAirportLog };
