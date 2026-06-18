const Report = require('../models/Report');
const Alert = require('../models/Alert');
const Hospital = require('../models/Hospital');
const Laboratory = require('../models/Laboratory');
const { logger } = require('../middleware/loggingMiddleware');

// @desc    Get aggregated dashboard stats
// @route   GET /api/dashboard/stats
// @access  Public
const getDashboardStats = async (req, res) => {
  try {
    const reports = await Report.find();
    const activeAlertsCount = await Alert.countDocuments({ status: 'Active' });
    const hospitalCount = await Hospital.countDocuments();
    const labCount = await Laboratory.countDocuments();

    let totalCases = 0;
    let totalDeaths = 0;
    let totalRecoveries = 0;

    reports.forEach((rep) => {
      totalCases += rep.cases;
      totalDeaths += rep.deaths;
      totalRecoveries += rep.recoveries;
    });

    const activeCases = totalCases - (totalDeaths + totalRecoveries);
    const recoveryRate = totalCases > 0 ? ((totalRecoveries / totalCases) * 100).toFixed(2) : 0;
    const mortalityRate = totalCases > 0 ? ((totalDeaths / totalCases) * 100).toFixed(2) : 0;

    // Identify high-risk countries (e.g., active cases > 1000)
    const highRiskRegions = reports
      .filter((r) => (r.cases - (r.deaths + r.recoveries)) > 1000)
      .map((r) => ({
        country: r.country,
        disease: r.disease,
        activeCases: r.cases - (r.deaths + r.recoveries),
        severity: (r.cases - (r.deaths + r.recoveries)) > 5000 ? 'Critical' : 'High'
      }))
      .sort((a, b) => b.activeCases - a.activeCases);

    res.json({
      success: true,
      data: {
        totalCases,
        activeCases,
        totalRecoveries,
        totalDeaths,
        recoveryRate: parseFloat(recoveryRate),
        mortalityRate: parseFloat(mortalityRate),
        activeAlertsCount,
        hospitalCount,
        labCount,
        highRiskRegions,
        totalReports: reports.length
      }
    });
  } catch (error) {
    logger.error('Error fetching dashboard stats', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error retrieving dashboard statistics' });
  }
};

module.exports = { getDashboardStats };
