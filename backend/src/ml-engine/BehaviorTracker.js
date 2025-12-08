/**
 * Behavior Tracker - Track and analyze user behavior patterns
 */

class BehaviorTracker {
  constructor() {
    this.behaviors = [];
    this.patterns = new Map();
    this.userPreferences = new Map();
  }

  /**
   * Initialize behavior tracker
   */
  async initialize() {
    console.log('👁️  Initializing Behavior Tracker...');
    console.log('✅ Behavior Tracker initialized');
  }

  /**
   * Track execution behavior
   */
  async track(execution) {
    const behavior = {
      timestamp: new Date().toISOString(),
      executionId: execution.executionId,
      workflowId: execution.workflowId,
      userId: execution.userId,
      duration: execution.duration,
      status: execution.status,
      nodeCount: execution.nodeExecutions?.length || 0,
      errorCount: execution.errors?.length || 0,
      timeOfDay: new Date().getHours(),
      dayOfWeek: new Date().getDay()
    };

    this.behaviors.push(behavior);

    // Update patterns
    await this.updatePatterns(behavior);

    // Update user preferences
    await this.updateUserPreferences(behavior);

    // Cleanup old data (keep last 10000)
    if (this.behaviors.length > 10000) {
      this.behaviors = this.behaviors.slice(-10000);
    }
  }

  /**
   * Update behavior patterns
   */
  async updatePatterns(behavior) {
    // Time-based patterns
    const hourKey = `hour_${behavior.timeOfDay}`;
    this.incrementPattern(hourKey);

    const dayKey = `day_${behavior.dayOfWeek}`;
    this.incrementPattern(dayKey);

    // Workflow patterns
    const workflowKey = `workflow_${behavior.workflowId}`;
    this.incrementPattern(workflowKey);

    // Success/failure patterns
    const statusKey = `status_${behavior.status}`;
    this.incrementPattern(statusKey);
  }

  /**
   * Increment pattern counter
   */
  incrementPattern(key) {
    this.patterns.set(key, (this.patterns.get(key) || 0) + 1);
  }

  /**
   * Update user preferences
   */
  async updateUserPreferences(behavior) {
    if (!behavior.userId) return;

    const prefs = this.userPreferences.get(behavior.userId) || {
      favoriteWorkflows: new Map(),
      preferredTimes: new Map(),
      avgDuration: 0,
      totalExecutions: 0
    };

    // Update favorite workflows
    const workflowCount = prefs.favoriteWorkflows.get(behavior.workflowId) || 0;
    prefs.favoriteWorkflows.set(behavior.workflowId, workflowCount + 1);

    // Update preferred times
    const timeKey = `${behavior.timeOfDay}:00`;
    const timeCount = prefs.preferredTimes.get(timeKey) || 0;
    prefs.preferredTimes.set(timeKey, timeCount + 1);

    // Update average duration
    prefs.avgDuration = (
      (prefs.avgDuration * prefs.totalExecutions + behavior.duration) /
      (prefs.totalExecutions + 1)
    );

    prefs.totalExecutions++;

    this.userPreferences.set(behavior.userId, prefs);
  }

  /**
   * Get behavior insights
   */
  getInsights(userId = null) {
    if (userId) {
      return this.getUserInsights(userId);
    }

    return this.getGlobalInsights();
  }

  /**
   * Get user-specific insights
   */
  getUserInsights(userId) {
    const prefs = this.userPreferences.get(userId);

    if (!prefs) {
      return null;
    }

    // Get top workflows
    const topWorkflows = Array.from(prefs.favoriteWorkflows.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([workflowId, count]) => ({ workflowId, count }));

    // Get preferred times
    const preferredTimes = Array.from(prefs.preferredTimes.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([time, count]) => ({ time, count }));

    return {
      userId,
      totalExecutions: prefs.totalExecutions,
      avgDuration: Math.round(prefs.avgDuration),
      topWorkflows,
      preferredTimes,
      recommendations: this.generateRecommendations(prefs)
    };
  }

  /**
   * Get global insights
   */
  getGlobalInsights() {
    // Most active hours
    const hourPatterns = Array.from(this.patterns.entries())
      .filter(([key]) => key.startsWith('hour_'))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([key, count]) => ({
        hour: parseInt(key.split('_')[1]),
        count
      }));

