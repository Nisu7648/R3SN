/**
 * Natural Language Processor
 * Processes user input and determines intent, then executes appropriate actions
 */

const OpenAIAPI = require('../integrations/apis/OpenAIAPI');
const DynamicAPIBuilder = require('./DynamicAPIBuilder');
const PluginMaker = require('./PluginMaker');

class NaturalLanguageProcessor {
    constructor() {
        this.openai = new OpenAIAPI();
        this.apiBuilder = new DynamicAPIBuilder();
        this.pluginMaker = new PluginMaker();
    }

    /**
     * Process user message and determine intent
     */
    async process(message, history = [], userId = 'default') {
        console.log(`Processing message: ${message}`);

        // Analyze intent using AI
        const intent = await this.analyzeIntent(message, history);

        // Execute based on intent
        const result = await this.executeIntent(intent, message, userId);

        return result;
    }

    /**
     * Analyze user intent
     */
    async analyzeIntent(message, history) {
        const systemPrompt = `You are an AI assistant that analyzes user intent. Determine what the user wants to do.

Possible intents:
- build_api: User wants to create/build an API
- create_plugin: User wants to create a plugin
- create_workflow: User wants to create a workflow
- execute_api: User wants to execute an existing API
- execute_plugin: User wants to run a plugin
- execute_workflow: User wants to run a workflow
- list_apis: User wants to see their APIs
- list_plugins: User wants to see their plugins
- list_workflows: User wants to see their workflows
- get_details: User wants details about something
- question: User is asking a question
- general: General conversation

Return JSON:
{
    "intent": "intent_name",
    "confidence": 0.95,
    "entities": {
        "api_name": "extracted name",
        "description": "extracted description"
    }
}`;

        const messages = [
            { role: 'system', content: systemPrompt },
            ...history.slice(-5), // Last 5 messages for context
            { role: 'user', content: message }
        ];

        const response = await this.openai.chat(messages, 'gpt-4');
        const content = response.choices[0].message.content;

        // Extract JSON
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            return { intent: 'general', confidence: 0.5, entities: {} };
        }

