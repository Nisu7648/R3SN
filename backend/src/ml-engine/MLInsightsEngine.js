/**
 * ML Insights Engine - Analyze workflows and provide AI-powered insights
 */

const PredictionEngine = require('./PredictionEngine');
const BehaviorTracker = require('./BehaviorTracker');
const SelfImprovementEngine = require('./SelfImprovementEngine');

class MLInsightsEngine {
  constructor() {
    this.predictionEngine = new PredictionEngine();
    this.behaviorTracker = new BehaviorTracker();
    this.selfImprovementEngine = new SelfImprovementEngine();
    this.insights = [];
    this.dailyAnalytics = new Map();
  }

  /**
   * Initialize ML engine
   */
  async initialize() {
    console.log('🤖 Initializing ML Insights Engine...');
    
    await this.predictionEngine.initialize();
    await this.behaviorTracker.initialize();
    await this.selfImprovementEngine.initialize();
    
    // Start daily analysis
    this.startDailyAnalysis();
    
    console.log('✅ ML Insights Engine initialized');
  }

  /**
   * Analyze workflow execution
   */
  async analyzeExecution(execution) {
    const insights = {
      executionId: execution.executionId,
      timestamp: new Date().toISOString(),
      performance: this.analyzePerformance(execution),
      patterns: await this.detectPatterns(execution),
      anomalies: await this.detectAnomalies(execution),
      optimization: await this.suggestOptimizations(execution),
      predictions: await this.predictionEngine.predict(execution)
    };

    this.insights.push(insights);
    
    // Track behavior
    await this.behaviorTracker.track(execution);

    return insights;
  }

  /**
   * Analyze performance metrics
   */
  analyzePerformance(execution) {
    const nodeExecutions = execution.nodeExecutions || [];
    
    const totalDuration = execution.duration;
    const avgNodeDuration = nodeExecutions.length > 0
      ? nodeExecutions.reduce((sum, n) => sum + n.duration, 0) / nodeExecutions.length
      : 0;

    const slowestNode = nodeExecutions.reduce((slowest, node) =>
      node.duration > (slowest?.duration || 0) ? node : slowest,
      null
    );

    const failedNodes = nodeExecutions.filter(n => n.status === 'failed');

    return {
      totalDuration,
      avgNodeDuration,
      slowestNode: slowestNode ? {
        name: slowestNode.nodeName,
        duration: slowestNode.duration
      } : null,
      failureRate: nodeExecutions.length > 0
        ? failedNodes.length / nodeExecutions.length
        : 0,
      efficiency: this.calculateEfficiency(execution)
    };
  }

