/**
 * Centralized Configuration Management
 * All environment variables and configuration in one place
 */

require('dotenv').config();

const config = {
  // Environment
  env: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',

  // Server
  server: {
    port: parseInt(process.env.PORT) || 3000,
    host: process.env.HOST || '0.0.0.0',
    corsOrigin: process.env.CORS_ORIGIN || '*',
    trustProxy: process.env.TRUST_PROXY === 'true',
  },

  // Database
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/r3sn',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: parseInt(process.env.DB_POOL_SIZE) || 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    },
  },

  // Redis
  redis: {
    enabled: !!process.env.REDIS_URL,
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    ttl: parseInt(process.env.REDIS_TTL) || 3600, // 1 hour default
  },

  // Authentication
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    jwtExpiry: process.env.JWT_EXPIRY || '7d',
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 10,
    apiKeyLength: parseInt(process.env.API_KEY_LENGTH) || 32,
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
    message: 'Too many requests, please try again later',
  },

  // OpenAI
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-4',
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 2000,
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7,
  },

  // File Upload
  upload: {
    maxSize: parseInt(process.env.MAX_UPLOAD_SIZE) || 10 * 1024 * 1024, // 10MB
    allowedTypes: (process.env.ALLOWED_FILE_TYPES || 'image/*,application/pdf').split(','),
    destination: process.env.UPLOAD_DESTINATION || './uploads',
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || './logs/combined.log',
    errorFile: process.env.LOG_ERROR_FILE || './logs/error.log',
    maxSize: process.env.LOG_MAX_SIZE || '20m',
    maxFiles: process.env.LOG_MAX_FILES || '14d',
  },

  // Email (if using nodemailer)
  email: {
    enabled: !!process.env.SMTP_HOST,
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    from: process.env.EMAIL_FROM || 'noreply@r3sn.io',
  },

  // Integrations
  integrations: {
    timeout: parseInt(process.env.INTEGRATION_TIMEOUT) || 30000, // 30 seconds
    retries: parseInt(process.env.INTEGRATION_RETRIES) || 3,
    retryDelay: parseInt(process.env.INTEGRATION_RETRY_DELAY) || 1000,
  },

  // Agents
  agents: {
    maxConcurrent: parseInt(process.env.MAX_CONCURRENT_AGENTS) || 10,
    executionTimeout: parseInt(process.env.AGENT_EXECUTION_TIMEOUT) || 300000, // 5 minutes
    maxMemory: parseInt(process.env.AGENT_MAX_MEMORY) || 512, // MB
  },

  // Workflows
  workflows: {
    maxSteps: parseInt(process.env.MAX_WORKFLOW_STEPS) || 50,
    executionTimeout: parseInt(process.env.WORKFLOW_EXECUTION_TIMEOUT) || 600000, // 10 minutes
    maxConcurrent: parseInt(process.env.MAX_CONCURRENT_WORKFLOWS) || 20,
  },

  // Plugins
  plugins: {
    directory: process.env.PLUGINS_DIRECTORY || './plugins',
    autoLoad: process.env.PLUGINS_AUTO_LOAD !== 'false',
    hotReload: process.env.PLUGINS_HOT_RELOAD !== 'false',
  },

  // Security
  security: {
    encryptionKey: process.env.ENCRYPTION_KEY || 'change-this-encryption-key-in-production',
    encryptionAlgorithm: process.env.ENCRYPTION_ALGORITHM || 'aes-256-gcm',
    sessionSecret: process.env.SESSION_SECRET || 'change-this-session-secret',
    csrfEnabled: process.env.CSRF_ENABLED === 'true',
  },

  // Monitoring
  monitoring: {
    enabled: process.env.MONITORING_ENABLED === 'true',
    metricsInterval: parseInt(process.env.METRICS_INTERVAL) || 60000, // 1 minute
    healthCheckInterval: parseInt(process.env.HEALTH_CHECK_INTERVAL) || 30000, // 30 seconds
  },

  // Scaling
  scaling: {
    enabled: process.env.AUTO_SCALING_ENABLED === 'true',
    minInstances: parseInt(process.env.MIN_INSTANCES) || 1,
    maxInstances: parseInt(process.env.MAX_INSTANCES) || 10,
    cpuThreshold: parseInt(process.env.CPU_THRESHOLD) || 80,
    memoryThreshold: parseInt(process.env.MEMORY_THRESHOLD) || 80,
  },

  // WebSocket
  websocket: {
    enabled: process.env.WEBSOCKET_ENABLED !== 'false',
    path: process.env.WEBSOCKET_PATH || '/socket.io',
    pingTimeout: parseInt(process.env.WS_PING_TIMEOUT) || 60000,
    pingInterval: parseInt(process.env.WS_PING_INTERVAL) || 25000,
  },

  // Features Flags
  features: {
    selfEvolving: process.env.FEATURE_SELF_EVOLVING !== 'false',
    selfDebugging: process.env.FEATURE_SELF_DEBUGGING !== 'false',
    autoScaling: process.env.FEATURE_AUTO_SCALING === 'true',
    analytics: process.env.FEATURE_ANALYTICS !== 'false',
    realtime: process.env.FEATURE_REALTIME !== 'false',
  },

  // External Services
  services: {
    // Add any external service configurations here
    stripe: {
      enabled: !!process.env.STRIPE_SECRET_KEY,
      secretKey: process.env.STRIPE_SECRET_KEY,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    },
    aws: {
      enabled: !!process.env.AWS_ACCESS_KEY_ID,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'us-east-1',
    },
    gcp: {
      enabled: !!process.env.GCP_PROJECT_ID,
      projectId: process.env.GCP_PROJECT_ID,
      keyFile: process.env.GCP_KEY_FILE,
    },
  },
};

// Validation
const validateConfig = () => {
  const errors = [];

  // Required fields
  if (!config.auth.jwtSecret || config.auth.jwtSecret === 'your-secret-key-change-in-production') {
    errors.push('JWT_SECRET must be set to a secure value in production');
  }

  if (!config.database.uri) {
    errors.push('MONGODB_URI is required');
  }

  if (config.isProduction) {
    if (!config.openai.apiKey) {
      errors.push('OPENAI_API_KEY is required in production');
    }

    if (config.security.encryptionKey === 'change-this-encryption-key-in-production') {
      errors.push('ENCRYPTION_KEY must be changed in production');
    }
  }

  if (errors.length > 0) {
    console.error('Configuration errors:');
    errors.forEach(error => console.error(`  - ${error}`));
    
    if (config.isProduction) {
      throw new Error('Invalid configuration for production environment');
    } else {
      console.warn('⚠️  Configuration warnings detected. Please fix before deploying to production.');
    }
  }
};

// Run validation
validateConfig();

// Export configuration
module.exports = config;
