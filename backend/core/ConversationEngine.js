const EventEmitter = require('events');

/**
 * Conversation Engine
 * Handles the complete conversation flow: user input → processing → response
 * Supports chat, workflows, automation, and multi-turn conversations
 */
class ConversationEngine extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      maxHistoryLength: config.maxHistoryLength || 50,
      contextWindow: config.contextWindow || 10,
      enableWorkflows: config.enableWorkflows !== false,
      enableAutomation: config.enableAutomation !== false,
      enableMemory: config.enableMemory !== false,
      defaultModel: config.defaultModel || 'gpt-4',
      streamResponses: config.streamResponses !== false
    };

    // Conversation state
    this.conversations = new Map(); // conversationId -> conversation data
    this.activeWorkflows = new Map(); // conversationId -> workflow state
    
    // Processing queue
    this.processingQueue = [];
    this.isProcessing = false;
  }

  /**
   * Initialize a new conversation
   */
  createConversation(userId, metadata = {}) {
    const conversationId = this.generateConversationId();
    
    const conversation = {
      id: conversationId,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: [],
      context: {
        user: metadata.user || {},
        preferences: metadata.preferences || {},
        history: []
      },
      state: {
        mode: 'chat', // chat, workflow, automation
        currentStep: null,
        waitingFor: null,
        variables: {}
      },
      metadata: {
        ...metadata,
        messageCount: 0,
        workflowsExecuted: 0,
        automationsRun: 0
      }
    };

    this.conversations.set(conversationId, conversation);
    this.emit('conversation:created', conversation);
    
    return conversation;
  }

  /**
   * Process user message - Main entry point
   */
  async processMessage(conversationId, userMessage, options = {}) {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Add user message to history
    const userMsg = {
      id: this.generateMessageId(),
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
      metadata: options.metadata || {}
    };
    
    conversation.messages.push(userMsg);
    conversation.metadata.messageCount++;
    conversation.updatedAt = new Date();

    this.emit('message:received', { conversationId, message: userMsg });

    // Analyze intent and determine processing mode
    const intent = await this.analyzeIntent(userMessage, conversation);
    
    // Process based on intent
    let response;
    switch (intent.type) {
      case 'workflow':
        response = await this.processWorkflow(conversation, userMessage, intent);
        break;
      
      case 'automation':
        response = await this.processAutomation(conversation, userMessage, intent);
        break;
      
      case 'query':
        response = await this.processQuery(conversation, userMessage, intent);
        break;
      
      case 'command':
        response = await this.processCommand(conversation, userMessage, intent);
        break;
      
      default:
        response = await this.processChat(conversation, userMessage, intent);
    }

    // Add assistant response to history
    const assistantMsg = {
      id: this.generateMessageId(),
      role: 'assistant',
      content: response.content,
      timestamp: new Date(),
      metadata: {
        intent: intent.type,
        processingTime: response.processingTime,
        ...response.metadata
      }
    };
    
    conversation.messages.push(assistantMsg);
    conversation.updatedAt = new Date();

    this.emit('message:sent', { conversationId, message: assistantMsg });

    // Trim history if needed
    this.trimHistory(conversation);

    return {
      conversationId,
      message: assistantMsg,
      intent,
      suggestions: response.suggestions || []
    };
  }

  /**
   * Analyze user intent
   */
  async analyzeIntent(message, conversation) {
    const startTime = Date.now();
    
    // Keywords for different intents
    const workflowKeywords = ['workflow', 'automate', 'create automation', 'build flow', 'sequence'];
    const automationKeywords = ['schedule', 'remind', 'every', 'daily', 'weekly', 'run at'];
    const queryKeywords = ['search', 'find', 'look up', 'what is', 'who is', 'how to'];
    const commandKeywords = ['execute', 'run', 'deploy', 'start', 'stop', 'delete'];

    const lowerMessage = message.toLowerCase();

    let type = 'chat';
    let confidence = 0.5;
    let entities = {};

    // Check for workflow intent
    if (workflowKeywords.some(kw => lowerMessage.includes(kw))) {
      type = 'workflow';
      confidence = 0.8;
      entities.workflowType = this.extractWorkflowType(message);
    }
    // Check for automation intent
    else if (automationKeywords.some(kw => lowerMessage.includes(kw))) {
      type = 'automation';
      confidence = 0.85;
      entities.schedule = this.extractSchedule(message);
    }
    // Check for query intent
    else if (queryKeywords.some(kw => lowerMessage.includes(kw))) {
      type = 'query';
      confidence = 0.75;
      entities.queryType = this.extractQueryType(message);
    }
    // Check for command intent
    else if (commandKeywords.some(kw => lowerMessage.includes(kw))) {
      type = 'command';
      confidence = 0.9;
      entities.command = this.extractCommand(message);
    }

    // Check conversation state
    if (conversation.state.mode !== 'chat' && conversation.state.waitingFor) {
      type = conversation.state.mode;
      confidence = 0.95;
    }

    return {
      type,
      confidence,
      entities,
      processingTime: Date.now() - startTime
    };
  }

  /**
   * Process workflow request
   */
  async processWorkflow(conversation, message, intent) {
    const startTime = Date.now();
    
    conversation.state.mode = 'workflow';
    
    // Check if workflow is already in progress
    if (this.activeWorkflows.has(conversation.id)) {
      return await this.continueWorkflow(conversation, message);
    }

    // Start new workflow
    const workflow = {
      id: this.generateWorkflowId(),
      name: intent.entities.workflowType || 'Custom Workflow',
      steps: [],
      currentStep: 0,
      variables: {},
      status: 'building'
    };

    this.activeWorkflows.set(conversation.id, workflow);
    conversation.state.currentStep = 'define_trigger';
    conversation.state.waitingFor = 'trigger_definition';

    const response = {
      content: `🔄 **Creating Workflow: ${workflow.name}**\n\n` +
               `Let's build your workflow step by step.\n\n` +
               `**Step 1: Define Trigger**\n` +
               `What should trigger this workflow?\n\n` +
               `Examples:\n` +
               `- "When I receive an email from [email]"\n` +
               `- "Every day at 9 AM"\n` +
               `- "When a new file is added to [folder]"\n` +
               `- "When [condition] happens"`,
      processingTime: Date.now() - startTime,
      metadata: {
        workflowId: workflow.id,
        step: 'define_trigger'
      },
      suggestions: [
        'When I receive an email',
        'Every day at 9 AM',
        'When a file is uploaded',
        'Manual trigger'
      ]
    };

    conversation.metadata.workflowsExecuted++;
    
    return response;
  }

  /**
   * Continue workflow building
   */
  async continueWorkflow(conversation, message) {
    const workflow = this.activeWorkflows.get(conversation.id);
    const currentStep = conversation.state.currentStep;

    switch (currentStep) {
      case 'define_trigger':
        workflow.trigger = message;
        conversation.state.currentStep = 'define_actions';
        conversation.state.waitingFor = 'action_definition';
        
        return {
          content: `✅ Trigger set: "${message}"\n\n` +
                   `**Step 2: Define Actions**\n` +
                   `What should happen when triggered?\n\n` +
                   `Examples:\n` +
                   `- "Send me a notification"\n` +
                   `- "Create a task in Notion"\n` +
                   `- "Post to Slack channel"\n` +
                   `- "Run a script"`,
          processingTime: 100,
          suggestions: [
            'Send notification',
            'Create task',
            'Send email',
            'Post to Slack'
          ]
        };

      case 'define_actions':
        workflow.steps.push({
          type: 'action',
          description: message,
          order: workflow.steps.length + 1
        });
        
        conversation.state.currentStep = 'confirm_workflow';
        conversation.state.waitingFor = 'confirmation';
        
        return {
          content: `✅ Action added: "${message}"\n\n` +
                   `**Workflow Summary:**\n` +
                   `📍 Trigger: ${workflow.trigger}\n` +
                   `⚡ Actions:\n${workflow.steps.map((s, i) => `  ${i + 1}. ${s.description}`).join('\n')}\n\n` +
                   `Would you like to:\n` +
                   `1. Add another action\n` +
                   `2. Save and activate workflow\n` +
                   `3. Cancel`,
          processingTime: 100,
          suggestions: [
            'Add another action',
            'Save and activate',
            'Cancel'
          ]
        };

      case 'confirm_workflow':
        if (message.toLowerCase().includes('save') || message.toLowerCase().includes('activate')) {
          workflow.status = 'active';
          this.activeWorkflows.delete(conversation.id);
          conversation.state.mode = 'chat';
          conversation.state.currentStep = null;
          conversation.state.waitingFor = null;
          
          return {
            content: `🎉 **Workflow Created Successfully!**\n\n` +
                     `**${workflow.name}**\n` +
                     `📍 Trigger: ${workflow.trigger}\n` +
                     `⚡ Actions: ${workflow.steps.length}\n` +
                     `✅ Status: Active\n\n` +
                     `Your workflow is now running and will execute automatically when triggered.`,
            processingTime: 100,
            metadata: {
              workflowId: workflow.id,
              status: 'active'
            }
          };
        } else if (message.toLowerCase().includes('add')) {
          conversation.state.currentStep = 'define_actions';
          return {
            content: `What action would you like to add?`,
            processingTime: 50,
            suggestions: [
              'Send notification',
              'Create task',
              'Send email'
            ]
          };
        } else {
          this.activeWorkflows.delete(conversation.id);
          conversation.state.mode = 'chat';
          return {
            content: `Workflow cancelled. No changes were saved.`,
            processingTime: 50
          };
        }
    }
  }

  /**
   * Process automation request
   */
  async processAutomation(conversation, message, intent) {
    const startTime = Date.now();
    
    const schedule = intent.entities.schedule || this.extractSchedule(message);
    const action = this.extractAction(message);

    const automation = {
      id: this.generateAutomationId(),
      schedule,
      action,
      status: 'active',
      createdAt: new Date()
    };

    const response = {
      content: `⏰ **Automation Created**\n\n` +
               `📅 Schedule: ${schedule}\n` +
               `⚡ Action: ${action}\n` +
               `✅ Status: Active\n\n` +
               `Your automation is now running and will execute on schedule.`,
      processingTime: Date.now() - startTime,
      metadata: {
        automationId: automation.id,
        schedule,
        action
      },
      suggestions: [
        'View all automations',
        'Create another automation',
        'Edit this automation'
      ]
    };

    conversation.metadata.automationsRun++;
    
    return response;
  }

  /**
   * Process query request
   */
  async processQuery(conversation, message, intent) {
    const startTime = Date.now();
    
    // Simulate query processing
    const queryType = intent.entities.queryType || 'general';
    
    const response = {
      content: `🔍 **Search Results**\n\n` +
               `Searching for: "${message}"\n\n` +
               `I'll search across multiple sources and provide you with the best results.\n\n` +
               `*Processing your query...*`,
      processingTime: Date.now() - startTime,
      metadata: {
        queryType,
        sources: ['web', 'knowledge_base', 'integrations']
      },
      suggestions: [
        'Refine search',
        'Search specific source',
        'Get more details'
      ]
    };
    
    return response;
  }

  /**
   * Process command request
   */
  async processCommand(conversation, message, intent) {
    const startTime = Date.now();
    
    const command = intent.entities.command || this.extractCommand(message);
    
    const response = {
      content: `⚡ **Executing Command**\n\n` +
               `Command: ${command}\n\n` +
               `*Processing...*\n\n` +
               `✅ Command executed successfully!`,
      processingTime: Date.now() - startTime,
      metadata: {
        command,
        status: 'success'
      },
      suggestions: [
        'View results',
        'Run another command',
        'Undo'
      ]
    };
    
    return response;
  }

  /**
   * Process regular chat message
   */
  async processChat(conversation, message, intent) {
    const startTime = Date.now();
    
    // Get conversation context
    const context = this.buildContext(conversation);
    
    // Generate response (this would call your LLM)
    const response = {
      content: this.generateChatResponse(message, context),
      processingTime: Date.now() - startTime,
      metadata: {
        contextUsed: context.messages.length,
        model: this.config.defaultModel
      },
      suggestions: this.generateSuggestions(message, conversation)
    };
    
    return response;
  }

  /**
   * Build conversation context
   */
  buildContext(conversation) {
    const recentMessages = conversation.messages.slice(-this.config.contextWindow);
    
    return {
      messages: recentMessages,
      user: conversation.context.user,
      preferences: conversation.context.preferences,
      state: conversation.state,
      metadata: conversation.metadata
    };
  }

  /**
   * Generate chat response
   */
  generateChatResponse(message, context) {
    // This is a placeholder - in production, this would call your LLM
    return `I understand you said: "${message}"\n\n` +
           `I'm here to help! I can:\n` +
           `- Answer questions\n` +
           `- Create workflows and automations\n` +
           `- Search for information\n` +
           `- Execute commands\n` +
           `- And much more!\n\n` +
           `What would you like to do?`;
  }

  /**
   * Generate suggestions
   */
  generateSuggestions(message, conversation) {
    const suggestions = [
      'Create a workflow',
      'Set up automation',
      'Search for information',
      'View my settings'
    ];

    // Add context-aware suggestions
    if (conversation.metadata.workflowsExecuted > 0) {
      suggestions.push('View my workflows');
    }
    
    if (conversation.metadata.automationsRun > 0) {
      suggestions.push('View my automations');
    }

    return suggestions.slice(0, 4);
  }

  /**
   * Get conversation
   */
  getConversation(conversationId) {
    return this.conversations.get(conversationId);
  }

  /**
   * Get conversation history
   */
  getHistory(conversationId, limit = 50) {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) return [];
    
    return conversation.messages.slice(-limit);
  }

  /**
   * Clear conversation
   */
  clearConversation(conversationId) {
    const conversation = this.conversations.get(conversationId);
    if (conversation) {
      conversation.messages = [];
      conversation.metadata.messageCount = 0;
      conversation.updatedAt = new Date();
      this.emit('conversation:cleared', { conversationId });
    }
  }

  /**
   * Delete conversation
   */
  deleteConversation(conversationId) {
    this.conversations.delete(conversationId);
    this.activeWorkflows.delete(conversationId);
    this.emit('conversation:deleted', { conversationId });
  }

  /**
   * Trim conversation history
   */
  trimHistory(conversation) {
    if (conversation.messages.length > this.config.maxHistoryLength) {
      const removed = conversation.messages.splice(
        0,
        conversation.messages.length - this.config.maxHistoryLength
      );
      this.emit('history:trimmed', {
        conversationId: conversation.id,
        removedCount: removed.length
      });
    }
  }

  /**
   * Helper: Extract workflow type
   */
  extractWorkflowType(message) {
    const types = {
      'email': 'Email Workflow',
      'notification': 'Notification Workflow',
      'data': 'Data Processing Workflow',
      'social': 'Social Media Workflow',
      'file': 'File Management Workflow'
    };

    for (const [key, value] of Object.entries(types)) {
      if (message.toLowerCase().includes(key)) {
        return value;
      }
    }

    return 'Custom Workflow';
  }

  /**
   * Helper: Extract schedule
   */
  extractSchedule(message) {
    const schedules = {
      'daily': 'Every day',
      'weekly': 'Every week',
      'hourly': 'Every hour',
      'morning': 'Every morning at 9 AM',
      'evening': 'Every evening at 6 PM'
    };

    for (const [key, value] of Object.entries(schedules)) {
      if (message.toLowerCase().includes(key)) {
        return value;
      }
    }

    return 'Custom schedule';
  }

  /**
   * Helper: Extract action
   */
  extractAction(message) {
    // Simple extraction - in production, use NLP
    return message.replace(/schedule|remind|every|daily|weekly|at/gi, '').trim();
  }

  /**
   * Helper: Extract query type
   */
  extractQueryType(message) {
    if (message.toLowerCase().includes('search')) return 'search';
    if (message.toLowerCase().includes('find')) return 'find';
    if (message.toLowerCase().includes('what')) return 'definition';
    if (message.toLowerCase().includes('how')) return 'tutorial';
    return 'general';
  }

  /**
   * Helper: Extract command
   */
  extractCommand(message) {
    return message.replace(/execute|run|deploy|start|stop/gi, '').trim();
  }

  /**
   * Generate unique IDs
   */
  generateConversationId() {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateWorkflowId() {
    return `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateAutomationId() {
    return `auto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

module.exports = ConversationEngine;
