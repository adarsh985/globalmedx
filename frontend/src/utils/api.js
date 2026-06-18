import axios from 'axios';

// Create central Axios instance
const API = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor to attach JWT token
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

// API Endpoint Map
export const authAPI = {
  login: (credentials) => API.post('/auth/login', credentials),
  register: (userData) => API.post('/auth/register', userData),
  getProfile: () => API.get('/auth/profile'),
};

export const dashboardAPI = {
  getStats: () => API.get('/dashboard/stats'),
};

export const reportAPI = {
  getReports: (params) => API.get('/reports', { params }),
  createReport: (data) => API.post('/reports', data),
  updateReport: (id, data) => API.put(`/reports/${id}`, data),
  deleteReport: (id) => API.delete(`/reports/${id}`),
};

export const hospitalAPI = {
  getHospitals: () => API.get('/hospitals'),
  registerHospital: (data) => API.post('/hospitals', data),
  updateHospital: (id, data) => API.put(`/hospitals/${id}`, data),
  deleteHospital: (id) => API.delete(`/hospitals/${id}`),
};

export const labAPI = {
  getLabs: () => API.get('/laboratories'),
  registerLab: (data) => API.post('/laboratories', data),
  updateLab: (id, data) => API.put(`/laboratories/${id}`, data),
  deleteLab: (id) => API.delete(`/laboratories/${id}`),
};

export const airportAPI = {
  getAirports: () => API.get('/airports'),
  createLog: (data) => API.post('/airports', data),
  updateLog: (id, data) => API.put(`/airports/${id}`, data),
  deleteLog: (id) => API.delete(`/airports/${id}`),
};

export const analyticsAPI = {
  getSummary: () => API.get('/analytics/summary'),
};

export const alertAPI = {
  getAlerts: () => API.get('/alerts'),
  raiseAlert: (data) => API.post('/alerts', data),
  updateAlert: (id, data) => API.put(`/alerts/${id}`, data),
  deleteAlert: (id) => API.delete(`/alerts/${id}`),
};

export const simulationAPI = {
  trigger: (type, country, disease) => API.post('/simulate', { type, country, disease }),
};

export const adminAPI = {
  getHealth: () => API.get('/health'),
  getUsers: () => API.get('/admin/users'),
  getResources: () => API.get('/admin/resources'),
  updateResource: (id, data) => API.put(`/admin/resources/${id}`, data),
  getIncidents: () => API.get('/admin/incidents'),
  updateIncident: (id, data) => API.put(`/admin/incidents/${id}`, data),
};

export const devopsAPI = {
  getMetrics: () => API.get('/devops/metrics'),
};

export default API;
