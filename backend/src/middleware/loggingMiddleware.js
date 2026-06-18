const winston = require('winston');

// Define Winston Logger configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'globalmedx-backend' },
  transports: [
    new winston.transports.Console()
  ]
});

// Express request/response logger middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Clean up paths for /metrics requests to avoid spamming the log files
  const isMetrics = req.originalUrl === '/metrics';
  
  res.on('finish', () => {
    if (isMetrics && res.statusCode === 200) return; // Skip logging metrics endpoint if successful
    
    const duration = Date.now() - start;
    logger.info('HTTP Request Processed', {
      method: req.method,
      url: req.originalUrl || req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.get('User-Agent')
    });
  });
  
  next();
};

module.exports = { logger, requestLogger };
