/**
 * Plugin Maker - Create Custom Plugins from Natural Language
 * Build workflows, automations, and integrations by describing them
 */

const OpenAIAPI = require('../integrations/apis/OpenAIAPI');
const DynamicAPIBuilder = require('./DynamicAPIBuilder');

class PluginMaker {
    constructor() {
        this.openai = new OpenAIAPI();
        this.apiBuilder = new DynamicAPIBuilder();
        this.plugins = new Map();
        this.workflows = new Map();
    }

    /**
     * Create plugin from natural language description
     */
    async createPluginFromPrompt(prompt, userId) {
        console.log(`Creating plugin from prompt: ${prompt}`);

        // Analyze what the user wants
        const pluginSpec = await this.analyzePluginPrompt(prompt);

        // Generate plugin code
        const pluginCode = await this.generatePluginCode(pluginSpec);

        // Create plugin instance
        const pluginInstance = await this.createPluginInstance(pluginCode, pluginSpec);

        // Store plugin
        const pluginId = `plugin_${Date.now()}_${userId}`;
        this.plugins.set(pluginId, {
            id: pluginId,
            userId,
            name: pluginSpec.name,
            description: pluginSpec.description,
            spec: pluginSpec,
            code: pluginCode,
            instance: pluginInstance,
            createdAt: new Date(),
            executions: 0
        });

        return {
            success: true,
            pluginId,
            name: pluginSpec.name,
            description: pluginSpec.description,
            actions: pluginSpec.actions,
            triggers: pluginSpec.triggers,
            usage: this.generatePluginUsage(pluginSpec)
        };
    }

    /**
     * Analyze plugin prompt using AI
     */
    async analyzePluginPrompt(prompt) {
        const systemPrompt = `You are a plugin specification expert. Analyze the user's description and create a plugin specification.

A plugin can have:
1. Triggers (events that start the plugin)
2. Actions (what the plugin does)
3. Conditions (when to execute)
4. Data transformations
5. API integrations

Return JSON:
{
    "name": "Plugin Name",
    "description": "What it does",
    "triggers": [
        {
            "type": "schedule|webhook|event|manual",
            "config": {}
        }
    ],
    "actions": [
        {
            "type": "api_call|transform|notify|store|custom",
            "api": "api_name",
            "endpoint": "endpoint_name",
            "params": {},
            "transform": "javascript code"
        }
    ],
    "conditions": [
        {
            "field": "field_name",
            "operator": "equals|contains|greater|less",
            "value": "value"
        }
    ],
    "variables": {
        "var_name": "default_value"
    }
}`;

        const response = await this.openai.chat([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
        ], 'gpt-4');

        const content = response.choices[0].message.content;
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        
        if (!jsonMatch) {
            throw new Error('Could not parse plugin specification');
        }

        return JSON.parse(jsonMatch[0]);
    }

    /**
     * Generate plugin code
     */
    async generatePluginCode(pluginSpec) {
        const codePrompt = `Generate a complete, production-ready JavaScript plugin class:

${JSON.stringify(pluginSpec, null, 2)}

Requirements:
1. Implement all triggers and actions
2. Handle errors gracefully
3. Support async operations
4. Include logging
5. Add JSDoc comments
6. Make it extensible

Generate ONLY the JavaScript class code.`;

        const response = await this.openai.chat([
            { role: 'system', content: 'You are an expert JavaScript developer.' },
            { role: 'user', content: codePrompt }
        ], 'gpt-4');

        let code = response.choices[0].message.content;

        const codeMatch = code.match(/```(?:javascript|js)?\n([\s\S]*?)\n```/);
        if (codeMatch) {
            code = codeMatch[1];
        }

        return code;
    }

    /**
     * Create plugin instance
     */
    async createPluginInstance(code, spec) {
        try {
            const module = { exports: {} };
            const require = (name) => {
                if (name === 'axios') return require('axios');
                throw new Error(`Module ${name} not available`);
            };

            const func = new Function('module', 'exports', 'require', code);
            func(module, module.exports, require);

            const PluginClass = module.exports;
            return new PluginClass(spec);
        } catch (error) {
            console.error('Error creating plugin instance:', error);
            throw new Error(`Failed to create plugin: ${error.message}`);
        }
    }

