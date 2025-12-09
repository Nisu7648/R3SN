const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  
  // Database
  database: {
    mongodb: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/r3sn',
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      }
    },
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT, 10) || 6379,
      password: process.env.REDIS_PASSWORD || '',
      db: parseInt(process.env.REDIS_DB, 10) || 0,
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      enableOfflineQueue: true,
    }
  },

  // Security
  security: {
    jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    jwtExpiration: process.env.JWT_EXPIRATION || '24h',
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS, 10) || 10,
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
    corsOrigin: process.env.CORS_ORIGIN || '*',
    encryptionKey: process.env.ENCRYPTION_KEY || 'your-32-character-encryption-key',
  },

  // Scalability
  scalability: {
    minWorkers: parseInt(process.env.MIN_WORKERS, 10) || 2,
    maxWorkers: parseInt(process.env.MAX_WORKERS, 10) || 10,
    workerScaleThreshold: parseFloat(process.env.WORKER_SCALE_THRESHOLD) || 0.8,
    loadBalancingAlgorithm: process.env.LOAD_BALANCING_ALGORITHM || 'round-robin',
    enableClustering: process.env.ENABLE_CLUSTERING === 'true',
    enableCompression: process.env.ENABLE_COMPRESSION !== 'false',
  },

  // Workflow Engine
  workflow: {
    maxConcurrentExecutions: parseInt(process.env.MAX_CONCURRENT_EXECUTIONS, 10) || 100,
    executionTimeout: parseInt(process.env.EXECUTION_TIMEOUT, 10) || 300000, // 5 minutes
    retryAttempts: parseInt(process.env.RETRY_ATTEMPTS, 10) || 3,
    retryDelay: parseInt(process.env.RETRY_DELAY, 10) || 1000,
    enableParallelExecution: process.env.ENABLE_PARALLEL_EXECUTION !== 'false',
  },

  // Plugin System
  plugins: {
    directory: process.env.PLUGINS_DIRECTORY || path.join(__dirname, '../../plugins'),
    enableHotReload: process.env.ENABLE_PLUGIN_HOT_RELOAD !== 'false',
    maxPluginExecutionTime: parseInt(process.env.MAX_PLUGIN_EXECUTION_TIME, 10) || 30000,
    enablePluginSandbox: process.env.ENABLE_PLUGIN_SANDBOX !== 'false',
  },

  // ML/AI Engine
  ml: {
    enableMLInsights: process.env.ENABLE_ML_INSIGHTS !== 'false',
    enablePredictions: process.env.ENABLE_PREDICTIONS !== 'false',
    enableSelfImprovement: process.env.ENABLE_SELF_IMPROVEMENT !== 'false',
    enableBehaviorTracking: process.env.ENABLE_BEHAVIOR_TRACKING !== 'false',
    mlAnalyticsInterval: parseInt(process.env.ML_ANALYTICS_INTERVAL, 10) || 3600000, // 1 hour
    predictionConfidenceThreshold: parseFloat(process.env.PREDICTION_CONFIDENCE_THRESHOLD) || 0.7,
  },

  // Self-Evolving Engine
  selfEvolving: {
    enabled: process.env.ENABLE_SELF_EVOLVING !== 'false',
    evolutionCycleInterval: parseInt(process.env.EVOLUTION_CYCLE_INTERVAL, 10) || 3600000, // 1 hour
    autoDeployImprovements: process.env.AUTO_DEPLOY_IMPROVEMENTS !== 'false',
    enableAutoTesting: process.env.ENABLE_AUTO_TESTING !== 'false',
    enableRollback: process.env.ENABLE_ROLLBACK !== 'false',
    minConfidenceForDeployment: parseFloat(process.env.MIN_CONFIDENCE_FOR_DEPLOYMENT) || 0.85,
  },

  // Self-Debugging Engine
  selfDebugging: {
    enabled: process.env.ENABLE_SELF_DEBUGGING !== 'false',
    autoFixEnabled: process.env.AUTO_FIX_ENABLED !== 'false',
    enableMemoryLeakDetection: process.env.ENABLE_MEMORY_LEAK_DETECTION !== 'false',
    healthCheckInterval: parseInt(process.env.HEALTH_CHECK_INTERVAL, 10) || 60000, // 1 minute
    maxAutoFixAttempts: parseInt(process.env.MAX_AUTO_FIX_ATTEMPTS, 10) || 3,
  },

  // Integrations
  integrations: {
    enableAllIntegrations: process.env.ENABLE_ALL_INTEGRATIONS !== 'false',
    integrationTimeout: parseInt(process.env.INTEGRATION_TIMEOUT, 10) || 30000,
    maxRetries: parseInt(process.env.INTEGRATION_MAX_RETRIES, 10) || 3,
    cacheIntegrationResponses: process.env.CACHE_INTEGRATION_RESPONSES !== 'false',
    cacheTTL: parseInt(process.env.INTEGRATION_CACHE_TTL, 10) || 300, // 5 minutes
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    enableFileLogging: process.env.ENABLE_FILE_LOGGING !== 'false',
    logDirectory: process.env.LOG_DIRECTORY || path.join(__dirname, '../../logs'),
    maxLogFiles: parseInt(process.env.MAX_LOG_FILES, 10) || 14,
    maxLogFileSize: process.env.MAX_LOG_FILE_SIZE || '20m',
    enableConsoleLogging: process.env.ENABLE_CONSOLE_LOGGING !== 'false',
  },

  // Monitoring
  monitoring: {
    enableMetrics: process.env.ENABLE_METRICS !== 'false',
    metricsPort: parseInt(process.env.METRICS_PORT, 10) || 9090,
    enableHealthCheck: process.env.ENABLE_HEALTH_CHECK !== 'false',
    healthCheckPath: process.env.HEALTH_CHECK_PATH || '/health',
    enableAPM: process.env.ENABLE_APM === 'true',
    apmServiceName: process.env.APM_SERVICE_NAME || 'r3sn-platform',
  },

  // External Services
  external: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY || '',
      model: process.env.OPENAI_MODEL || 'gpt-4',
      maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS, 10) || 2000,
    },
    smtp: {
      host: process.env.SMTP_HOST || '',
      port: parseInt(process.env.SMTP_PORT, 10) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      user: process.env.SMTP_USER || '',
      password: process.env.SMTP_PASSWORD || '',
    },
    webhook: {
      enabled: process.env.ENABLE_WEBHOOKS !== 'false',
      maxRetries: parseInt(process.env.WEBHOOK_MAX_RETRIES, 10) || 3,
      timeout: parseInt(process.env.WEBHOOK_TIMEOUT, 10) || 10000,
    }
  },

  // Android
  android: {
    enableAccessibilityService: process.env.ENABLE_ACCESSIBILITY_SERVICE !== 'false',
    enableBackgroundExecution: process.env.ENABLE_BACKGROUND_EXECUTION !== 'false',
    maxConcurrentAutomations: parseInt(process.env.MAX_CONCURRENT_AUTOMATIONS, 10) || 5,
  },

  // Performance
  performance: {
    enableCaching: process.env.ENABLE_CACHING !== 'false',
    cacheProvider: process.env.CACHE_PROVIDER || 'redis',
    enableQueryOptimization: process.env.ENABLE_QUERY_OPTIMIZATION !== 'false',
    enableConnectionPooling: process.env.ENABLE_CONNECTION_POOLING !== 'false',
    maxConnectionPoolSize: parseInt(process.env.MAX_CONNECTION_POOL_SIZE, 10) || 10,
  },

  // Development
  development: {
    enableDebugMode: process.env.ENABLE_DEBUG_MODE === 'true',
    enableVerboseLogging: process.env.ENABLE_VERBOSE_LOGGING === 'true',
    enableMockData: process.env.ENABLE_MOCK_DATA === 'true',
    enableSwagger: process.env.ENABLE_SWAGGER !== 'false',
  }
};

// Validation
const validateConfig = () => {
  const errors = [];

  if (config.env === 'production') {
    if (config.security.jwtSecret === 'your-super-secret-jwt-key-change-in-production') {
      errors.push('JWT_SECRET must be set in production');
    }
    if (config.security.encryptionKey === 'your-32-character-encryption-key') {
      errors.push('ENCRYPTION_KEY must be set in production');
    }
    if (!config.database.mongodb.uri.includes('mongodb://') && !config.database.mongodb.uri.includes('mongodb+srv://')) {
      errors.push('Invalid MONGODB_URI format');
    }
  }

  if (errors.length > 0) {
    console.error('Configuration validation errors:');
    errors.forEach(error => console.error(`  - ${error}`));
    if (config.env === 'production') {
      process.exit(1);
    }
  }
};

validateConfig();

module.exports = config;
