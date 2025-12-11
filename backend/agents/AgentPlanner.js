/**
 * AgentPlanner.js - Agent Planning Module
 * Decomposes tasks into executable steps
 */

class AgentPlanner {
  async createPlan(task, context = {}) {
    console.log(`📋 Creating plan for task: ${task}`);

    // Decompose task into steps
    const steps = this.decompose(task, context);

    const plan = {
      task,
      steps,
      estimatedDuration: steps.length * 1000,
      context,
      created: Date.now()
    };

    console.log(`✅ Plan created with ${steps.length} steps`);

    return plan;
  }

  decompose(task, context) {
    const steps = [];
    const taskLower = task.toLowerCase();

    // Step 1: Analyze task requirements
    steps.push({
      id: 'step-1',
      action: 'analyze',
      parameters: {
        task,
        analysisType: 'requirements'
      },
      description: 'Analyze task requirements and constraints'
    });

    // Step 2: Determine action based on task type
    if (taskLower.includes('create') || taskLower.includes('generate')) {
      steps.push({
        id: 'step-2',
        action: 'generate',
        parameters: {
          task,
          template: this.inferTemplate(task)
        },
        description: 'Generate required content or artifacts'
      });
    } else if (taskLower.includes('analyze') || taskLower.includes('review')) {
      steps.push({
        id: 'step-2',
        action: 'analyze',
        parameters: {
          task,
          analysisType: 'detailed'
        },
        description: 'Perform detailed analysis'
      });
    } else if (taskLower.includes('integrate') || taskLower.includes('connect')) {
      steps.push({
        id: 'step-2',
        action: 'integrate',
        parameters: {
          task,
          service: this.inferService(task)
        },
        description: 'Integrate with external service'
      });
    } else if (taskLower.includes('execute') || taskLower.includes('run')) {
      steps.push({
        id: 'step-2',
        action: 'execute',
        parameters: {
          task,
          command: this.inferCommand(task)
        },
        description: 'Execute command or script'
      });
    } else {
      steps.push({
        id: 'step-2',
        action: 'transform',
        parameters: {
          task,
          transformation: 'default'
        },
        description: 'Transform and process data'
      });
    }

    // Step 3: Finalize and validate
    steps.push({
      id: 'step-3',
      action: 'transform',
      parameters: {
        task,
        transformation: 'finalize'
      },
      description: 'Finalize results and validate output'
    });

    return steps;
  }

  inferTemplate(task) {
    if (task.includes('workflow')) return 'workflow';
    if (task.includes('plugin')) return 'plugin';
    if (task.includes('report')) return 'report';
    if (task.includes('code')) return 'code';
    return 'general';
  }

  inferService(task) {
    if (task.includes('github')) return 'github';
    if (task.includes('slack')) return 'slack';
    if (task.includes('email')) return 'email';
    if (task.includes('database')) return 'database';
    return 'api';
  }

  inferCommand(task) {
    if (task.includes('deploy')) return 'deploy';
    if (task.includes('build')) return 'build';
    if (task.includes('test')) return 'test';
    if (task.includes('install')) return 'install';
    return 'execute';
  }

  async adaptPlan(plan, feedback) {
    console.log(`🔄 Adapting plan based on feedback`);

    // Analyze feedback
    const needsMoreSteps = feedback.includes('incomplete') || feedback.includes('missing');
    const needsOptimization = feedback.includes('slow') || feedback.includes('inefficient');

    if (needsMoreSteps) {
      // Add additional steps
      plan.steps.push({
        id: `step-${plan.steps.length + 1}`,
        action: 'analyze',
        parameters: { feedback },
        description: 'Address feedback and complete missing parts'
      });
    }

    if (needsOptimization) {
      // Optimize existing steps
      plan.steps = plan.steps.map(step => ({
        ...step,
        optimized: true
      }));
    }

    plan.adapted = true;
    plan.adaptedAt = Date.now();
    plan.feedback = feedback;

    return plan;
  }

  async optimizePlan(plan) {
    console.log(`⚡ Optimizing plan`);

    // Identify parallelizable steps
    const parallelGroups = this.identifyParallelSteps(plan.steps);

    // Merge redundant steps
    const optimizedSteps = this.mergeRedundantSteps(plan.steps);

    return {
      ...plan,
      steps: optimizedSteps,
      parallelGroups,
      optimized: true,
      optimizedAt: Date.now()
    };
  }

  identifyParallelSteps(steps) {
    // Simple heuristic: steps with same action can run in parallel
    const groups = new Map();

    steps.forEach((step, index) => {
      if (!groups.has(step.action)) {
        groups.set(step.action, []);
      }
      groups.get(step.action).push(index);
    });

    return Array.from(groups.entries())
      .filter(([action, indices]) => indices.length > 1)
      .map(([action, indices]) => ({ action, indices }));
  }

  mergeRedundantSteps(steps) {
    // Remove duplicate steps
    const seen = new Set();
    const unique = [];

    for (const step of steps) {
      const signature = `${step.action}:${JSON.stringify(step.parameters)}`;
      
      if (!seen.has(signature)) {
        seen.add(signature);
        unique.push(step);
      }
    }

    return unique;
  }
}

module.exports = AgentPlanner;
