const client = require('prom-client');

// Initialize a central registry
const register = new client.Registry();

// Collect default system metrics (CPU, memory, etc.)
client.collectDefaultMetrics({ register });

// Custom Prometheus HTTP metrics
const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests processed',
  labelNames: ['method', 'route', 'status_code'],
});

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 1, 1.5, 2, 5],
});

// Register custom metrics
register.registerMetric(httpRequestCounter);
register.registerMetric(httpRequestDuration);

module.exports = {
  register,
  httpRequestCounter,
  httpRequestDuration,
  client
};
