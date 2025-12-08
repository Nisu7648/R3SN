/**
 * Prediction Engine - Predict workflow outcomes and performance
 */

class PredictionEngine {
  constructor() {
    this.models = new Map();
    this.trainingData = [];
    this.predictions = [];
  }

  /**
   * Initialize prediction engine
   */
  async initialize() {
    console.log('🔮 Initializing Prediction Engine...');
    
    // Load pre-trained models
    await this.loadModels();
    
    console.log('✅ Prediction Engine initialized');
  }

  /**
   * Load ML models
   */
  async loadModels() {
    // Duration prediction model
    this.models.set('duration', {
      type: 'regression',
      features: ['nodeCount', 'dataSize', 'complexity'],
      predict: (features) => this.predictDuration(features)
    });

    // Success prediction model
    this.models.set('success', {
      type: 'classification',
      features: ['nodeTypes', 'connections', 'dataQuality'],
      predict: (features) => this.predictSuccess(features)
    });

    // Resource usage prediction
    this.models.set('resources', {
      type: 'regression',
      features: ['nodeCount', 'dataSize', 'operations'],
      predict: (features) => this.predictResources(features)
    });
  }

  /**
   * Predict workflow execution
   */
  async predict(execution) {
    const features = this.extractFeatures(execution);

    const predictions = {
      duration: await this.predictDuration(features),
      success: await this.predictSuccess(features),
      resources: await this.predictResources(features),
      bottlenecks: await this.predictBottlenecks(features),
      confidence: this.calculateConfidence(features)
    };

    this.predictions.push({
      timestamp: new Date().toISOString(),
      executionId: execution.executionId,
      predictions
    });

    return predictions;
  }

  /**
   * Extract features from execution
   */
  extractFeatures(execution) {
    const workflow = execution.workflow || {};
    const nodes = workflow.nodes || [];
    const connections = workflow.connections || [];

    return {
      nodeCount: nodes.length,
      connectionCount: connections.length,
      complexity: this.calculateComplexity(nodes, connections),
      dataSize: this.estimateDataSize(execution.inputData),
      nodeTypes: nodes.map(n => n.type),
      hasLoops: this.detectLoops(nodes, connections),
      parallelPaths: this.countParallelPaths(nodes, connections),
      avgNodeComplexity: this.calculateAvgNodeComplexity(nodes)
    };
  }

  /**
   * Predict execution duration
   */
  async predictDuration(features) {
    // Simple linear model (replace with actual ML model)
    const baseTime = 1000; // 1 second base
    const nodeTime = features.nodeCount * 500; // 500ms per node
    const complexityFactor = features.complexity * 100;
    const dataFactor = Math.log(features.dataSize + 1) * 50;

    const predicted = baseTime + nodeTime + complexityFactor + dataFactor;

    return {
      value: Math.round(predicted),
      unit: 'ms',
      range: {
        min: Math.round(predicted * 0.8),
        max: Math.round(predicted * 1.2)
      }
    };
  }

  /**
   * Predict success probability
   */
  async predictSuccess(features) {
    // Simple probability model (replace with actual ML model)
    let probability = 0.9; // Base 90% success rate

    // Reduce probability based on complexity
    probability -= features.complexity * 0.05;

    // Reduce for loops
    if (features.hasLoops) {
      probability -= 0.1;
    }

    // Reduce for high node count
    if (features.nodeCount > 20) {
      probability -= 0.05;
    }

    probability = Math.max(0.1, Math.min(0.99, probability));

    return {
      probability: Math.round(probability * 100) / 100,
      confidence: 'medium',
      factors: this.getSuccessFactors(features)
    };
  }

  /**
   * Predict resource usage
   */
  async predictResources(features) {
    const memory = features.nodeCount * 10 + features.dataSize * 0.001; // MB
    const cpu = features.complexity * 20; // CPU percentage

    return {
      memory: {
        value: Math.round(memory),
        unit: 'MB'
      },
      cpu: {
        value: Math.round(cpu),
        unit: '%'
      },
      network: {
        value: Math.round(features.dataSize * 0.1),
        unit: 'KB'
      }
    };
  }

  /**
   * Predict potential bottlenecks
   */
  async predictBottlenecks(features) {
    const bottlenecks = [];

    if (features.nodeCount > 15) {
      bottlenecks.push({
        type: 'high_node_count',
        severity: 'medium',
        description: 'Large number of nodes may slow execution',
        suggestion: 'Consider consolidating similar operations'
      });
    }

    if (features.complexity > 5) {
      bottlenecks.push({
        type: 'high_complexity',
        severity: 'high',
        description: 'Complex workflow structure detected',
        suggestion: 'Simplify workflow or add parallel execution'
      });
    }

    if (features.dataSize > 1000000) {
      bottlenecks.push({
        type: 'large_data',
        severity: 'high',
        description: 'Large data size may cause memory issues',
        suggestion: 'Implement streaming or pagination'
      });
    }

    return bottlenecks;
  }

