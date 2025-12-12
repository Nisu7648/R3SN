/**
 * R3SN Reasoning Models
 * LLM integration with OpenAI, Anthropic, Google, and local models
 */

const axios = require('axios');
const EventEmitter = require('events');

class ReasoningModels extends EventEmitter {
    constructor() {
        super();
        this.models = new Map();
        this.conversations = new Map();
        this.tokenUsage = new Map();
        this.initializeModels();
    }

    /**
     * Initialize available models
     */
    initializeModels() {
        // OpenAI Models
        this.models.set('gpt-4-turbo', {
            provider: 'openai',
            name: 'GPT-4 Turbo',
            endpoint: 'https://api.openai.com/v1/chat/completions',
            maxTokens: 128000,
            costPer1kTokens: { input: 0.01, output: 0.03 }
        });

        this.models.set('gpt-4', {
            provider: 'openai',
            name: 'GPT-4',
            endpoint: 'https://api.openai.com/v1/chat/completions',
            maxTokens: 8192,
            costPer1kTokens: { input: 0.03, output: 0.06 }
        });

        this.models.set('gpt-3.5-turbo', {
            provider: 'openai',
            name: 'GPT-3.5 Turbo',
            endpoint: 'https://api.openai.com/v1/chat/completions',
            maxTokens: 16385,
            costPer1kTokens: { input: 0.0005, output: 0.0015 }
        });

        // Anthropic Models
        this.models.set('claude-3-opus', {
            provider: 'anthropic',
            name: 'Claude 3 Opus',
            endpoint: 'https://api.anthropic.com/v1/messages',
            maxTokens: 200000,
            costPer1kTokens: { input: 0.015, output: 0.075 }
        });

        this.models.set('claude-3-sonnet', {
            provider: 'anthropic',
            name: 'Claude 3 Sonnet',
            endpoint: 'https://api.anthropic.com/v1/messages',
            maxTokens: 200000,
            costPer1kTokens: { input: 0.003, output: 0.015 }
        });

        this.models.set('claude-3-haiku', {
            provider: 'anthropic',
            name: 'Claude 3 Haiku',
            endpoint: 'https://api.anthropic.com/v1/messages',
            maxTokens: 200000,
            costPer1kTokens: { input: 0.00025, output: 0.00125 }
        });

        // Google Models
        this.models.set('gemini-pro', {
            provider: 'google',
            name: 'Gemini Pro',
            endpoint: 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent',
            maxTokens: 32000,
            costPer1kTokens: { input: 0.00025, output: 0.0005 }
        });

        this.models.set('gemini-ultra', {
            provider: 'google',
            name: 'Gemini Ultra',
            endpoint: 'https://generativelanguage.googleapis.com/v1/models/gemini-ultra:generateContent',
            maxTokens: 32000,
            costPer1kTokens: { input: 0.001, output: 0.002 }
        });

        // Local Models (Ollama)
        this.models.set('llama2', {
            provider: 'ollama',
            name: 'Llama 2',
            endpoint: 'http://localhost:11434/api/generate',
            maxTokens: 4096,
            costPer1kTokens: { input: 0, output: 0 }
        });

        this.models.set('mistral', {
            provider: 'ollama',
            name: 'Mistral',
            endpoint: 'http://localhost:11434/api/generate',
            maxTokens: 8192,
            costPer1kTokens: { input: 0, output: 0 }
        });

        this.models.set('codellama', {
            provider: 'ollama',
            name: 'Code Llama',
            endpoint: 'http://localhost:11434/api/generate',
            maxTokens: 4096,
            costPer1kTokens: { input: 0, output: 0 }
        });
    }

