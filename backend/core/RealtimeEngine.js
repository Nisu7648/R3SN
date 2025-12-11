/**
 * RealtimeEngine - Real-time WebSocket orchestration
 * Broadcasts execution progress, agent updates, workflow status in real-time
 * Connects ExecutionOrchestrator with WebSocket clients
 */

const EventEmitter = require('events');

class RealtimeEngine extends EventEmitter {
  constructor(io, executionOrchestrator) {
    super();
    this.io = io;
    this.orchestrator = executionOrchestrator;
    this.connectedClients = new Map();
    this.subscriptions = new Map();
    
    this.setupSocketHandlers();
    this.setupOrchestratorListeners();
    
    console.log('📡 RealtimeEngine initialized');
  }

  /**
   * Setup WebSocket handlers
   */
  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`🔌 Client connected: ${socket.id}`);
      
      this.connectedClients.set(socket.id, {
        socket,
        userId: null,
        subscriptions: new Set()
      });

      // Authentication
      socket.on('auth', async (data) => {
        const { userId, token } = data;
        const client = this.connectedClients.get(socket.id);
        if (client) {
          client.userId = userId;
          socket.join(`user:${userId}`);
          console.log(`✅ Client ${socket.id} authenticated as user ${userId}`);
          
          socket.emit('auth:success', {
            message: 'Authenticated successfully',
            userId
          });
        }
      });

      // Execute prompt in real-time
      socket.on('prompt:execute', async (data) => {
        const { prompt, context } = data;
        const client = this.connectedClients.get(socket.id);
        
        if (!client || !client.userId) {
          socket.emit('error', { message: 'Not authenticated' });
          return;
        }

        try {
          socket.emit('prompt:started', { prompt });

          // Execute with progress updates
          const result = await this.executeWithProgress(
            prompt,
            client.userId,
            context,
            (progress) => {
              socket.emit('prompt:progress', progress);
            }
          );

          socket.emit('prompt:completed', result);
        } catch (error) {
          socket.emit('prompt:failed', {
            error: error.message,
            prompt
          });
        }
      });

      // Execute workflow in real-time
      socket.on('workflow:execute', async (data) => {
        const { workflowId, triggerData } = data;
        const client = this.connectedClients.get(socket.id);
        
        if (!client || !client.userId) {
          socket.emit('error', { message: 'Not authenticated' });
          return;
        }

        try {
          socket.emit('workflow:started', { workflowId });

          const result = await this.executeWorkflowWithProgress(
            workflowId,
            client.userId,
            triggerData,
            (progress) => {
              socket.emit('workflow:progress', progress);
            }
          );

          socket.emit('workflow:completed', result);
        } catch (error) {
          socket.emit('workflow:failed', {
            error: error.message,
            workflowId
          });
        }
      });

      // Subscribe to execution updates
      socket.on('execution:subscribe', (executionId) => {
        const client = this.connectedClients.get(socket.id);
        if (client) {
          client.subscriptions.add(executionId);
          socket.join(`execution:${executionId}`);
          console.log(`📬 Client ${socket.id} subscribed to execution ${executionId}`);
        }
      });

      // Unsubscribe from execution updates
      socket.on('execution:unsubscribe', (executionId) => {
        const client = this.connectedClients.get(socket.id);
        if (client) {
          client.subscriptions.delete(executionId);
          socket.leave(`execution:${executionId}`);
          console.log(`📭 Client ${socket.id} unsubscribed from execution ${executionId}`);
        }
      });

      // Get active executions
      socket.on('executions:active', () => {
        const activeExecutions = this.orchestrator.getActiveExecutions();
        socket.emit('executions:active:response', activeExecutions);
      });

      // Get execution status
      socket.on('execution:status', async (executionId) => {
        const status = await this.orchestrator.getExecutionStatus(executionId);
        socket.emit('execution:status:response', status);
      });

      // Agent operations
      socket.on('agent:create', async (data) => {
        const client = this.connectedClients.get(socket.id);
        if (!client || !client.userId) {
          socket.emit('error', { message: 'Not authenticated' });
          return;
        }

        try {
          const agent = await this.orchestrator.agentEngine.createAgent({
            ...data,
            userId: client.userId
          });
          socket.emit('agent:created', agent);
          this.broadcastToUser(client.userId, 'agent:new', agent);
        } catch (error) {
          socket.emit('agent:create:failed', { error: error.message });
        }
      });

      // Plugin generation
      socket.on('plugin:generate', async (data) => {
        const client = this.connectedClients.get(socket.id);
        if (!client || !client.userId) {
          socket.emit('error', { message: 'Not authenticated' });
          return;
        }

        try {
          socket.emit('plugin:generating', { appName: data.appName });

          const plugin = await this.orchestrator.pluginFactory.generatePlugin(data);
          
          socket.emit('plugin:generated', plugin);
          this.broadcastToUser(client.userId, 'plugin:new', plugin);
        } catch (error) {
          socket.emit('plugin:generate:failed', { error: error.message });
        }
      });

      // System stats
      socket.on('stats:request', async () => {
        const stats = {
          activeExecutions: this.orchestrator.getActiveExecutions().length,
          connectedClients: this.connectedClients.size,
          totalExecutions: this.orchestrator.executionHistory.length
        };
        socket.emit('stats:response', stats);
      });

      // Disconnect
      socket.on('disconnect', () => {
        console.log(`🔌 Client disconnected: ${socket.id}`);
        this.connectedClients.delete(socket.id);
      });
    });
  }

  /**
   * Setup orchestrator event listeners
   */
  setupOrchestratorListeners() {
    // Listen to orchestrator events and broadcast to clients
    this.orchestrator.on = (event, data) => {
      this.emit(event, data);
    };
  }

  /**
   * Execute prompt with progress updates
   */
  async executeWithProgress(prompt, userId, context, progressCallback) {
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Wrap orchestrator execution with progress tracking
    const originalExecute = this.orchestrator.executePrompt.bind(this.orchestrator);
    
    // Intercept and emit progress
    progressCallback({
      stage: 'analyzing',
      message: 'Analyzing prompt...',
      progress: 10
    });

    const result = await originalExecute(prompt, userId, {
      ...context,
      executionId,
      onProgress: (stage, message, progress) => {
        progressCallback({ stage, message, progress });
        this.broadcastToExecution(executionId, 'progress', {
          stage,
          message,
          progress
        });
      }
    });

    progressCallback({
      stage: 'completed',
      message: 'Execution completed',
      progress: 100
    });

    return result;
  }

  /**
   * Execute workflow with progress updates
   */
  async executeWorkflowWithProgress(workflowId, userId, triggerData, progressCallback) {
    const executionId = `wf_exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    progressCallback({
      stage: 'starting',
      message: 'Starting workflow...',
      progress: 0
    });

    const result = await this.orchestrator.executeWorkflow(workflowId, userId, {
      ...triggerData,
      executionId,
      onStepComplete: (stepIndex, totalSteps, stepResult) => {
        const progress = Math.round(((stepIndex + 1) / totalSteps) * 100);
        progressCallback({
          stage: 'executing',
          message: `Step ${stepIndex + 1}/${totalSteps} completed`,
          progress,
          stepResult
        });
        this.broadcastToExecution(executionId, 'step:completed', {
          stepIndex,
          totalSteps,
          stepResult,
          progress
        });
      }
    });

    progressCallback({
      stage: 'completed',
      message: 'Workflow completed',
      progress: 100
    });

    return result;
  }

  /**
   * Broadcast to all clients of a user
   */
  broadcastToUser(userId, event, data) {
    this.io.to(`user:${userId}`).emit(event, data);
  }

  /**
   * Broadcast to all subscribers of an execution
   */
  broadcastToExecution(executionId, event, data) {
    this.io.to(`execution:${executionId}`).emit(event, data);
  }

  /**
   * Broadcast to all connected clients
   */
  broadcastToAll(event, data) {
    this.io.emit(event, data);
  }

  /**
   * Send system notification
   */
  sendSystemNotification(userId, notification) {
    this.broadcastToUser(userId, 'notification', {
      type: 'system',
      ...notification,
      timestamp: new Date()
    });
  }

  /**
   * Send execution update
   */
  sendExecutionUpdate(executionId, update) {
    this.broadcastToExecution(executionId, 'update', {
      executionId,
      ...update,
      timestamp: new Date()
    });
  }

  /**
   * Get connected clients count
   */
  getConnectedClientsCount() {
    return this.connectedClients.size;
  }

  /**
   * Get clients for user
   */
  getClientsForUser(userId) {
    const clients = [];
    for (const [socketId, client] of this.connectedClients) {
      if (client.userId === userId) {
        clients.push(socketId);
      }
    }
    return clients;
  }

  /**
   * Disconnect client
   */
  disconnectClient(socketId) {
    const client = this.connectedClients.get(socketId);
    if (client) {
      client.socket.disconnect(true);
      this.connectedClients.delete(socketId);
    }
  }

  /**
   * Broadcast agent update
   */
  broadcastAgentUpdate(userId, agent, action) {
    this.broadcastToUser(userId, 'agent:update', {
      agent,
      action,
      timestamp: new Date()
    });
  }

  /**
   * Broadcast workflow update
   */
  broadcastWorkflowUpdate(userId, workflow, action) {
    this.broadcastToUser(userId, 'workflow:update', {
      workflow,
      action,
      timestamp: new Date()
    });
  }

  /**
   * Broadcast plugin update
   */
  broadcastPluginUpdate(userId, plugin, action) {
    this.broadcastToUser(userId, 'plugin:update', {
      plugin,
      action,
      timestamp: new Date()
    });
  }

  /**
   * Broadcast integration update
   */
  broadcastIntegrationUpdate(userId, integration, action) {
    this.broadcastToUser(userId, 'integration:update', {
      integration,
      action,
      timestamp: new Date()
    });
  }

  /**
   * Send error notification
   */
  sendErrorNotification(userId, error, context) {
    this.broadcastToUser(userId, 'error', {
      error: error.message,
      context,
      timestamp: new Date()
    });
  }

  /**
   * Send success notification
   */
  sendSuccessNotification(userId, message, data) {
    this.broadcastToUser(userId, 'success', {
      message,
      data,
      timestamp: new Date()
    });
  }
}

module.exports = RealtimeEngine;