    /**
     * Execute plugin
     */
    async executePlugin(pluginId, input = {}) {
        const plugin = this.plugins.get(pluginId);
        if (!plugin) {
            throw new Error(`Plugin ${pluginId} not found`);
        }

        try {
            plugin.executions++;

            const result = await plugin.instance.execute(input);

            return {
                success: true,
                pluginId,
                pluginName: plugin.name,
                input,
                output: result,
                executedAt: new Date()
            };
        } catch (error) {
            return {
                success: false,
                pluginId,
                pluginName: plugin.name,
                error: error.message,
                executedAt: new Date()
            };
        }
    }

    /**
     * Create workflow from description
     */
    async createWorkflowFromPrompt(prompt, userId) {
        console.log(`Creating workflow from prompt: ${prompt}`);

        const workflowSpec = await this.analyzeWorkflowPrompt(prompt);

        const workflowId = `workflow_${Date.now()}_${userId}`;
        this.workflows.set(workflowId, {
            id: workflowId,
            userId,
            name: workflowSpec.name,
            description: workflowSpec.description,
            spec: workflowSpec,
            createdAt: new Date(),
            executions: 0,
            enabled: true
        });

        return {
            success: true,
            workflowId,
            name: workflowSpec.name,
            description: workflowSpec.description,
            steps: workflowSpec.steps
        };
    }

    /**
     * Analyze workflow prompt
     */
    async analyzeWorkflowPrompt(prompt) {
        const systemPrompt = `You are a workflow automation expert. Create a workflow specification.

A workflow has sequential steps:
1. Trigger (what starts it)
2. Steps (actions to perform)
3. Conditions (branching logic)
4. Error handling

Return JSON:
{
    "name": "Workflow Name",
    "description": "What it does",
    "trigger": {
        "type": "schedule|webhook|event|manual",
        "config": {}
    },
    "steps": [
        {
            "id": "step_1",
            "name": "Step Name",
            "type": "api_call|condition|loop|transform|notify",
            "action": "what to do",
            "config": {},
            "onSuccess": "step_2",
            "onError": "error_handler"
        }
    ],
    "variables": {},
    "errorHandling": {
        "retry": 3,
        "onFailure": "notify|stop|continue"
    }
}`;

        const response = await this.openai.chat([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
        ], 'gpt-4');

        const content = response.choices[0].message.content;
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        
        if (!jsonMatch) {
            throw new Error('Could not parse workflow specification');
        }

        return JSON.parse(jsonMatch[0]);
    }

    /**
     * Execute workflow
     */
    async executeWorkflow(workflowId, input = {}) {
        const workflow = this.workflows.get(workflowId);
        if (!workflow) {
            throw new Error(`Workflow ${workflowId} not found`);
        }

        if (!workflow.enabled) {
            throw new Error(`Workflow ${workflowId} is disabled`);
        }

        workflow.executions++;

        const execution = {
            workflowId,
            workflowName: workflow.name,
            startedAt: new Date(),
            steps: [],
            variables: { ...workflow.spec.variables, ...input }
        };

        try {
            let currentStep = workflow.spec.steps[0];
            
            while (currentStep) {
                const stepResult = await this.executeWorkflowStep(currentStep, execution.variables);
                
                execution.steps.push({
                    stepId: currentStep.id,
                    stepName: currentStep.name,
                    success: stepResult.success,
                    output: stepResult.output,
                    error: stepResult.error,
                    executedAt: new Date()
                });

                if (!stepResult.success) {
                    if (currentStep.onError) {
                        currentStep = workflow.spec.steps.find(s => s.id === currentStep.onError);
                    } else {
                        break;
                    }
                } else {
                    if (currentStep.onSuccess) {
                        currentStep = workflow.spec.steps.find(s => s.id === currentStep.onSuccess);
                    } else {
                        break;
                    }
                }
            }

            execution.completedAt = new Date();
            execution.success = execution.steps.every(s => s.success);

            return execution;
        } catch (error) {
            execution.completedAt = new Date();
            execution.success = false;
            execution.error = error.message;
            return execution;
        }
    }

