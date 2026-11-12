/**
 * GlobalMedX Local Offline Mock Store
 * Enables 100% full application functionality even when the remote Render backend is sleeping or offline.
 * Persists changes in localStorage so CRUD operations, simulations, and alert resolutions work in real-time.
 */

const STORAGE_KEYS = {
  REPORTS: 'gmx_mock_reports',
  HOSPITALS: 'gmx_mock_hospitals',
  LABS: 'gmx_mock_labs',
  AIRPORTS: 'gmx_mock_airports',
  ALERTS: 'gmx_mock_alerts',
  RESOURCES: 'gmx_mock_resources',
  INCIDENTS: 'gmx_mock_incidents',
  USERS: 'gmx_mock_users',
  IS_DEMO: 'gmx_is_demo_mode'
};

const INITIAL_REPORTS = [
  { _id: 'rep-1', country: 'United States', disease: 'COVID-19', cases: 12500, deaths: 150, recoveries: 11000, reportDate: '2026-03-15T00:00:00.000Z' },
  { _id: 'rep-2', country: 'India', disease: 'COVID-19', cases: 18400, deaths: 220, recoveries: 17200, reportDate: '2026-03-16T00:00:00.000Z' },
  { _id: 'rep-3', country: 'Brazil', disease: 'Dengue Fever', cases: 8500, deaths: 45, recoveries: 7900, reportDate: '2026-03-14T00:00:00.000Z' },
  { _id: 'rep-4', country: 'Democratic Republic of Congo', disease: 'Ebola', cases: 350, deaths: 180, recoveries: 120, reportDate: '2026-03-12T00:00:00.000Z' },
  { _id: 'rep-5', country: 'United Kingdom', disease: 'Influenza', cases: 9200, deaths: 60, recoveries: 8900, reportDate: '2026-03-17T00:00:00.000Z' },
  { _id: 'rep-6', country: 'South Africa', disease: 'Tuberculosis', cases: 4200, deaths: 110, recoveries: 3500, reportDate: '2026-03-11T00:00:00.000Z' },
  { _id: 'rep-7', country: 'Australia', disease: 'Influenza', cases: 2500, deaths: 12, recoveries: 2400, reportDate: '2026-03-13T00:00:00.000Z' },
  { _id: 'rep-8', country: 'Nigeria', disease: 'Lassa Fever', cases: 880, deaths: 95, recoveries: 700, reportDate: '2026-03-10T00:00:00.000Z' }
];

const INITIAL_HOSPITALS = [
  { _id: 'hosp-1', name: 'Metro General Hospital', country: 'United States', city: 'New York', totalBeds: 500, availableBeds: 120, activeCases: 45, contactNumber: '+1-555-0199' },
  { _id: 'hosp-2', name: 'AIIMS New Delhi', country: 'India', city: 'New Delhi', totalBeds: 2200, availableBeds: 150, activeCases: 380, contactNumber: '+91-11-26588500' },
  { _id: 'hosp-3', name: 'St Thomas Hospital', country: 'United Kingdom', city: 'London', totalBeds: 800, availableBeds: 240, activeCases: 65, contactNumber: '+44-20-71887188' },
  { _id: 'hosp-4', name: 'Albert Einstein Hospital', country: 'Brazil', city: 'Sao Paulo', totalBeds: 600, availableBeds: 180, activeCases: 30, contactNumber: '+55-11-21511233' }
];

const INITIAL_LABS = [
  { _id: 'lab-1', name: 'CDC Global Diagnostics', country: 'United States', city: 'Atlanta', testsConducted: 45000, positiveResults: 1200, negativeResults: 43800, primaryFocus: 'Virology' },
  { _id: 'lab-2', name: 'National Institute of Virology', country: 'India', city: 'Pune', testsConducted: 32000, positiveResults: 1500, negativeResults: 30500, primaryFocus: 'Vector-borne Pathogens' },
  { _id: 'lab-3', name: 'Porton Down Lab', country: 'United Kingdom', city: 'Salisbury', testsConducted: 21000, positiveResults: 600, negativeResults: 20400, primaryFocus: 'Bio-surveillance' }
];

