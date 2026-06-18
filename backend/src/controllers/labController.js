const Laboratory = require('../models/Laboratory');
const { logger } = require('../middleware/loggingMiddleware');

// @desc    Get all labs
// @route   GET /api/laboratories
// @access  Public
const getLaboratories = async (req, res) => {
  try {
    const labs = await Laboratory.find().sort({ createdAt: -1 });
    res.json({ success: true, count: labs.length, data: labs });
  } catch (error) {
    logger.error('Error fetching laboratories', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error retrieving labs' });
  }
};

// @desc    Register a lab
// @route   POST /api/laboratories
// @access  Private (Officer/Admin only)
const registerLaboratory = async (req, res) => {
  const { name, country, city, testsConducted, positiveResults, negativeResults, primaryFocus } = req.body;

  if (!name || !country || !city || !primaryFocus) {
    return res.status(400).json({ success: false, message: 'Please provide name, country, city, and primary focus' });
  }

  try {
    const lab = await Laboratory.create({
      name,
      country,
      city,
      testsConducted: testsConducted || 0,
      positiveResults: positiveResults || 0,
      negativeResults: negativeResults || 0,
      primaryFocus
    });

    logger.info('Laboratory Registered', { labId: lab._id, user: req.user.email });
    res.status(201).json({ success: true, data: lab });
  } catch (error) {
    logger.error('Error registering laboratory', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error registering lab' });
  }
};

// @desc    Update lab statistics
// @route   PUT /api/laboratories/:id
// @access  Private (Officer/Admin only)
const updateLaboratory = async (req, res) => {
  const { name, country, city, testsConducted, positiveResults, negativeResults, primaryFocus } = req.body;

  try {
    let lab = await Laboratory.findById(req.params.id);

    if (!lab) {
      return res.status(404).json({ success: false, message: 'Laboratory not found' });
    }

    lab.name = name || lab.name;
    lab.country = country || lab.country;
    lab.city = city || lab.city;
    lab.testsConducted = testsConducted !== undefined ? testsConducted : lab.testsConducted;
    lab.positiveResults = positiveResults !== undefined ? positiveResults : lab.positiveResults;
    lab.negativeResults = negativeResults !== undefined ? negativeResults : lab.negativeResults;
    lab.primaryFocus = primaryFocus || lab.primaryFocus;

    await lab.save();

    logger.info('Laboratory Updated', { labId: lab._id, user: req.user.email });
    res.json({ success: true, data: lab });
  } catch (error) {
    logger.error('Error updating laboratory', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error updating lab' });
  }
};

// @desc    Delete a lab
// @route   DELETE /api/laboratories/:id
// @access  Private (Admin only)
const deleteLaboratory = async (req, res) => {
  try {
    const lab = await Laboratory.findById(req.params.id);

    if (!lab) {
      return res.status(404).json({ success: false, message: 'Laboratory not found' });
    }

    await lab.deleteOne();
    logger.info('Laboratory Deleted', { labId: req.params.id, user: req.user.email });
    res.json({ success: true, message: 'Laboratory removed successfully' });
  } catch (error) {
    logger.error('Error deleting laboratory', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error deleting lab' });
  }
};

module.exports = { getLaboratories, registerLaboratory, updateLaboratory, deleteLaboratory };
