/**
 * OpenAI API Integration
 * Complete AI models, completions, and embeddings
 */

const axios = require('axios');

class OpenAIAPI {
  constructor(apiKey) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY;
    this.baseURL = 'https://api.openai.com/v1';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  // ==================== CHAT COMPLETIONS ====================

  async createChatCompletion(data) {
    const payload = {
      model: data.model || 'gpt-4',
      messages: data.messages,
      temperature: data.temperature !== undefined ? data.temperature : 0.7,
      ...(data.max_tokens && { max_tokens: data.max_tokens }),
      ...(data.top_p !== undefined && { top_p: data.top_p }),
      ...(data.frequency_penalty !== undefined && { frequency_penalty: data.frequency_penalty }),
      ...(data.presence_penalty !== undefined && { presence_penalty: data.presence_penalty }),
      ...(data.stop && { stop: data.stop }),
      ...(data.stream !== undefined && { stream: data.stream }),
      ...(data.user && { user: data.user }),
      ...(data.functions && { functions: data.functions }),
      ...(data.function_call && { function_call: data.function_call })
    };

    const response = await this.client.post('/chat/completions', payload);
    return { success: true, completion: response.data };
  }

  async createStreamingChatCompletion(data, onChunk) {
    const payload = {
      model: data.model || 'gpt-4',
      messages: data.messages,
      stream: true,
      temperature: data.temperature !== undefined ? data.temperature : 0.7,
      ...(data.max_tokens && { max_tokens: data.max_tokens })
    };

    const response = await this.client.post('/chat/completions', payload, {
      responseType: 'stream'
    });

    return new Promise((resolve, reject) => {
      let fullContent = '';
      
      response.data.on('data', (chunk) => {
        const lines = chunk.toString().split('\n').filter(line => line.trim() !== '');
        for (const line of lines) {
          if (line.includ) continue;
          if (line.startsWith('data: ')) {
            try {
              const json = JSON.parse(line.slice(6));
              const content = json.choices[0]?.delta?.content || '';
              fullContent += content;
              if (onChunk) onChunk(content);
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      });

      response.data.on('end', () => {
        resolve({ success: true, content: fullContent });
      });

      response.data.on('error', reject);
    });
  }

  // ==================== COMPLETIONS (Legacy) ====================

  async createCompletion(data) {
    const payload = {
      model: data.model || 'gpt-3.5-turbo-instruct',
      prompt: data.prompt,
      max_tokens: data.max_tokens || 100,
      temperature: data.temperature !== undefined ? data.temperature : 0.7,
      ...(data.top_p !== undefined && { top_p: data.top_p }),
      ...(data.frequency_penalty !== undefined && { frequency_penalty: data.frequency_penalty }),
      ...(data.presence_penalty !== undefined && { presence_penalty: data.presence_penalty }),
      ...(data.stop && { stop: data.stop }),
      ...(data.stream !== undefined && { stream: data.stream }),
      ...(data.user && { user: data.user })
    };

    const response = await this.client.post('/completions', payload);
    return { success: true, completion: response.data };
  }

  // ==================== EMBEDDINGS ====================

  async createEmbedding(data) {
    const payload = {
      model: data.model || 'text-embedding-ada-002',
      input: data.input,
      ...(data.user && { user: data.user })
    };

    const response = await this.client.post('/embeddings', payload);
    return { success: true, embedding: response.data };
  }

  async createBatchEmbeddings(inputs, model = 'text-embedding-ada-002') {
    const payload = {
      model,
      input: inputs
    };

    const response = await this.client.post('/embeddings', payload);
    return { success: true, embeddings: response.data.data };
  }

  // ==================== IMAGES ====================

  async createImage(data) {
    const payload = {
      prompt: data.prompt,
      n: data.n || 1,
      size: data.size || '1024x1024',
      response_format: data.response_format || 'url',
      ...(data.user && { user: data.user })
    };

    const response = await this.client.post('/images/generations', payload);
    return { success: true, images: response.data.data };
  }

  async createImageEdit(data) {
    const formData = new FormData();
    formData.append('image', data.image);
    formData.append('prompt', data.prompt);
    if (data.mask) formData.append('mask', data.mask);
    if (data.n) formData.append('n', data.n);
    if (data.size) formData.append('size', data.size);
    if (data.response_format) formData.append('response_format', data.response_format);

    const response = await this.client.post('/images/edits', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return { success: true, images: response.data.data };
  }

  async createImageVariation(data) {
    const formData = new FormData();
    formData.append('image', data.image);
    if (data.n) formData.append('n', data.n);
    if (data.size) formData.append('size', data.size);
    if (data.response_format) formData.append('response_format', data.response_format);

    const response = await this.client.post('/images/variations', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return { success: true, images: response.data.data };
  }

  // ==================== AUDIO ====================

  async createTranscription(data) {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('model', data.model || 'whisper-1');
    if (data.prompt) formData.append('prompt', data.prompt);
    if (data.response_format) formData.append('response_format', data.response_format);
    if (data.temperature) formData.append('temperature', data.temperature);
    if (data.language) formData.append('language', data.language);

    const response = await this.client.post('/audio/transcriptions', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return { success: true, transcription: response.data };
  }

  async createTranslation(data) {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('model', data.model || 'whisper-1');
    if (data.prompt) formData.append('prompt', data.prompt);
    if (data.response_format) formData.append('response_format', data.response_format);
    if (data.temperature) formData.append('temperature', data.temperature);

    const response = await this.client.post('/audio/translations', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return { success: true, translation: response.data };
  }

  async createSpeech(data) {
    const payload = {
      model: data.model || 'tts-1',
      input: data.input,
      voice: data.voice || 'alloy',
      ...(data.response_format && { response_format: data.response_format }),
      ...(data.speed && { speed: data.speed })
    };

    const response = await this.client.post('/audio/speech', payload, {
      responseType: 'arraybuffer'
    });
    return { success: true, audio: response.data };
  }

  // ==================== FILES ====================

  async listFiles() {
    const response = await this.client.get('/files');
    return { success: true, files: response.data.data };
  }

  async uploadFile(data) {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('purpose', data.purpose);

    const response = await this.client.post('/files', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return { success: true, file: response.data };
  }

  async getFile(fileId) {
    const response = await this.client.get(`/files/${fileId}`);
    return { success: true, file: response.data };
  }

  async deleteFile(fileId) {
    const response = await this.client.delete(`/files/${fileId}`);
    return { success: true, deleted: response.data.deleted };
  }

  async getFileContent(fileId) {
    const response = await this.client.get(`/files/${fileId}/content`);
    return { success: true, content: response.data };
  }

  // ==================== FINE-TUNING ====================

  async createFineTuningJob(data) {
    const payload = {
      training_file: data.training_file,
      model: data.model || 'gpt-3.5-turbo',
      ...(data.validation_file && { validation_file: data.validation_file }),
      ...(data.hyperparameters && { hyperparameters: data.hyperparameters }),
      ...(data.suffix && { suffix: data.suffix })
    };

    const response = await this.client.post('/fine_tuning/jobs', payload);
    return { success: true, job: response.data };
  }

  async listFineTuningJobs(options = {}) {
    const params = {
      ...(options.after && { after: options.after }),
      ...(options.limit && { limit: options.limit })
    };

    const response = await this.client.get('/fine_tuning/jobs', { params });
    return { success: true, jobs: response.data.data };
  }

  async getFineTuningJob(jobId) {
    const response = await this.client.get(`/fine_tuning/jobs/${jobId}`);
    return { success: true, job: response.data };
  }

  async cancelFineTuningJob(jobId) {
    const response = await this.client.post(`/fine_tuning/jobs/${jobId}/cancel`);
    return { success: true, job: response.data };
  }

  async listFineTuningEvents(jobId, options = {}) {
    const params = {
      ...(options.after && { after: options.after }),
      ...(options.limit && { limit: options.limit })
    };

    const response = await this.client.get(`/fine_tuning/jobs/${jobId}/events`, { params });
    return { success: true, events: response.data.data };
  }

  // ==================== MODELS ====================

  async listModels() {
    const response = await this.client.get('/models');
    return { success: true, models: response.data.data };
  }

  async getModel(modelId) {
    const response = await this.client.get(`/models/${modelId}`);
    return { success: true, model: response.data };
  }

  async deleteFineTunedModel(modelId) {
    const response = await this.client.delete(`/models/${modelId}`);
    return { success: true, deleted: response.data.deleted };
  }

  // ==================== MODERATIONS ====================

  async createModeration(data) {
    const payload = {
      input: data.input,
      model: data.model || 'text-moderation-latest'
    };

    const response = await this.client.post('/moderations', payload);
    return { success: true, moderation: response.data };
  }

  // ==================== ASSISTANTS (Beta) ====================

  async createAssistant(data) {
    const payload = {
      model: data.model || 'gpt-4',
      name: data.name,
      description: data.description,
      instructions: data.instructions,
      ...(data.tools && { tools: data.tools }),
      ...(data.file_ids && { file_ids: data.file_ids }),
      ...(data.metadata && { metadata: data.metadata })
    };

    const response = await this.client.post('/assistants', payload, {
      headers: { 'OpenAI-Beta': 'assistants=v1' }
    });
    return { success: true, assistant: response.data };
  }

  async listAssistants(options = {}) {
    const params = {
      limit: options.limit || 20,
      ...(options.order && { order: options.order }),
      ...(options.after && { after: options.after }),
      ...(options.before && { before: options.before })
    };

    const response = await this.client.get('/assistants', {
      params,
      headers: { 'OpenAI-Beta': 'assistants=v1' }
    });
    return { success: true, assistants: response.data.data };
  }

  async getAssistant(assistantId) {
    const response = await this.client.get(`/assistants/${assistantId}`, {
      headers: { 'OpenAI-Beta': 'assistants=v1' }
    });
    return { success: true, assistant: response.data };
  }

  async updateAssistant(assistantId, data) {
    const response = await this.client.post(`/assistants/${assistantId}`, data, {
      headers: { 'OpenAI-Beta': 'assistants=v1' }
    });
    return { success: true, assistant: response.data };
  }

  async deleteAssistant(assistantId) {
    const response = await this.client.delete(`/assistants/${assistantId}`, {
      headers: { 'OpenAI-Beta': 'assistants=v1' }
    });
    return { success: true, deleted: response.data.deleted };
  }

  // ==================== THREADS (Beta) ====================

  async createThread(data = {}) {
    const payload = {
      ...(data.messages && { messages: data.messages }),
      ...(data.metadata && { metadata: data.metadata })
    };

    const response = await this.client.post('/threads', payload, {
      headers: { 'OpenAI-Beta': 'assistants=v1' }
    });
    return { success: true, thread: response.data };
  }

  async getThread(threadId) {
    const response = await this.client.get(`/threads/${threadId}`, {
      headers: { 'OpenAI-Beta': 'assistants=v1' }
    });
    return { success: true, thread: response.data };
  }

  async updateThread(threadId, data) {
    const response = await this.client.post(`/threads/${threadId}`, data, {
      headers: { 'OpenAI-Beta': 'assistants=v1' }
    });
    return { success: true, thread: response.data };
  }

  async deleteThread(threadId) {
    const response = await this.client.delete(`/threads/${threadId}`, {
      headers: { 'OpenAI-Beta': 'assistants=v1' }
    });
    return { success: true, deleted: response.data.deleted };
  }

  // ==================== MESSAGES (Beta) ====================

  async createMessage(threadId, data) {
    const payload = {
      role: data.role || 'user',
      content: data.content,
      ...(data.file_ids && { file_ids: data.file_ids }),
      ...(data.metadata && { metadata: data.metadata })
    };

    const response = await this.client.post(`/threads/${threadId}/messages`, payload, {
      headers: { 'OpenAI-Beta': 'assistants=v1' }
    });
    return { success: true, message: response.data };
  }

  async listMessages(threadId, options = {}) {
    const params = {
      limit: options.limit || 20,
      ...(options.order && { order: options.order }),
      ...(options.after && { after: options.after }),
      ...(options.before && { before: options.before })
    };

    const response = await this.client.get(`/threads/${threadId}/messages`, {
      params,
      headers: { 'OpenAI-Beta': 'assistants=v1' }
    });
    return { success: true, messages: response.data.data };
  }

  async getMessage(threadId, messageId) {
    const response = await this.client.get(`/threads/${threadId}/messages/${messageId}`, {
      headers: { 'OpenAI-Beta': 'assistants=v1' }
    });
    return { success: true, message: response.data };
  }

  async updateMessage(threadId, messageId, data) {
    const response = await this.client.post(`/threads/${threadId}/messages/${messageId}`, data, {
      headers: { 'OpenAI-Beta': 'assistants=v1' }
    });
    return { success: true, message: response.data };
  }

  // ==================== RUNS (Beta) ====================

  async createRun(threadId, data) {
    const payload = {
      assistant_id: data.assistant_id,
      ...(data.model && { model: data.model }),
      ...(data.instructions && { instructions: data.instructions }),
      ...(data.tools && { tools: data.tools }),
      ...(data.metadata && { metadata: data.metadata })
    };

    const response = await this.client.post(`/threads/${threadId}/runs`, payload, {
      headers: { 'OpenAI-Beta': 'assistants=v1' }
    });
    return { success: true, run: response.data };
  }

  async listRuns(threadId, options = {}) {
    const params = {
      limit: options.limit || 20,
      ...(options.order && { order: options.order }),
      ...(options.after && { after: options.after }),
      ...(options.before && { before: options.before })
    };

    const response = await this.client.get(`/threads/${threadId}/runs`, {
      params,
      headers: { 'OpenAI-Beta': 'assistants=v1' }
    });
    return { success: true, runs: response.data.data };
  }

  async getRun(threadId, runId) {
    const response = await this.client.get(`/threads/${threadId}/runs/${runId}`, {
      headers: { 'OpenAI-Beta': 'assistants=v1' }
    });
    return { success: true, run: response.data };
  }

  async cancelRun(threadId, runId) {
    const response = await this.client.post(`/threads/${threadId}/runs/${runId}/cancel`, {}, {
      headers: { 'OpenAI-Beta': 'assistants=v1' }
    });
    return { success: true, run: response.data };
  }
}

module.exports = OpenAIAPI;
