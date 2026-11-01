import axios from 'axios';
import { mockStore } from './mockStore';

// Central Axios instance
// Local development: uses Vite's /api proxy
// Production: uses VITE_API_URL if configured, otherwise /api
// Configured with 5000ms timeout to prevent indefinite screen freezing when backend is sleeping/offline
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('globalmedx_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Robust resilience wrapper:
 * Tries the real backend first. If the backend is down, asleep, times out,
 * or returns a network error, automatically fails over to the offline local store.
 */
const withFallback = async (requestFn, fallbackFn) => {
  if (mockStore.isDemoMode()) {
    try {
      return { data: await fallbackFn() };
    } catch (e) {
      console.warn('Fallback store error:', e);
    }
  }

  try {
    const res = await requestFn();
    return res;
  } catch (err) {
    console.warn(
      `[GlobalMedX Resilience Engine] Remote API unreachable (${err.message}). Activating local offline mock store failover.`
    );
    mockStore.setDemoMode(true);
    return { data: await fallbackFn() };
  }
};

// Authentication
export const authAPI = {
  login: async (credentials) => {
    try {
      return await API.post('/auth/login', credentials);
    } catch (err) {
      console.warn('Backend login unreachable or timed out. Validating via offline failover...');
      return { data: mockStore.login(credentials) };
    }
  },
  register: (userData) =>
    withFallback(
      () => API.post('/auth/register', userData),
      () => ({ success: true, message: 'User registered in offline store' })
    ),
  getProfile: () =>
    withFallback(
      () => API.get('/auth/profile'),
      () => ({ success: true, data: mockStore.getUsers().data[0] })
    ),
};

// Dashboard
export const dashboardAPI = {
  getStats: () =>
    withFallback(
      () => API.get('/dashboard/stats'),
      () => mockStore.getStats()
    ),
};

// Disease Reports
export const reportAPI = {
  getReports: (params) =>
    withFallback(
      () => API.get('/reports', { params }),
      () => mockStore.getReports()
    ),
  createReport: (data) =>
    withFallback(
      () => API.post('/reports', data),
      () => mockStore.createReport(data)
    ),
  updateReport: (id, data) =>
    withFallback(
      () => API.put(`/reports/${id}`, data),
      () => mockStore.updateReport(id, data)
    ),
  deleteReport: (id) =>
    withFallback(
      () => API.delete(`/reports/${id}`),
      () => mockStore.deleteReport(id)
    ),
};

// Hospitals
export const hospitalAPI = {
  getHospitals: () =>
    withFallback(
      () => API.get('/hospitals'),
      () => mockStore.getHospitals()
    ),
  registerHospital: (data) =>
    withFallback(
      () => API.post('/hospitals', data),
      () => mockStore.registerHospital(data)
    ),
  updateHospital: (id, data) =>
    withFallback(
      () => API.put(`/hospitals/${id}`, data),
      () => mockStore.updateHospital(id, data)
    ),
  deleteHospital: (id) =>
    withFallback(
      () => API.delete(`/hospitals/${id}`),
      () => mockStore.deleteHospital(id)
    ),
};

// Laboratories
export const labAPI = {
  getLabs: () =>
    withFallback(
      () => API.get('/laboratories'),
      () => mockStore.getLabs()
    ),
  registerLab: (data) =>
    withFallback(
      () => API.post('/laboratories', data),
      () => mockStore.registerLab(data)
    ),
  updateLab: (id, data) =>
    withFallback(
      () => API.put(`/laboratories/${id}`, data),
      () => mockStore.updateLab(id, data)
    ),
  deleteLab: (id) =>
    withFallback(
      () => API.delete(`/laboratories/${id}`),
      () => mockStore.deleteLab(id)
    ),
};

// Airports
export const airportAPI = {
  getAirports: () =>
    withFallback(
      () => API.get('/airports'),
      () => mockStore.getAirports()
    ),
  createLog: (data) =>
    withFallback(
      () => API.post('/airports', data),
      () => mockStore.createAirportLog(data)
    ),
  updateLog: (id, data) =>
    withFallback(
      () => API.put(`/airports/${id}`, data),
      () => mockStore.updateAirportLog(id, data)
    ),
  deleteLog: (id) =>
    withFallback(
      () => API.delete(`/airports/${id}`),
      () => mockStore.deleteAirportLog(id)
    ),
};

// Analytics
export const analyticsAPI = {
  getSummary: () =>
    withFallback(
      () => API.get('/analytics/summary'),
      () => mockStore.getAnalyticsSummary()
    ),
};

// Alerts
export const alertAPI = {
  getAlerts: () =>
    withFallback(
      () => API.get('/alerts'),
      () => mockStore.getAlerts()
    ),
  raiseAlert: (data) =>
    withFallback(
      () => API.post('/alerts', data),
      () => mockStore.raiseAlert(data)
    ),
  updateAlert: (id, data) =>
    withFallback(
      () => API.put(`/alerts/${id}`, data),
      () => mockStore.updateAlert(id, data)
    ),
  deleteAlert: (id) =>
    withFallback(
      () => API.delete(`/alerts/${id}`),
      () => mockStore.deleteAlert(id)
    ),
};

// Simulation
export const simulationAPI = {
  trigger: (type, country, disease) =>
    withFallback(
      () =>
        API.post('/simulate', {
          type,
          country,
          disease,
        }),
      () => mockStore.triggerSimulation(type, country, disease)
    ),
};

// Admin
export const adminAPI = {
  getHealth: () =>
    withFallback(
      () => API.get('/health'),
      () => mockStore.getHealth()
    ),
  getUsers: () =>
    withFallback(
      () => API.get('/admin/users'),
      () => mockStore.getUsers()
    ),
  getResources: () =>
    withFallback(
      () => API.get('/admin/resources'),
      () => mockStore.getResources()
    ),
  updateResource: (id, data) =>
    withFallback(
      () => API.put(`/admin/resources/${id}`, data),
      () => mockStore.updateResource(id, data)
    ),
  getIncidents: () =>
    withFallback(
      () => API.get('/admin/incidents'),
      () => mockStore.getIncidents()
    ),
  updateIncident: (id, data) =>
    withFallback(
      () => API.put(`/admin/incidents/${id}`, data),
      () => mockStore.updateIncident(id, data)
    ),
};

// DevOps
export const devopsAPI = {
  getMetrics: () =>
    withFallback(
      () => API.get('/devops/metrics'),
      () => mockStore.getDevopsMetrics()
    ),
};

export default API;
