const logger = require('./logger');

class MetricsCollector {
  constructor() {
    this.metrics = {
      workflows: {
        total: 0,
        successful: 0,
        failed: 0,
        avgDuration: 0,
        durations: [],
      },
      agents: {
        total: 0,
        active: 0,
        avgExecutionTime: 0,
        executionTimes: [],
      },
      integrations: {
        total: 0,
        successful: 0,
        failed: 0,
        avgResponseTime: 0,
        responseTimes: [],
      },
      plugins: {
        total: 0,
        loaded: 0,
        failed: 0,
      },
      api: {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        avgResponseTime: 0,
        responseTimes: [],
      },
      system: {
        uptime: 0,
        memoryUsage: {},
        cpuUsage: 0,
      },
    };

    this.startTime = Date.now();
    this.requestTimings = new Map();
  }

  // Workflow metrics
  recordWorkflowExecution(success, duration) {
    this.metrics.workflows.total++;
    if (success) {
      this.metrics.workflows.successful++;
    } else {
      this.metrics.workflows.failed++;
    }

    this.metrics.workflows.durations.push(duration);
    if (this.metrics.workflows.durations.length > 1000) {
      this.metrics.workflows.durations.shift();
    }

    this.metrics.workflows.avgDuration = this._calculateAverage(
      this.metrics.workflows.durations
    );

    logger.performance('Workflow execution recorded', {
      success,
      duration,
      avgDuration: this.metrics.workflows.avgDuration,
    });
  }

  // Agent metrics
  recordAgentExecution(executionTime) {
    this.metrics.agents.total++;
    this.metrics.agents.executionTimes.push(executionTime);

    if (this.metrics.agents.executionTimes.length > 1000) {
      this.metrics.agents.executionTimes.shift();
    }

    this.metrics.agents.avgExecutionTime = this._calculateAverage(
      this.metrics.agents.executionTimes
    );
  }

  setActiveAgents(count) {
    this.metrics.agents.active = count;
  }

  // Integration metrics
  recordIntegrationCall(success, responseTime) {
    this.metrics.integrations.total++;
    if (success) {
      this.metrics.integrations.successful++;
    } else {
      this.metrics.integrations.failed++;
    }

    this.metrics.integrations.responseTimes.push(responseTime);
    if (this.metrics.integrations.responseTimes.length > 1000) {
      this.metrics.integrations.responseTimes.shift();
    }

    this.metrics.integrations.avgResponseTime = this._calculateAverage(
      this.metrics.integrations.responseTimes
    );
  }

  // Plugin metrics
  recordPluginLoad(success) {
    this.metrics.plugins.total++;
    if (success) {
      this.metrics.plugins.loaded++;
    } else {
      this.metrics.plugins.failed++;
    }
  }

  // API metrics
  startRequest(requestId) {
    this.requestTimings.set(requestId, Date.now());
  }

  endRequest(requestId, success) {
    const startTime = this.requestTimings.get(requestId);
    if (!startTime) return;

    const duration = Date.now() - startTime;
    this.requestTimings.delete(requestId);

    this.metrics.api.totalRequests++;
    if (success) {
      this.metrics.api.successfulRequests++;
    } else {
      this.metrics.api.failedRequests++;
    }

    this.metrics.api.responseTimes.push(duration);
    if (this.metrics.api.responseTimes.length > 1000) {
      this.metrics.api.responseTimes.shift();
    }

    this.metrics.api.avgResponseTime = this._calculateAverage(
      this.metrics.api.responseTimes
    );
  }

  // System metrics
  updateSystemMetrics() {
    this.metrics.system.uptime = Math.floor((Date.now() - this.startTime) / 1000);
    this.metrics.system.memoryUsage = process.memoryUsage();
    this.metrics.system.cpuUsage = process.cpuUsage();
  }

  // Get all metrics
  getMetrics() {
    this.updateSystemMetrics();
    return {
      ...this.metrics,
      timestamp: new Date().toISOString(),
    };
  }

  // Get specific metric category
  getWorkflowMetrics() {
    return this.metrics.workflows;
  }

  getAgentMetrics() {
    return this.metrics.agents;
  }

  getIntegrationMetrics() {
    return this.metrics.integrations;
  }

  getPluginMetrics() {
    return this.metrics.plugins;
  }

  getApiMetrics() {
    return this.metrics.api;
  }

  getSystemMetrics() {
    this.updateSystemMetrics();
    return this.metrics.system;
  }

  // Reset metrics
  reset() {
    this.metrics = {
      workflows: {
        total: 0,
        successful: 0,
        failed: 0,
        avgDuration: 0,
        durations: [],
      },
      agents: {
        total: 0,
        active: 0,
        avgExecutionTime: 0,
        executionTimes: [],
      },
      integrations: {
        total: 0,
        successful: 0,
        failed: 0,
        avgResponseTime: 0,
        responseTimes: [],
      },
      plugins: {
        total: 0,
        loaded: 0,
        failed: 0,
      },
      api: {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        avgResponseTime: 0,
        responseTimes: [],
      },
      system: {
        uptime: 0,
        memoryUsage: {},
        cpuUsage: 0,
      },
    };

    this.startTime = Date.now();
    this.requestTimings.clear();

    logger.info('Metrics reset');
  }

  // Helper methods
  _calculateAverage(arr) {
    if (arr.length === 0) return 0;
    return arr.reduce((sum, val) => sum + val, 0) / arr.length;
  }

  // Get percentiles
  getPercentile(arr, percentile) {
    if (arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index];
  }

  // Get detailed statistics
  getDetailedStats() {
    this.updateSystemMetrics();

    return {
      workflows: {
        ...this.metrics.workflows,
        p50: this.getPercentile(this.metrics.workflows.durations, 50),
        p95: this.getPercentile(this.metrics.workflows.durations, 95),
        p99: this.getPercentile(this.metrics.workflows.durations, 99),
        successRate: this.metrics.workflows.total > 0
          ? (this.metrics.workflows.successful / this.metrics.workflows.total) * 100
          : 0,
      },
      agents: {
        ...this.metrics.agents,
        p50: this.getPercentile(this.metrics.agents.executionTimes, 50),
        p95: this.getPercentile(this.metrics.agents.executionTimes, 95),
        p99: this.getPercentile(this.metrics.agents.executionTimes, 99),
      },
      integrations: {
        ...this.metrics.integrations,
        p50: this.getPercentile(this.metrics.integrations.responseTimes, 50),
        p95: this.getPercentile(this.metrics.integrations.responseTimes, 95),
        p99: this.getPercentile(this.metrics.integrations.responseTimes, 99),
        successRate: this.metrics.integrations.total > 0
          ? (this.metrics.integrations.successful / this.metrics.integrations.total) * 100
          : 0,
      },
      api: {
        ...this.metrics.api,
        p50: this.getPercentile(this.metrics.api.responseTimes, 50),
        p95: this.getPercentile(this.metrics.api.responseTimes, 95),
        p99: this.getPercentile(this.metrics.api.responseTimes, 99),
        successRate: this.metrics.api.totalRequests > 0
          ? (this.metrics.api.successfulRequests / this.metrics.api.totalRequests) * 100
          : 0,
      },
      system: this.metrics.system,
      timestamp: new Date().toISOString(),
    };
  }
}

// Create singleton instance
const metrics = new MetricsCollector();

module.exports = metrics;
