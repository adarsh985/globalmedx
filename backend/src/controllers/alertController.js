const Alert = require('../models/Alert');
const { logger } = require('../middleware/loggingMiddleware');

// @desc    Get all alerts
// @route   GET /api/alerts
// @access  Public
const getAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ createdAt: -1 });
    res.json({ success: true, count: alerts.length, data: alerts });
  } catch (error) {
    logger.error('Error fetching alerts', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error retrieving alerts' });
  }
};

// @desc    Raise a custom alert
// @route   POST /api/alerts
// @access  Private (Officer/Admin only)
const raiseAlert = async (req, res) => {
  const { title, description, level } = req.body;

  if (!title || !description) {
    return res.status(400).json({ success: false, message: 'Please provide title and description' });
  }

  try {
    const alert = await Alert.create({
      title,
      description,
      level: level || 'Info',
      status: 'Active'
    });

    logger.warn('System alert raised manually', { alertId: alert._id, user: req.user.email });
    res.status(201).json({ success: true, data: alert });
  } catch (error) {
    logger.error('Error raising alert', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error raising alert' });
  }
};

// @desc    Update alert status
// @route   PUT /api/alerts/:id
// @access  Private (Officer/Admin only)
const updateAlert = async (req, res) => {
  const { status, title, description, level } = req.body;

  try {
    let alert = await Alert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    alert.status = status || alert.status;
    alert.title = title || alert.title;
    alert.description = description || alert.description;
    alert.level = level || alert.level;

    await alert.save();

    logger.info('Alert status updated', { alertId: alert._id, user: req.user.email });
    res.json({ success: true, data: alert });
  } catch (error) {
    logger.error('Error updating alert', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error updating alert' });
  }
};

// @desc    Delete alert
// @route   DELETE /api/alerts/:id
// @access  Private (Admin only)
const deleteAlert = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    await alert.deleteOne();
    logger.info('Alert deleted', { alertId: req.params.id, user: req.user.email });
    res.json({ success: true, message: 'Alert removed successfully' });
  } catch (error) {
    logger.error('Error deleting alert', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error deleting alert' });
  }
};

module.exports = { getAlerts, raiseAlert, updateAlert, deleteAlert };
