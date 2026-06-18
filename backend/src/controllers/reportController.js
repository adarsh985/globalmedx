const Report = require('../models/Report');
const { logger } = require('../middleware/loggingMiddleware');

// @desc    Get all reports (with searching and filtering)
// @route   GET /api/reports
// @access  Public
const getReports = async (req, res) => {
  const { search, country, disease, startDate, endDate } = req.query;
  let query = {};

  if (search) {
    query.$or = [
      { country: { $regex: search, $options: 'i' } },
      { disease: { $regex: search, $options: 'i' } }
    ];
  }

  if (country) {
    query.country = { $regex: country, $options: 'i' };
  }

  if (disease) {
    query.disease = { $regex: disease, $options: 'i' };
  }

  if (startDate || endDate) {
    query.reportDate = {};
    if (startDate) query.reportDate.$gte = new Date(startDate);
    if (endDate) query.reportDate.$lte = new Date(endDate);
  }

  try {
    const reports = await Report.find(query).sort({ reportDate: -1 });
    res.json({ success: true, count: reports.length, data: reports });
  } catch (error) {
    logger.error('Error fetching reports', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error retrieving reports' });
  }
};

// @desc    Create a report
// @route   POST /api/reports
// @access  Private (Officer/Admin only)
const createReport = async (req, res) => {
  const { country, disease, cases, deaths, recoveries, reportDate } = req.body;

  if (!country || !disease) {
    return res.status(400).json({ success: false, message: 'Country and Disease are required fields' });
  }

  try {
    const report = await Report.create({
      country,
      disease,
      cases: cases || 0,
      deaths: deaths || 0,
      recoveries: recoveries || 0,
      reportDate: reportDate || new Date()
    });

    logger.info('Disease Report Created', { reportId: report._id, user: req.user.email });
    res.status(201).json({ success: true, data: report });
  } catch (error) {
    logger.error('Error creating report', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error creating report' });
  }
};

// @desc    Update a report
// @route   PUT /api/reports/:id
// @access  Private (Officer/Admin only)
const updateReport = async (req, res) => {
  const { country, disease, cases, deaths, recoveries, reportDate } = req.body;

  try {
    let report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    report.country = country || report.country;
    report.disease = disease || report.disease;
    report.cases = cases !== undefined ? cases : report.cases;
    report.deaths = deaths !== undefined ? deaths : report.deaths;
    report.recoveries = recoveries !== undefined ? recoveries : report.recoveries;
    report.reportDate = reportDate || report.reportDate;

    await report.save();

    logger.info('Disease Report Updated', { reportId: report._id, user: req.user.email });
    res.json({ success: true, data: report });
  } catch (error) {
    logger.error('Error updating report', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error updating report' });
  }
};

// @desc    Delete a report
// @route   DELETE /api/reports/:id
// @access  Private (Admin only)
const deleteReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    await report.deleteOne();
    logger.info('Disease Report Deleted', { reportId: req.params.id, user: req.user.email });
    res.json({ success: true, message: 'Report removed successfully' });
  } catch (error) {
    logger.error('Error deleting report', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error deleting report' });
  }
};

module.exports = { getReports, createReport, updateReport, deleteReport };
