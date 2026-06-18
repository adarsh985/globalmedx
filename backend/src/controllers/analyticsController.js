const Report = require('../models/Report');
const { logger } = require('../middleware/loggingMiddleware');

// Define geographic mock coordinates for heatmap visualizations
const countryCoords = {
  'United States': { lat: 37.0902, lng: -95.7129 },
  'India': { lat: 20.5937, lng: 78.9629 },
  'United Kingdom': { lat: 55.3781, lng: -3.4360 },
  'Brazil': { lat: -14.2350, lng: -51.9253 },
  'Democratic Republic of Congo': { lat: -4.0383, lng: 21.7587 },
  'South Africa': { lat: -30.5595, lng: 22.9375 },
  'Australia': { lat: -25.2744, lng: 133.7751 },
  'Nigeria': { lat: 9.0820, lng: 8.6753 }
};

// @desc    Get aggregated statistics for charts
// @route   GET /api/analytics/summary
// @access  Public
const getAnalyticsSummary = async (req, res) => {
  try {
    const reports = await Report.find();

    // 1. Cases by Country
    const casesByCountry = {};
    // 2. Cases by Disease
    const casesByDisease = {};
    // 3. Trends
    let totalCases = 0;
    let totalDeaths = 0;
    let totalRecoveries = 0;

    reports.forEach((r) => {
      totalCases += r.cases;
      totalDeaths += r.deaths;
      totalRecoveries += r.recoveries;

      // Group Country
      if (!casesByCountry[r.country]) {
        casesByCountry[r.country] = { cases: 0, deaths: 0, recoveries: 0 };
      }
      casesByCountry[r.country].cases += r.cases;
      casesByCountry[r.country].deaths += r.deaths;
      casesByCountry[r.country].recoveries += r.recoveries;

      // Group Disease
      if (!casesByDisease[r.disease]) {
        casesByDisease[r.disease] = { cases: 0, deaths: 0, recoveries: 0 };
      }
      casesByDisease[r.disease].cases += r.cases;
      casesByDisease[r.disease].deaths += r.deaths;
      casesByDisease[r.disease].recoveries += r.recoveries;
    });

    // Format cases by country for chart
    const countryData = Object.keys(casesByCountry).map((country) => ({
      country,
      cases: casesByCountry[country].cases,
      deaths: casesByCountry[country].deaths,
      recoveries: casesByCountry[country].recoveries
    }));

    // Format cases by disease
    const diseaseData = Object.keys(casesByDisease).map((disease) => ({
      disease,
      cases: casesByDisease[disease].cases,
      deaths: casesByDisease[disease].deaths,
      recoveries: casesByDisease[disease].recoveries
    }));

    // Generate monthly case trends (mock dates spread over the last 6 months)
    const monthlyTrends = [
      { month: 'Jan', cases: Math.round(totalCases * 0.4), deaths: Math.round(totalDeaths * 0.38), recoveries: Math.round(totalRecoveries * 0.3) },
      { month: 'Feb', cases: Math.round(totalCases * 0.5), deaths: Math.round(totalDeaths * 0.48), recoveries: Math.round(totalRecoveries * 0.4) },
      { month: 'Mar', cases: Math.round(totalCases * 0.65), deaths: Math.round(totalDeaths * 0.6), recoveries: Math.round(totalRecoveries * 0.55) },
      { month: 'Apr', cases: Math.round(totalCases * 0.8), deaths: Math.round(totalDeaths * 0.78), recoveries: Math.round(totalRecoveries * 0.7) },
      { month: 'May', cases: Math.round(totalCases * 0.9), deaths: Math.round(totalDeaths * 0.88), recoveries: Math.round(totalRecoveries * 0.85) },
      { month: 'Jun', cases: totalCases, deaths: totalDeaths, recoveries: totalRecoveries }
    ];

    // Generate heatmap datasets using coordinates mapping
    const heatmaps = reports.map((r) => {
      const coords = countryCoords[r.country] || { lat: 0, lng: 0 };
      return {
        country: r.country,
        disease: r.disease,
        lat: coords.lat,
        lng: coords.lng,
        intensity: r.cases
      };
    });

    res.json({
      success: true,
      data: {
        byCountry: countryData,
        byDisease: diseaseData,
        monthlyTrends,
        heatmaps
      }
    });
  } catch (error) {
    logger.error('Error computing analytics summary', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error retrieving analytics reports' });
  }
};

module.exports = { getAnalyticsSummary };