    /**
     * Execute workflow step
     */
    async executeWorkflowStep(step, variables) {
        try {
            switch (step.type) {
                case 'api_call':
                    return await this.executeAPICallStep(step, variables);
                case 'condition':
                    return await this.executeConditionStep(step, variables);
                case 'transform':
                    return await this.executeTransformStep(step, variables);
                case 'notify':
                    return await this.executeNotifyStep(step, variables);
                default:
                    throw new Error(`Unknown step type: ${step.type}`);
            }
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Execute API call step
     */
    async executeAPICallStep(step, variables) {
        // Replace variables in config
        const config = this.replaceVariables(step.config, variables);

        // Make API call (simplified)
        const result = { success: true, output: config };
        return result;
    }

    /**
     * Execute condition step
     */
    async executeConditionStep(step, variables) {
        const condition = this.replaceVariables(step.config.condition, variables);
        const result = eval(condition); // In production, use safer evaluation

        return {
            success: true,
            output: result
        };
    }

    /**
     * Execute transform step
     */
    async executeTransformStep(step, variables) {
        const transform = step.config.transform;
        const input = this.replaceVariables(step.config.input, variables);

        // Execute transformation
        const func = new Function('input', 'variables', transform);
        const output = func(input, variables);

        return {
            success: true,
            output
        };
    }

    /**
     * Execute notify step
     */
    async executeNotifyStep(step, variables) {
        const message = this.replaceVariables(step.config.message, variables);

        console.log(`Notification: ${message}`);

        return {
            success: true,
            output: { notified: true, message }
        };
    }

    /**
     * Replace variables in object
     */
    replaceVariables(obj, variables) {
        if (typeof obj === 'string') {
            return obj.replace(/\{\{(\w+)\}\}/g, (match, key) => variables[key] || match);
        }

        if (Array.isArray(obj)) {
            return obj.map(item => this.replaceVariables(item, variables));
        }

        if (typeof obj === 'object' && obj !== null) {
            const result = {};
            for (const [key, value] of Object.entries(obj)) {
                result[key] = this.replaceVariables(value, variables);
            }
            return result;
        }

        return obj;
    }

    /**
     * Generate plugin usage examples
     */
    generatePluginUsage(spec) {
        return {
            basic: `await plugin.execute({ input: 'value' })`,
            withConfig: `await plugin.execute({ 
    ${Object.keys(spec.variables || {}).map(k => `${k}: 'value'`).join(',\n    ')}
})`,
            description: spec.description
        };
    }

    /**
     * List user's plugins
     */
    listUserPlugins(userId) {
        const userPlugins = [];

        for (const [id, plugin] of this.plugins) {
            if (plugin.userId === userId) {
                userPlugins.push({
                    id: plugin.id,
                    name: plugin.name,
                    description: plugin.description,
                    executions: plugin.executions,
                    createdAt: plugin.createdAt
                });
            }
        }

        return userPlugins;
    }

    /**
     * List user's workflows
     */
    listUserWorkflows(userId) {
        const userWorkflows = [];

        for (const [id, workflow] of this.workflows) {
            if (workflow.userId === userId) {
                userWorkflows.push({
                    id: workflow.id,
                    name: workflow.name,
                    description: workflow.description,
                    enabled: workflow.enabled,
                    executions: workflow.executions,
                    createdAt: workflow.createdAt
                });
            }
        }

        return userWorkflows;
    }

    /**
     * Get plugin details
     */
    getPlugin(pluginId) {
        return this.plugins.get(pluginId);
    }

    /**
     * Get workflow details
     */
    getWorkflow(workflowId) {
        return this.workflows.get(workflowId);
    }

    /**
     * Delete plugin
     */
    deletePlugin(pluginId) {
        return this.plugins.delete(pluginId);
    }

    /**
     * Delete workflow
     */
    deleteWorkflow(workflowId) {
        return this.workflows.delete(workflowId);
    }

    /**
     * Enable/disable workflow
     */
    toggleWorkflow(workflowId, enabled) {
        const workflow = this.workflows.get(workflowId);
        if (workflow) {
            workflow.enabled = enabled;
            return true;
        }
        return false;
    }
}

module.exports = PluginMaker;
