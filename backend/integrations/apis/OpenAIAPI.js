/**
 * OpenAI API Integration - COMPLETE IMPLEMENTATION
 * Chat, Completions, Embeddings, Images, Audio, Files, Fine-tuning
 */

const axios = require('axios');

class OpenAIAPI {
    constructor(apiKey) {
        this.apiKey = apiKey || process.env.OPENAI_API_KEY;
        this.baseUrl = 'https://api.openai.com/v1';
    }

    /**
     * Make authenticated request
     */
    async request(method, endpoint, data = null) {
        const config = {
            method,
            url: `${this.baseUrl}${endpoint}`,
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            }
        };

        if (data) {
            config.data = data;
        }

        const response = await axios(config);
        return response.data;
    }

    // ============================================
    // CHAT
    // ============================================

    /**
     * Create chat completion
     */
    async chat(messages, model = 'gpt-4', options = {}) {
        return await this.request('POST', '/chat/completions', {
            model,
            messages,
            ...options
        });
    }

    /**
     * Stream chat completion
     */
    async chatStream(messages, model = 'gpt-4', options = {}) {
        const response = await axios.post(
            `${this.baseUrl}/chat/completions`,
            {
                model,
                messages,
                stream: true,
                ...options
            },
            {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                responseType: 'stream'
            }
        );

        return response.data;
    }

    // ============================================
    // COMPLETIONS
    // ============================================

    /**
     * Create completion
     */
    async complete(prompt, model = 'gpt-3.5-turbo-instruct', options = {}) {
        return await this.request('POST', '/completions', {
            model,
            prompt,
            ...options
        });
    }

    // ============================================
    // EMBEDDINGS
    // ============================================

    /**
     * Create embeddings
     */
    async createEmbedding(input, model = 'text-embedding-ada-002') {
        return await this.request('POST', '/embeddings', {
            model,
            input
        });
    }

    /**
     * Create embeddings for multiple texts
     */
    async createEmbeddings(texts, model = 'text-embedding-ada-002') {
        return await this.request('POST', '/embeddings', {
            model,
            input: texts
        });
    }

    // ============================================
    // IMAGES
    // ============================================

    /**
     * Generate image
     */
    async generateImage(prompt, options = {}) {
        return await this.request('POST', '/images/generations', {
            prompt,
            n: options.n || 1,
            size: options.size || '1024x1024',
            response_format: options.responseFormat || 'url'
        });
    }

    /**
     * Edit image
     */
    async editImage(image, prompt, mask = null, options = {}) {
        const FormData = require('form-data');
        const form = new FormData();
        
        form.append('image', image);
        form.append('prompt', prompt);
        if (mask) form.append('mask', mask);
        if (options.n) form.append('n', options.n);
        if (options.size) form.append('size', options.size);

        const response = await axios.post(
            `${this.baseUrl}/images/edits`,
            form,
            {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    ...form.getHeaders()
                }
            }
        );

        return response.data;
    }

    /**
     * Create image variation
     */
    async createImageVariation(image, options = {}) {
        const FormData = require('form-data');
        const form = new FormData();
        
        form.append('image', image);
        if (options.n) form.append('n', options.n);
        if (options.size) form.append('size', options.size);

        const response = await axios.post(
            `${this.baseUrl}/images/variations`,
            form,
            {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    ...form.getHeaders()
                }
            }
        );

        return response.data;
    }

    // ============================================
    // AUDIO
    // ============================================

    /**
     * Create speech (text-to-speech)
     */
    async createSpeech(text, voice = 'alloy', model = 'tts-1', options = {}) {
        const response = await axios.post(
            `${this.baseUrl}/audio/speech`,
            {
                model,
                input: text,
                voice,
                ...options
            },
            {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                responseType: 'arraybuffer'
            }
        );

        return response.data;
    }

    /**
     * Transcribe audio
     */
    async transcribe(audioFile, model = 'whisper-1', options = {}) {
        const FormData = require('form-data');
        const form = new FormData();
        
        form.append('file', audioFile);
        form.append('model', model);
        if (options.language) form.append('language', options.language);
        if (options.prompt) form.append('prompt', options.prompt);
        if (options.responseFormat) form.append('response_format', options.responseFormat);
        if (options.temperature) form.append('temperature', options.temperature);

        const response = await axios.post(
            `${this.baseUrl}/audio/transcriptions`,
            form,
            {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    ...form.getHeaders()
                }
            }
        );

        return response.data;
    }

    /**
     * Translate audio
     */
    async translate(audioFile, model = 'whisper-1', options = {}) {
        const FormData = require('form-data');
        const form = new FormData();
        
        form.append('file', audioFile);
        form.append('model', model);
        if (options.prompt) form.append('prompt', options.prompt);
        if (options.responseFormat) form.append('response_format', options.responseFormat);
        if (options.temperature) form.append('temperature', options.temperature);

        const response = await axios.post(
            `${this.baseUrl}/audio/translations`,
            form,
            {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    ...form.getHeaders()
                }
            }
        );

        return response.data;
    }

    // ============================================
    // FILES
    // ============================================

    /**
     * Upload file
     */
    async uploadFile(file, purpose = 'fine-tune') {
        const FormData = require('form-data');
        const form = new FormData();
        
        form.append('file', file);
        form.append('purpose', purpose);

        const response = await axios.post(
            `${this.baseUrl}/files`,
            form,
            {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    ...form.getHeaders()
                }
            }
        );

        return response.data;
    }

    /**
     * List files
     */
    async listFiles() {
        return await this.request('GET', '/files');
    }

    /**
     * Get file
     */
    async getFile(fileId) {
        return await this.request('GET', `/files/${fileId}`);
    }

    /**
     * Delete file
     */
    async deleteFile(fileId) {
        return await this.request('DELETE', `/files/${fileId}`);
    }

    /**
     * Get file content
     */
    async getFileContent(fileId) {
        const response = await axios.get(
            `${this.baseUrl}/files/${fileId}/content`,
            {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            }
        );

        return response.data;
    }

    // ============================================
    // FINE-TUNING
    // ============================================

    /**
     * Create fine-tuning job
     */
    async createFineTuningJob(trainingFile, model = 'gpt-3.5-turbo', options = {}) {
        return await this.request('POST', '/fine_tuning/jobs', {
            training_file: trainingFile,
            model,
            ...options
        });
    }

    /**
     * List fine-tuning jobs
     */
    async listFineTuningJobs(limit = 20) {
        return await this.request('GET', `/fine_tuning/jobs?limit=${limit}`);
    }

    /**
     * Get fine-tuning job
     */
    async getFineTuningJob(jobId) {
        return await this.request('GET', `/fine_tuning/jobs/${jobId}`);
    }

    /**
     * Cancel fine-tuning job
     */
    async cancelFineTuningJob(jobId) {
        return await this.request('POST', `/fine_tuning/jobs/${jobId}/cancel`);
    }

    /**
     * List fine-tuning events
     */
    async listFineTuningEvents(jobId, limit = 20) {
        return await this.request('GET', `/fine_tuning/jobs/${jobId}/events?limit=${limit}`);
    }

    // ============================================
    // MODELS
    // ============================================

    /**
     * List models
     */
    async listModels() {
        return await this.request('GET', '/models');
    }

    /**
     * Get model
     */
    async getModel(modelId) {
        return await this.request('GET', `/models/${modelId}`);
    }

    /**
     * Delete fine-tuned model
     */
    async deleteModel(modelId) {
        return await this.request('DELETE', `/models/${modelId}`);
    }

    // ============================================
    // MODERATIONS
    // ============================================

    /**
     * Create moderation
     */
    async moderate(input, model = 'text-moderation-latest') {
        return await this.request('POST', '/moderations', {
            input,
            model
        });
    }

    // ============================================
    // ASSISTANTS (Beta)
    // ============================================

    /**
     * Create assistant
     */
    async createAssistant(model, name, instructions, options = {}) {
        return await this.request('POST', '/assistants', {
            model,
            name,
            instructions,
            ...options
        });
    }

    /**
     * List assistants
     */
    async listAssistants(limit = 20) {
        return await this.request('GET', `/assistants?limit=${limit}`);
    }

    /**
     * Get assistant
     */
    async getAssistant(assistantId) {
        return await this.request('GET', `/assistants/${assistantId}`);
    }

    /**
     * Update assistant
     */
    async updateAssistant(assistantId, updates) {
        return await this.request('POST', `/assistants/${assistantId}`, updates);
    }

    /**
     * Delete assistant
     */
    async deleteAssistant(assistantId) {
        return await this.request('DELETE', `/assistants/${assistantId}`);
    }

    // ============================================
    // THREADS (Beta)
    // ============================================

    /**
     * Create thread
     */
    async createThread(messages = []) {
        return await this.request('POST', '/threads', { messages });
    }

    /**
     * Get thread
     */
    async getThread(threadId) {
        return await this.request('GET', `/threads/${threadId}`);
    }

    /**
     * Delete thread
     */
    async deleteThread(threadId) {
        return await this.request('DELETE', `/threads/${threadId}`);
    }

    /**
     * Add message to thread
     */
    async addMessage(threadId, role, content) {
        return await this.request('POST', `/threads/${threadId}/messages`, {
            role,
            content
        });
    }

    /**
     * List messages
     */
    async listMessages(threadId, limit = 20) {
        return await this.request('GET', `/threads/${threadId}/messages?limit=${limit}`);
    }

    /**
     * Run assistant on thread
     */
    async runAssistant(threadId, assistantId, instructions = null) {
        const data = { assistant_id: assistantId };
        if (instructions) data.instructions = instructions;

        return await this.request('POST', `/threads/${threadId}/runs`, data);
    }

    /**
     * Get run
     */
    async getRun(threadId, runId) {
        return await this.request('GET', `/threads/${threadId}/runs/${runId}`);
    }

    /**
     * Cancel run
     */
    async cancelRun(threadId, runId) {
        return await this.request('POST', `/threads/${threadId}/runs/${runId}/cancel`);
    }
}

module.exports = OpenAIAPI;