  /**
   * Calculate workflow efficiency score
   */
  calculateEfficiency(execution) {
    const factors = {
      duration: execution.duration < 5000 ? 1.0 : 0.5,
      success: execution.status === 'completed' ? 1.0 : 0.0,
      nodeCount: execution.nodeExecutions?.length || 0,
      errors: execution.errors?.length || 0
    };

    const score = (
      factors.duration * 0.3 +
      factors.success * 0.4 +
      (factors.nodeCount > 0 ? 0.2 : 0) -
      (factors.errors * 0.1)
    );

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Detect execution patterns
   */
  async detectPatterns(execution) {
    const patterns = [];

    // Detect sequential vs parallel execution
    const hasParallelNodes = this.detectParallelExecution(execution);
    if (hasParallelNodes) {
      patterns.push({
        type: 'parallel_execution',
        description: 'Workflow uses parallel node execution',
        impact: 'positive'
      });
    }

    // Detect repeated operations
    const repeatedOps = this.detectRepeatedOperations(execution);
    if (repeatedOps.length > 0) {
      patterns.push({
        type: 'repeated_operations',
        description: 'Detected repeated operations that could be optimized',
        operations: repeatedOps,
        impact: 'negative'
      });
    }

    // Detect data transformation chains
    const transformChains = this.detectTransformationChains(execution);
    if (transformChains.length > 2) {
      patterns.push({
        type: 'transformation_chain',
        description: 'Long data transformation chain detected',
        length: transformChains.length,
        impact: 'neutral'
      });
    }

    return patterns;
  }

  /**
   * Detect anomalies in execution
   */
  async detectAnomalies(execution) {
    const anomalies = [];

    // Check for unusually long execution time
    const avgDuration = await this.getAverageDuration(execution.workflowId);
    if (execution.duration > avgDuration * 2) {
      anomalies.push({
        type: 'slow_execution',
        severity: 'warning',
        message: `Execution took ${execution.duration}ms, ${Math.round((execution.duration / avgDuration - 1) * 100)}% longer than average`,
        suggestion: 'Check for network issues or resource constraints'
      });
    }

    // Check for high error rate
    const errorRate = (execution.errors?.length || 0) / (execution.nodeExecutions?.length || 1);
    if (errorRate > 0.2) {
      anomalies.push({
        type: 'high_error_rate',
        severity: 'error',
        message: `${Math.round(errorRate * 100)}% of nodes failed`,
        suggestion: 'Review node configurations and input data'
      });
    }

    // Check for memory issues
    if (execution.nodeExecutions) {
      const largeOutputs = execution.nodeExecutions.filter(n =>
        JSON.stringify(n.output || {}).length > 1000000
      );
      
      if (largeOutputs.length > 0) {
        anomalies.push({
          type: 'large_data_output',
          severity: 'warning',
          message: `${largeOutputs.length} nodes produced large outputs`,
          suggestion: 'Consider streaming or pagination for large datasets'
        });
      }
    }

    return anomalies;
  }

  /**
   * Suggest optimizations
   */
  async suggestOptimizations(execution) {
    const suggestions = [];

    // Suggest parallelization
    const parallelizable = this.findParallelizableNodes(execution);
    if (parallelizable.length > 0) {
      suggestions.push({
        type: 'parallelization',
        priority: 'high',
        description: 'Some nodes can be executed in parallel',
        nodes: parallelizable,
        estimatedImprovement: '30-50% faster execution'
      });
    }

    // Suggest caching
    const cacheable = this.findCacheableNodes(execution);
    if (cacheable.length > 0) {
      suggestions.push({
        type: 'caching',
        priority: 'medium',
        description: 'Cache results of expensive operations',
        nodes: cacheable,
        estimatedImprovement: '20-40% faster on repeated executions'
      });
    }

    // Suggest node consolidation
    const consolidatable = this.findConsolidatableNodes(execution);
    if (consolidatable.length > 0) {
      suggestions.push({
        type: 'consolidation',
        priority: 'low',
        description: 'Combine similar operations into single nodes',
        nodes: consolidatable,
        estimatedImprovement: '10-20% faster execution'
      });
    }

    return suggestions;
  }

  /**
   * Get daily analytics
   */
  async getDailyAnalytics(date = new Date()) {
    const dateKey = date.toISOString().split('T')[0];
    return this.dailyAnalytics.get(dateKey) || null;
  }

  /**
   * Start daily analysis
   */
  startDailyAnalysis() {
    // Run analysis every day at midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const timeUntilMidnight = tomorrow - now;

    setTimeout(() => {
      this.runDailyAnalysis();
      
      // Schedule for every 24 hours
      setInterval(() => {
        this.runDailyAnalysis();
      }, 24 * 60 * 60 * 1000);
    }, timeUntilMidnight);
  }

  /**
   * Run daily analysis
   */
  async runDailyAnalysis() {
    console.log('📊 Running daily ML analysis...');

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateKey = yesterday.toISOString().split('T')[0];

    const analytics = {
      date: dateKey,
      totalExecutions: this.insights.length,
      avgEfficiency: this.calculateAverageEfficiency(),
      topPatterns: this.getTopPatterns(),
      commonAnomalies: this.getCommonAnomalies(),
      improvements: await this.selfImprovementEngine.generateImprovements(),
      predictions: await this.predictionEngine.generateDailyPredictions()
    };

    this.dailyAnalytics.set(dateKey, analytics);

    console.log('✅ Daily analysis complete');

    return analytics;
  }

  /**
   * Helper methods
   */
  detectParallelExecution(execution) {
    // Implementation
    return false;
  }

  detectRepeatedOperations(execution) {
    // Implementation
    return [];
  }

  detectTransformationChains(execution) {
    // Implementation
    return [];
  }

  async getAverageDuration(workflowId) {
    // Implementation
    return 5000;
  }

  findParallelizableNodes(execution) {
    // Implementation
    return [];
  }

  findCacheableNodes(execution) {
    // Implementation
    return [];
  }

  findConsolidatableNodes(execution) {
    // Implementation
    return [];
  }

  calculateAverageEfficiency() {
    if (this.insights.length === 0) return 0;
    
    const sum = this.insights.reduce((acc, i) =>
      acc + (i.performance?.efficiency || 0), 0
    );
    
    return sum / this.insights.length;
  }

  getTopPatterns() {
    // Implementation
    return [];
  }

  getCommonAnomalies() {
    // Implementation
    return [];
  }
}

module.exports = MLInsightsEngine;