const INITIAL_AIRPORTS = [
  { _id: 'port-1', name: 'JFK International Airport', city: 'New York', country: 'United States', passengersScreened: 120000, highRiskFlagged: 45, quarantined: 12 },
  { _id: 'port-2', name: 'Indira Gandhi International Airport', city: 'New Delhi', country: 'India', passengersScreened: 150000, highRiskFlagged: 90, quarantined: 32 },
  { _id: 'port-3', name: 'London Heathrow Airport', city: 'London', country: 'United Kingdom', passengersScreened: 110000, highRiskFlagged: 25, quarantined: 8 }
];

const INITIAL_ALERTS = [
  { _id: 'alert-1', title: 'Ebola Outbreak Surge', description: 'Immediate containment protocols active in Central Africa.', level: 'Danger', status: 'Active', createdAt: new Date().toISOString() },
  { _id: 'alert-2', title: 'Flu Season Warning', description: 'Increased influenza cases noted across UK and France.', level: 'Warning', status: 'Active', createdAt: new Date().toISOString() },
  { _id: 'alert-3', title: 'Routine COVID Screening', description: 'Screening levels normalized at European borders.', level: 'Info', status: 'Resolved', createdAt: new Date().toISOString() }
];

const INITIAL_RESOURCES = [
  { _id: 'res-1', item: 'Vaccines', totalQuantity: 100000, allocatedQuantity: 45000, region: 'Asia-Pacific' },
  { _id: 'res-2', item: 'Ventilators', totalQuantity: 1200, allocatedQuantity: 950, region: 'North America' },
  { _id: 'res-3', item: 'PPE Kits', totalQuantity: 500000, allocatedQuantity: 320000, region: 'South America' },
  { _id: 'res-4', item: 'ICU Beds', totalQuantity: 5000, allocatedQuantity: 4100, region: 'Europe' }
];

const INITIAL_INCIDENTS = [
  { _id: 'inc-1', title: 'Vaccine Transport Delays', description: 'Cold-chain shipping issues at border checkpoints in Europe.', region: 'Europe', status: 'Open', reportedBy: 'Logistics Officer' },
  { _id: 'inc-2', title: 'ICU Bed Shortage', description: 'Hospital bed limits reached in Delhi Metropolitan Area.', region: 'Asia-Pacific', status: 'Investigating', reportedBy: 'Hospital Liaison' }
];

const INITIAL_USERS = [
  { _id: 'usr-1', name: 'Admin Administrator', email: 'admin@globalmedx.gov', role: 'admin' },
  { _id: 'usr-2', name: 'Surveillance Officer', email: 'officer@globalmedx.gov', role: 'officer' }
];

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

// Storage Helpers
const getStorage = (key, defaultVal) => {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : defaultVal;
  } catch (e) {
    return defaultVal;
  }
};

const setStorage = (key, val) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error('Storage write error:', e);
  }
};