    // Most active days
    const dayPatterns = Array.from(this.patterns.entries())
      .filter(([key]) => key.startsWith('day_'))
      .sort((a, b) => b[1] - a[1])
      .map(([key, count]) => ({
        day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][parseInt(key.split('_')[1])],
        count
      }));

    // Most used workflows
    const workflowPatterns = Array.from(this.patterns.entries())
      .filter(([key]) => key.startsWith('workflow_'))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([key, count]) => ({
        workflowId: key.split('_')[1],
        count
      }));

    // Success rate
    const successCount = this.patterns.get('status_completed') || 0;
    const failureCount = this.patterns.get('status_failed') || 0;
    const totalCount = successCount + failureCount;
    const successRate = totalCount > 0 ? successCount / totalCount : 0;

    return {
      totalBehaviors: this.behaviors.length,
      mostActiveHours: hourPatterns,
      mostActiveDays: dayPatterns,
      mostUsedWorkflows: workflowPatterns,
      successRate: Math.round(successRate * 100) / 100,
      trends: this.analyzeTrends()
    };
  }

  /**
   * Analyze trends
   */
  analyzeTrends() {
    const trends = [];

    // Analyze recent vs older behaviors
    const recentBehaviors = this.behaviors.slice(-100);
    const olderBehaviors = this.behaviors.slice(-200, -100);

    if (recentBehaviors.length > 0 && olderBehaviors.length > 0) {
      // Duration trend
      const recentAvgDuration = recentBehaviors.reduce((sum, b) => sum + b.duration, 0) / recentBehaviors.length;
      const olderAvgDuration = olderBehaviors.reduce((sum, b) => sum + b.duration, 0) / olderBehaviors.length;
      
      if (recentAvgDuration < olderAvgDuration * 0.9) {
        trends.push({
          type: 'performance_improvement',
          description: 'Execution times are improving',
          change: Math.round((1 - recentAvgDuration / olderAvgDuration) * 100)
        });
      } else if (recentAvgDuration > olderAvgDuration * 1.1) {
        trends.push({
          type: 'performance_degradation',
          description: 'Execution times are increasing',
          change: Math.round((recentAvgDuration / olderAvgDuration - 1) * 100)
        });
      }

      // Error rate trend
      const recentErrorRate = recentBehaviors.filter(b => b.status === 'failed').length / recentBehaviors.length;
      const olderErrorRate = olderBehaviors.filter(b => b.status === 'failed').length / olderBehaviors.length;

      if (recentErrorRate < olderErrorRate * 0.8) {
        trends.push({
          type: 'reliability_improvement',
          description: 'Error rate is decreasing',
          change: Math.round((1 - recentErrorRate / olderErrorRate) * 100)
        });
      } else if (recentErrorRate > olderErrorRate * 1.2) {
        trends.push({
          type: 'reliability_degradation',
          description: 'Error rate is increasing',
          change: Math.round((recentErrorRate / olderErrorRate - 1) * 100)
        });
      }
    }

    return trends;
  }

  /**
   * Generate recommendations
   */
  generateRecommendations(prefs) {
    const recommendations = [];

    // Recommend based on preferred times
    const topTime = Array.from(prefs.preferredTimes.entries())
      .sort((a, b) => b[1] - a[1])[0];

    if (topTime) {
      recommendations.push({
        type: 'scheduling',
        message: `You're most productive around ${topTime[0]}. Consider scheduling important workflows during this time.`
      });
    }

    // Recommend based on average duration
    if (prefs.avgDuration > 10000) {
      recommendations.push({
        type: 'optimization',
        message: 'Your workflows take an average of ' + Math.round(prefs.avgDuration / 1000) + ' seconds. Consider optimizing for better performance.'
      });
    }

    // Recommend based on favorite workflows
    const topWorkflow = Array.from(prefs.favoriteWorkflows.entries())
      .sort((a, b) => b[1] - a[1])[0];

    if (topWorkflow && topWorkflow[1] > 10) {
      recommendations.push({
        type: 'automation',
        message: `You frequently use workflow ${topWorkflow[0]}. Consider setting up automated triggers.`
      });
    }

    return recommendations;
  }

  /**
   * Export behavior data
   */
  exportData(userId = null) {
    if (userId) {
      return {
        behaviors: this.behaviors.filter(b => b.userId === userId),
        preferences: this.userPreferences.get(userId)
      };
    }

    return {
      behaviors: this.behaviors,
      patterns: Object.fromEntries(this.patterns),
      userPreferences: Object.fromEntries(this.userPreferences)
    };
  }
}

module.exports = BehaviorTracker;
