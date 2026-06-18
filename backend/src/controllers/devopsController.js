const mongoose = require('mongoose');
const { register } = require('../config/prometheus');
const { logger } = require('../middleware/loggingMiddleware');

// Cache system start time
const SERVER_START_TIME = Date.now();

// Simulated historical deployment logs
const simulatedDeployments = [
  { version: 'v1.1.0', commit: 'bf59ae2', author: 'Devops Lead', status: 'SUCCESS', environment: 'Production', timestamp: new Date(Date.now() - 3600000 * 24 * 3).toISOString() },
  { version: 'v1.0.8', commit: 'c3f192b', author: 'CI/CD Bot', status: 'SUCCESS', environment: 'Staging', timestamp: new Date(Date.now() - 3600000 * 24 * 7).toISOString() },
  { version: 'v1.0.7', commit: '89aab01', author: 'Frontend Dev', status: 'SUCCESS', environment: 'Production', timestamp: new Date(Date.now() - 3600000 * 24 * 12).toISOString() },
  { version: 'v1.0.6', commit: '9211fc2', author: 'Backend Dev', status: 'FAILED', environment: 'Production', timestamp: new Date(Date.now() - 3600000 * 24 * 15).toISOString() }
];

// Simulated Jenkins builds
const simulatedJenkinsBuilds = [
  { buildNo: 48, jobName: 'globalmedx-main-pipeline', branch: 'main', status: 'SUCCESS', duration: '2m 15s', timestamp: new Date(Date.now() - 1800000).toISOString() },
  { buildNo: 47, jobName: 'globalmedx-main-pipeline', branch: 'main', status: 'SUCCESS', duration: '2m 08s', timestamp: new Date(Date.now() - 7200000).toISOString() },
  { buildNo: 46, jobName: 'globalmedx-feature-auth', branch: 'feature/vault-jwt', status: 'FAILURE', duration: '1m 20s', timestamp: new Date(Date.now() - 14400000).toISOString() },
  { buildNo: 45, jobName: 'globalmedx-main-pipeline', branch: 'main', status: 'SUCCESS', duration: '2m 12s', timestamp: new Date(Date.now() - 28800000).toISOString() }
];

// @desc    Get real-time DevOps metrics, Node.js load, Prometheus statistics, and simulated status
// @route   GET /api/devops/metrics
// @access  Public (or Protected)
const getDevopsMetrics = async (req, res) => {
  try {
    // 1. Live Node.js Process Telemetry
    const memory = process.memoryUsage();
    const uptimeSec = process.uptime();
    const cpu = process.cpuUsage();
    
    // 2. Mongoose Live DB Status
    const dbState = mongoose.connection.readyState;
    const dbStatusStr = dbState === 1 ? 'Healthy' : dbState === 2 ? 'Connecting' : 'Disconnected';
    
    let dbDetails = {
      status: dbStatusStr,
      collections: 0,
      documents: 0,
      host: mongoose.connection.host || 'localhost'
    };

    if (dbState === 1) {
      const collections = Object.keys(mongoose.connection.collections);
      dbDetails.collections = collections.length;
      let totalDocs = 0;
      for (const col of collections) {
        try {
          totalDocs += await mongoose.connection.collections[col].countDocuments();
        } catch (e) {
          // ignore counting issues on metadata collections
        }
      }
      dbDetails.documents = totalDocs;
    }

    // 3. Scraping Prometheus Registry Metrics
    let totalRequests = 0;
    const apiRequestsBreakdown = [];
    const apiLatencies = [];

    try {
      const requestsMetric = await register.getSingleMetric('http_requests_total').get();
      const durationMetric = await register.getSingleMetric('http_request_duration_seconds').get();

      if (requestsMetric && requestsMetric.values) {
        requestsMetric.values.forEach(v => {
          totalRequests += v.value;
          apiRequestsBreakdown.push({
            method: v.labels.method,
            route: v.labels.route,
            status_code: v.labels.status_code,
            count: v.value
          });
        });
      }

      if (durationMetric && durationMetric.values) {
        const sums = {};
        const counts = {};
        
        durationMetric.values.forEach(v => {
          const key = `${v.labels.method}:${v.labels.route}:${v.labels.status_code}`;
          if (v.metricName.endsWith('_sum')) {
            sums[key] = v.value;
          } else if (v.metricName.endsWith('_count')) {
            counts[key] = v.value;
          }
        });

        Object.keys(counts).forEach(key => {
          const count = counts[key];
          const sum = sums[key] || 0;
          const avg = count > 0 ? (sum / count) * 1000 : 0; // Convert to ms
          const [method, route, status_code] = key.split(':');
          
          apiLatencies.push({
            method,
            route,
            statusCode: parseInt(status_code, 10),
            avgResponseTimeMs: Math.round(avg),
            totalCalls: count
          });
        });
      }
    } catch (metricError) {
      logger.warn('Failed to extract Prometheus metrics', { error: metricError.message });
    }

    // 4. Live Metrics Payload
    const liveMetrics = {
      uptime: `${Math.round(uptimeSec)}s`,
      uptimeSeconds: uptimeSec,
      memory: {
        rss: `${Math.round(memory.rss / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(memory.heapUsed / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(memory.heapTotal / 1024 / 1024)} MB`,
        heapUsedBytes: memory.heapUsed,
        heapTotalBytes: memory.heapTotal,
      },
      cpu: {
        user: cpu.user,
        system: cpu.system,
        totalPercent: Math.min(100, Math.round((cpu.user + cpu.system) / 1000000)) // Scaled representation
      },
      api: {
        totalRequests,
        requestsBreakdown: apiRequestsBreakdown,
        latencies: apiLatencies
      },
      database: dbDetails,
      timestamp: new Date().toISOString()
    };

    // 5. Simulated Infrastructure (Docker, Kubernetes, Jenkins, Vault, ELK)
    const simulatedInfrastructure = {
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
      jenkinsBuilds: simulatedJenkinsBuilds,
      deployments: simulatedDeployments,
      vault: {
        status: 'Initialized & Unsealed',
        engine: 'kv-v2',
        unsealProgress: '0/3',
        version: '1.15.2'
      }
    };

    res.json({
      success: true,
      liveMetrics,
      simulatedInfrastructure
    });
  } catch (error) {
    logger.error('Error in DevOps metrics collection', { error: error.message });
    res.status(500).json({ success: false, message: 'DevOps metrics bootstrap error' });
  }
};

module.exports = { getDevopsMetrics };
