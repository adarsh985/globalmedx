const Hospital = require('../models/Hospital');
const { logger } = require('../middleware/loggingMiddleware');

// @desc    Get all hospitals
// @route   GET /api/hospitals
// @access  Public
const getHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find().sort({ createdAt: -1 });
    res.json({ success: true, count: hospitals.length, data: hospitals });
  } catch (error) {
    logger.error('Error fetching hospitals', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error retrieving hospitals' });
  }
};

// @desc    Register a hospital
// @route   POST /api/hospitals
// @access  Private (Officer/Admin only)
const registerHospital = async (req, res) => {
  const { name, country, city, totalBeds, availableBeds, activeCases, contactNumber } = req.body;

  if (!name || !country || !city || !contactNumber) {
    return res.status(400).json({ success: false, message: 'Please provide name, country, city, and contact number' });
  }

  try {
    const hospital = await Hospital.create({
      name,
      country,
      city,
      totalBeds: totalBeds || 0,
      availableBeds: availableBeds || 0,
      activeCases: activeCases || 0,
      contactNumber
    });

    logger.info('Hospital Registered', { hospitalId: hospital._id, user: req.user.email });
    res.status(201).json({ success: true, data: hospital });
  } catch (error) {
    logger.error('Error registering hospital', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error registering hospital' });
  }
};

// @desc    Update a hospital
// @route   PUT /api/hospitals/:id
// @access  Private (Officer/Admin only)
const updateHospital = async (req, res) => {
  const { name, country, city, totalBeds, availableBeds, activeCases, contactNumber } = req.body;

  try {
    let hospital = await Hospital.findById(req.params.id);

    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    hospital.name = name || hospital.name;
    hospital.country = country || hospital.country;
    hospital.city = city || hospital.city;
    hospital.totalBeds = totalBeds !== undefined ? totalBeds : hospital.totalBeds;
    hospital.availableBeds = availableBeds !== undefined ? availableBeds : hospital.availableBeds;
    hospital.activeCases = activeCases !== undefined ? activeCases : hospital.activeCases;
    hospital.contactNumber = contactNumber || hospital.contactNumber;

    await hospital.save();

    logger.info('Hospital Updated', { hospitalId: hospital._id, user: req.user.email });
    res.json({ success: true, data: hospital });
  } catch (error) {
    logger.error('Error updating hospital', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error updating hospital' });
  }
};

// @desc    Delete a hospital
// @route   DELETE /api/hospitals/:id
// @access  Private (Admin only)
const deleteHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);

    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    await hospital.deleteOne();
    logger.info('Hospital Deleted', { hospitalId: req.params.id, user: req.user.email });
    res.json({ success: true, message: 'Hospital removed successfully' });
  } catch (error) {
    logger.error('Error deleting hospital', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error deleting hospital' });
  }
};

module.exports = { getHospitals, registerHospital, updateHospital, deleteHospital };
