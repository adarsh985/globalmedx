require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { getSecrets } = require('./config/vault');
const { requestLogger, logger } = require('./middleware/loggingMiddleware');
const { protect, authorize } = require('./middleware/authMiddleware');
const { register, httpRequestCounter, httpRequestDuration } = require('./config/prometheus');

// Initialize Express
const app = express();
const PORT = process.env.PORT || 5000;

// Setup CORS and Body Parser
app.use(cors());
app.use(express.json());

// Setup Centralized JSON Logger Middleware
app.use(requestLogger);


// Metrics Middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    // Avoid registration metrics poll pollution
    if (req.route && req.route.path !== '/metrics') {
      const duration = (Date.now() - start) / 1000;
      const labels = {
        method: req.method,
        route: req.route.path,
        status_code: res.statusCode,
      };
      httpRequestCounter.inc(labels);
      httpRequestDuration.observe(labels, duration);
    }
  });
  next();
});

// Import Controllers
const authCtrl = require('./controllers/authController');
const dashboardCtrl = require('./controllers/dashboardController');
const reportCtrl = require('./controllers/reportController');
const hospitalCtrl = require('./controllers/hospitalController');
const labCtrl = require('./controllers/labController');
const airportCtrl = require('./controllers/airportController');
const analyticsCtrl = require('./controllers/analyticsController');
const alertCtrl = require('./controllers/alertController');
const simulationCtrl = require('./controllers/simulationController');
const adminCtrl = require('./controllers/adminController');
const devopsCtrl = require('./controllers/devopsController');

// Define API Router
const apiRouter = express.Router();

// 1. Health check (No auth)
apiRouter.get('/health', adminCtrl.getHealthStatus);

// 2. Authentication Route Map
apiRouter.post('/auth/register', authCtrl.registerUser);
apiRouter.post('/auth/login', authCtrl.loginUser);
apiRouter.get('/auth/profile', protect, authCtrl.getUserProfile);

// 3. Dashboard Route Map
apiRouter.get('/dashboard/stats', dashboardCtrl.getDashboardStats);

// 4. Disease Surveillance Route Map
apiRouter.get('/reports', reportCtrl.getReports);
apiRouter.post('/reports', protect, authorize('officer', 'admin'), reportCtrl.createReport);
apiRouter.put('/reports/:id', protect, authorize('officer', 'admin'), reportCtrl.updateReport);
apiRouter.delete('/reports/:id', protect, authorize('admin'), reportCtrl.deleteReport);

// 5. Hospital Management Route Map
apiRouter.get('/hospitals', hospitalCtrl.getHospitals);
apiRouter.post('/hospitals', protect, authorize('officer', 'admin'), hospitalCtrl.registerHospital);
apiRouter.put('/hospitals/:id', protect, authorize('officer', 'admin'), hospitalCtrl.updateHospital);
apiRouter.delete('/hospitals/:id', protect, authorize('admin'), hospitalCtrl.deleteHospital);

// 6. Laboratory Route Map
apiRouter.get('/laboratories', labCtrl.getLaboratories);
apiRouter.post('/laboratories', protect, authorize('officer', 'admin'), labCtrl.registerLaboratory);
apiRouter.put('/laboratories/:id', protect, authorize('officer', 'admin'), labCtrl.updateLaboratory);
apiRouter.delete('/laboratories/:id', protect, authorize('admin'), labCtrl.deleteLaboratory);

// 7. Airport & Border Route Map
apiRouter.get('/airports', airportCtrl.getAirports);
apiRouter.post('/airports', protect, authorize('officer', 'admin'), airportCtrl.createAirportLog);
apiRouter.put('/airports/:id', protect, authorize('officer', 'admin'), airportCtrl.updateAirportLog);
apiRouter.delete('/airports/:id', protect, authorize('admin'), airportCtrl.deleteAirportLog);

// 8. Analytics Route Map
apiRouter.get('/analytics/summary', analyticsCtrl.getAnalyticsSummary);

// 9. Alert Route Map
apiRouter.get('/alerts', alertCtrl.getAlerts);
apiRouter.post('/alerts', protect, authorize('officer', 'admin'), alertCtrl.raiseAlert);
apiRouter.put('/alerts/:id', protect, authorize('officer', 'admin'), alertCtrl.updateAlert);
apiRouter.delete('/alerts/:id', protect, authorize('admin'), alertCtrl.deleteAlert);

// 10. Simulation Route Map
apiRouter.post('/simulate', protect, authorize('officer', 'admin'), simulationCtrl.triggerSimulation);

// 11. Admin & Resources Route Map
apiRouter.get('/admin/users', protect, authorize('admin'), adminCtrl.getUsers);
apiRouter.get('/admin/resources', protect, authorize('officer', 'admin'), adminCtrl.getResources);
apiRouter.put('/admin/resources/:id', protect, authorize('officer', 'admin'), adminCtrl.updateResource);
apiRouter.get('/admin/incidents', protect, authorize('officer', 'admin'), adminCtrl.getIncidents);
apiRouter.put('/admin/incidents/:id', protect, authorize('officer', 'admin'), adminCtrl.updateIncident);
apiRouter.get('/devops/metrics', devopsCtrl.getDevopsMetrics);

// Mount API routes
app.use('/api', apiRouter);

// Prometheus Scraping Route (Expose metrics)
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err);
  }
});

// App Bootstrap Logic (Loads Secrets first)
const startServer = async () => {
  try {
    // 1. Fetch credentials from Vault or Local Env
    const secrets = await getSecrets();
    
    // 2. Set Env variables
    process.env.MONGODB_URI = secrets.MONGODB_URI;
    process.env.JWT_SECRET = secrets.JWT_SECRET;
    process.env.API_KEY = secrets.API_KEY;

    // 3. Connect to Database
    await connectDB();

    // 4. Start listening
    app.listen(PORT, () => {
      console.log(`GlobalMedX Server running on port ${PORT}`);
      logger.info('GlobalMedX REST API Service Started successfully', { port: PORT });
    });
  } catch (error) {
    console.error(`Bootstrap Failure: ${error.message}`);
    process.exit(1);
  }
};

startServer();
