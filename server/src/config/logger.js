const winston = require('winston');

const environment = process.env.NODE_ENV || 'development';

/**
 * Winston logger configuration
 * Different verbosity levels for development and production
 */
const logger = winston.createLogger({
  level: environment === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'ekai-backend' },
  transports: [
    // File transport for errors
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),

    // File transport for all logs
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Add console transport in development
if (environment !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp, stack }) => {
          const stackTrace = stack ? `\n${stack}` : '';
          return `${timestamp} [${level}]: ${message}${stackTrace}`;
        })
      ),
    })
  );
}

module.exports = logger;
