const config = require('../config/config');
const logger = require('../utils/logger');
const cache = require('../utils/cache');
const mongoose = require('../mongoose');

// Import ML engines
const MLInsightsEngine = require('../src/ml-engine/MLInsightsEngine');
const PredictionEngine = require('../src/ml-engine/PredictionEngine');
const BehaviorTracker = require('../src/ml-engine/BehaviorTracker');

// Connect to databases
async function connectDatabases() {
  try {
    await mongoose.connect(config.database.mongodb.uri, config.database.mongodb.options);
    logger.info('ML Analytics Job: MongoDB connected');

    await cache.connect();
    logger.info('ML Analytics Job: Redis connected');
  } catch (error) {
    logger.error('ML Analytics Job: Database connection failed:', error);
    process.exit(1);
  }
}

// Run ML analytics
async function runAnalytics() {
  try {
    logger.ml('Starting ML analytics job');

    const mlInsights = new MLInsightsEngine();
    const predictions = new PredictionEngine();
    const behaviorTracker = new BehaviorTracker();

    // Generate daily analytics
    logger.ml('Generating daily analytics');
    const dailyAnalytics = await mlInsights.generateDailyAnalytics();
    
    // Store analytics in cache
    await cache.set('ml:analytics:daily', dailyAnalytics, 86400); // 24 hours
    logger.ml('Daily analytics stored in cache');

    // Detect patterns
    logger.ml('Detecting patterns');
    const patterns = await mlInsights.detectPatterns();
    await cache.set('ml:patterns:latest', patterns, 86400);
    logger.ml('Patterns detected and stored');

    // Detect anomalies
    logger.ml('Detecting anomalies');
    const anomalies = await mlInsights.detectAnomalies();
    if (anomalies.length > 0) {
      logger.warn('Anomalies detected', { count: anomalies.length });
      await cache.set('ml:anomalies:latest', anomalies, 86400);
    }

    // Generate predictions
    logger.ml('Generating predictions');
    const workflowPredictions = await predictions.predictWorkflowDuration();
    await cache.set('ml:predictions:workflows', workflowPredictions, 3600); // 1 hour
    logger.ml('Workflow predictions generated');

    // Analyze behavior
    logger.ml('Analyzing user behavior');
    const behaviorAnalysis = await behaviorTracker.analyzePatterns();
    await cache.set('ml:behavior:analysis', behaviorAnalysis, 86400);
    logger.ml('Behavior analysis complete');

    // Generate recommendations
    logger.ml('Generating recommendations');
    const recommendations = await behaviorTracker.generateRecommendations();
    await cache.set('ml:recommendations:latest', recommendations, 86400);
    logger.ml('Recommendations generated');

    logger.ml('ML analytics job completed successfully');

    return {
      success: true,
      analytics: dailyAnalytics,
      patterns: patterns.length,
      anomalies: anomalies.length,
      predictions: workflowPredictions.length,
      recommendations: recommendations.length,
    };
  } catch (error) {
    logger.error('ML analytics job failed:', error);
    throw error;
  }
}

// Main execution
async function main() {
  try {
    await connectDatabases();
    
    const result = await runAnalytics();
    
    logger.ml('ML analytics job result:', result);
    
    // Cleanup
    await cache.disconnect();
    await mongoose.connection.close();
    
    logger.info('ML analytics job: Shutdown complete');
    process.exit(0);
  } catch (error) {
    logger.error('ML analytics job: Fatal error:', error);
    process.exit(1);
  }
}

main();