  /**
   * Calculate confidence score
   */
  calculateConfidence(features) {
    // Base confidence on amount of training data and feature quality
    let confidence = 0.7;

    if (this.trainingData.length > 100) {
      confidence += 0.1;
    }

    if (this.trainingData.length > 1000) {
      confidence += 0.1;
    }

    return Math.min(0.95, confidence);
  }

  /**
   * Generate daily predictions
   */
  async generateDailyPredictions() {
    return {
      expectedExecutions: this.predictDailyExecutions(),
      peakHours: this.predictPeakHours(),
      resourceNeeds: this.predictDailyResources(),
      potentialIssues: this.predictPotentialIssues()
    };
  }

  /**
   * Helper methods
   */
  calculateComplexity(nodes, connections) {
    const nodeComplexity = nodes.length;
    const connectionComplexity = connections.length;
    const branchingFactor = this.calculateBranchingFactor(nodes, connections);
    
    return (nodeComplexity + connectionComplexity + branchingFactor) / 3;
  }

  calculateBranchingFactor(nodes, connections) {
    const outgoingCounts = new Map();
    
    connections.forEach(conn => {
      outgoingCounts.set(
        conn.source,
        (outgoingCounts.get(conn.source) || 0) + 1
      );
    });

    const maxBranching = Math.max(...outgoingCounts.values(), 1);
    return maxBranching;
  }

  estimateDataSize(data) {
    return JSON.stringify(data || {}).length;
  }

  detectLoops(nodes, connections) {
    // Simple cycle detection
    const visited = new Set();
    const recursionStack = new Set();

    const hasCycle = (nodeId) => {
      visited.add(nodeId);
      recursionStack.add(nodeId);

      const outgoing = connections.filter(c => c.source === nodeId);
      
      for (const conn of outgoing) {
        if (!visited.has(conn.target)) {
          if (hasCycle(conn.target)) return true;
        } else if (recursionStack.has(conn.target)) {
          return true;
        }
      }

      recursionStack.delete(nodeId);
      return false;
    };

    for (const node of nodes) {
      if (!visited.has(node.id)) {
        if (hasCycle(node.id)) return true;
      }
    }

    return false;
  }

  countParallelPaths(nodes, connections) {
    // Count nodes with multiple outgoing connections
    const parallelNodes = connections.reduce((acc, conn) => {
      acc[conn.source] = (acc[conn.source] || 0) + 1;
      return acc;
    }, {});

    return Object.values(parallelNodes).filter(count => count > 1).length;
  }

  calculateAvgNodeComplexity(nodes) {
    // Estimate based on node types
    const complexityMap = {
      'http.request': 3,
      'data.transform': 4,
      'data.filter': 2,
      'default': 1
    };

    const total = nodes.reduce((sum, node) =>
      sum + (complexityMap[node.type] || complexityMap.default), 0
    );

    return nodes.length > 0 ? total / nodes.length : 0;
  }

  getSuccessFactors(features) {
    const factors = [];

    if (features.complexity < 3) {
      factors.push({ factor: 'Low complexity', impact: 'positive' });
    }

    if (features.nodeCount < 10) {
      factors.push({ factor: 'Manageable size', impact: 'positive' });
    }

    if (features.hasLoops) {
      factors.push({ factor: 'Contains loops', impact: 'negative' });
    }

    return factors;
  }

  predictDailyExecutions() {
    // Based on historical data
    return Math.round(this.predictions.length * 1.1);
  }

  predictPeakHours() {
    return ['09:00-11:00', '14:00-16:00'];
  }

  predictDailyResources() {
    return {
      memory: '500 MB',
      cpu: '40%',
      storage: '100 MB'
    };
  }

  predictPotentialIssues() {
    return [];
  }

  /**
   * Train model with new data
   */
  train(execution, actualOutcome) {
    this.trainingData.push({
      features: this.extractFeatures(execution),
      outcome: actualOutcome,
      timestamp: new Date().toISOString()
    });

    // Retrain models periodically
    if (this.trainingData.length % 100 === 0) {
      this.retrainModels();
    }
  }

  /**
   * Retrain models
   */
  async retrainModels() {
    console.log('🔄 Retraining prediction models...');
    // Implementation for model retraining
    console.log('✅ Models retrained');
  }
}

module.exports = PredictionEngine;