export const mockStore = {
  isDemoMode: () => {
    return localStorage.getItem(STORAGE_KEYS.IS_DEMO) === 'true';
  },

  setDemoMode: (status) => {
    localStorage.setItem(STORAGE_KEYS.IS_DEMO, status ? 'true' : 'false');
  },

  resetAllData: () => {
    setStorage(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
    setStorage(STORAGE_KEYS.HOSPITALS, INITIAL_HOSPITALS);
    setStorage(STORAGE_KEYS.LABS, INITIAL_LABS);
    setStorage(STORAGE_KEYS.AIRPORTS, INITIAL_AIRPORTS);
    setStorage(STORAGE_KEYS.ALERTS, INITIAL_ALERTS);
    setStorage(STORAGE_KEYS.RESOURCES, INITIAL_RESOURCES);
    setStorage(STORAGE_KEYS.INCIDENTS, INITIAL_INCIDENTS);
    setStorage(STORAGE_KEYS.USERS, INITIAL_USERS);
    return { success: true, message: 'All telemetry and alerts reset to nominal baseline.' };
  },

  // Auth
  login: ({ email, password }) => {
    const lowerEmail = (email || '').trim().toLowerCase();
    
    // Support admin credentials
    if (lowerEmail === 'admin@globalmedx.gov' && password === 'admin123') {
      mockStore.setDemoMode(true);
      return {
        success: true,
        token: 'globalmedx-demo-jwt-token-admin',
        user: INITIAL_USERS[0],
        isDemo: true
      };
    }

    // Support officer credentials
    if (lowerEmail === 'officer@globalmedx.gov' && password === 'officer123') {
      mockStore.setDemoMode(true);
      return {
        success: true,
        token: 'globalmedx-demo-jwt-token-officer',
        user: INITIAL_USERS[1],
        isDemo: true
      };
    }

    // Fallback: allow any valid login if user wants to test quickly
    if (lowerEmail.includes('@') && password && password.length >= 4) {
      mockStore.setDemoMode(true);
      const isAdm = lowerEmail.includes('admin');
      const testUser = {
        _id: 'usr-custom',
        name: isAdm ? 'Admin User' : 'Surveillance Officer',
        email: lowerEmail,
        role: isAdm ? 'admin' : 'officer'
      };
      return {
        success: true,
        token: 'globalmedx-demo-jwt-token-custom',
        user: testUser,
        isDemo: true
      };
    }

    const err = new Error('Invalid email or password');
    err.response = { data: { success: false, message: 'Invalid credentials. Use admin@globalmedx.gov / admin123' } };
    throw err;
  },

  // Dashboard Stats
  getStats: () => {
    const reports = getStorage(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
    const alerts = getStorage(STORAGE_KEYS.ALERTS, INITIAL_ALERTS);
    const hospitals = getStorage(STORAGE_KEYS.HOSPITALS, INITIAL_HOSPITALS);
    const labs = getStorage(STORAGE_KEYS.LABS, INITIAL_LABS);

    let totalCases = 0;
    let totalDeaths = 0;
    let totalRecoveries = 0;

    reports.forEach((rep) => {
      totalCases += Number(rep.cases || 0);
      totalDeaths += Number(rep.deaths || 0);
      totalRecoveries += Number(rep.recoveries || 0);
    });

    const activeCases = Math.max(0, totalCases - (totalDeaths + totalRecoveries));
    const recoveryRate = totalCases > 0 ? ((totalRecoveries / totalCases) * 100).toFixed(2) : 0;
    const mortalityRate = totalCases > 0 ? ((totalDeaths / totalCases) * 100).toFixed(2) : 0;

    const highRiskRegions = reports
      .filter((r) => (r.cases - (r.deaths + r.recoveries)) > 1000)
      .map((r) => ({
        country: r.country,
        disease: r.disease,
        activeCases: Math.max(0, r.cases - (r.deaths + r.recoveries)),
        severity: (r.cases - (r.deaths + r.recoveries)) > 5000 ? 'Critical' : 'High'
      }))
      .sort((a, b) => b.activeCases - a.activeCases);

    return {
      success: true,
      data: {
        totalCases,
        activeCases,
        totalRecoveries,
        totalDeaths,
        recoveryRate: parseFloat(recoveryRate),
        mortalityRate: parseFloat(mortalityRate),
        activeAlertsCount: alerts.filter(a => a.status === 'Active').length,
        hospitalCount: hospitals.length,
        labCount: labs.length,
        highRiskRegions,
        totalReports: reports.length
      }
    };
  },

  // Reports
  getReports: () => {
    return { success: true, data: getStorage(STORAGE_KEYS.REPORTS, INITIAL_REPORTS) };
  },
  createReport: (data) => {
    const list = getStorage(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
    const newReport = { ...data, _id: `rep-${Date.now()}`, reportDate: data.reportDate || new Date().toISOString() };
    const updated = [newReport, ...list];
    setStorage(STORAGE_KEYS.REPORTS, updated);
    return { success: true, data: newReport };
  },
  updateReport: (id, data) => {
    const list = getStorage(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
    const updated = list.map(item => item._id === id ? { ...item, ...data } : item);
    setStorage(STORAGE_KEYS.REPORTS, updated);
    return { success: true, data: updated.find(i => i._id === id) };
  },
  deleteReport: (id) => {
    const list = getStorage(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
    const updated = list.filter(item => item._id !== id);
    setStorage(STORAGE_KEYS.REPORTS, updated);
    return { success: true, message: 'Report deleted' };
  },

  // Hospitals
  getHospitals: () => {
    return { success: true, data: getStorage(STORAGE_KEYS.HOSPITALS, INITIAL_HOSPITALS) };
  },
  registerHospital: (data) => {
    const list = getStorage(STORAGE_KEYS.HOSPITALS, INITIAL_HOSPITALS);
    const newHosp = { ...data, _id: `hosp-${Date.now()}` };
    const updated = [newHosp, ...list];
    setStorage(STORAGE_KEYS.HOSPITALS, updated);
    return { success: true, data: newHosp };
  },
  updateHospital: (id, data) => {
    const list = getStorage(STORAGE_KEYS.HOSPITALS, INITIAL_HOSPITALS);
    const updated = list.map(item => item._id === id ? { ...item, ...data } : item);
    setStorage(STORAGE_KEYS.HOSPITALS, updated);
    return { success: true, data: updated.find(i => i._id === id) };
  },
  deleteHospital: (id) => {
    const list = getStorage(STORAGE_KEYS.HOSPITALS, INITIAL_HOSPITALS);
    const updated = list.filter(item => item._id !== id);
    setStorage(STORAGE_KEYS.HOSPITALS, updated);
    return { success: true, message: 'Hospital removed' };
  },

  // Labs
  getLabs: () => {
    return { success: true, data: getStorage(STORAGE_KEYS.LABS, INITIAL_LABS) };
  },
  registerLab: (data) => {
    const list = getStorage(STORAGE_KEYS.LABS, INITIAL_LABS);
    const newLab = { ...data, _id: `lab-${Date.now()}` };
    const updated = [newLab, ...list];
    setStorage(STORAGE_KEYS.LABS, updated);
    return { success: true, data: newLab };
  },
  updateLab: (id, data) => {
    const list = getStorage(STORAGE_KEYS.LABS, INITIAL_LABS);
    const updated = list.map(item => item._id === id ? { ...item, ...data } : item);
    setStorage(STORAGE_KEYS.LABS, updated);
    return { success: true, data: updated.find(i => i._id === id) };
  },
  deleteLab: (id) => {
    const list = getStorage(STORAGE_KEYS.LABS, INITIAL_LABS);
    const updated = list.filter(item => item._id !== id);
    setStorage(STORAGE_KEYS.LABS, updated);
    return { success: true, message: 'Laboratory removed' };
  },

  // Airports
  getAirports: () => {
    return { success: true, data: getStorage(STORAGE_KEYS.AIRPORTS, INITIAL_AIRPORTS) };
  },
  createAirportLog: (data) => {
    const list = getStorage(STORAGE_KEYS.AIRPORTS, INITIAL_AIRPORTS);
    const newAirport = { ...data, _id: `port-${Date.now()}` };
    const updated = [newAirport, ...list];
    setStorage(STORAGE_KEYS.AIRPORTS, updated);
    return { success: true, data: newAirport };
  },
  updateAirportLog: (id, data) => {
    const list = getStorage(STORAGE_KEYS.AIRPORTS, INITIAL_AIRPORTS);
    const updated = list.map(item => item._id === id ? { ...item, ...data } : item);
    setStorage(STORAGE_KEYS.AIRPORTS, updated);
    return { success: true, data: updated.find(i => i._id === id) };
  },
  deleteAirportLog: (id) => {
    const list = getStorage(STORAGE_KEYS.AIRPORTS, INITIAL_AIRPORTS);
    const updated = list.filter(item => item._id !== id);
    setStorage(STORAGE_KEYS.AIRPORTS, updated);
    return { success: true, message: 'Airport log removed' };
  },

  // Alerts
  getAlerts: () => {
    return { success: true, data: getStorage(STORAGE_KEYS.ALERTS, INITIAL_ALERTS) };
  },
  raiseAlert: (data) => {
    const list = getStorage(STORAGE_KEYS.ALERTS, INITIAL_ALERTS);
    const newAlert = { ...data, _id: `alert-${Date.now()}`, status: 'Active', createdAt: new Date().toISOString() };
    const updated = [newAlert, ...list];
    setStorage(STORAGE_KEYS.ALERTS, updated);
    return { success: true, data: newAlert };
  },
  updateAlert: (id, data) => {
    const list = getStorage(STORAGE_KEYS.ALERTS, INITIAL_ALERTS);
    const updated = list.map(item => item._id === id ? { ...item, ...data } : item);
    setStorage(STORAGE_KEYS.ALERTS, updated);
    return { success: true, data: updated.find(i => i._id === id) };
  },
  deleteAlert: (id) => {
    const list = getStorage(STORAGE_KEYS.ALERTS, INITIAL_ALERTS);
    const updated = list.filter(item => item._id !== id);
    setStorage(STORAGE_KEYS.ALERTS, updated);
    return { success: true, message: 'Alert deleted' };
  },
  resolveAllAlerts: () => {
    const list = getStorage(STORAGE_KEYS.ALERTS, INITIAL_ALERTS);
    const updated = list.map(item => ({ ...item, status: 'Resolved' }));
    setStorage(STORAGE_KEYS.ALERTS, updated);
    return { success: true, message: 'All active alerts resolved', data: updated };
  },

  // Analytics Summary
  getAnalyticsSummary: () => {
    const reports = getStorage(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
    const casesByCountry = {};
    const casesByDisease = {};
    let totalCases = 0;
    let totalDeaths = 0;
    let totalRecoveries = 0;

    reports.forEach((r) => {
      totalCases += r.cases;
      totalDeaths += r.deaths;
      totalRecoveries += r.recoveries;

      if (!casesByCountry[r.country]) {
        casesByCountry[r.country] = { cases: 0, deaths: 0, recoveries: 0 };
      }
      casesByCountry[r.country].cases += r.cases;
      casesByCountry[r.country].deaths += r.deaths;
      casesByCountry[r.country].recoveries += r.recoveries;

      if (!casesByDisease[r.disease]) {
        casesByDisease[r.disease] = { cases: 0, deaths: 0, recoveries: 0 };
      }
      casesByDisease[r.disease].cases += r.cases;
      casesByDisease[r.disease].deaths += r.deaths;
      casesByDisease[r.disease].recoveries += r.recoveries;
    });

    const countryData = Object.keys(casesByCountry).map((country) => ({
      country,
      cases: casesByCountry[country].cases,
      deaths: casesByCountry[country].deaths,
      recoveries: casesByCountry[country].recoveries
    }));

    const diseaseData = Object.keys(casesByDisease).map((disease) => ({
      disease,
      cases: casesByDisease[disease].cases,
      deaths: casesByDisease[disease].deaths,
      recoveries: casesByDisease[disease].recoveries
    }));

    const monthlyTrends = [
      { month: 'Jan', cases: Math.round(totalCases * 0.4), deaths: Math.round(totalDeaths * 0.38), recoveries: Math.round(totalRecoveries * 0.3) },
      { month: 'Feb', cases: Math.round(totalCases * 0.5), deaths: Math.round(totalDeaths * 0.48), recoveries: Math.round(totalRecoveries * 0.4) },
      { month: 'Mar', cases: Math.round(totalCases * 0.65), deaths: Math.round(totalDeaths * 0.6), recoveries: Math.round(totalRecoveries * 0.55) },
      { month: 'Apr', cases: Math.round(totalCases * 0.8), deaths: Math.round(totalDeaths * 0.78), recoveries: Math.round(totalRecoveries * 0.7) },
      { month: 'May', cases: Math.round(totalCases * 0.9), deaths: Math.round(totalDeaths * 0.88), recoveries: Math.round(totalRecoveries * 0.85) },
      { month: 'Jun', cases: totalCases, deaths: totalDeaths, recoveries: totalRecoveries }
    ];

    const heatmaps = reports.map((r) => {
      const coords = countryCoords[r.country] || { lat: 20, lng: 0 };
      return {
        country: r.country,
        disease: r.disease,
        lat: coords.lat,
        lng: coords.lng,
        intensity: r.cases
      };
    });

    return {
      success: true,
      data: {
        byCountry: countryData,
        byDisease: diseaseData,
        monthlyTrends,
        heatmaps
      }
    };
  },

  // Admin & Resources
  getHealth: () => {
    return {
      success: true,
      data: {
        status: 'UP',
        uptime: '3840s',
        database: 'Healthy',
        timestamp: new Date().toISOString(),
        processDetails: {
          memoryHeapUsed: '94 MB',
          memoryHeapTotal: '148 MB',
          cpuUsage: { user: 120000, system: 45000 }
        }
      }
    };
  },
  getUsers: () => {
    return { success: true, count: INITIAL_USERS.length, data: INITIAL_USERS };
  },
  getResources: () => {
    return { success: true, data: getStorage(STORAGE_KEYS.RESOURCES, INITIAL_RESOURCES) };
  },
  updateResource: (id, data) => {
    const list = getStorage(STORAGE_KEYS.RESOURCES, INITIAL_RESOURCES);
    const updated = list.map(item => item._id === id ? { ...item, ...data } : item);
    setStorage(STORAGE_KEYS.RESOURCES, updated);
    return { success: true, data: updated.find(i => i._id === id) };
  },
  getIncidents: () => {
    return { success: true, data: getStorage(STORAGE_KEYS.INCIDENTS, INITIAL_INCIDENTS) };
  },
  updateIncident: (id, data) => {
    const list = getStorage(STORAGE_KEYS.INCIDENTS, INITIAL_INCIDENTS);
    const updated = list.map(item => item._id === id ? { ...item, ...data } : item);
    setStorage(STORAGE_KEYS.INCIDENTS, updated);
    return { success: true, data: updated.find(i => i._id === id) };
  },

  // DevOps Metrics
  getDevopsMetrics: () => {
    const memory = 98;
    const cpuTotal = 14;

    return {
      success: true,
      liveMetrics: {
        uptime: '4250s',
        uptimeSeconds: 4250,
        memory: {
          rss: '142 MB',
          heapUsed: `${memory} MB`,
          heapTotal: '180 MB',
          heapUsedBytes: memory * 1024 * 1024,
          heapTotalBytes: 180 * 1024 * 1024
        },
        cpu: {
          user: 32000,
          system: 18000,
          totalPercent: cpuTotal
        },
        api: {
          totalRequests: 248,
          requestsBreakdown: [
            { method: 'GET', route: '/api/dashboard/stats', status_code: 200, count: 64 },
            { method: 'GET', route: '/api/reports', status_code: 200, count: 48 },
            { method: 'GET', route: '/api/analytics/summary', status_code: 200, count: 32 },
            { method: 'POST', route: '/api/auth/login', status_code: 200, count: 18 }
          ],
          latencies: [
            { method: 'GET', route: '/api/dashboard/stats', statusCode: 200, avgResponseTimeMs: 42, totalCalls: 64 },
            { method: 'GET', route: '/api/reports', statusCode: 200, avgResponseTimeMs: 56, totalCalls: 48 },
            { method: 'GET', route: '/api/analytics/summary', statusCode: 200, avgResponseTimeMs: 68, totalCalls: 32 },
            { method: 'POST', route: '/api/auth/login', statusCode: 200, avgResponseTimeMs: 110, totalCalls: 18 }
          ]
        },
        database: {
          status: 'Healthy',
          collections: 9,
          documents: 34,
          host: 'globalmedx-mongodb'
        },
        timestamp: new Date().toISOString()
      },
      simulatedInfrastructure: {
        dockerContainers: [
          { name: 'globalmedx-frontend', status: 'RUNNING', cpu: '1.4%', memory: '85 MB', uptime: '1h 45m', port: 3000 },
          { name: 'globalmedx-backend', status: 'RUNNING', cpu: '0.9%', memory: '112 MB', uptime: '1h 45m', port: 5005 },
          { name: 'globalmedx-mongodb', status: 'RUNNING', cpu: '0.5%', memory: '180 MB', uptime: '1h 45m', port: 27017 },
          { name: 'globalmedx-vault', status: 'RUNNING', cpu: '0.1%', memory: '42 MB', uptime: '1h 45m', port: 8200 },
          { name: 'globalmedx-prometheus', status: 'RUNNING', cpu: '0.3%', memory: '60 MB', uptime: '1h 45m', port: 9090 },
          { name: 'globalmedx-grafana', status: 'RUNNING', cpu: '0.2%', memory: '95 MB', uptime: '1h 45m', port: 3001 },
          { name: 'globalmedx-elasticsearch', status: 'STANDBY', cpu: '0.0%', memory: '0 MB', uptime: '0s', port: 9200 },
          { name: 'globalmedx-logstash', status: 'STANDBY', cpu: '0.0%', memory: '0 MB', uptime: '0s', port: 5044 },
          { name: 'globalmedx-kibana', status: 'STANDBY', cpu: '0.0%', memory: '0 MB', uptime: '0s', port: 5601 }
        ],
        kubernetesPods: [
          { name: 'backend-deployment-f489db7-c812a', namespace: 'globalmedx', status: 'Running', restarts: 0, cpu: '18m', memory: '110Mi', age: '45m' },
          { name: 'frontend-deployment-856cdf-k9b45', namespace: 'globalmedx', status: 'Running', restarts: 0, cpu: '12m', memory: '75Mi', age: '45m' },
          { name: 'mongodb-statefulset-0', namespace: 'globalmedx', status: 'Running', restarts: 0, cpu: '25m', memory: '185Mi', age: '1d' },
          { name: 'vault-statefulset-0', namespace: 'globalmedx', status: 'Running', restarts: 1, cpu: '5m', memory: '40Mi', age: '2d' }
        ],
        jenkinsBuilds: [
          { buildNo: 48, jobName: 'globalmedx-main-pipeline', branch: 'main', status: 'SUCCESS', duration: '2m 15s', timestamp: new Date(Date.now() - 1800000).toISOString() },
          { buildNo: 47, jobName: 'globalmedx-main-pipeline', branch: 'main', status: 'SUCCESS', duration: '2m 08s', timestamp: new Date(Date.now() - 7200000).toISOString() },
          { buildNo: 46, jobName: 'globalmedx-feature-auth', branch: 'feature/vault-jwt', status: 'FAILURE', duration: '1m 20s', timestamp: new Date(Date.now() - 14400000).toISOString() }
        ],
        deployments: [
          { version: 'v1.1.0', commit: 'bf59ae2', author: 'Devops Lead', status: 'SUCCESS', environment: 'Production', timestamp: new Date(Date.now() - 3600000 * 24 * 3).toISOString() },
          { version: 'v1.0.8', commit: 'c3f192b', author: 'CI/CD Bot', status: 'SUCCESS', environment: 'Staging', timestamp: new Date(Date.now() - 3600000 * 24 * 7).toISOString() }
        ],
        vault: {
          status: 'Initialized & Unsealed',
          engine: 'kv-v2',
          unsealProgress: '0/3',
          version: '1.15.2'
        }
      }
    };
  },

  // Trigger Simulation
  triggerSimulation: (type, country, disease) => {
    switch (type) {
      case 'pandemic_event': {
        const reports = getStorage(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
        const updated = reports.map(r => ({
          ...r,
          cases: Math.round(r.cases * 1.25),
          deaths: Math.round(r.deaths * 1.1)
        }));
        setStorage(STORAGE_KEYS.REPORTS, updated);
        mockStore.raiseAlert({
          title: 'GLOBAL CASE SURGE SIMULATION',
          description: 'Surveillance systems detect a concurrent rise in viral pathogen cases worldwide.',
          level: 'Danger'
        });
        return { success: true, message: 'Global pandemic case counts successfully incremented. Warning alert issued.' };
      }
      case 'resource_shortage': {
        const hospitals = getStorage(STORAGE_KEYS.HOSPITALS, INITIAL_HOSPITALS);
        const updatedHosp = hospitals.map(h => ({
          ...h,
          availableBeds: Math.max(1, Math.round(h.totalBeds * 0.02)),
          activeCases: Math.round(h.totalBeds * 0.95)
        }));
        setStorage(STORAGE_KEYS.HOSPITALS, updatedHosp);

        const resources = getStorage(STORAGE_KEYS.RESOURCES, INITIAL_RESOURCES);
        const updatedRes = resources.map(r => ({
          ...r,
          allocatedQuantity: r.totalQuantity
        }));
        setStorage(STORAGE_KEYS.RESOURCES, updatedRes);

        mockStore.raiseAlert({
          title: 'CRITICAL STOCKPILE DEPLETION',
          description: 'Hospital bed limits reached & emergency reserve stocks fully committed.',
          level: 'Danger'
        });
        return { success: true, message: 'Simulated acute stockpile depletion and ICU bed strain.' };
      }
      case 'traffic_surge': {
        const airports = getStorage(STORAGE_KEYS.AIRPORTS, INITIAL_AIRPORTS);
        const updated = airports.map(a => ({
          ...a,
          passengersScreened: Math.round(a.passengersScreened * 1.4),
          highRiskFlagged: a.highRiskFlagged + 15,
          quarantined: a.quarantined + 8
        }));
        setStorage(STORAGE_KEYS.AIRPORTS, updated);
        mockStore.raiseAlert({
          title: 'BORDER HEALTH CHECK SPIKE',
          description: 'High-risk passenger screenings exceed normal protocol thresholds.',
          level: 'Warning'
        });
        return { success: true, message: 'Border passenger screenings and quarantine counts escalated.' };
      }
      default: {
        mockStore.raiseAlert({
          title: 'SIMULATION EVENT RECORDED',
          description: `Event type: ${type} executed against ${country || 'global'} sector.`,
          level: 'Info'
        });
        return { success: true, message: `Simulation event '${type}' processed successfully.` };
      }
    }
  }
};

