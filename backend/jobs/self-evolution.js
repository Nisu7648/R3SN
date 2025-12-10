const config = require('../config/config');
const logger = require('../utils/logger');
const cache = require('../utils/cache');
const mongoose = require('mongoose');

// Import self-improvement engines
const SelfEvolvingEngine = require('../core/SelfEvolvingEngine');
const SelfDebuggingEngine = require('../core/SelfDebuggingEngine');
const SelfImprovementEngine = require('../src/ml-engine/SelfImprovementEngine');

// Connect to databases
async function connectDatabases() {
  try {
    await mongoose.connect(config.database.mongodb.uri, config.database.mongodb.options);
    logger.info('Self-Evolution Job: MongoDB connected');

    await cache.connect();
    logger.info('Self-Evolution Job: Redis connected');
  } catch (error) {
    logger.error('Self-Evolution Job: Database connection failed:', error);
    process.exit(1);
  }
}

// Run self-evolution cycle
async function runEvolutionCycle() {
  try {
    logger.info('Starting self-evolution cycle');

    const selfEvolving = new SelfEvolvingEngine();
    const selfDebugging = new SelfDebuggingEngine();
    const selfImprovement = new SelfImprovementEngine();

    // Learn from executions
    logger.info('Learning from executions');
    const learnings = await selfEvolving.learnFromExecutions();
    logger.info('Learnings collected', { count: learnings.length });

    // Identify optimization opportunities
    logger.info('Identifying optimization opportunities');
    const optimizations = await selfEvolving.identifyOptimizations();
    logger.info('Optimizations identified', { count: optimizations.length });

    // Generate improvements
    logger.info('Generating improvements');
    const improvements = await selfEvolving.generateImprovements(optimizations);
    logger.info('Improvements generated', { count: improvements.length });

    // Test improvements
    logger.info('Testing improvements');
    const testedImprovements = [];
    for (const improvement of improvements) {
      const testResult = await selfEvolving.testImprovement(improvement);
      if (testResult.success) {
        testedImprovements.push(improvement);
      }
    }
    logger.info('Improvements tested', { passed: testedImprovements.length, total: improvements.length });

    // Deploy improvements (if auto-deploy enabled)
    if (config.selfEvolving.autoDeployImprovements && testedImprovements.length > 0) {
      logger.info('Auto-deploying improvements');
      for (const improvement of testedImprovements) {
        try {
          await selfEvolving.deployImprovement(improvement);
          logger.info('Improvement deployed', { id: improvement.id });
        } catch (error) {
          logger.error('Failed to deploy improvement', { id: improvement.id, error: error.message });
        }
      }
    }

    // Run self-debugging
    logger.info('Running self-debugging');
    const debugResults = await selfDebugging.analyzeSystem();
    
    if (debugResults.issues.length > 0) {
      logger.warn('Issues detected', { count: debugResults.issues.length });
      
      // Auto-fix if enabled
      if (config.selfDebugging.autoFixEnabled) {
        logger.info('Auto-fixing issues');
        for (const issue of debugResults.issues) {
          try {
            const fix = await selfDebugging.generateFix(issue);
            const testResult = await selfDebugging.testFix(fix);
            
            if (testResult.success) {
              await selfDebugging.deployFix(fix);
              logger.info('Issue fixed', { issue: issue.id });
            }
          } catch (error) {
            logger.error('Failed to fix issue', { issue: issue.id, error: error.message });
          }
        }
      }
    }

    // Generate self-improvement suggestions
    logger.info('Generating self-improvement suggestions');
    const suggestions = await selfImprovement.generateSuggestions();
    await cache.set('evolution:suggestions:latest', suggestions, 86400);
    logger.info('Self-improvement suggestions generated', { count: suggestions.length });

    // Store evolution cycle results
    const cycleResults = {
      timestamp: new Date().toISOString(),
      learnings: learnings.length,
      optimizations: optimizations.length,
      improvements: improvements.length,
      deployed: testedImprovements.length,
      issues: debugResults.issues.length,
      suggestions: suggestions.length,
    };

    await cache.set('evolution:cycle:latest', cycleResults, 86400);
    logger.info('Self-evolution cycle completed successfully', cycleResults);

    return cycleResults;
  } catch (error) {
    logger.error('Self-evolution cycle failed:', error);
    throw error;
  }
}

// Main execution
async function main() {
  try {
    await connectDatabases();
    
    const result = await runEvolutionCycle();
    
    logger.info('Self-evolution job result:', result);
    
    // Cleanup
    await cache.disconnect();
    await mongoose.connection.close();
    
    logger.info('Self-evolution job: Shutdown complete');
    process.exit(0);
  } catch (error) {
    logger.error('Self-evolution job: Fatal error:', error);
    process.exit(1);
  }
}

main();