    /**
     * Generate completion
     */
    async generate(modelId, prompt, options = {}) {
        const model = this.models.get(modelId);
        if (!model) {
            throw new Error(`Model ${modelId} not found`);
        }

        try {
            let response;

            switch (model.provider) {
                case 'openai':
                    response = await this.generateOpenAI(model, prompt, options);
                    break;
                case 'anthropic':
                    response = await this.generateAnthropic(model, prompt, options);
                    break;
                case 'google':
                    response = await this.generateGoogle(model, prompt, options);
                    break;
                case 'ollama':
                    response = await this.generateOllama(model, prompt, options);
                    break;
                default:
                    throw new Error(`Provider ${model.provider} not supported`);
            }

            // Track token usage
            this.trackTokenUsage(modelId, response.usage);

            this.emit('generation:completed', { modelId, usage: response.usage });

            return response;

        } catch (error) {
            this.emit('generation:error', { modelId, error: error.message });
            throw error;
        }
    }

    /**
     * OpenAI generation
     */
    async generateOpenAI(model, prompt, options) {
        const apiKey = options.apiKey || process.env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new Error('OpenAI API key not provided');
        }

        const messages = options.messages || [
            { role: 'user', content: prompt }
        ];

        const response = await axios.post(model.endpoint, {
            model: model.name.toLowerCase().replace(/\s+/g, '-'),
            messages,
            temperature: options.temperature || 0.7,
            max_tokens: options.maxTokens || 1000,
            stream: options.stream || false
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        return {
            text: response.data.choices[0].message.content,
            model: model.name,
            usage: {
                promptTokens: response.data.usage.prompt_tokens,
                completionTokens: response.data.usage.completion_tokens,
                totalTokens: response.data.usage.total_tokens
            },
            finishReason: response.data.choices[0].finish_reason
        };
    }

    /**
     * Anthropic generation
     */
    async generateAnthropic(model, prompt, options) {
        const apiKey = options.apiKey || process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
            throw new Error('Anthropic API key not provided');
        }

        const response = await axios.post(model.endpoint, {
            model: model.name.toLowerCase().replace(/\s+/g, '-'),
            messages: [
                { role: 'user', content: prompt }
            ],
            max_tokens: options.maxTokens || 1000,
            temperature: options.temperature || 0.7
        }, {
            headers: {
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'Content-Type': 'application/json'
            }
        });

        return {
            text: response.data.content[0].text,
            model: model.name,
            usage: {
                promptTokens: response.data.usage.input_tokens,
                completionTokens: response.data.usage.output_tokens,
                totalTokens: response.data.usage.input_tokens + response.data.usage.output_tokens
            },
            finishReason: response.data.stop_reason
        };
    }