        return JSON.parse(jsonMatch[0]);
    }

    /**
     * Execute based on intent
     */
    async executeIntent(intent, message, userId) {
        switch (intent.intent) {
            case 'build_api':
                return await this.handleBuildAPI(message, userId);

            case 'create_plugin':
                return await this.handleCreatePlugin(message, userId);

            case 'create_workflow':
                return await this.handleCreateWorkflow(message, userId);

            case 'execute_api':
                return await this.handleExecuteAPI(message, userId, intent.entities);

            case 'execute_plugin':
                return await this.handleExecutePlugin(message, userId, intent.entities);

            case 'execute_workflow':
                return await this.handleExecuteWorkflow(message, userId, intent.entities);

            case 'list_apis':
                return await this.handleListAPIs(userId);

            case 'list_plugins':
                return await this.handleListPlugins(userId);

            case 'list_workflows':
                return await this.handleListWorkflows(userId);

            case 'get_details':
                return await this.handleGetDetails(message, userId, intent.entities);

            case 'question':
                return await this.handleQuestion(message);

            default:
                return await this.handleGeneral(message);
        }
    }

    /**
     * Handle build API intent
     */
    async handleBuildAPI(message, userId) {
        try {
            const result = await this.apiBuilder.buildAPIFromPrompt(message, userId);

            return {
                success: true,
                response: `✅ API created successfully!\n\n**Name:** ${result.name}\n**Description:** ${result.description}\n\n**Endpoints:**\n${result.endpoints.map(e => `- ${e.method} ${e.path}: ${e.description}`).join('\n')}\n\nYou can now use this API!`,
                action: 'api_created',
                actionData: result,
                refreshLists: true
            };
        } catch (error) {
            return {
                success: false,
                response: `Sorry, I couldn't create the API. Error: ${error.message}`
            };
        }
    }

    /**
     * Handle create plugin intent
     */
    async handleCreatePlugin(message, userId) {
        try {
            const result = await this.pluginMaker.createPluginFromPrompt(message, userId);

            return {
                success: true,
                response: `✅ Plugin created successfully!\n\n**Name:** ${result.name}\n**Description:** ${result.description}\n\nYour plugin is ready to use!`,
                action: 'plugin_created',
                actionData: result,
                refreshLists: true
            };
        } catch (error) {
            return {
                success: false,
                response: `Sorry, I couldn't create the plugin. Error: ${error.message}`
            };
        }
    }

    /**
     * Handle create workflow intent
     */
    async handleCreateWorkflow(message, userId) {
        try {
            const result = await this.pluginMaker.createWorkflowFromPrompt(message, userId);

            return {
                success: true,
                response: `✅ Workflow created successfully!\n\n**Name:** ${result.name}\n**Description:** ${result.description}\n\n**Steps:** ${result.steps.length}\n\nYour workflow is ready!`,
                action: 'workflow_created',
                actionData: result,
                refreshLists: true
            };
        } catch (error) {
            return {
                success: false,
                response: `Sorry, I couldn't create the workflow. Error: ${error.message}`
            };
        }
    }

    /**
     * Handle execute API intent
     */
    async handleExecuteAPI(message, userId, entities) {
        // Extract API ID and parameters from message
        const apiId = entities.api_id || await this.extractAPIId(message, userId);
        const params = entities.params || {};

        try {
            const result = await this.apiBuilder.executeAPICall(apiId, entities.endpoint, params);

            return {
                success: true,
                response: `✅ API executed successfully!\n\n**Result:**\n\`\`\`json\n${JSON.stringify(result.data, null, 2)}\n\`\`\``,
                action: 'api_executed',
                actionData: result
            };
        } catch (error) {
            return {
                success: false,
                response: `Sorry, I couldn't execute the API. Error: ${error.message}`
            };
        }
    }

    /**
     * Handle execute plugin intent
     */
    async handleExecutePlugin(message, userId, entities) {
        const pluginId = entities.plugin_id || await this.extractPluginId(message, userId);
        const input = entities.input || {};

        try {
            const result = await this.pluginMaker.executePlugin(pluginId, input);

            return {
                success: true,
                response: `✅ Plugin executed successfully!\n\n**Output:**\n\`\`\`json\n${JSON.stringify(result.output, null, 2)}\n\`\`\``,
                action: 'plugin_executed',
                actionData: result
            };
        } catch (error) {
            return {
                success: false,
                response: `Sorry, I couldn't execute the plugin. Error: ${error.message}`
            };
        }
    }

    /**
     * Handle execute workflow intent
     */
    async handleExecuteWorkflow(message, userId, entities) {
        const workflowId = entities.workflow_id || await this.extractWorkflowId(message, userId);
        const input = entities.input || {};

        try {
            const result = await this.pluginMaker.executeWorkflow(workflowId, input);

            return {
                success: true,
                response: `✅ Workflow executed successfully!\n\n**Steps completed:** ${result.steps.length}\n**Success:** ${result.success}`,
                action: 'workflow_executed',
                actionData: result
            };
        } catch (error) {
            return {
                success: false,
                response: `Sorry, I couldn't execute the workflow. Error: ${error.message}`
            };
        }
    }

    /**
     * Handle list APIs intent
     */
    async handleListAPIs(userId) {
        const apis = this.apiBuilder.listUserAPIs(userId);

        if (apis.length === 0) {
            return {
                success: true,
                response: "You don't have any APIs yet. Try saying: 'Build an API for...'"
            };
        }

        const list = apis.map((api, i) => `${i + 1}. **${api.name}** - ${api.description}`).join('\n');

        return {
            success: true,
            response: `📋 Your APIs (${apis.length}):\n\n${list}`
        };
    }

    /**
     * Handle list plugins intent
     */
    async handleListPlugins(userId) {
        const plugins = this.pluginMaker.listUserPlugins(userId);

        if (plugins.length === 0) {
            return {
                success: true,
                response: "You don't have any plugins yet. Try saying: 'Create a plugin that...'"
            };
        }

        const list = plugins.map((p, i) => `${i + 1}. **${p.name}** - ${p.description}`).join('\n');

        return {
            success: true,
            response: `🔌 Your Plugins (${plugins.length}):\n\n${list}`
        };
    }

    /**
     * Handle list workflows intent
     */
    async handleListWorkflows(userId) {
        const workflows = this.pluginMaker.listUserWorkflows(userId);

        if (workflows.length === 0) {
            return {
                success: true,
                response: "You don't have any workflows yet. Try saying: 'Build a workflow that...'"
            };
        }

        const list = workflows.map((w, i) => `${i + 1}. **${w.name}** - ${w.description}`).join('\n');

        return {
            success: true,
            response: `⚡ Your Workflows (${workflows.length}):\n\n${list}`
        };
    }

    /**
     * Handle get details intent
     */
    async handleGetDetails(message, userId, entities) {
        // Determine what type of details
        if (message.toLowerCase().includes('api')) {
            const apiId = await this.extractAPIId(message, userId);
            const api = this.apiBuilder.getAPI(apiId);

            if (!api) {
                return {
                    success: false,
                    response: "API not found."
                };
            }

            return {
                success: true,
                response: `📋 **${api.name}**\n\n${api.description}\n\n**Endpoints:**\n${api.spec.endpoints.map(e => `- ${e.method} ${e.path}`).join('\n')}`
            };
        }

        return await this.handleGeneral(message);
    }

    /**
     * Handle question intent
     */
    async handleQuestion(message) {
        const response = await this.openai.chat([
            { role: 'system', content: 'You are a helpful AI assistant for R3SN platform. Answer questions concisely.' },
            { role: 'user', content: message }
        ], 'gpt-4');

        return {
            success: true,
            response: response.choices[0].message.content
        };
    }

    /**
     * Handle general conversation
     */
    async handleGeneral(message) {
        const response = await this.openai.chat([
            { role: 'system', content: 'You are a friendly AI assistant for R3SN platform. Have natural conversations.' },
            { role: 'user', content: message }
        ], 'gpt-4');

        return {
            success: true,
            response: response.choices[0].message.content
        };
    }

    /**
     * Helper: Extract API ID from message
     */
    async extractAPIId(message, userId) {
        const apis = this.apiBuilder.listUserAPIs(userId);
        // Simple extraction - can be enhanced
        for (const api of apis) {
            if (message.toLowerCase().includes(api.name.toLowerCase())) {
                return api.id;
            }
        }
        return apis[0]?.id;
    }

    /**
     * Helper: Extract plugin ID from message
     */
    async extractPluginId(message, userId) {
        const plugins = this.pluginMaker.listUserPlugins(userId);
        for (const plugin of plugins) {
            if (message.toLowerCase().includes(plugin.name.toLowerCase())) {
                return plugin.id;
            }
        }
        return plugins[0]?.id;
    }

    /**
     * Helper: Extract workflow ID from message
     */
    async extractWorkflowId(message, userId) {
        const workflows = this.pluginMaker.listUserWorkflows(userId);
        for (const workflow of workflows) {
            if (message.toLowerCase().includes(workflow.name.toLowerCase())) {
                return workflow.id;
            }
        }
        return workflows[0]?.id;
    }
}

module.exports = NaturalLanguageProcessor;
