const config = require('./config/config');
const logger = require('./utils/logger');
const cache = require('./utils/cache');
const mongoose = require('mongoose');
const Bull = require('bull');

// Import engines
const UniversalExecutor = require('./core/UniversalExecutor');
const AgentEngine = require('./core/AgentEngine');
const IntegrationHub = require('./core/IntegrationHub');

// Connect to databases
async function connectDatabases() {
  try {
    // MongoDB
    await mongoose.connect(config.database.mongodb.uri, config.database.mongodb.options);
    logger.info('Worker: MongoDB connected');

    // Redis
    await cache.connect();
    logger.info('Worker: Redis connected');
  } catch (error) {
    logger.error('Worker: Database connection failed:', error);
    process.exit(1);
  }
}

// Initialize engines
const executor = new UniversalExecutor();
const agentEngine = new AgentEngine();
const integrationHub = new IntegrationHub();

// Create Bull queues
const workflowQueue = new Bull('workflows', {
  redis: config.database.redis,
});

const integrationQueue = new Bull('integrations', {
  redis: config.database.redis,
});

const agentQueue = new Bull('agents', {
  redis: config.database.redis,
});

// Workflow processing
workflowQueue.process(async (job) => {
  const { workflowId, input, context } = job.data;
  
  logger.workflow('Processing workflow job', { workflowId, jobId: job.id });

  try {
    const result = await executor.execute({
      workflow: workflowId,
      input,
      context,
    });

    logger.workflow('Workflow job completed', { workflowId, jobId: job.id });
    return result;
  } catch (error) {
    logger.error('Workflow job failed', { workflowId, jobId: job.id, error: error.message });
    throw error;
  }
});

// Integration processing
integrationQueue.process(async (job) => {
  const { integration, action, params } = job.data;
  
  logger.integration('Processing integration job', { integration, action, jobId: job.id });

  try {
    const result = await integrationHub.execute(integration, action, params);

    logger.integration('Integration job completed', { integration, action, jobId: job.id });
    return result;
  } catch (error) {
    logger.error('Integration job failed', { integration, action, jobId: job.id, error: error.message });
    throw error;
  }
});

// Agent processing
agentQueue.process(async (job) => {
  const { agentId, task, context } = job.data;
  
  logger.info('Processing agent job', { agentId, jobId: job.id });

  try {
    const result = await agentEngine.executeAgent(agentId, task, context);

    logger.info('Agent job completed', { agentId, jobId: job.id });
    return result;
  } catch (error) {
    logger.error('Agent job failed', { agentId, jobId: job.id, error: error.message });
    throw error;
  }
});

// Queue event handlers
workflowQueue.on('completed', (job, result) => {
  logger.workflow('Workflow job completed', { jobId: job.id });
});

workflowQueue.on('failed', (job, err) => {
  logger.error('Workflow job failed', { jobId: job.id, error: err.message });
});

integrationQueue.on('completed', (job, result) => {
  logger.integration('Integration job completed', { jobId: job.id });
});

integrationQueue.on('failed', (job, err) => {
  logger.error('Integration job failed', { jobId: job.id, error: err.message });
});

agentQueue.on('completed', (job, result) => {
  logger.info('Agent job completed', { jobId: job.id });
});

agentQueue.on('failed', (job, err) => {
  logger.error('Agent job failed', { jobId: job.id, error: err.message });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('Worker: SIGTERM received, shutting down gracefully');
  
  await workflowQueue.close();
  await integrationQueue.close();
  await agentQueue.close();
  
  await cache.disconnect();
  await mongoose.connection.close();
  
  logger.info('Worker: Shutdown complete');
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('Worker: SIGINT received, shutting down gracefully');
  
  await workflowQueue.close();
  await integrationQueue.close();
  await agentQueue.close();
  
  await cache.disconnect();
  await mongoose.connection.close();
  
  logger.info('Worker: Shutdown complete');
  process.exit(0);
});

// Start worker
async function start() {
  try {
    await connectDatabases();
    
    logger.info('Worker: Started successfully');
    logger.info('Worker: Processing workflows, integrations, and agents');
  } catch (error) {
    logger.error('Worker: Failed to start:', error);
    process.exit(1);
  }
}

start();
