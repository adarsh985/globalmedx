const mongoose = require('mongoose');
const User = require('../models/User');
const Resource = require('../models/Resource');
const Incident = require('../models/Incident');
const { logger } = require('../middleware/loggingMiddleware');

// @desc    Get system status & database connectivity
// @route   GET /api/admin/health
// @access  Public (or Protected)
const getHealthStatus = async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'Healthy' : 'Disconnected';
  const memoryUsage = process.memoryUsage();
  
  res.json({
    success: true,
    data: {
      status: 'UP',
      uptime: `${Math.round(process.uptime())}s`,
      database: dbStatus,
      timestamp: new Date(),
      processDetails: {
        memoryHeapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
        memoryHeapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
        cpuUsage: process.cpuUsage()
      }
    }
  });
};

// @desc    Get all active platform users
// @route   GET /api/admin/users
// @access  Private (Admin only)
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    logger.error('Error fetching users', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error retrieving users' });
  }
};

// @desc    Get stockpile resources
// @route   GET /api/admin/resources
// @access  Private (Officer/Admin only)
const getResources = async (req, res) => {
  try {
    const resources = await Resource.find().sort({ createdAt: -1 });
    res.json({ success: true, data: resources });
  } catch (error) {
    logger.error('Error fetching resources', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error retrieving stockpiles' });
  }
};

// @desc    Update stockpile levels
// @route   PUT /api/admin/resources/:id
// @access  Private (Officer/Admin only)
const updateResource = async (req, res) => {
  const { totalQuantity, allocatedQuantity, region } = req.body;

  try {
    let resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    resource.totalQuantity = totalQuantity !== undefined ? totalQuantity : resource.totalQuantity;
    resource.allocatedQuantity = allocatedQuantity !== undefined ? allocatedQuantity : resource.allocatedQuantity;
    resource.region = region || resource.region;

    await resource.save();
    res.json({ success: true, data: resource });
  } catch (error) {
    logger.error('Error updating stockpile resource', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error updating resource stockpile' });
  }
};

// @desc    Get incident logs
// @route   GET /api/admin/incidents
// @access  Private (Officer/Admin only)
const getIncidents = async (req, res) => {
  try {
    const incidents = await Incident.find().sort({ createdAt: -1 });
    res.json({ success: true, data: incidents });
  } catch (error) {
    logger.error('Error fetching incidents', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error retrieving incident logs' });
  }
};

// @desc    Update incident log status
// @route   PUT /api/admin/incidents/:id
// @access  Private (Officer/Admin only)
const updateIncident = async (req, res) => {
  const { status, title, description, region } = req.body;

  try {
    let incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident log not found' });
    }

    incident.status = status || incident.status;
    incident.title = title || incident.title;
    incident.description = description || incident.description;
    incident.region = region || incident.region;

    await incident.save();
    res.json({ success: true, data: incident });
  } catch (error) {
    logger.error('Error updating incident log', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error updating incident log' });
  }
};

module.exports = { getHealthStatus, getUsers, getResources, updateResource, getIncidents, updateIncident };