    /**
     * Google generation
     */
    async generateGoogle(model, prompt, options) {
        const apiKey = options.apiKey || process.env.GOOGLE_API_KEY;
        if (!apiKey) {
            throw new Error('Google API key not provided');
        }

        const response = await axios.post(`${model.endpoint}?key=${apiKey}`, {
            contents: [{
                parts: [{ text: prompt }]
            }],
            generationConfig: {
                temperature: options.temperature || 0.7,
                maxOutputTokens: options.maxTokens || 1000
            }
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const text = response.data.candidates[0].content.parts[0].text;

        return {
            text,
            model: model.name,
            usage: {
                promptTokens: this.estimateTokens(prompt),
                completionTokens: this.estimateTokens(text),
                totalTokens: this.estimateTokens(prompt) + this.estimateTokens(text)
            },
            finishReason: response.data.candidates[0].finishReason
        };
    }

    /**
     * Ollama generation (local)
     */
    async generateOllama(model, prompt, options) {
        const response = await axios.post(model.endpoint, {
            model: model.name.toLowerCase().replace(/\s+/g, ''),
            prompt,
            stream: false,
            options: {
                temperature: options.temperature || 0.7,
                num_predict: options.maxTokens || 1000
            }
        });

        return {
            text: response.data.response,
            model: model.name,
            usage: {
                promptTokens: this.estimateTokens(prompt),
                completionTokens: this.estimateTokens(response.data.response),
                totalTokens: this.estimateTokens(prompt) + this.estimateTokens(response.data.response)
            },
            finishReason: 'stop'
        };
    }

    /**
     * Chain-of-thought reasoning
     */
    async chainOfThought(modelId, problem, options = {}) {
        const steps = [];
        let currentThought = `Let's think step by step about: ${problem}`;

        for (let i = 0; i < (options.maxSteps || 5); i++) {
            const response = await this.generate(modelId, currentThought, options);
            
            steps.push({
                step: i + 1,
                thought: response.text,
                tokens: response.usage.totalTokens
            });

            // Check if reasoning is complete
            if (response.text.toLowerCase().includes('therefore') || 
                response.text.toLowerCase().includes('conclusion')) {
                break;
            }

            currentThought = `${currentThought}\n\nStep ${i + 1}: ${response.text}\n\nContinue reasoning:`;
        }

        return {
            problem,
            steps,
            totalSteps: steps.length,
            conclusion: steps[steps.length - 1].thought
        };
    }

    /**
     * Multi-model consensus
     */
    async consensus(modelIds, prompt, options = {}) {
        const responses = await Promise.all(
            modelIds.map(modelId => this.generate(modelId, prompt, options))
        );

        return {
            prompt,
            models: modelIds,
            responses: responses.map((r, i) => ({
                model: modelIds[i],
                text: r.text,
                tokens: r.usage.totalTokens
            })),
            consensus: this.findConsensus(responses.map(r => r.text))
        };
    }

    /**
     * Find consensus among responses
     */
    findConsensus(responses) {
        // Simple consensus: most common response
        const counts = new Map();
        
        responses.forEach(response => {
            const normalized = response.toLowerCase().trim();
            counts.set(normalized, (counts.get(normalized) || 0) + 1);
        });

        let maxCount = 0;
        let consensus = null;

        for (const [response, count] of counts) {
            if (count > maxCount) {
                maxCount = count;
                consensus = response;
            }
        }

        return {
            text: consensus,
            agreement: maxCount / responses.length,
            votes: maxCount
        };
    }

    /**
     * Estimate tokens (rough approximation)
     */
    estimateTokens(text) {
        return Math.ceil(text.split(/\s+/).length * 1.3);
    }

    /**
     * Track token usage
     */
    trackTokenUsage(modelId, usage) {
        if (!this.tokenUsage.has(modelId)) {
            this.tokenUsage.set(modelId, {
                promptTokens: 0,
                completionTokens: 0,
                totalTokens: 0,
                requests: 0
            });
        }

        const stats = this.tokenUsage.get(modelId);
        stats.promptTokens += usage.promptTokens;
        stats.completionTokens += usage.completionTokens;
        stats.totalTokens += usage.totalTokens;
        stats.requests++;
    }

    /**
     * Get token usage stats
     */
    getTokenUsage(modelId = null) {
        if (modelId) {
            return this.tokenUsage.get(modelId) || null;
        }

        const total = {
            promptTokens: 0,
            completionTokens: 0,
            totalTokens: 0,
            requests: 0
        };

        for (const stats of this.tokenUsage.values()) {
            total.promptTokens += stats.promptTokens;
            total.completionTokens += stats.completionTokens;
            total.totalTokens += stats.totalTokens;
            total.requests += stats.requests;
        }

        return total;
    }

    /**
     * List available models
     */
    listModels(provider = null) {
        let models = Array.from(this.models.entries());

        if (provider) {
            models = models.filter(([id, model]) => model.provider === provider);
        }

        return models.map(([id, model]) => ({
            id,
            name: model.name,
            provider: model.provider,
            maxTokens: model.maxTokens,
            cost: model.costPer1kTokens
        }));
    }

    /**
     * Get model info
     */
    getModel(modelId) {
        return this.models.get(modelId);
    }
}

module.exports = ReasoningModels;
